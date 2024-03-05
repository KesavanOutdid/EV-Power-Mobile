package com.yourappname;

import com.facebook.react.ReactActivity;
import com.google.zxing.integration.android.IntentIntegrator;

public class QRScanActivity extends ReactActivity {
    @Override
    protected void onResume() {
        super.onResume();
        new IntentIntegrator(this).initiateScan(); // Start the QR code scanning activity
    }
}
