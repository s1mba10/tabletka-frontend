// src/screens/MainScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Platform, StatusBar, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { format, addWeeks, startOfWeek, addDays, getISOWeek } from "date-fns";
import { ru } from "date-fns/locale";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList, Reminder } from "../navigation/AppNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView, Swipeable, RectButton } from "react-native-gesture-handler";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, RouteProp } from "@react-navigation/native";

type NavigationProp = StackNavigationProp<RootStackParamList, "Main">;

type ReminderStatus = "taken" | "pending" | "missed";
type MedicationType = "tablet" | "capsule" | "liquid" | "injection";

const statusColors: Record<ReminderStatus, string> = {
    taken: "green",
    pending: "gray",
    missed: "red",
};

const typeIcons: Record<MedicationType, string> = {
    tablet: "pill",
    capsule: "pill",
    liquid: "bottle-tonic-plus",
    injection: "needle",
};

const sampleReminders: Reminder[] = [
    { id: "1", name: "Vitamin D", dosage: "2 tablets", type: "tablet", time: "09:00", status: "pending", date: "2025-03-11" },
    { id: "2", name: "Omega 3", dosage: "1 capsule", type: "capsule", time: "12:00", status: "missed", date: "2025-03-11" },
    { id: "3", name: "Painkiller", dosage: "5ml", type: "liquid", time: "18:00", status: "taken", date: "2025-03-13" },
    { id: "4", name: "Insulin", dosage: "1 injection", type: "injection", time: "21:00", status: "pending", date: "2025-03-13" },
];

const getWeekDates = (weekOffset: number = 0) => {
    const today = new Date();
    const weekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i: number) => {
        const date = addDays(weekStart, i);
        return {
            dayLabel: ["пн", "вт", "ср", "чт", "пт", "сб", "вс"][i],
            dateNumber: format(date, "d"),
            fullDate: format(date, "yyyy-MM-dd"),
            isToday: format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd"),
        };
    });
};

const MainScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProp<RootStackParamList, 'Main'>>();
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const weekDates = getWeekDates(weekOffset);
    const [reminders, setReminders] = useState<Reminder[]>(sampleReminders);

    // Reference to track open swipeables
    const rowRefs = useRef<Map<string, Swipeable>>(new Map());
    const resetStorage = async () => {
        try {
            Alert.alert(
                "Reset Storage",
                "This will delete all your reminders and replace them with sample data. Are you sure?",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "Reset",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                // Clear all storage
                                await AsyncStorage.clear();
                                console.log("Storage cleared");

                                // Set sample data
                                await AsyncStorage.setItem('reminders', JSON.stringify(sampleReminders));
                                console.log("Sample data saved to storage");

                                // Update state
                                setReminders(sampleReminders);

                                // Force refresh app state
                                setSelectedDate(format(new Date(), "yyyy-MM-dd"));

                                Alert.alert(
                                    "Storage Reset",
                                    "Your storage has been reset to sample data. The app will now show the sample reminders."
                                );
                            } catch (error) {
                                console.error("Failed to reset storage:", error);
                                Alert.alert("Error", "Failed to reset storage: " + String(error));
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error("Reset dialog error:", error);
        }
    };

    // Add a second debug button for resetting:
    <TouchableOpacity
        style={[styles.fab, { bottom: 160, backgroundColor: '#FF3B30' }]}
        onPress={resetStorage}
    >
        <Icon name="restart" size={30} color="white" />
    </TouchableOpacity>
    // Load reminders from AsyncStorage when component mounts
    useEffect(() => {
        const loadReminders = async () => {
            try {
                const storedReminders = await AsyncStorage.getItem('reminders');
                if (storedReminders) {
                    console.log("Loaded reminders from storage");
                    setReminders(JSON.parse(storedReminders));
                }
            } catch (error) {
                console.error("Failed to load reminders:", error);
            }
        };

        loadReminders();
    }, []);

    // Save reminders to AsyncStorage whenever they change
    useEffect(() => {
        const saveReminders = async () => {
            try {
                await AsyncStorage.setItem('reminders', JSON.stringify(reminders));
                console.log("Saved reminders to storage, count:", reminders.length);
            } catch (error) {
                console.error("Failed to save reminders:", error);
            }
        };

        // Only save if different from initial sample reminders to avoid unnecessary storage writes
        if (JSON.stringify(reminders) !== JSON.stringify(sampleReminders)) {
            saveReminders();
        }
    }, [reminders]);

    // Functions for managing reminders
    const updateReminder = (updatedReminder: Reminder) => {
        setReminders((prevReminders) =>
            prevReminders.map((reminder) =>
                reminder.id === updatedReminder.id ? updatedReminder : reminder
            )
        );
    };

    const addReminder = (newReminder: Reminder) => {
        console.log("Adding new reminder:", newReminder);
        setReminders((prevReminders) => [...prevReminders, newReminder]);
    };

    const deleteReminder = (id: string) => {
        Alert.alert(
            "Удалить напоминание",
            "Вы уверены, что хотите удалить это напоминание?",
            [
                { text: "Отмена", style: "cancel" },
                {
                    text: "Удалить",
                    onPress: () => {
                        // First close the swipeable if it's still open
                        const swipeable = rowRefs.current.get(id);
                        if (swipeable) {
                            swipeable.close();
                        }

                        // Then remove the reminder from state
                        setReminders(prev => prev.filter(item => item.id !== id));
                    },
                    style: "destructive"
                }
            ]
        );
    };

    // Handle navigation events
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log("MainScreen focused with date:", selectedDate);

            // Get parameters from the route
            const params = route.params;
            console.log("Route params from useRoute:", params);

            // Check if we have params
            if (params) {
                // Handle multiple reminders
                if (params.newReminders && params.newReminders.length > 0) {
                    console.log("Processing new reminders array:", params.newReminders.length);
                    console.log("New reminders:", JSON.stringify(params.newReminders));

                    // Check if any reminders have today's date to auto-select that date
                    const reminderDates = params.newReminders.map(r => r.date);
                    console.log("Reminder dates:", reminderDates);

                    // If any reminder has the same date as the selected date, it will show up
                    // Otherwise, we should select the date of the first reminder
                    if (!reminderDates.includes(selectedDate) && reminderDates.length > 0) {
                        console.log("Auto-selecting date:", reminderDates[0]);
                        setSelectedDate(reminderDates[0]);
                    }

                    // Add each reminder in the array by creating a new array with all existing reminders plus new ones
                    setReminders(currentReminders => {
                        const newArray = [...currentReminders, ...params.newReminders!];
                        console.log("New reminders array length:", newArray.length);
                        return newArray;
                    });

                    // Clear the parameter after processing
                    navigation.setParams({
                        newReminders: undefined,
                    });
                }
                // Keep backward compatibility for single reminders
                else if (params.newReminder) {
                    console.log("Processing single new reminder");

                    // Check if we need to change the selected date
                    if (params.newReminder.date !== selectedDate) {
                        console.log("Auto-selecting date for single reminder:", params.newReminder.date);
                        setSelectedDate(params.newReminder.date);
                    }

                    setReminders(currentReminders => [...currentReminders, params.newReminder!]);
                    // Clear the parameter after processing
                    navigation.setParams({
                        newReminder: undefined,
                    });
                }

                if (params.updatedReminder) {
                    console.log("Processing updated reminder");
                    updateReminder(params.updatedReminder);
                    // Clear the parameter after processing
                    navigation.setParams({
                        updatedReminder: undefined,
                    });
                }
            }
        });

        return unsubscribe;
    }, [navigation, selectedDate, route.params]); // Add selectedDate as a dependency

    // Filter reminders by selected date and sort by time (earliest to latest)
    const filteredReminders = reminders
        .filter((reminder) => reminder.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time));

    console.log(`Filtered reminders for ${selectedDate}:`, filteredReminders.length);

    const getDayStatusDots = (date: string) => {
        const dayReminders = reminders
            .filter((reminder) => reminder.date === date)
            .sort((a, b) => a.time.localeCompare(b.time))
            .slice(0, 5);
        return dayReminders.map((reminder) => ({ color: statusColors[reminder.status] }));
    };

    const markAsTaken = (id: string) => {
        setReminders((prevReminders) =>
            prevReminders.map((reminder) =>
                reminder.id === id ? { ...reminder, status: "taken" } : reminder
            )
        );
    };

    // Close all other open rows when opening a new one
    const closeOtherRows = (id: string) => {
        rowRefs.current.forEach((ref, key) => {
            if (key !== id) {
                ref.close();
            }
        });
    };

    // Render right actions (delete button)
    const renderRightActions = (id: string) => {
        return (
            <RectButton
                style={styles.deleteButton}
                onPress={() => deleteReminder(id)}
            >
                <Icon name="delete" size={24} color="white" />
                <Text style={styles.deleteText}>Удалить</Text>
            </RectButton>
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" />
                {/* Week Navigation */}
                <View style={styles.weekHeader}>
                    <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)} style={styles.arrowButton}>
                        <Icon name="chevron-left" size={30} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.weekText}>
                        {format(addWeeks(new Date(), weekOffset), "LLLL yyyy", { locale: ru }).charAt(0).toUpperCase() +
                            format(addWeeks(new Date(), weekOffset), "LLLL yyyy ", { locale: ru }).slice(1)}
                        • {getISOWeek(addWeeks(new Date(), weekOffset))} неделя
                    </Text>
                    <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)} style={styles.arrowButton}>
                        <Icon name="chevron-right" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Weekly Calendar */}
                <View style={styles.weekContainer}>
                    <View style={styles.weekdayRow}>
                        {weekDates.map((day, index: number) => (
                            <Text key={index} style={styles.weekdayText}>{day.dayLabel}</Text>
                        ))}
                    </View>
                    <View style={styles.datesRow}>
                        {weekDates.map((day) => (
                            <TouchableOpacity
                                key={day.fullDate}
                                onPress={() => setSelectedDate(day.fullDate)}
                                style={[
                                    styles.dayContainer,
                                    day.fullDate === selectedDate && styles.selectedDay
                                ]}
                            >
                                <Text style={[
                                    styles.dayText,
                                    day.fullDate === selectedDate && styles.selectedDayText,
                                    day.isToday && styles.todayText
                                ]}>
                                    {day.dateNumber}
                                </Text>
                                <View style={styles.dotContainer}>
                                    {getDayStatusDots(day.fullDate).map((dot, index: number) => (
                                        <View key={index} style={[styles.dot, { backgroundColor: dot.color }]} />
                                    ))}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Reminders List with Swipeable */}
                <FlatList
                    data={filteredReminders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Swipeable
                            ref={(ref) => {
                                if (ref) {
                                    rowRefs.current.set(item.id, ref);
                                }
                            }}
                            renderRightActions={() => renderRightActions(item.id)}
                            onSwipeableOpen={() => closeOtherRows(item.id)}
                            friction={2}
                            overshootRight={false}
                        >
                            <View
                                style={[styles.reminderItem, { borderLeftColor: statusColors[item.status] }]}
                            >
                                <TouchableWithoutFeedback
                                    onPress={() => navigation.navigate("EditReminder", {
                                        reminder: item
                                    })}
                                >
                                    <View style={styles.reminderContent}>
                                        <Icon name={typeIcons[item.type]} size={24} color={statusColors[item.status]} style={styles.icon} />
                                        <View style={styles.textContainer}>
                                            <Text style={styles.reminderTitle}>{item.name}</Text>
                                            <Text style={styles.reminderDetails}>{item.dosage} @ {item.time}</Text>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>

                                {item.status !== "taken" && (
                                    <TouchableOpacity
                                        onPress={() => markAsTaken(item.id)}
                                        style={[styles.takeButton, { backgroundColor: statusColors[item.status] }]}
                                    >
                                        <Text style={styles.buttonText}>Принять</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </Swipeable>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyListContainer}>
                            <Icon name="pill-off" size={60} color="#444" />
                            <Text style={styles.emptyListText}>Нет напоминаний на этот день</Text>
                            <Text style={styles.emptyListSubText}>Нажмите на + чтобы добавить</Text>
                        </View>
                    )}
                />

                {/* Floating Add Button */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => {
                        // Pass selectedDate instead of addReminder
                        navigation.navigate("AddReminder", { selectedDate });
                    }}
                >
                    <Icon name="plus" size={30} color="white" />
                </TouchableOpacity>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        paddingTop: Platform.OS === "ios" ? 10 : StatusBar.currentHeight,
    },
    weekHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    weekText: {
        fontSize: 18,
        color: "white",
        fontWeight: "bold",
    },
    arrowButton: {
        padding: 10,
    },
    weekContainer: {
        alignItems: "center",
        marginBottom: 15,
    },
    weekdayRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        marginBottom: 5,
    },
    weekdayText: {
        fontSize: 14,
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        width: "14%",
    },
    datesRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    dayContainer: {
        alignItems: "center",
        width: "14%",
        paddingVertical: 6,
        borderRadius: 20,
    },
    selectedDay: {
        backgroundColor: "#323232",
    },
    dayText: {
        fontSize: 16,
        color: "white",
        fontWeight: "bold",
    },
    selectedDayText: {
        color: "white",
    },
    todayText: {
        color: "#007AFF",
    },
    dotContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 3,
        minHeight: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 2,
    },
    reminderItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        marginBottom: 10,
        backgroundColor: "#1E1E1E",
        borderRadius: 10,
        borderLeftWidth: 6,
    },
    reminderContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
        marginLeft: 10,
    },
    reminderTitle: {
        fontSize: 18,
        color: "white",
        fontWeight: "bold",
    },
    reminderDetails: {
        fontSize: 14,
        color: "#AAA",
    },
    takeButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 70,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
    deleteButton: {
        backgroundColor: "#FF3B30",
        width: 100,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    deleteText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 5,
    },
    fab: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "#007AFF",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5, // Shadow for Android
        shadowColor: "#000", // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    emptyListContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    emptyListText: {
        color: '#AAA',
        fontSize: 18,
        marginTop: 20,
        fontWeight: 'bold',
    },
    emptyListSubText: {
        color: '#666',
        fontSize: 14,
        marginTop: 10,
    },
});

export default MainScreen;