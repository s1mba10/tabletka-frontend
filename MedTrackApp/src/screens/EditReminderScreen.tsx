import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList, Reminder } from "../navigation/AppNavigator"; // Import Reminder
import { RouteProp } from "@react-navigation/native";

type EditReminderScreenRouteProp = RouteProp<RootStackParamList, "EditReminder">;

const EditReminderScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<EditReminderScreenRouteProp>();
    const { reminder, updateReminder } = route.params; // Should now type-check correctly

    const [name, setName] = useState(reminder.name);
    const [dosage, setDosage] = useState(reminder.dosage);
    const [time, setTime] = useState(reminder.time);

    const saveReminder = () => {
        const updatedReminder: Reminder = {
            ...reminder,
            name,
            dosage,
            time,
        };
        updateReminder(updatedReminder); // Call the callback
        Alert.alert("Сохранено", "Напоминание успешно обновлено!");
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Text style={styles.label}>Название</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
            <Text style={styles.label}>Дозировка</Text>
            <TextInput style={styles.input} value={dosage} onChangeText={setDosage} />
            <Text style={styles.label}>Время</Text>
            <TextInput style={styles.input} value={time} onChangeText={setTime} />
            <TouchableOpacity onPress={saveReminder} style={styles.saveButton}>
                <Text style={styles.buttonText}>Сохранить</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#121212" },
    label: { fontSize: 16, color: "white", marginBottom: 5 },
    input: {
        backgroundColor: "#1E1E1E",
        color: "white",
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    saveButton: { backgroundColor: "#007AFF", padding: 12, borderRadius: 5, alignItems: "center" },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default EditReminderScreen;