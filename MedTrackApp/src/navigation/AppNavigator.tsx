// src/navigation/AppNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import MainScreen from "../screens/MainScreen";
import UserInfoScreen from "../screens/UserInfoScreen";
import EditReminderScreen from "../screens/EditReminderScreen";
import AddReminderScreen from "../screens/AddReminderScreen"; // Import new screen
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export type RootStackParamList = {
    Main: undefined;
    EditReminder: {
        reminder: Reminder;
        updateReminder: (updatedReminder: Reminder) => void;
    };
    AddReminder: {
        addReminder: (newReminder: Reminder) => void; // Callback to add new reminder
    };
};

export interface Reminder {
    id: string;
    name: string;
    dosage: string;
    type: "tablet" | "capsule" | "liquid" | "injection";
    time: string;
    status: "taken" | "pending" | "missed";
    date: string;
}

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