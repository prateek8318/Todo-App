const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const path = require('node:path');
const defaultConfig = getDefaultConfig(__dirname);
const escapedRoot = __dirname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const config = {
  // Keep Metro and native compilation from competing for all available RAM.
  maxWorkers: 2,
  resolver: {
    blockList: [
      defaultConfig.resolver.blockList,
      // Gradle/CMake output is not JavaScript source. Ignore only this project's
      // generated folders; node_modules packages may legitimately contain build/.
      new RegExp(`${escapedRoot}[\\\\/]android[\\\\/](?:.*[\\\\/])?(?:build|\\.gradle|\\.cxx)(?:[\\\\/]|$)`),
      new RegExp(`${path.join(__dirname, 'build').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[\\\\/]|$)`),
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);
