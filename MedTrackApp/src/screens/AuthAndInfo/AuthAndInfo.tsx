import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { styles } from './styles';
import { FormType, AuthNavigationProp } from './types';
import { validateEmail, validateFullName, validatePassword } from './validators';
import { AUTH_ENDPOINT, USERS_ENDPOINT } from '../../api';

const AuthAndInfo: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const [formType, setFormType] = useState<FormType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    if (validateForm()) {
      setIsLoading(true);
      try {
        // Get user's timezone
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Prepare request data based on form type
        const requestData = {
          email,
          password,
          timezone: timeZone,
        };
        
        // Add full_name only when registering
        if (formType === 'register') {
          Object.assign(requestData, { full_name: fullName });
        }

        // Make authentication request
        const response = await fetch(AUTH_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Authentication failed');
        }

        // Get access token from response
        const accessToken = data.access_token;
        const tokenType = data.token_type; // 'bearer'
        
        if (accessToken) {
          // Fetch user information with the correct token format
          const userResponse = await fetch(`${USERS_ENDPOINT}/me`, {
            method: 'GET',
            headers: {
              'Authorization': `${tokenType} ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
          }

          const userData = await userResponse.json();
          
          // Navigate to Profile with user data
          navigation.navigate('Profile', { userData });
        } else {
          throw new Error('No authentication token received');
        }
      } catch (error) {
        console.error('Auth error:', error);
        Alert.alert(
          'Authentication Error', 
          error instanceof Error ? error.message : 'Failed to authenticate'
        );
      } finally {
        setIsLoading(false);
      }
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
          editable={!isLoading}
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
          editable={!isLoading}
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
              editable={!isLoading}
            />
            {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
          </>
        )}

        <TouchableOpacity 
          style={[styles.submitButton, isLoading && { backgroundColor: '#3A5D7E', opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
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
