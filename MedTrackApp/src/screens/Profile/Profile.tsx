import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BarChart } from 'react-native-chart-kit';
import Svg, { Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { styles } from './styles';
import { ProfileScreenRouteProp, RootNavigationProp } from './types';
import { USERS_ENDPOINT } from '../../api';

const Profile: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<ProfileScreenRouteProp>();
  const { userData } = route.params || {};
  
  const [user, setUser] = useState({
    full_name: userData?.full_name || 'User Name',
    email: userData?.email || 'user@example.com',
    timezone: userData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    is_active: userData?.is_active || true,
    total_taken: userData?.total_taken || 0,
    total_missed: userData?.total_missed || 0,
    adherence_percentage: userData?.adherence_percentage || 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const screenWidth = Dimensions.get('window').width - 40; // Account for padding

  useEffect(() => {
    // Set navigation title
    navigation.setOptions({
      headerTitle: 'Profile',
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={handleLogout}
        >
          <Icon name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Define prop types for the Adherence Display Component
  type AdherenceDisplayProps = {
    percentage: number;
    color: string;
  };

  // Custom Adherence Display Component
  const AdherenceDisplay: React.FC<AdherenceDisplayProps> = ({ percentage, color }) => {
    // Calculate the stroke dash based on percentage (circumference = 2πr = 2 * π * 85)
    const radius = 85;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * percentage) / 100;
    
    // Round the percentage to a whole number
    const roundedPercentage = Math.round(percentage);
    
    return (
      <View style={styles.adherenceContainer}>
        <Svg height="200" width="200" viewBox="0 0 200 200">
          {/* Background Circle */}
          <Circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#2C2C2C"
            strokeWidth="15"
            fill="transparent"
          />
          
          {/* Progress Arc */}
          <Circle
            cx="100"
            cy="100"
            r={radius}
            stroke={color}
            strokeWidth="15"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90, 100, 100)"
          />
        </Svg>
        
        {/* Central display */}
        <View style={styles.adherenceCenterContent}>
          <Text style={[styles.adherencePercentage, { color: color }]}>
            {roundedPercentage}%
          </Text>
          <Text style={styles.adherenceLabel}>Соблюдения</Text>
          
          {/* Status indicator */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: color }]} />
            <Text style={styles.statusText}>
              {roundedPercentage >= 80 ? 'Потрясающе' : 
                roundedPercentage >= 60 ? 'Хорошо' : 'Можно лучше'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Function to refresh user data from the API
  const refreshUserData = async () => {
    try {
      setIsRefreshing(true);
      
      // Get authentication token from storage
      const token = await AsyncStorage.getItem('authToken');
      const tokenType = await AsyncStorage.getItem('tokenType') || 'Bearer';
      
      if (!token) {
        console.log('Токен авторизации не найден');
        Alert.alert(
          'Ошибка авторизации', 
          'Сессия истекла. Пожалуйста, войдите снова.'
        );
        
        // Redirect to login screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'AuthAndInfo' }],
        });
        return;
      }
      
      // Make API request to get user data with proper token format
      const response = await fetch(`${USERS_ENDPOINT}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `${tokenType} ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If unauthorized (401), token might be expired
        if (response.status === 401) {
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('tokenType');
          throw new Error('Токен авторизации истек. Пожалуйста, войдите снова.');
        }
        
        const errorData = await response.json().catch(() => null);
        console.error('API error response:', errorData);
        throw new Error(`Ошибка получения данных: ${response.status} ${response.statusText}`);
      }

      // Parse the response and update state
      const updatedUserData = await response.json();
      setUser(updatedUserData);
      
      Alert.alert("Готово!", "Статистика была обновена!");
    } catch (error) {
      console.error('Error refreshing user data:', error);
      Alert.alert(
        'Ошибка обновления', 
        error instanceof Error ? error.message : 'Не удалось обновить статистику. Пожалуйста, попробуйте позже.'
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        {
          text: 'Отмена',
          style: 'cancel'
        },
        {
          text: 'Выйти',
          onPress: async () => {
            try {
              // Clear the auth tokens from storage
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('tokenType');
              
              // Navigate to auth screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'AuthAndInfo' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Ошибка', 'Не удалось выйти из системы. Пожалуйста, попробуйте еще раз.');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Function to navigate to the Main tab
  const navigateToMain = () => {
    navigation.navigate('Главная');
  };

  // Data for bar chart
  const barData = {
    labels: ['Принято', 'Пропущено'],
    datasets: [
      {
        data: [user.total_taken, user.total_missed],
        colors: [(opacity = 1) => `rgba(76, 175, 80, ${opacity})`, (opacity = 1) => `rgba(255, 87, 34, ${opacity})`]
      },
    ],
  };

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#1E1E1E',
    backgroundGradientTo: '#1E1E1E',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  // Get adherence color based on percentage
  const getAdherenceColor = (percentage: number): string => {
    if (percentage >= 80) return '#4CAF50'; // Good - Green
    if (percentage >= 60) return '#FFC107'; // Okay - Yellow
    return '#FF5722'; // Poor - Red/Orange
  };
  
  const adherenceColor = getAdherenceColor(user.adherence_percentage);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user.full_name.split(' ').map(name => name[0]).join('').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.nameText}>{user.full_name}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Пользовательская информация</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Часовой пояс</Text>
            <Text style={styles.infoValue}>{user.timezone}</Text>
          </View>
        </View>

        {/* Update Statistics Button */}
        <TouchableOpacity 
          style={[styles.updateButton, isRefreshing && styles.disabledButton]} 
          onPress={refreshUserData}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="refresh" size={20} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.updateButtonText}>Обновить статистику</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Medication Adherence Section */}
        <View style={styles.adherenceSection}>
          <Text style={styles.sectionTitle}>Статистика</Text>
          
          {/* Adherence Rate - Enhanced Circular Progress */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Процент соблюдения</Text>
            <View style={styles.centeredChart}>
              <AdherenceDisplay 
                percentage={user.adherence_percentage} 
                color={adherenceColor} 
              />
              
              <View style={styles.adherenceLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.legendText}>Принято</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FF5722' }]} />
                  <Text style={styles.legendText}>Пропущено</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Medications Summary - Bar Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Общая информация</Text>
            <BarChart
              data={barData}
              width={screenWidth}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                barPercentage: 0.7,
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
              fromZero
              showValuesOnTopOfBars
            />
          </View>

          {/* Stats Summary */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user.total_taken}</Text>
              <Text style={styles.statLabel}>Принято</Text>
              <Icon name="check-circle" size={20} color="#4CAF50" style={styles.statIcon} />
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user.total_missed}</Text>
              <Text style={styles.statLabel}>Пропущено</Text>
              <Icon name="close-circle" size={20} color="#FF5722" style={styles.statIcon} />
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user.total_taken + user.total_missed}</Text>
              <Text style={styles.statLabel}>Всего</Text>
              <Icon name="pill" size={20} color="#007AFF" style={styles.statIcon} />
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={navigateToMain}>
            <Icon name="pill" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Управление лекарствами</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Настройки', 'Здесь откроется страница настроек')}>
            <Icon name="cog" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Настройки</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Выход</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;