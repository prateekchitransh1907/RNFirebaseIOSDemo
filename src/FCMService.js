import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';

class FCMService {
  register = (onRegister, onNotification, onOpenNotification) => {
    this.checkPermission(onRegister);
    this.createNotificationListeners(
      onRegister,
      onNotification,
      onOpenNotification,
    );
  };

  registerAppWithFCM = async () => {
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
      await messaging().setAutoInitEnabled(true);
    }
  };

  checkPermission = onRegister => {
    messaging()
      .hasPermission()
      .then(enabled => {
        if (enabled) {
          this.getToken(onRegister);
        } else {
          this.requestPermission(onRegister);
        }
      })
      .catch(error => {
        console.log('Permission for FCM rejected', error);
      });
  };

  getToken = onRegister => {
    messaging()
      .getToken()
      .then(fcmToken => {
        if (fcmToken) {
          onRegister(fcmToken);
        } else {
          console.log('user doesnt have a device token');
        }
      })
      .catch(error => {
        console.log('getToken rejected FCM service', error);
      });
  };

  requestPermission = onRegister => {
    messaging()
      .requestPermission()
      .then(() => {
        this.getToken(onRegister);
      })
      .catch(error => {
        console.log('Request Permission Rejected', error);
      });
  };

  deleteToken = () => {
    console.log('FCMService delete token');
    messaging()
      .deleteToken()
      .catch(error => {
        console.log('FCMService delete token error', error);
      });
  };

  createNotificationListeners = (
    onRegister,
    onNotification,
    onOpenNotification,
  ) => {
    //when the app is in the background

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        '[FCMService] onNotificationOpenedApp Notification caused app to open',
      );
      if (remoteMessage) {
        const notification = remoteMessage.notification;
        onOpenNotification(notification);
      }
    });

    //when the application is opened from a quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        console.log('[FCMService] getInitialNotification caused app to open ');
        if (remoteMessage) {
          const notification = remoteMessage.notification;
          onOpenNotification(notification);
        }
      });
    //foreground state messages
    this.messageListener = messaging().onMessage(async remoteMessage => {
      console.log('FCM a new message has arrived!');
      if (remoteMessage) {
        let notification = null;
        if (Platform.OS === 'ios') {
          notification = remoteMessage.data.notification;
        } else {
          notification = remoteMessage.notification;
        }
        onNotification(notification);
      }
    });

    //triggered when you have new token
    messaging().onTokenRefresh(fcmToken => {
      console.log('New token refresh'.fcmToken);
      onRegister(fcmToken);
    });
  };
  unRegister = () => {
    this.messageListener();
  };
}
export const fcmService = new FCMService();
