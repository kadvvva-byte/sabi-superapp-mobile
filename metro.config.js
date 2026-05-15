const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// SABI_METRO_STABLE_START:
// The project is large and Expo/Metro can spawn too many transformer workers on
// Windows, which leads to `Error: write ENOMEM` from jest-worker/processChild.
// Keep bundling stable for Android launch checks. Increase only after launch.
const workerCount = Number(process.env.METRO_WORKER_COUNT || 1);
config.maxWorkers = Number.isFinite(workerCount) && workerCount > 0 ? Math.max(1, Math.floor(workerCount)) : 1;

module.exports = config;
