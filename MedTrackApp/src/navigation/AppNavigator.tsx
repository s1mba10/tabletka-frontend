import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator, StackScreenProps } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import MainScreen from "../screens/MainScreen";
import UserInfoScreen from "../screens/UserInfoScreen";
import EditReminderScreen from "../screens/EditReminderScreen";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Reminder } from "../types"; 

// ✅ Define types for each screen's parameters
export type RootStackParamList = {
    Main: undefined;
    EditReminder: { reminder: Reminder };
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="EditReminder" component={EditReminderScreen} />
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
