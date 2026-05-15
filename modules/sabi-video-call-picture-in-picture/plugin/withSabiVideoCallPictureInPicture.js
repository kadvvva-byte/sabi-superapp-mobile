const {
  AndroidConfig,
  IOSConfig,
  withAndroidManifest,
  withInfoPlist,
  createRunOncePlugin,
} = require("@expo/config-plugins");

function getLauncherActivityOrThrow(androidManifest) {
  const mainApplication =
    AndroidConfig.Manifest.getMainApplicationOrThrow(androidManifest);

  const activities = mainApplication.activity ?? [];
  if (!activities.length) {
    throw new Error(
      "Sabi PiP plugin: AndroidManifest.xml does not contain any <activity> entries in the main application."
    );
  }

  const launcherActivity =
    activities.find((activity) => {
      const intentFilters = activity["intent-filter"] ?? [];

      return intentFilters.some((intentFilter) => {
        const actions = intentFilter.action ?? [];
        const categories = intentFilter.category ?? [];

        const hasMainAction = actions.some(
          (action) =>
            action?.$?.["android:name"] === "android.intent.action.MAIN"
        );

        const hasLauncherCategory = categories.some(
          (category) =>
            category?.$?.["android:name"] === "android.intent.category.LAUNCHER"
        );

        return hasMainAction && hasLauncherCategory;
      });
    }) ?? activities[0];

  if (!launcherActivity) {
    throw new Error(
      "Sabi PiP plugin: Unable to resolve launcher activity in AndroidManifest.xml."
    );
  }

  launcherActivity.$ = launcherActivity.$ ?? {};
  return launcherActivity;
}

function withAndroidPictureInPicture(config) {
  return withAndroidManifest(config, (config) => {
    const launcherActivity = getLauncherActivityOrThrow(config.modResults);

    launcherActivity.$["android:supportsPictureInPicture"] = "true";
    launcherActivity.$["android:resizeableActivity"] = "true";

    return config;
  });
}

function withIosBackgroundAudio(config) {
  return withInfoPlist(config, (config) => {
    const currentModes = IOSConfig.Plist.getBackgroundModes(config.modResults) ?? [];
    const nextModes = Array.from(new Set([...currentModes, "audio"]));

    config.modResults.UIBackgroundModes = nextModes;

    return config;
  });
}

const withSabiVideoCallPictureInPicture = (config) => {
  config = withAndroidPictureInPicture(config);
  config = withIosBackgroundAudio(config);
  return config;
};

const pkg = {
  name: "sabi-video-call-picture-in-picture",
  version: "1.0.0",
};

module.exports = createRunOncePlugin(
  withSabiVideoCallPictureInPicture,
  pkg.name,
  pkg.version
);