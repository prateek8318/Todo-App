import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './src/app/App';
import { name as appName } from './app.json';

// TODO (Phase 4): Register FCM background handler here
// messaging().setBackgroundMessageHandler(async remoteMessage => { ... });

AppRegistry.registerComponent(appName, () => App);
