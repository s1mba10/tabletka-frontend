import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './styles';
import { FormType } from './types';
import { validateEmail, validateFullName, validatePassword } from './validators';
import { BASE_URL } from '../../api';

const AuthAndInfo: React.FC = () => {
  const [formType, setFormType] = useState<FormType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

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

  const handleSubmit = () => {
    if (validateForm()) {
      let requestData;
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (formType === 'register') {
        requestData = {
          email,
          password,
          full_name: fullName,
          timezone: timeZone,
        };
      } else {
        requestData = {
          email,
          password,
          timezone: timeZone,
        };
      }

      Alert.alert(formType === 'register' ? 'Registration Data' : 'Login Data', JSON.stringify(requestData, null, 2));

      fetch(`${BASE_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
        .then((response) => response.json())
        .then((data) => {
          // Переходим на экран профиля в случае успеха
          console.log(data);
        })
        .catch((error) => {
          // Выводим ErrorStub
          console.log(error);
        });
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
            />
            {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
          </>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Отправить</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthAndInfo;
