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

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    repeatPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    const trimmedEmail = email.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    const nextErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      repeatPassword: '',
    };

    if (!trimmedFirstName) {
      nextErrors.firstName = 'Заполните все поля';
    }

    if (!trimmedLastName) {
      nextErrors.lastName = 'Заполните все поля';
    }

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      nextErrors.email = 'Некорректный email';
    }

    if (password.length < 6) {
      nextErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (password !== repeatPassword) {
      nextErrors.repeatPassword = 'Пароли не совпадают';
    }

    setErrors(nextErrors);

    const hasErrors = Object.values(nextErrors).some((message) => message.length > 0);
    if (hasErrors) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register(trimmedEmail, password);
      navigation.navigate('EmailCode', { email: trimmedEmail });
    } catch {
      Alert.alert('Ошибка', 'Повторите попытку');
    } finally {
      setErrors({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        repeatPassword: '',
      });
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
          label="Имя"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Иван"
          autoCapitalize="words"
          error={errors.firstName}
        />
        <FormTextInput
          label="Фамилия"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Иванов"
          autoCapitalize="words"
          error={errors.lastName}
        />
        <FormTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="example@mail.ru"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
        />
        <FormTextInput
          label="Пароль"
          value={password}
          onChangeText={setPassword}
          placeholder="Минимум 6 символов"
          secureTextEntry
          autoCapitalize="none"
          error={errors.password}
        />
        <FormTextInput
          label="Повторите пароль"
          value={repeatPassword}
          onChangeText={setRepeatPassword}
          placeholder="Введите пароль ещё раз"
          secureTextEntry
          autoCapitalize="none"
          error={errors.repeatPassword}
        />

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
});

export default RegisterScreen;
