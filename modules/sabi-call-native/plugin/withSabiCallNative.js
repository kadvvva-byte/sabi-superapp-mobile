const { AndroidConfig, withAndroidManifest, withInfoPlist, withEntitlementsPlist } = require('expo/config-plugins');

const ANDROID_PACKAGE = 'expo.modules.sabicallnative';
const ACTION_ACCEPT = `${ANDROID_PACKAGE}.ACCEPT`;
const ACTION_DECLINE = `${ANDROID_PACKAGE}.DECLINE`;
const ACTION_END = `${ANDROID_PACKAGE}.END`;

const androidPermissions = [
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.RECORD_AUDIO',
  'android.permission.CAMERA',
  'android.permission.MODIFY_AUDIO_SETTINGS',
  'android.permission.WAKE_LOCK',
  'android.permission.VIBRATE',
  'android.permission.USE_FULL_SCREEN_INTENT',
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_MICROPHONE',
  'android.permission.FOREGROUND_SERVICE_PHONE_CALL',
  'android.permission.BIND_TELECOM_CONNECTION_SERVICE',
  'android.permission.MANAGE_OWN_CALLS',
];

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasName(items, name) {
  return ensureArray(items).some((item) => item && item.$ && item.$['android:name'] === name);
}

module.exports = function withSabiCallNative(config) {
  config = AndroidConfig.Permissions.withPermissions(config, androidPermissions);

  config = withAndroidManifest(config, (mod) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);
    app.activity = ensureArray(app.activity);
    app.service = ensureArray(app.service);
    app.receiver = ensureArray(app.receiver);

    const incomingActivity = `${ANDROID_PACKAGE}.SabiIncomingCallActivity`;
    if (!hasName(app.activity, incomingActivity)) {
      app.activity.push({
        $: {
          'android:name': incomingActivity,
          'android:exported': 'false',
          'android:excludeFromRecents': 'true',
          'android:launchMode': 'singleTask',
          'android:showWhenLocked': 'true',
          'android:turnScreenOn': 'true',
          'android:theme': '@android:style/Theme.Material.NoActionBar',
        },
      });
    }

    const foregroundService = `${ANDROID_PACKAGE}.SabiCallForegroundService`;
    if (!hasName(app.service, foregroundService)) {
      app.service.push({
        $: {
          'android:name': foregroundService,
          'android:exported': 'false',
          'android:foregroundServiceType': 'phoneCall|microphone',
          'android:stopWithTask': 'false',
        },
      });
    }

    const fcmService = `${ANDROID_PACKAGE}.SabiFirebaseMessagingService`;
    if (!hasName(app.service, fcmService)) {
      app.service.push({
        $: {
          'android:name': fcmService,
          'android:exported': 'false',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'com.google.firebase.MESSAGING_EVENT' } }],
          },
        ],
      });
    }

    const actionReceiver = `${ANDROID_PACKAGE}.SabiCallActionReceiver`;
    if (!hasName(app.receiver, actionReceiver)) {
      app.receiver.push({
        $: {
          'android:name': actionReceiver,
          'android:exported': 'false',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': ACTION_ACCEPT } },
              { $: { 'android:name': ACTION_DECLINE } },
              { $: { 'android:name': ACTION_END } },
            ],
          },
        ],
      });
    }

    const mainActivity = app.activity.find((activity) => activity.$?.['android:name'] === '.MainActivity');
    if (mainActivity && mainActivity.$) {
      mainActivity.$['android:showWhenLocked'] = 'true';
      mainActivity.$['android:turnScreenOn'] = 'true';
    }

    return mod;
  });

  config = withInfoPlist(config, (mod) => {
    mod.modResults.UIBackgroundModes = Array.from(new Set([...(mod.modResults.UIBackgroundModes || []), 'voip', 'audio']));
    mod.modResults.NSMicrophoneUsageDescription = mod.modResults.NSMicrophoneUsageDescription || 'Sabi uses microphone for audio and video calls.';
    mod.modResults.NSCameraUsageDescription = mod.modResults.NSCameraUsageDescription || 'Sabi uses camera for video calls.';
    return mod;
  });

  config = withEntitlementsPlist(config, (mod) => {
    mod.modResults['aps-environment'] = mod.modResults['aps-environment'] || 'development';
    return mod;
  });

  return config;
};
