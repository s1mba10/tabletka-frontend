import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActionSheetIOS,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, addWeeks, getISOWeek, differenceInCalendarISOWeeks } from 'date-fns';
import { ru } from 'date-fns/locale';

import { getWeekDates } from '../screens/MedCalendarScreen/utils';

export type NutritionCalendarProps = {
  value: string;
  onChange: (date: string) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  getHasFoodByDate: (date: string) => boolean;
  onCopyFromYesterday?: (date: string) => void;
  onClearDay?: (date: string) => void;
};

const NutritionCalendar: React.FC<NutritionCalendarProps> = ({
  value,
  onChange,
  onPrevWeek,
  onNextWeek,
  getHasFoodByDate,
  onCopyFromYesterday,
  onClearDay,
}) => {
  const initialOffset = differenceInCalendarISOWeeks(new Date(value), new Date());
  const [weekOffset, setWeekOffset] = useState(initialOffset);
  const [selectedDate, setSelectedDate] = useState(value);

  useEffect(() => {
    setSelectedDate(value);
    setWeekOffset(differenceInCalendarISOWeeks(new Date(value), new Date()));
  }, [value]);

  const weekDates = getWeekDates(weekOffset);
  const displayDate = addWeeks(new Date(), weekOffset);
  const monthYear = format(displayDate, 'LLLL yyyy', { locale: ru });
  const headerText = `${monthYear.charAt(0).toUpperCase()}${monthYear.slice(1)} · ${getISOWeek(displayDate)} неделя`;

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
    onChange(date);
  };

  const handleDayLongPress = (date: string) => {
    handleDayPress(date);
    if (!onCopyFromYesterday && !onClearDay) {
      return;
    }

    const confirmCopy = () => {
      Alert.alert('Скопировать из вчера?', 'Текущие записи будут заменены данными из вчера', [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Скопировать', onPress: () => onCopyFromYesterday?.(date) },
      ]);
    };

    const confirmClear = () => {
      Alert.alert('Очистить день?', '', [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: () => onClearDay?.(date),
        },
      ]);
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Скопировать из вчера', 'Очистить день', 'Отмена'],
          cancelButtonIndex: 2,
          destructiveButtonIndex: 1,
        },
        buttonIndex => {
          if (buttonIndex === 0) {
            confirmCopy();
          } else if (buttonIndex === 1) {
            confirmClear();
          }
        },
      );
    } else {
      Alert.alert('', 'Выберите действие', [
        { text: 'Скопировать из вчера', onPress: confirmCopy },
        { text: 'Очистить день', onPress: confirmClear, style: 'destructive' },
        { text: 'Отмена', style: 'cancel' },
      ]);
    }
  };

  const handlePrevWeek = () => {
    const offset = weekOffset - 1;
    setWeekOffset(offset);
    if (onPrevWeek) {
      onPrevWeek();
    }
  };

  const handleNextWeek = () => {
    const offset = weekOffset + 1;
    setWeekOffset(offset);
    if (onNextWeek) {
      onNextWeek();
    }
  };

  return (
    <View>
      <View style={styles.weekHeader}>
        <TouchableOpacity onPress={handlePrevWeek} style={styles.arrowButton} accessibilityRole="button">
          <Icon name="chevron-left" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.weekText}>{headerText}</Text>
        <TouchableOpacity onPress={handleNextWeek} style={styles.arrowButton} accessibilityRole="button">
          <Icon name="chevron-right" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekContainer}>
        <View style={styles.weekdayRow}>
          {weekDates.map((day, index) => (
            <Text key={index} style={styles.weekdayText}>
              {day.dayLabel}
            </Text>
          ))}
        </View>
        <View style={styles.datesRow}>
          {weekDates.map(day => (
            <TouchableOpacity
              key={day.fullDate}
              onPress={() => handleDayPress(day.fullDate)}
              onLongPress={() => handleDayLongPress(day.fullDate)}
              style={[styles.dayContainer, day.fullDate === selectedDate && styles.selectedDay]}
            >
              <Text
                style={[
                  styles.dayText,
                  day.fullDate === selectedDate && styles.selectedDayText,
                  day.isToday && styles.todayText,
                ]}
              >
                {day.dateNumber}
              </Text>
              <View style={styles.dotContainer}>
                {getHasFoodByDate(day.fullDate) && <View style={styles.dot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  weekText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  arrowButton: {
    padding: 10,
  },
  weekContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 5,
  },
  weekdayText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    width: '14%',
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  dayContainer: {
    alignItems: 'center',
    width: '14%',
    paddingVertical: 6,
    borderRadius: 20,
  },
  selectedDay: {
    backgroundColor: '#323232',
  },
  dayText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  selectedDayText: {
    color: 'white',
  },
  todayText: {
    color: '#22C55E',
  },
  dotContainer: {
    marginTop: 3,
    minHeight: 6,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
});

export default NutritionCalendar;

