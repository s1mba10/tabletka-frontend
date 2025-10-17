import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StyleSheet, Text, View, Platform } from 'react-native';
import { AuthStackParamList, RootStackParamList } from './types';
import { useAuth } from '../auth/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import ReminderEdit from '../screens/ReminderEdit';
import ReminderAdd from '../screens/ReminderAdd';
import MainScreen from '../screens/MainScreen';
import AccountScreen from '../screens/AccountScreen';
import MedCalendarScreen from '../screens/MedCalendarScreen';
import Profile from '../screens/Profile';
import Medications from '../screens/Medications';
import BodyDiaryScreen from '../screens/BodyDiaryScreen';
import DietScreen from '../screens/DietScreen';
import TrainingScreen from '../screens/TrainingScreen';
import FoodEditScreen from '../screens/FoodEditScreen';
import NutritionStatsScreen from '../screens/NutritionStats';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import EmailCodeScreen from '../screens/auth/EmailCodeScreen';

// Кастомный таббар — используем ТОЛЬКО на iOS
import CustomTabBar from './CustomTabBar';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator<AuthStackParamList>();

// --- Auth Stack ---
const AuthStackNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="EmailCode" component={EmailCodeScreen} />
  </AuthStack.Navigator>
);

// --- Main Stack ---
const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainScreen" component={MainScreen} />
    <Stack.Screen name="Account" component={AccountScreen} />
    <Stack.Screen name="BodyDiary" component={BodyDiaryScreen} />
    <Stack.Screen name="AuthStack" component={AuthStackNavigator} />
  </Stack.Navigator>
);

// --- MedCalendar Stack ---
const MedCalendarStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MedCalendar" component={MedCalendarScreen} />
    <Stack.Screen name="ReminderEdit" component={ReminderEdit} />
    <Stack.Screen name="ReminderAdd" component={ReminderAdd} />
    <Stack.Screen name="Medications" component={Medications} />
  </Stack.Navigator>
);

// --- Profile Stack ---
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Profile" component={Profile} />
    <Stack.Screen name="Medications" component={Medications} />
  </Stack.Navigator>
);

// --- Diet Stack ---
const DietStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Diet" component={DietScreen} />
    <Stack.Screen name="FoodEdit" component={FoodEditScreen} />
    <Stack.Screen
      name="NutritionStats"
      component={NutritionStatsScreen}
      options={{
        title: 'Статистика питания',
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: { backgroundColor: '#000' },
        headerTitleStyle: { color: '#fff' },
      }}
    />
  </Stack.Navigator>
);

// --- App Navigator ---
const AppNavigator: React.FC = () => {
  const { isLoading } = useAuth();
  const isIOS = Platform.OS === 'ios';

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loaderText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        // Общие опции
        screenOptions={{
          headerShown: false,
          // Прозрачный/абсолютный стиль нужен только для iOS-капсулы
          ...(isIOS ? { tabBarStyle: { backgroundColor: 'transparent', position: 'absolute' } } : {}),
        }}
        // ВАЖНО: кастомный таббар подключаем ТОЛЬКО на iOS
        {...(isIOS ? { tabBar: (props: any) => <CustomTabBar {...props} /> } : {})}
      >
        <Tab.Screen
          name="Главная"
          component={MainStack}
          options={{
            // для Android — стандартный таббар берёт этот icon
            tabBarIcon: ({ color, size }) => <Icon name="home" size={size ?? 28} color={color} />,
            // для iOS наш кастом читает tabBarIconName (необязательно, но удобно)
            // @ts-ignore
            tabBarIconName: 'home',
            tabBarLabel: 'Главная',
          }}
        />
        <Tab.Screen
          name="Лекарства"
          component={MedCalendarStack}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="pill" size={size ?? 28} color={color} />,
            // @ts-ignore
            tabBarIconName: 'pill',
            tabBarLabel: 'Лекарства',
          }}
        />
        <Tab.Screen
          name="Питание"
          component={DietStack}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="food-apple" size={size ?? 28} color={color} />,
            // @ts-ignore
            tabBarIconName: 'food-apple',
            tabBarLabel: 'Питание',
          }}
        />
        <Tab.Screen
          name="Тренировки"
          component={TrainingScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="dumbbell" size={size ?? 28} color={color} />,
            // @ts-ignore
            tabBarIconName: 'dumbbell',
            tabBarLabel: 'Тренировки',
          }}
        />
        <Tab.Screen
          name="Статистика"
          component={ProfileStack}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="equalizer" size={size ?? 28} color={color} />,
            // @ts-ignore
            tabBarIconName: 'equalizer',
            tabBarLabel: 'Статистика',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

// --- Styles ---
const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
});
