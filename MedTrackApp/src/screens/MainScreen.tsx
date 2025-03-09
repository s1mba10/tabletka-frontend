import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { format, addWeeks, startOfWeek, addDays, getISOWeek } from "date-fns";
import { ru } from "date-fns/locale";

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
    { id: "2", name: "Omega 3", dosage: "1 capsule", type: "capsule", time: "12:00", status: "missed", date: "2025-03-12" },
    { id: "3", name: "Painkiller", dosage: "5ml", type: "liquid", time: "18:00", status: "taken", date: "2025-03-13" },
    { id: "4", name: "Insulin", dosage: "1 injection", type: "injection", time: "21:00", status: "pending", date: "2025-03-14" },
];

// Function to get current week's dates
const getWeekDates = (weekOffset = 0) => {
    const today = new Date();
    const weekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 }); // Start from Monday
    return Array.from({ length: 7 }).map((_, i) => {
        const date = addDays(weekStart, i);
        return {
            dayLabel: ["пн", "вт", "ср", "чт", "пт", "сб", "вс"][i], // Fixed weekday format
            dateNumber: format(date, "d"), // Example: "4"
            fullDate: format(date, "yyyy-MM-dd"),
            isToday: format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd"),
        };
    });
};

const MainScreen = () => {
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const weekDates = getWeekDates(weekOffset);
    const [reminders, setReminders] = useState<Reminder[]>(sampleReminders);

    // Get reminders for the selected day
    const filteredReminders = reminders.filter((reminder) => reminder.date === selectedDate);

    // Function to mark a reminder as "taken"
    const markAsTaken = (id: string) => {
        setReminders((prev) =>
            prev.map((reminder) =>
                reminder.id === id ? { ...reminder, status: "taken" } : reminder
            )
        );
    };

    // Count statuses for each day to show colored dots
    const getDayStatusDots = (date: string) => {
        const dayReminders = reminders.filter((reminder) => reminder.date === date);
        const statusCounts = {
            taken: dayReminders.filter((r) => r.status === "taken").length,
            pending: dayReminders.filter((r) => r.status === "pending").length,
            missed: dayReminders.filter((r) => r.status === "missed").length,
        };
        return Object.entries(statusCounts)
            .map(([status, count]) => (count > 0 ? { color: statusColors[status as ReminderStatus] } : null))
            .filter(Boolean);
    };

    return (
        <View style={styles.container}>
            {/* Calendar Navigation */}
            <View style={styles.weekHeader}>
                <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)} style={styles.arrowButton}>
                    <Icon name="chevron-left" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.weekText}>
                    {format(addWeeks(new Date(), weekOffset), "LLLL yyyy", { locale: ru }).charAt(0).toUpperCase() +
                        format(addWeeks(new Date(), weekOffset), "LLLL yyyy", { locale: ru }).slice(1)}
                    • {getISOWeek(addWeeks(new Date(), weekOffset))} неделя
                </Text>
                <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)} style={styles.arrowButton}>
                    <Icon name="chevron-right" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Weekly Calendar */}
            <View style={styles.weekContainer}>
                {/* Weekday Labels */}
                <View style={styles.weekdayRow}>
                    {weekDates.map((day, index) => (
                        <Text key={index} style={styles.weekdayText}>{day.dayLabel}</Text>
                    ))}
                </View>

                {/* Dates Row */}
                <View style={styles.datesRow}>
                    {weekDates.map((day) => (
                        <TouchableOpacity
                            key={day.fullDate}
                            style={[styles.dayContainer, selectedDate === day.fullDate && styles.selectedDay]}
                            onPress={() => setSelectedDate(day.fullDate)}
                        >
                            <Text style={styles.dayText}>{day.dateNumber}</Text>
                            <View style={styles.dotContainer}>
                                {getDayStatusDots(day.fullDate).map((dot, index) => (
                                    <View key={index} style={[styles.dot, { backgroundColor: dot?.color }]} />
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
                        {/* Medication Icon */}
                        <Icon name={typeIcons[item.type]} size={24} color={statusColors[item.status]} style={styles.icon} />

                        {/* Reminder Details */}
                        <View style={styles.textContainer}>
                            <Text style={styles.reminderTitle}>{item.name}</Text>
                            <Text style={styles.reminderDetails}>{item.dosage} @ {item.time}</Text>
                        </View>

                        {/* Take Button (Aligned to Right) */}
                        {item.status !== "taken" && (
                            <TouchableOpacity onPress={() => markAsTaken(item.id)} style={[styles.takeButton, { backgroundColor: statusColors[item.status] }]}>
                                <Text style={styles.buttonText}>Принять</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#121212" },
    weekHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    weekText: { fontSize: 18, color: "white", fontWeight: "bold" },
    arrowButton: { padding: 10 },
    weekContainer: { alignItems: "center", marginBottom: 15 },

    // Weekday labels row (пн, вт, ср...)
    weekdayRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 5 },
    weekdayText: { fontSize: 14, color: "white", fontWeight: "bold", textAlign: "center", width: "14%" },

    // Dates row
    datesRow: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
    dayContainer: { alignItems: "center", width: "14%", paddingVertical: 5, borderRadius: 5 },
    selectedDay: { backgroundColor: "#007AFF", borderRadius: 5, padding: 5 },
    dayText: { fontSize: 16, color: "white", fontWeight: "bold" },

    // Dots under the dates
    dotContainer: { flexDirection: "row", marginTop: 5 },
    dot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 2 },

    // 📌 Updated Reminder Styles
    reminderItem: {
        flexDirection: "row", // Ensures button is on the right
        alignItems: "center",
        justifyContent: "space-between", // Moves button to the right
        padding: 15,
        marginBottom: 10,
        backgroundColor: "#1E1E1E",
        borderRadius: 10,
        borderLeftWidth: 6, // Colored border based on status
    },
    icon: { marginRight: 10 },
    textContainer: { flex: 1, marginLeft: 10 }, // Allows text to take full space
    reminderTitle: { fontSize: 18, color: "white", fontWeight: "bold" },
    reminderDetails: { fontSize: 14, color: "#AAA" },

    // 📌 Smaller "Take" Button (Aligned to Right)
    takeButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 50, // Smaller button width
    },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});


export default MainScreen;
