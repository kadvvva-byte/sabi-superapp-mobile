const {
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

const withSabiScreenShare = (config) => {
  return withAndroidManifest(config, (configWithManifest) => {
    const manifest = configWithManifest.modResults;

    ensureUsesPermission(manifest, "android.permission.FOREGROUND_SERVICE");
    ensureUsesPermission(
      manifest,
      "android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION",
    );
    ensureUsesPermission(manifest, "android.permission.POST_NOTIFICATIONS");

    return configWithManifest;
  });
};

module.exports = createRunOncePlugin(
  withSabiScreenShare,
  pkg.name,
  pkg.version,
);
