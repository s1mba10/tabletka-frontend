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

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!emailRegex.test(trimmedEmail) || password.length < 6) {
      setError('Неверные данные');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await login(trimmedEmail, password);
      navigation.getParent()?.replace('Account');
    } catch (e) {
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
        <Text style={styles.title}>Вход</Text>
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
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          activeOpacity={0.8}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Войти</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.linkText}>Нет аккаунта? Зарегистрироваться</Text>
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
    backgroundColor: '#4CAF50',
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
  link: {
    marginTop: 20,
    alignSelf: 'center',
  },
  linkText: {
    color: '#9E9E9E',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  error: {
    color: '#FF6B6B',
    marginBottom: 4,
    fontSize: 13,
  },
});

export default LoginScreen;
