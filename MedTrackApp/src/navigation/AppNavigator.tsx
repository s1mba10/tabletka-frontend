import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import MainScreen from "../screens/MainScreen";
import UserInfoScreen from "../screens/UserInfoScreen";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator>
                <Tab.Screen name="Главная" component={MainScreen} options={{ tabBarIcon: ({ color }) => <Icon name="home" size={30} color={color} /> }} />
                <Tab.Screen name="Настройки" component={UserInfoScreen} options={{ tabBarIcon: ({ color }) => <Icon name="account" size={30} color={color} /> }} />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
