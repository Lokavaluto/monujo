package com.lokavaluto.monujo;

import android.webkit.WebView;
import android.webkit.SslErrorHandler;
import android.net.http.SslError;
import android.net.http.SslCertificate;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebViewClient;

import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.security.KeyStore;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.cert.CertificateException;

import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;
import javax.net.ssl.TrustManager;


public class MonujoWebViewClient extends BridgeWebViewClient {

    private X509TrustManager trustManager;

    public MonujoWebViewClient(Bridge bridge) {
        super(bridge);
        try {

            KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType()); // Typically "BKS"
            keyStore.load(null, null);

            // List of resource IDs of certificates in res/raw
            int[] certResourceIds = new int[] {
                R.raw.isrgrootx1,
                R.raw.isrgrootx2,
                R.raw.e5_cross,
                R.raw.e6_cross,
                R.raw.r10,
                R.raw.r11
            };

            CertificateFactory cf = CertificateFactory.getInstance("X.509");

            for (int i = 0; i < certResourceIds.length; i++) {
                InputStream caInput = bridge.getContext().getResources().openRawResource(certResourceIds[i]);
                X509Certificate caCert = (X509Certificate) cf.generateCertificate(caInput);
                String alias = caCert.getSubjectX500Principal().getName();
                keyStore.setCertificateEntry(alias, caCert);
                caInput.close();
            }

            // Initialize a TrustManagerFactory with our KeyStore
            TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            tmf.init(keyStore);

            // Get the X509TrustManager from the factory
            TrustManager[] trustManagers = tmf.getTrustManagers();
            for (TrustManager tm : trustManagers) {
                if (tm instanceof X509TrustManager) {
                    trustManager = (X509TrustManager) tm;
                    break;
                }
            }

            if (trustManager == null) {
                throw new Exception("No X509TrustManager found");
            }

        } catch (Exception e) {
            Log.e("MyWebViewClient", "Error initializing TrustManager", e);
        }
    }

    private boolean isCertTrusted(SslError error) {
        try {
            // Get the server's certificate chain
            X509Certificate[] serverCertChain = getServerCertificateChain(error);

            if (serverCertChain == null || serverCertChain.length == 0) {
                return false;
            }

            // Validate the server's certificates against our TrustManager
            trustManager.checkServerTrusted(serverCertChain, "RSA");
            return true; // No exceptions thrown, certificate is trusted
        } catch (Exception e) {
            Log.e("MonujoWebViewClient", "Certificate validation failed", e);
            return false; // Certificate is not trusted
        }
    }

    private X509Certificate[] getServerCertificateChain(SslError error) {
        try {
            android.net.http.SslCertificate cert = error.getCertificate();
            java.security.cert.CertificateFactory cf = java.security.cert.CertificateFactory.getInstance("X.509");

            Bundle bundle = SslCertificate.saveState(cert);
            byte[] bytes = bundle.getByteArray("x509-certificate");

            if (bytes == null) {
                return null;
            } else {
                java.io.InputStream is = new java.io.ByteArrayInputStream(bytes);
                X509Certificate serverCert = (X509Certificate) cf.generateCertificate(is);
                return new X509Certificate[]{serverCert};
            }
        } catch (Exception e) {
            Log.e("MonujoWebViewClient", "Failed to get server certificate chain", e);
            return null;
        }
    }

    @Override
    public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.N_MR1) { // API level 25 or lower
            Log.e("MonujoWebViewClient", "SSL error on Android <= 7.1.1: " + error.toString());
            if (trustManager != null && isCertTrusted(error)) {
                // Certificate is trusted, proceed with the connection
                handler.proceed();
            } else {
                // Certificate is not trusted, cancel the connection
                handler.cancel();
            }
        } else {
            Log.e("MonujoWebViewClient", "SSL error on Android > 7.1.1: " + error.toString());
            super.onReceivedSslError(view, handler, error);
        }
    }
}
