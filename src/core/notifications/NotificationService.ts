import {
  AuthorizationStatus as MessagingAuthorizationStatus,
  getMessaging,
  requestPermission,
} from '@react-native-firebase/messaging';
import { getApps } from '@react-native-firebase/app';
import notifee, { AuthorizationStatus, AndroidImportance } from '@notifee/react-native';

export class NotificationService {
  static async requestPermissions() {
    let enabled = false;
    try {
      if (getApps().length > 0) {
        const authStatus = await requestPermission(getMessaging());
        enabled =
          authStatus === MessagingAuthorizationStatus.AUTHORIZED ||
          authStatus === MessagingAuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('FCM Authorization status:', authStatus);
        }
      } else {
        console.warn('Firebase is not configured; skipping FCM permission request.');
      }
    } catch (error) {
      console.warn('Remote notifications are unavailable.', error);
    }

    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
      console.log('Notifee Authorization status:', settings.authorizationStatus);
    }

    return (
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
    );
  }

  static async setupChannels() {
    await notifee.createChannel({
      id: 'task-reminders',
      name: 'Task Reminders',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  static async initialize() {
    try {
      await this.setupChannels();
      await this.requestPermissions();
    } catch (error) {
      console.warn('Notification setup could not finish.', error);
    }
  }
}
