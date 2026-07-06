const appJson = require("./app.json");

module.exports = ({ config }) => {
  const base = appJson.expo || config || {};
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return {
    ...base,
    android: {
      ...(base.android || {}),
      config: {
        ...((base.android && base.android.config) || {}),
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    ios: {
      ...(base.ios || {}),
      config: {
        ...((base.ios && base.ios.config) || {}),
        googleMapsApiKey,
      },
    },
    extra: {
      ...(base.extra || {}),
      googleMapsApiKey,
    },
  };
};
