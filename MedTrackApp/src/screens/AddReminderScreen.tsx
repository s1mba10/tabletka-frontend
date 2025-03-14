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
    Modal,
    TouchableWithoutFeedback,
    ScrollView,
    FlatList
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import { RootStackParamList, Reminder } from "../navigation/AppNavigator";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { format } from "date-fns";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define proper types for navigation and route
type AddReminderScreenRouteProp = RouteProp<RootStackParamList, "AddReminder">;
type AddReminderScreenNavigationProp = StackNavigationProp<RootStackParamList, "AddReminder">;

type MedicationType = "tablet" | "capsule" | "liquid" | "injection";

// Define typeIcons constant
const typeIcons: Record<MedicationType, string> = {
    tablet: "pill",
    capsule: "pill",
    liquid: "bottle-tonic-plus",
    injection: "needle",
};

const AddReminderScreen = () => {
    const navigation = useNavigation<AddReminderScreenNavigationProp>();
    const route = useRoute<AddReminderScreenRouteProp>();
    const { selectedDate } = route.params || {}; // Default to empty object if params is undefined

    console.log("AddReminderScreen opened with date:", selectedDate);

    // Form state
    const [name, setName] = useState("");
    const [dosage, setDosage] = useState("");
    const [type, setType] = useState<MedicationType>("tablet");

    // Multiple times state - replace single time with array of times
    const [times, setTimes] = useState<string[]>(["09:00"]); // Default with one time
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [currentEditingTime, setCurrentEditingTime] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState(() => {
        const date = new Date();
        date.setHours(9, 0, 0, 0);
        return date;
    });

    // Function to add a new time
    const addTime = (timeString: string) => {
        // Check if time already exists
        if (times.includes(timeString)) {
            Alert.alert("Предупреждение", "Это время уже добавлено");
            return;
        }

        // Add the new time and sort the array
        const newTimes = [...times, timeString].sort();
        setTimes(newTimes);
    };

    // Function to edit an existing time
    const startEditingTime = (time: string) => {
        // Parse the time string to set the date picker
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        setSelectedTime(date);
        setCurrentEditingTime(time);
        setShowTimePicker(true);
    };

    // Function to remove a time
    const removeTime = (timeToRemove: string) => {
        // Don't allow removing all times
        if (times.length <= 1) {
            Alert.alert("Предупреждение", "Должно быть добавлено хотя бы одно время");
            return;
        }

        setTimes(times.filter(t => t !== timeToRemove));
    };

    // Handle time selection from the picker
    const handleTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }

        if (selectedDate) {
            setSelectedTime(selectedDate);

            // Format the time as HH:mm
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            const timeString = `${hours}:${minutes}`;

            // For Android, apply the change immediately
            if (Platform.OS === 'android') {
                confirmTimeSelection(timeString);
            }
        }
    };

    // Open time picker to add a new time
    const openTimePicker = () => {
        setCurrentEditingTime(null); // Indicates we're adding a new time
        setShowTimePicker(true);
    };

    // Confirm time selection (for both adding and editing)
    const confirmTimeSelection = (timeString: string) => {
        if (currentEditingTime) {
            // We're editing an existing time
            if (currentEditingTime !== timeString) {
                // Only update if the time has changed
                const newTimes = times.filter(t => t !== currentEditingTime);

                // Check if new time already exists
                if (newTimes.includes(timeString)) {
                    Alert.alert("Предупреждение", "Это время уже добавлено");
                } else {
                    setTimes([...newTimes, timeString].sort());
                }
            }
        } else {
            // We're adding a new time
            addTime(timeString);
        }

        setCurrentEditingTime(null);
        setShowTimePicker(false);
    };

    // For iOS to confirm the time
    const confirmTime = () => {
        const hours = selectedTime.getHours().toString().padStart(2, '0');
        const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;

        confirmTimeSelection(timeString);
    };

    // Cancel time picker
    const cancelTimePicker = () => {
        setCurrentEditingTime(null);
        setShowTimePicker(false);
    };

    // Type selection options
    const typeOptions: Array<{ label: string, value: MedicationType }> = [
        { label: "Таблетка", value: "tablet" },
        { label: "Капсула", value: "capsule" },
        { label: "Жидкость", value: "liquid" },
        { label: "Инъекция", value: "injection" }
    ];

    // Save all reminders (one for each time)
    const saveNewReminders = async () => {
        if (!name.trim()) {
            Alert.alert("Ошибка", "Пожалуйста, введите название напоминания");
            return;
        }

        if (!dosage.trim()) {
            Alert.alert("Ошибка", "Пожалуйста, введите дозировку");
            return;
        }

        // Use today's date if none is selected
        const reminderDate = selectedDate || format(new Date(), "yyyy-MM-dd");

        // Create a reminder for each selected time
        const newReminders: Reminder[] = times.map(time => {
            // Generate a unique ID with timestamp and random string
            const id = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);

            return {
                id,
                name,
                dosage,
                type,
                time,
                status: "pending",
                date: reminderDate
            };
        });

        console.log("Created reminders:", JSON.stringify(newReminders));

        // IMPORTANT: Directly update AsyncStorage before navigation
        try {
            // Get current reminders from storage
            const storedReminders = await AsyncStorage.getItem('reminders');
            let allReminders: Reminder[] = [];

            if (storedReminders) {
                // Parse existing reminders and add new ones
                allReminders = JSON.parse(storedReminders);
                console.log("Existing reminders count:", allReminders.length);

                // Make sure we have a valid array
                if (!Array.isArray(allReminders)) {
                    console.error("Invalid reminders format in storage, resetting");
                    allReminders = [];
                }
            } else {
                console.log("No existing reminders in storage");
            }

            // Add new reminders to the array
            allReminders = [...allReminders, ...newReminders];
            console.log("New total reminders count:", allReminders.length);

            // Save the updated array back to storage
            await AsyncStorage.setItem('reminders', JSON.stringify(allReminders));
            console.log("Successfully saved all reminders to storage");

            // Verify the save
            const verification = await AsyncStorage.getItem('reminders');
            if (verification) {
                const parsed = JSON.parse(verification);
                console.log("Verification: stored reminders count:", parsed.length);
            }
        } catch (error) {
            console.error("Failed to update reminders in storage:", error);
            Alert.alert(
                "Storage Error",
                "Failed to save your reminders. The app will try to add them to your list, but you may need to restart the app."
            );
        }

        // Now navigate back
        navigation.navigate('Main', {
            newReminders,
            forceRefresh: Date.now() // Force refresh with timestamp
        });

        // Show confirmation alert
        const reminderText = newReminders.length === 1 ? "напоминание" : "напоминания";
        Alert.alert("Добавлено", `${newReminders.length} ${reminderText} успешно создано!`);
    };
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Добавить напоминание</Text>
                <Text style={styles.dateInfo}>
                    Дата: {selectedDate || format(new Date(), "yyyy-MM-dd")}
                </Text>

                <Text style={styles.label}>Название</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Название лекарства"
                    placeholderTextColor="#666"
                />

                <Text style={styles.label}>Дозировка</Text>
                <TextInput
                    style={styles.input}
                    value={dosage}
                    onChangeText={setDosage}
                    placeholder="Например: 1 таблетка, 5мл"
                    placeholderTextColor="#666"
                />

                <Text style={styles.label}>Тип</Text>
                <View style={styles.typeContainer}>
                    {typeOptions.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.typeOption,
                                type === option.value && styles.selectedType
                            ]}
                            onPress={() => setType(option.value)}
                        >
                            <Icon
                                name={typeIcons[option.value]}
                                size={24}
                                color={type === option.value ? "#007AFF" : "#888"}
                            />
                            <Text style={[
                                styles.typeText,
                                type === option.value && styles.selectedTypeText
                            ]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Время</Text>
                <View style={styles.timesList}>
                    {times.map((time) => (
                        <View key={time} style={styles.timeItem}>
                            <Text style={styles.timeItemText}>{time}</Text>
                            <View style={styles.timeActions}>
                                <TouchableOpacity
                                    onPress={() => startEditingTime(time)}
                                    style={styles.timeActionButton}
                                >
                                    <Icon name="pencil" size={20} color="#007AFF" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => removeTime(time)}
                                    style={styles.timeActionButton}
                                >
                                    <Icon name="delete" size={20} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    onPress={openTimePicker}
                    style={styles.addTimeButton}
                >
                    <Icon name="plus-circle" size={24} color="#007AFF" />
                    <Text style={styles.addTimeText}>Добавить время</Text>
                </TouchableOpacity>

                {/* Time Picker Modal for iOS */}
                {Platform.OS === 'ios' && showTimePicker && (
                    <Modal
                        transparent={true}
                        animationType="slide"
                        visible={showTimePicker}
                    >
                        <TouchableWithoutFeedback onPress={cancelTimePicker}>
                            <View style={styles.modalOverlay}>
                                <TouchableWithoutFeedback>
                                    <View style={styles.modalContent}>
                                        <View style={styles.modalHeader}>
                                            <TouchableOpacity onPress={cancelTimePicker}>
                                                <Text style={styles.cancelButton}>Отмена</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.modalTitle}>
                                                {currentEditingTime ? "Изменить время" : "Добавить время"}
                                            </Text>
                                            <TouchableOpacity onPress={confirmTime}>
                                                <Text style={styles.doneButton}>
                                                    {currentEditingTime ? "Сохранить" : "Добавить"}
                                                </Text>
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

                <TouchableOpacity onPress={saveNewReminders} style={styles.saveButton}>
                    <Text style={styles.buttonText}>Добавить</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#121212"
    },
    title: {
        fontSize: 24,
        color: "white",
        fontWeight: "bold",
        marginBottom: 8
    },
    dateInfo: {
        fontSize: 16,
        color: "#007AFF",
        marginBottom: 20
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
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    typeOption: {
        backgroundColor: "#1E1E1E",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignItems: 'center',
        width: '48%',
        marginBottom: 10,
    },
    selectedType: {
        backgroundColor: "#2C2C2C",
        borderColor: "#007AFF",
        borderWidth: 1,
    },
    typeText: {
        color: "#888",
        marginTop: 5,
    },
    selectedTypeText: {
        color: "white",
    },
    // Styles for multiple times
    timesList: {
        marginBottom: 10,
    },
    timeItem: {
        backgroundColor: "#1E1E1E",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        borderRadius: 5,
        marginBottom: 8,
    },
    timeItemText: {
        color: "white",
        fontSize: 16,
    },
    timeActions: {
        flexDirection: "row",
    },
    timeActionButton: {
        paddingHorizontal: 8,
    },
    addTimeButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1E1E1E",
        padding: 12,
        borderRadius: 5,
        marginBottom: 20,
    },
    addTimeText: {
        color: "#007AFF",
        marginLeft: 10,
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: "#007AFF",
        padding: 12,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 30
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

export default AddReminderScreen;