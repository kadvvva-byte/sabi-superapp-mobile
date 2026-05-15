const {
  AndroidConfig,
  createRunOncePlugin,
  withAndroidManifest,
} = require("@expo/config-plugins");

const pkg = {
  name: "sabi-screen-share",
  version: "1.0.0",
};

function ensureUsesPermission(manifest, permissionName) {
  manifest.manifest["uses-permission"] = manifest.manifest["uses-permission"] || [];
  const permissions = manifest.manifest["uses-permission"];

  const exists = permissions.some(
    (item) => item?.$?.["android:name"] === permissionName,
  );

  if (!exists) {
    permissions.push({
      $: {
        "android:name": permissionName,
      },
    });
  }
}

function ensureApplication(manifest) {
  const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  app.activity = app.activity || [];
  app.service = app.service || [];
  return app;
}

function ensureActivity(app) {
  const activityName =
    "expo.modules.sabiscreenshare.SabiScreenSharePermissionActivity";

  const exists = app.activity.some(
    (item) => item?.$?.["android:name"] === activityName,
  );

  if (!exists) {
    app.activity.push({
      $: {
        "android:name": activityName,
        "android:exported": "false",
        "android:theme": "@android:style/Theme.Translucent.NoTitleBar",
        "android:excludeFromRecents": "true",
        "android:noHistory": "true",
        "android:launchMode": "singleTask",
      },
    });
  }
}

function ensureService(app) {
  const serviceName =
    "expo.modules.sabiscreenshare.SabiScreenShareForegroundService";

  const exists = app.service.some(
    (item) => item?.$?.["android:name"] === serviceName,
  );

  if (!exists) {
    app.service.push({
      $: {
        "android:name": serviceName,
        "android:exported": "false",
        "android:foregroundServiceType": "mediaProjection",
        "android:stopWithTask": "false",
      },
    });
  }
}

const withSabiScreenShare = (config) => {
  return withAndroidManifest(config, (configWithManifest) => {
    const manifest = configWithManifest.modResults;

    ensureUsesPermission(manifest, "android.permission.FOREGROUND_SERVICE");
    ensureUsesPermission(
      manifest,
      "android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION",
    );
    ensureUsesPermission(manifest, "android.permission.POST_NOTIFICATIONS");

    const app = ensureApplication(manifest);
    ensureActivity(app);
    ensureService(app);

    return configWithManifest;
  });
};

module.exports = createRunOncePlugin(
  withSabiScreenShare,
  pkg.name,
  pkg.version
);