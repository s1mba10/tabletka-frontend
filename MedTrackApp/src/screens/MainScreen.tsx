// src/screens/MainScreen.tsx
import React, { useState, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Platform, StatusBar, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { format, addWeeks, startOfWeek, addDays, getISOWeek } from "date-fns";
import { ru } from "date-fns/locale";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView, Swipeable, RectButton } from "react-native-gesture-handler";

type NavigationProp = StackNavigationProp<RootStackParamList, "Main">;

type ReminderStatus = "taken" | "pending" | "missed";
type MedicationType = "tablet" | "capsule" | "liquid" | "injection";

interface Reminder {
    id: string;
    name: string;
    dosage: string;
    type: MedicationType;
    time: string;
    status: ReminderStatus;
    date: string;
}

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
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const weekDates = getWeekDates(weekOffset);
    const [reminders, setReminders] = useState<Reminder[]>(sampleReminders);

    // Reference to track open swipeables
    const rowRefs = useRef<Map<string, Swipeable>>(new Map());

    const updateReminder = (updatedReminder: Reminder) => {
        setReminders((prevReminders) =>
            prevReminders.map((reminder) =>
                reminder.id === updatedReminder.id ? updatedReminder : reminder
            )
        );
    };

    const addReminder = (newReminder: Reminder) => {
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

    // Filter reminders by selected date and sort by time (earliest to latest)
    const filteredReminders = reminders
        .filter((reminder) => reminder.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time));

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
                                style={styles.dayContainer}
                            >
                                <Text style={styles.dayText}>{day.dateNumber}</Text>
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
                                    onPress={() => navigation.navigate("EditReminder", { reminder: item, updateReminder })}
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
                />

                {/* Floating Add Button */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => {
                        // Fixed navigation to AddReminder screen with proper params
                        navigation.navigate("AddReminder", { addReminder });
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
    },
    dayText: {
        fontSize: 16,
        color: "white",
        fontWeight: "bold",
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
});

export default MainScreen;