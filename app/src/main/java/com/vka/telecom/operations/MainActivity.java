package com.vka.telecom.operations;

import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;
import java.io.File;
import java.util.List;

public class MainActivity extends BridgeActivity {

    private long downloadId = -1;
    private BroadcastReceiver downloadReceiver;

    public class AndroidInstallerInterface {
        Context mContext;

        AndroidInstallerInterface(Context c) {
            mContext = c;
        }

        @JavascriptInterface
        public void downloadAndInstallApk(final String url) {
            runOnUiThread(() -> startApkDownload(url));
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register DownloadManager complete listener for 100% in-app OTA APK updates
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

        // Clear web cache and attach in-app AndroidInstaller Javascript Interface
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.clearCache(true);
                webView.addJavascriptInterface(new AndroidInstallerInterface(this), "AndroidInstaller");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
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
            // Check Android 8.0+ Unknown App Installation Permission
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!getPackageManager().canRequestPackageInstalls()) {
                    Toast.makeText(this, "Please allow 'Install unknown apps' permission to update LocFinder Pro", Toast.LENGTH_LONG).show();
                    Intent settingsIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getPackageName()));
                    startActivity(settingsIntent);
                    return;
                }
            }

            Toast.makeText(this, "Downloading LocFinder Pro update in-app...", Toast.LENGTH_LONG).show();

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
            request.setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, "LocFinderPro_Update.apk");
            request.setMimeType("application/vnd.android.package-archive");

            downloadId = downloadManager.enqueue(request);
        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(this, "Failed to start in-app download: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private void installDownloadedApk(Context context) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!getPackageManager().canRequestPackageInstalls()) {
                    Toast.makeText(context, "Please allow 'Install unknown apps' permission to update LocFinder Pro", Toast.LENGTH_LONG).show();
                    Intent settingsIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getPackageName()));
                    settingsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(settingsIntent);
                    return;
                }
            }

            File destinationFile = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "LocFinderPro_Update.apk");
            if (!destinationFile.exists()) {
                Toast.makeText(context, "Update file download incomplete. Retrying...", Toast.LENGTH_SHORT).show();
                return;
            }

            Uri apkUri = FileProvider.getUriForFile(context, getPackageName() + ".fileprovider", destinationFile);

            Intent installIntent = new Intent(Intent.ACTION_VIEW);
            installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
            installIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PREFIX_URI_PERMISSION);

            List<ResolveInfo> resInfoList = context.getPackageManager().queryIntentActivities(installIntent, PackageManager.MATCH_DEFAULT_ONLY);
            for (ResolveInfo resolveInfo : resInfoList) {
                String packageName = resolveInfo.activityInfo.packageName;
                context.grantUriPermission(packageName, apkUri, Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            }

            Toast.makeText(context, "Opening in-app package installer...", Toast.LENGTH_SHORT).show();
            context.startActivity(installIntent);
        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(context, "Error launching package installer: " + e.getMessage(), Toast.LENGTH_LONG).show();
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
