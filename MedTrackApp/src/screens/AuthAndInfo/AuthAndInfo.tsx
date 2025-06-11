import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks';

import { styles } from './styles';
import { FormType, AuthNavigationProp } from './types';
import { validateEmail, validateFullName, validatePassword } from './validators';

const AuthAndInfo: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const [formType, setFormType] = useState<FormType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { login, register, loading } = useAuth();

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [fullNameError, setFullNameError] = useState('');

  const toggleFormType = () => {
    setFormType(formType === 'login' ? 'register' : 'login');
    setEmailError('');
    setPasswordError('');
    setFullNameError('');
  };

  const validateForm = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError('Email обязателен');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Введите корректный email');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Пароль обязателен');
      isValid = false;
    } else if (formType === 'register' && !validatePassword(password)) {
      setPasswordError('Пароль должен содержать минимум 6 символов');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (formType === 'register') {
      if (!fullName.trim()) {
        setFullNameError('Имя обязательно');
        isValid = false;
      } else if (!validateFullName(fullName)) {
        setFullNameError('Имя должно содержать минимум 3 символа');
        isValid = false;
      } else {
        setFullNameError('');
      }
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const userData =
        formType === 'register'
          ? await register(email, password, fullName)
          : await login(email, password);
      navigation.navigate('Profile', { userData });
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert(
        'Authentication Error',
        error instanceof Error ? error.message : 'Failed to authenticate'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>{formType === 'register' ? 'Регистрация' : 'Вход'}</Text>

        <TouchableOpacity style={styles.toggleButton} onPress={toggleFormType}>
          <Text style={styles.toggleText}>{formType === 'register' ? 'Войти' : 'Регистрация'}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, emailError ? styles.inputError : null]}
          value={email}
          onChangeText={setEmail}
          placeholder="example@email.com"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <Text style={styles.label}>Пароль</Text>
        <TextInput
          style={[styles.input, passwordError ? styles.inputError : null]}
          value={password}
          onChangeText={setPassword}
          placeholder="Ваш пароль"
          placeholderTextColor="#666"
          secureTextEntry
          editable={!loading}
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        {formType === 'register' && (
          <>
            <Text style={styles.label}>Полное имя</Text>
            <TextInput
              style={[styles.input, fullNameError ? styles.inputError : null]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Иван Иванов"
              placeholderTextColor="#666"
              editable={!loading}
            />
            {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
          </>
        )}

        <TouchableOpacity 
          style={[styles.submitButton, loading && { backgroundColor: '#3A5D7E', opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>
              {formType === 'register' ? 'Зарегистрироваться' : 'Войти'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthAndInfo;