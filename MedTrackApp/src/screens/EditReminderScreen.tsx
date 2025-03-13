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
    Modal,
    TouchableWithoutFeedback
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList, Reminder } from "../navigation/AppNavigator"; // Import Reminder
import { RouteProp } from "@react-navigation/native";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type EditReminderScreenRouteProp = RouteProp<RootStackParamList, "EditReminder">;

const EditReminderScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<EditReminderScreenRouteProp>();
    const { reminder, updateReminder } = route.params;

    const [name, setName] = useState(reminder.name);
    const [dosage, setDosage] = useState(reminder.dosage);
    const [time, setTime] = useState(reminder.time);

    // New state for time picker
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState(() => {
        // Parse the HH:mm time string to a Date object
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    });

    // Handle time selection
    const handleTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }

        if (selectedDate) {
            setSelectedTime(selectedDate);

            // Format the time as HH:mm
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            setTime(`${hours}:${minutes}`);
        }
    };

    // Open time picker modal
    const openTimePicker = () => {
        setShowTimePicker(true);
    };

    // For iOS to close the modal
    const closeTimePicker = () => {
        setShowTimePicker(false);
    };

    const saveReminder = () => {
        const updatedReminder: Reminder = {
            ...reminder,
            name,
            dosage,
            time,
        };

        updateReminder(updatedReminder);
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
            <TouchableOpacity
                onPress={openTimePicker}
                style={styles.timePickerButton}
            >
                <Text style={styles.timeText}>{time}</Text>
                <Icon name="clock-outline" size={24} color="#007AFF" />
            </TouchableOpacity>

            {/* Time Picker Modal for iOS */}
            {Platform.OS === 'ios' && showTimePicker && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={showTimePicker}
                >
                    <TouchableWithoutFeedback onPress={closeTimePicker}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={styles.modalContent}>
                                    <View style={styles.modalHeader}>
                                        <TouchableOpacity onPress={closeTimePicker}>
                                            <Text style={styles.cancelButton}>Отмена</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.modalTitle}>Выберите время</Text>
                                        <TouchableOpacity onPress={closeTimePicker}>
                                            <Text style={styles.doneButton}>Готово</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <DateTimePicker
                                        value={selectedTime}
                                        mode="time"
                                        display="spinner"
                                        onChange={handleTimeChange}
                                        style={styles.timePickerIOS}
                                        textColor="white"
                                        themeVariant="dark"
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}

            {/* Time Picker for Android uses the native UI */}
            {Platform.OS === 'android' && showTimePicker && (
                <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={handleTimeChange}
                />
            )}

            <TouchableOpacity onPress={saveReminder} style={styles.saveButton}>
                <Text style={styles.buttonText}>Сохранить</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#121212"
    },
    label: {
        fontSize: 16,
        color: "white",
        marginBottom: 5
    },
    input: {
        backgroundColor: "#1E1E1E",
        color: "white",
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    timePickerButton: {
        backgroundColor: "#1E1E1E",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    timeText: {
        color: "white",
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: "#007AFF",
        padding: 12,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 10
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#2C2C2C',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        alignItems: 'center',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#3A3A3A',
        width: '100%',
    },
    modalTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButton: {
        color: '#FF3B30',
        fontSize: 16,
        paddingRight: 8,
    },
    doneButton: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: 'bold',
        paddingLeft: 8,
    },
    timePickerIOS: {
        height: 200,
        alignSelf: 'center',
        width: '100%',
    },
});

export default EditReminderScreen;