import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { getApps } from '@react-native-firebase/app';
import App from './src/app/App';
import { name as appName } from './app.json';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';

if (getApps().length > 0) {
  setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });
} else {
  console.warn('Firebase is not configured; skipping the FCM background handler.');
}

AppRegistry.registerComponent(appName, () => App);
