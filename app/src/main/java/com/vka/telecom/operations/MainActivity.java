package com.vka.telecom.operations;

import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.webkit.DownloadListener;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;
import java.io.File;

public class MainActivity extends BridgeActivity {

    private long downloadId = -1;
    private BroadcastReceiver downloadReceiver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register DownloadManager complete listener for OTA APK updates
        downloadReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                if (downloadId != -1 && id == downloadId) {
                    installDownloadedApk(context);
                }
            }
        };

        try {
            ContextCompat.registerReceiver(
                this,
                downloadReceiver,
                new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
                ContextCompat.RECEIVER_EXPORTED
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        setupApkDownloadListener();
    }

    private void setupApkDownloadListener() {
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.setDownloadListener(new DownloadListener() {
                    @Override
                    public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimetype, long contentLength) {
                        if (url != null && (url.endsWith(".apk") || url.contains("/releases/download/") || mimetype.contains("vnd.android.package-archive"))) {
                            startApkDownload(url);
                        } else if (url != null) {
                            try {
                                Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                                startActivity(browserIntent);
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    }
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void startApkDownload(String url) {
        try {
            Toast.makeText(this, "Downloading LocFinder Pro OTA update...", Toast.LENGTH_LONG).show();

            DownloadManager downloadManager = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            if (downloadManager == null) return;

            File destinationFile = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "LocFinderPro_Update.apk");
            if (destinationFile.exists()) {
                boolean deleted = destinationFile.delete();
            }

            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setTitle("LocFinder Pro OTA Update");
            request.setDescription("Downloading latest LocFinder Pro field engine update...");
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationUri(Uri.fromFile(destinationFile));
            request.setMimeType("application/vnd.android.package-archive");

            downloadId = downloadManager.enqueue(request);
        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(this, "Failed to start download: " + e.getMessage(), Toast.LENGTH_LONG).show();
            try {
                Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                startActivity(browserIntent);
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
    }

    private void installDownloadedApk(Context context) {
        try {
            File destinationFile = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "LocFinderPro_Update.apk");
            if (!destinationFile.exists()) return;

            Intent installIntent = new Intent(Intent.ACTION_VIEW);
            Uri apkUri = FileProvider.getUriForFile(context, getPackageName() + ".fileprovider", destinationFile);

            installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
            installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            Toast.makeText(context, "Opening package installer...", Toast.LENGTH_SHORT).show();
            context.startActivity(installIntent);
        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(context, "Please grant 'Install unknown apps' permission if prompted.", Toast.LENGTH_LONG).show();
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (downloadReceiver != null) {
            try {
                unregisterReceiver(downloadReceiver);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
