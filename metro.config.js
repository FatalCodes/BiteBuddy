const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Opt-out of package.json exports support as per Expo SDK 53 guidance for RN 0.79
config.resolver.unstable_enablePackageExports = false;

module.exports = config; 