import { Platform, ToastAndroid, Alert } from 'react-native';

/**
 * Показывает всплывающее уведомление (toast)
 * - На Android использует нативный ToastAndroid
 * - На iOS использует Alert.alert
 *
 * @param message - текст сообщения для отображения
 */
export const showToast = (message: string): void => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(message);
  }
};
