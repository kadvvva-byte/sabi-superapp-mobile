const { AndroidConfig, withAndroidManifest, withInfoPlist, withEntitlementsPlist } = require("expo/config-plugins");

const androidPermissions = [
  "android.permission.POST_NOTIFICATIONS",
  "android.permission.RECORD_AUDIO",
  "android.permission.CAMERA",
  "android.permission.MODIFY_AUDIO_SETTINGS",
  "android.permission.WAKE_LOCK",
  "android.permission.USE_FULL_SCREEN_INTENT",
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_MICROPHONE",
  "android.permission.FOREGROUND_SERVICE_PHONE_CALL",
  "android.permission.BIND_TELECOM_CONNECTION_SERVICE",
  "android.permission.MANAGE_OWN_CALLS",
];

function ensureArray(value) { return Array.isArray(value) ? value : []; }

module.exports = function withSabiCallNative(config) {
  config = AndroidConfig.Permissions.withPermissions(config, androidPermissions);

  config = withAndroidManifest(config, (mod) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);
    app.service = ensureArray(app.service);
    app.receiver = ensureArray(app.receiver);

    if (!app.service.some((s) => s.$?.["android:name"] === ".calls.SabiFirebaseMessagingService")) {
      app.service.push({
        $: { "android:name": ".calls.SabiFirebaseMessagingService", "android:exported": "false" },
        "intent-filter": [{ action: [{ $: { "android:name": "com.google.firebase.MESSAGING_EVENT" } }] }],
      });
    }

    if (!app.service.some((s) => s.$?.["android:name"] === ".calls.SabiCallForegroundService")) {
      app.service.push({
        $: {
          "android:name": ".calls.SabiCallForegroundService",
          "android:exported": "false",
          "android:foregroundServiceType": "phoneCall|microphone",
          "android:stopWithTask": "false",
        },
      });
    }

    if (!app.receiver.some((r) => r.$?.["android:name"] === ".calls.SabiCallActionReceiver")) {
      app.receiver.push({
        $: { "android:name": ".calls.SabiCallActionReceiver", "android:exported": "false" },
        "intent-filter": [{ action: [
          { $: { "android:name": "com.anonymous.superappmobile.calls.ACCEPT" } },
          { $: { "android:name": "com.anonymous.superappmobile.calls.DECLINE" } },
          { $: { "android:name": "com.anonymous.superappmobile.calls.END" } },
        ] }],
      });
    }

    return mod;
  });

  config = withInfoPlist(config, (mod) => {
    mod.modResults.UIBackgroundModes = Array.from(new Set([...(mod.modResults.UIBackgroundModes || []), "voip", "audio"]));
    mod.modResults.NSMicrophoneUsageDescription = mod.modResults.NSMicrophoneUsageDescription || "Sabi uses microphone for audio and video calls.";
    mod.modResults.NSCameraUsageDescription = mod.modResults.NSCameraUsageDescription || "Sabi uses camera for video calls.";
    return mod;
  });

  config = withEntitlementsPlist(config, (mod) => {
    mod.modResults["aps-environment"] = mod.modResults["aps-environment"] || "development";
    return mod;
  });

  return config;
};
