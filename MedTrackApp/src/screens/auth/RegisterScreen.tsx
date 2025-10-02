import React, { useState } from 'react';
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
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

import { FormTextInput } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { AuthStackParamList } from '../../navigation';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    const trimmedEmail = email.trim();
    if (!emailRegex.test(trimmedEmail) || password.length < 6 || password !== repeatPassword) {
      setError('Неверные данные');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await register(trimmedEmail, password);
      navigation.navigate('EmailCode', { email: trimmedEmail });
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
        <Text style={styles.title}>Регистрация</Text>
        <FormTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="example@mail.ru"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <FormTextInput
          label="Пароль"
          value={password}
          onChangeText={setPassword}
          placeholder="Минимум 6 символов"
          secureTextEntry
          autoCapitalize="none"
        />
        <FormTextInput
          label="Повторите пароль"
          value={repeatPassword}
          onChangeText={setRepeatPassword}
          placeholder="Введите пароль ещё раз"
          secureTextEntry
          autoCapitalize="none"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          activeOpacity={0.8}
          onPress={handleContinue}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Продолжить</Text>
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
    marginBottom: 24,
  },
  button: {
    width: '100%',
    backgroundColor: '#536DFE',
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
  error: {
    color: '#FF6B6B',
    marginBottom: 4,
    fontSize: 13,
  },
});

export default RegisterScreen;
