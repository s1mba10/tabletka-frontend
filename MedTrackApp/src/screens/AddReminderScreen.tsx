// src/screens/AddReminderScreen.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
    StatusBar,
    FlatList,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList, Reminder } from "../navigation/AppNavigator";
import { RouteProp } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";

type AddReminderScreenRouteProp = RouteProp<RootStackParamList, "AddReminder">;

const AddReminderScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<AddReminderScreenRouteProp>();
    const { addReminder } = route.params;

    const [name, setName] = useState("");
    const [dosage, setDosage] = useState("");
    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
    const [type, setType] = useState<"tablet" | "capsule" | "liquid" | "injection">("tablet");

    // State for controlling the DateTimePicker modal and temporary time
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [currentTimeIndex, setCurrentTimeIndex] = useState<number | null>(null);
    const [tempTime, setTempTime] = useState<Date>(new Date());
    const [tempSelectedTime, setTempSelectedTime] = useState<string | null>(null); // Temporary storage for selected time

    const addTimeField = () => {
        console.log("Adding new time, opening picker");
        setCurrentTimeIndex(-1); // -1 indicates a new time
        setTempTime(new Date());
        setTempSelectedTime(null); // Reset temporary time
        setShowTimePicker(true);
    };

    const editTime = (index: number) => {
        console.log("Editing time at index:", index);
        setCurrentTimeIndex(index);
        const time = selectedTimes[index];
        if (time) {
            const [hours, minutes] = time.split(":");
            const date = new Date();
            date.setHours(parseInt(hours, 10) || 0);
            date.setMinutes(parseInt(minutes, 10) || 0);
            setTempTime(date);
            setTempSelectedTime(time); // Set the current time as temporary
        }
        setShowTimePicker(true);
    };

    const removeTime = (index: number) => {
        setSelectedTimes(selectedTimes.filter((_, i) => i !== index));
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        console.log("Time changed, event type:", event.type, "selectedDate:", selectedDate);
        if (event.type === "dismissed" || !selectedDate) {
            return; // Do nothing if dismissed or no date
        }

        // Update the temporary time without committing to selectedTimes
        const formattedTime = format(selectedDate, "HH:mm");
        setTempTime(selectedDate);
        setTempSelectedTime(formattedTime);
    };

    const handleSaveTime = () => {
        if (tempSelectedTime) {
            if (currentTimeIndex === -1) {
                // Adding a new time
                setSelectedTimes([...selectedTimes, tempSelectedTime]);
            } else {
                // Editing an existing time
                const newTimes = [...selectedTimes];
                newTimes[currentTimeIndex!] = tempSelectedTime;
                setSelectedTimes(newTimes);
            }
        }
        setShowTimePicker(false); // Close the modal
    };

    const saveReminder = () => {
        if (!name || !dosage || selectedTimes.length === 0 || selectedTimes.some((time) => !time)) {
            Alert.alert("Ошибка", "Пожалуйста, заполните все поля и выберите хотя бы одно время.");
            return;
        }

        selectedTimes.forEach((time) => {
            const newReminder: Reminder = {
                id: Math.random().toString(36).substr(2, 9),
                name,
                dosage,
                type,
                time,
                status: "pending",
                date: format(new Date(), "yyyy-MM-dd"),
            };
            addReminder(newReminder);
        });

        Alert.alert("Сохранено", "Напоминание добавлено!");
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <Text style={styles.label}>Название</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <Text style={styles.label}>Дозировка</Text>
            <TextInput style={styles.input} value={dosage} onChangeText={setDosage} />

            <Text style={styles.label}>Тип</Text>
            <View style={styles.typeContainer}>
                {[
                    { label: "💊 Таблетка", value: "tablet" },
                    { label: "🔵 Капсула", value: "capsule" },
                    { label: "💧 Жидкость", value: "liquid" },
                    { label: "💉 Инъекция", value: "injection" },
                ].map((item) => (
                    <TouchableOpacity
                        key={item.value}
                        style={[styles.typeButton, type === item.value && styles.selectedType]}
                        onPress={() => setType(item.value as "tablet" | "capsule" | "liquid" | "injection")}
                    >
                        <Text style={styles.typeText}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Время</Text>
            <FlatList
                data={selectedTimes}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <TouchableOpacity onPress={() => editTime(index)} style={styles.timeContainer}>
                        <Text style={styles.timeText}>{item || "Выберите время"}</Text>
                        <TouchableOpacity onPress={() => removeTime(index)} style={styles.removeButton}>
                            <Icon name="minus-circle" size={24} color="red" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                ListFooterComponent={
                    <TouchableOpacity onPress={addTimeField} style={styles.addTimeButton}>
                        <Text style={styles.addTimeText}>+ Добавить время</Text>
                    </TouchableOpacity>
                }
            />

            {/* Modal for Time Picker */}
            <Modal
                visible={showTimePicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowTimePicker(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={tempTime}
                            mode="time"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={onTimeChange}
                            style={styles.dateTimePicker}
                            textColor={Platform.OS === "ios" ? "white" : undefined} // ✅ iOS: White text
                            themeVariant="dark" // ✅ Android: Dark mode enabled
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                onPress={() => setShowTimePicker(false)}
                                style={[styles.modalButton, styles.cancelButton]}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveTime}
                                style={[styles.modalButton, styles.saveButton]}
                            >
                                <Text style={styles.modalButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
        backgroundColor: "white",
        color: "black",
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },

    typeContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 15,
    },
    typeButton: {
        backgroundColor: "#1E1E1E",
        padding: 8,
        borderRadius: 5,
        marginRight: 10,
        marginBottom: 10,
    },
    selectedType: {
        backgroundColor: "#007AFF",
    },
    typeText: {
        color: "white",
        fontSize: 14,
    },
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1E1E1E",
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    timeText: {
        color: "white",
        fontSize: 16,
        flex: 1,
    },
    removeButton: {
        marginLeft: 10,
    },
    addTimeButton: {
        marginBottom: 20,
    },
    addTimeText: {
        color: "#007AFF",
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: "#007AFF",
        padding: 12,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#1E1E1E",
        padding: 20,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    dateTimePicker: {
        width: "100%",
        height: 200, // Ensure sufficient height for the picker
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    modalButton: {
        padding: 10,
        borderRadius: 5,
        width: "45%",
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#FF3B30",
    },
    modalButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default AddReminderScreen;

// there should be ability to delete scheduled reminder by swiping it to the left.
