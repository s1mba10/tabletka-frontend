// src/navigation/AppNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import MainScreen from "../screens/MainScreen";
import UserInfoScreen from "../screens/UserInfoScreen";
import EditReminderScreen from "../screens/EditReminderScreen";
import AddReminderScreen from "../screens/AddReminderScreen";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Define Reminder type
export interface Reminder {
    id: string;
    name: string;
    dosage: string;
    type: "tablet" | "capsule" | "liquid" | "injection";
    time: string;
    status: "taken" | "pending" | "missed";
    date: string;
}

export type RootStackParamList = {
    Main: {
        updatedReminder?: Reminder;
        newReminder?: Reminder;
        newReminders?: Reminder[];
        forceRefresh?: number; // Add this line to fix the type error
    } | undefined;
    EditReminder: {
        reminder: Reminder;
    };
    AddReminder: {
        selectedDate?: string;
    };
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="EditReminder" component={EditReminderScreen} />
        <Stack.Screen name="AddReminder" component={AddReminderScreen} />
    </Stack.Navigator>
);

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator screenOptions={{ headerShown: false }}>
                <Tab.Screen
                    name="Главная"
                    component={MainStack}
                    options={{ tabBarIcon: ({ color }) => <Icon name="home" size={30} color={color} /> }}
                />
                <Tab.Screen
                    name="Настройки"
                    component={UserInfoScreen}
                    options={{ tabBarIcon: ({ color }) => <Icon name="account" size={30} color={color} /> }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;