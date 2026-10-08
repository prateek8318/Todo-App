module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', { moduleName: '@env', path: '.env', allowlist: ['OPENAI_API_KEY'], allowUndefined: true }],
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@app': './src/app',
          '@core': './src/core',
          '@shared': './src/shared',
          '@features': './src/features',
        },
      },
    ],
    'react-native-worklets/plugin',
  ],
};
