import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { FormTextInput } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { AuthStackParamList } from '../../navigation';

type NavigationProp = StackNavigationProp<AuthStackParamList, 'EmailCode'>;
type RouteProps = RouteProp<AuthStackParamList, 'EmailCode'>;

const EmailCodeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { verifyEmail, pendingEmail } = useAuth();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailForDisplay = useMemo(
    () => route.params?.email ?? pendingEmail ?? '',
    [pendingEmail, route.params?.email],
  );

  const handleConfirm = async () => {
    if (code.trim().length !== 6) {
      Alert.alert('Ошибка', 'Введите код из 6 цифр');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyEmail(code.trim());
      navigation.getParent()?.replace('Account');
    } catch {
      Alert.alert('Ошибка', 'Повторите попытку');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Подтвердите Email</Text>
        {emailForDisplay ? (
          <Text style={styles.subtitle}>Мы отправили код на {emailForDisplay}</Text>
        ) : null}
        <FormTextInput
          label="Код из письма"
          value={code}
          onChangeText={setCode}
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
        />

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          activeOpacity={0.8}
          onPress={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Подтвердить</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E0E',
    justifyContent: 'center',
  },
  inner: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    color: '#B0B0B0',
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EmailCodeScreen;
