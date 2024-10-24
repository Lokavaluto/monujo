package com.lokavaluto.monujo;

import android.webkit.WebView;
import android.webkit.SslErrorHandler;
import android.net.http.SslError;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebViewClient;

public class MonujoWebViewClient extends BridgeWebViewClient {
    public MonujoWebViewClient(Bridge bridge) {
        super(bridge);
    }

    @Override
    public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.N_MR1) { // API level 25 or lower
            Log.w("MonujoWebViewClient", "Bypassing SSL error on Android <= 7.1.1: " + error.toString());
            handler.proceed();
        } else {
            Log.e("MonujoWebViewClient", "SSL error on Android > 7.1.1: " + error.toString());
            super.onReceivedSslError(view, handler, error);
        }
    }
}
