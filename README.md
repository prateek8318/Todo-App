This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

For everyday development on Windows, keep Metro in one terminal (`npm start`)
and run `npm run android:dev` in a second terminal. This avoids relying on the
CLI to open a separate Metro window. Both `android` and `android:dev` build only
the connected device's architecture. Use `npm run android:all` when you need all
configured architectures.

Metro and Gradle are limited to two workers to reduce memory pressure. Gradle's
build cache is enabled. Keep Metro running: edits to JavaScript/TypeScript use
Fast Refresh and do not require another native build. Rebuild after changes to
native dependencies or Android configuration. Avoid routinely running Gradle
`clean` or Metro `--reset-cache`, as they discard reusable build work.

For the JavaScript console, open the debug app on the phone and press `j` in
Metro's terminal once the server is ready. React Native DevTools requires a
connected Hermes debug app. If it reports no compatible apps, check the USB
connection and run `adb reverse tcp:8081 tcp:8081`, then reload the app. Release
builds do not expose DevTools. Native Android logs remain available with
`adb logcat -s ReactNativeJS AndroidRuntime`.

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

## OpenAI key and release signing

Set `OPENAI_API_KEY` in the local `.env` file (see `.env.example`).
The `.env` file is ignored by Git. After changing it, restart Metro with
`npm start -- --reset-cache` and rebuild the app.
This value is included in the app bundle; use a backend for production secrets.
An empty key uses local insight fallbacks and leaves AI task parsing unavailable.

Release signing details are saved in `android/release-signing.properties`.
Place your existing release key at `android/app/release.jks`, then fill in
`storePassword`, `keyAlias`, and `keyPassword`. If the key has another filename,
change `storeFile` (relative to `android/`). The release JKS and properties file
are intentionally allowed in Git for your requested backup. Release builds use
this key and fail if signing details are missing.

The release JKS has now been generated with alias `tickd-release`. Its passwords
are saved in `android/release-signing.properties`. Keep this same JKS and these
details for all future updates; do not generate a new key for each bundle.
`scripts/create-release-key.cjs` refuses to overwrite an existing key.

Before each Play Store update, increase `versionCode` in
`android/app/build.gradle`, then run `npm run android:bundle` from the project
root. It verifies the saved signing details and builds the signed release AAB at
`android/app/build/outputs/bundle/release/app-release.aab`. `npm run signing:verify`
checks the JKS on its own without printing passwords.

Run one Android/Gradle build at a time for this checkout. Concurrent builds can
write the same React Native code-generation files and fail with missing-file
errors. The standalone signing verifier does not run native build tasks.

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
