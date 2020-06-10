import PushNotifcation from 'react-native-push-notification';
import PushNotifcationIOS from '@react-native-community/push-notification-ios';
import {Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';

class LocalNotifications {
  configure = onOpenNotification => {
    PushNotifcation.configure({
      onRegister: function(token) {
        console.log('Local notification onRegister', token);
      },
      onNotification: function(notification) {
        console.log('LocalNotification onNotification', notification);
        if (notification?.data) {
          return;
        }
        notification.userInteraction = true;
        onOpenNotification(
          Platform.OS === 'ios' ? notification.data.item : notification.data,
        );

        //only call callback if not from foreground
        if (Platform.OS === 'ios') {
          notification.finish(PushNotifcationIOS.FetchResult.NoData);
        }
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  };

  unRegister = () => {
    PushNotification.unregister();
  };

  showNotification = (id, title, message, data = {}, options = {}) => {
    PushNotification.localNotification({
      ...this.buildIOSNotification(id, title, message, data, options),

      title: title || '',
      message: message || '',
      playSound: options.playSound || false,
      soundName: options.soundName || 'default',
      userInteraction: false,
    });
  };

  buildIOSNotification = (id, title, message, data = {}, options = {}) => {
    return {
      alertAction: options.alertAction || 'View',
      category: options.category || '',
      userInfo: {
        id: id,
        item: data,
      },
    };
  };

  cancelAllLocalNotifications = () => {
    if (Platform.OS === 'ios') {
      PushNotifcationIOS.removeAllDeliveredNotifications();
    } else {
      PushNotifcation.cancelAllLocalNotifications();
    }
  };

  removeDeliveredNotificationByID = notificationId => {
    console.log(
      'LocalNotificationService removeDeliveredNotifications',
      notificationId,
    );
    PushNotifcation.cancelLocalNotifications({
      id: `${notificationId}`,
    });
  };
}

export const localNotificationService = new LocalNotifications();
