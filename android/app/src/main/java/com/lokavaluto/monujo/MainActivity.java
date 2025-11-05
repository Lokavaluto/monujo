package com.lokavaluto.monujo;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.util.Log;
import android.os.Build;

import androidx.annotation.Nullable;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import android.webkit.WebView;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Set the custom WebViewClient
        Bridge bridge = this.bridge;
        bridge.setWebViewClient(new MonujoWebViewClient(bridge));

        WebView webView = bridge.getWebView();
        ViewCompat.setOnApplyWindowInsetsListener(webView, (view, windowInsets) -> {
            DisplayMetrics metrics = view.getResources().getDisplayMetrics();
            float density = metrics.density;
            Insets insets = windowInsets.getInsets(
                WindowInsetsCompat.Type.systemBars()
                    | WindowInsetsCompat.Type.displayCutout()
                    | WindowInsetsCompat.Type.ime()
            );
            // Forward raw inset pixels; the web bundle converts them using window.devicePixelRatio.
            String js =
                "(function(){"
                    + "const payload={top:" + insets.top + ",right:" + insets.right + ",bottom:" + insets.bottom + ",left:" + insets.left + "};"
                    + "window.__monujoSafeArea = window.__monujoSafeArea || {};"
                    + "window.__monujoSafeArea.values = payload;"
                    + "window.dispatchEvent(new CustomEvent('monujoSafeAreaApplied',{detail:payload}));"
                    + "})();";

            webView.evaluateJavascript(js, null);
            Log.d(
                "SafeAreaInsets",
                "union=" + insets
                    + ", density=" + density
            );
            return windowInsets;
        });
        ViewCompat.requestApplyInsets(webView);
    }

    @Override
    public Intent registerReceiver(@Nullable BroadcastReceiver receiver, IntentFilter filter) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return super.registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED);
        } else {
            return super.registerReceiver(receiver, filter);
        }
    }
}
