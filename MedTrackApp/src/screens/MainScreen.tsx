import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform, StatusBar } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { format, addWeeks, startOfWeek, addDays, getISOWeek } from "date-fns";
import { ru } from "date-fns/locale";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { SafeAreaView } from "react-native-safe-area-context";

// Define the navigation prop type
type NavigationProp = StackNavigationProp<RootStackParamList, "Main">;

// Define possible status values
type ReminderStatus = "taken" | "pending" | "missed";

// Define medication types
type MedicationType = "tablet" | "capsule" | "liquid" | "injection";

// Define Reminder type
interface Reminder {
    id: string;
    name: string;
    dosage: string;
    type: MedicationType;
    time: string;
    status: ReminderStatus;
    date: string; // YYYY-MM-DD format
}

// Status colors
const statusColors: Record<ReminderStatus, string> = {
    taken: "green",
    pending: "gray",
    missed: "red",
};

// Icons for medication types
const typeIcons: Record<MedicationType, string> = {
    tablet: "pill",
    capsule: "pill",
    liquid: "bottle-tonic-plus",
    injection: "needle",
};

// Sample reminders
const sampleReminders: Reminder[] = [
    { id: "1", name: "Vitamin D", dosage: "2 tablets", type: "tablet", time: "09:00", status: "pending", date: "2025-03-11" },
    { id: "2", name: "Omega 3", dosage: "1 capsule", type: "capsule", time: "12:00", status: "missed", date: "2025-03-11" },
    { id: "3", name: "Painkiller", dosage: "5ml", type: "liquid", time: "18:00", status: "taken", date: "2025-03-13" },
    { id: "4", name: "Insulin", dosage: "1 injection", type: "injection", time: "21:00", status: "pending", date: "2025-03-13" },
];

// Function to get current week's dates
const getWeekDates = (weekOffset = 0) => {
    const today = new Date();
    const weekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => {
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

    // Get reminders for the selected day
    const filteredReminders = reminders.filter((reminder) => reminder.date === selectedDate);

    // Get dots for each day
    const getDayStatusDots = (date: string) => {
        const dayReminders = reminders.filter((reminder) => reminder.date === date);
        return dayReminders.map((reminder) => ({ color: statusColors[reminder.status] }));
    };

    // Function to mark a reminder as "taken"
    const markAsTaken = (id: string) => {
        setReminders((prevReminders) =>
            prevReminders.map((reminder) =>
                reminder.id === id ? { ...reminder, status: "taken" } : reminder
            )
        );
    };

    return (
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
                    <Icon name="chevron-right" size={30} color="white" />
                </TouchableOpacity>
            </View>

            {/* Weekly Calendar */}
            <View style={styles.weekContainer}>
                <View style={styles.weekdayRow}>
                    {weekDates.map((day, index) => (
                        <Text key={index} style={styles.weekdayText}>{day.dayLabel}</Text>
                    ))}
                </View>

                <View style={styles.datesRow}>
                    {weekDates.map((day) => (
                        <TouchableOpacity key={day.fullDate} onPress={() => setSelectedDate(day.fullDate)} style={styles.dayContainer}>
                            <Text style={styles.dayText}>{day.dateNumber}</Text>
                            <View style={styles.dotContainer}>
                                {getDayStatusDots(day.fullDate).map((dot, index) => (
                                    <View key={index} style={[styles.dot, { backgroundColor: dot.color }]} />
                                ))}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Reminders List */}
            <FlatList
                data={filteredReminders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.reminderItem, { borderLeftColor: statusColors[item.status] }]}>
                        <Icon name={typeIcons[item.type]} size={24} color={statusColors[item.status]} style={styles.icon} />

                        <View style={styles.textContainer}>
                            <Text style={styles.reminderTitle}>{item.name}</Text>
                            <Text style={styles.reminderDetails}>{item.dosage} @ {item.time}</Text>
                        </View>

                        {/* "Принять" Button */}
                        {item.status !== "taken" && (
                            <TouchableOpacity onPress={() => markAsTaken(item.id)} style={[styles.takeButton, { backgroundColor: statusColors[item.status] }]}>
                                <Text style={styles.buttonText}>Принять</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        paddingTop: Platform.OS === "ios" ? 10 : StatusBar.currentHeight
    },
    weekHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
    },
    weekText: {
        fontSize: 18,
        color: "white",
        fontWeight: "bold"
    },
    arrowButton: {
        padding: 10
    },

    // Calendar styling
    weekContainer: {
        alignItems: "center",
        marginBottom: 15
    },
    weekdayRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        marginBottom: 5
    },
    weekdayText: {
        fontSize: 14,
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        width: "14%"
    },
    datesRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%"
    },
    dayContainer: {
        alignItems: "center",
        width: "14%"
    },
    dayText: {
        fontSize: 16,
        color: "white",
        fontWeight: "bold"
    },

    // Dots under the calendar
    dotContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 3,
        minHeight: 8
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 2
    },

    // Reminder List Styling
    reminderItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        marginBottom: 10,
        backgroundColor: "#1E1E1E",
        borderRadius: 10,
        borderLeftWidth: 6
    },
    icon: {
        marginRight: 10
    },
    textContainer: {
        flex: 1,
        marginLeft: 10
    },
    reminderTitle: {
        fontSize: 18,
        color: "white",
        fontWeight: "bold"
    },
    reminderDetails: {
        fontSize: 14,
        color: "#AAA"
    },

    // "Принять" Button
    takeButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 70
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14
    }
});


export default MainScreen;
