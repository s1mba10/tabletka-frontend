import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TouchableWithoutFeedback, StatusBar, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, addWeeks, getISOWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView, Swipeable, RectButton } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, RouteProp } from '@react-navigation/native';

import { styles } from './styles';
import { NavigationProp } from './types';
import { RootStackParamList } from '../../navigation';
import { Reminder } from '../../types';
import { getWeekDates } from './utils';
import { sampleReminders, statusColors, typeIcons } from './constants';

const Main: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Main'>>();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const weekDates = getWeekDates(weekOffset);
  const [reminders, setReminders] = useState<Reminder[]>(sampleReminders);

  const rowRefs = useRef<Map<string, Swipeable>>(new Map());
  const resetStorage = async () => {
    try {
      Alert.alert(
        'Reset Storage',
        'This will delete all your reminders and replace them with sample data. Are you sure?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: async () => {
              try {
                await AsyncStorage.clear();
                console.log('Storage cleared');

                await AsyncStorage.setItem('reminders', JSON.stringify(sampleReminders));
                console.log('Sample data saved to storage');

                setReminders(sampleReminders);

                setSelectedDate(format(new Date(), 'yyyy-MM-dd'));

                Alert.alert(
                  'Storage Reset',
                  'Your storage has been reset to sample data. The app will now show the sample reminders.',
                );
              } catch (error) {
                console.error('Failed to reset storage:', error);
                Alert.alert('Error', 'Failed to reset storage: ' + String(error));
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Reset dialog error:', error);
    }
  };

  <TouchableOpacity style={[styles.fab, { bottom: 160, backgroundColor: '#FF3B30' }]} onPress={resetStorage}>
    <Icon name="restart" size={30} color="white" />
  </TouchableOpacity>;

  useEffect(() => {
    const loadReminders = async () => {
      try {
        const storedReminders = await AsyncStorage.getItem('reminders');
        if (storedReminders) {
          console.log('Loaded reminders from storage');
          setReminders(JSON.parse(storedReminders));
        }
      } catch (error) {
        console.error('Failed to load reminders:', error);
      }
    };

    loadReminders();
  }, []);

  useEffect(() => {
    const saveReminders = async () => {
      try {
        await AsyncStorage.setItem('reminders', JSON.stringify(reminders));
        console.log('Saved reminders to storage, count:', reminders.length);
      } catch (error) {
        console.error('Failed to save reminders:', error);
      }
    };

    if (JSON.stringify(reminders) !== JSON.stringify(sampleReminders)) {
      saveReminders();
    }
  }, [reminders]);

  const updateReminder = (updatedReminder: Reminder) => {
    setReminders((prevReminders) =>
      prevReminders.map((reminder) => (reminder.id === updatedReminder.id ? updatedReminder : reminder)),
    );
  };

  // const addReminder = (newReminder: Reminder) => {
  //   console.log('Adding new reminder:', newReminder);
  //   setReminders((prevReminders) => [...prevReminders, newReminder]);
  // };

  const deleteReminder = (id: string) => {
    Alert.alert('Удалить напоминание', 'Вы уверены, что хотите удалить это напоминание?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        onPress: () => {
          const swipeable = rowRefs.current.get(id);
          if (swipeable) {
            swipeable.close();
          }

          setReminders((prev) => prev.filter((item) => item.id !== id));
        },
        style: 'destructive',
      },
    ]);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('MainScreen focused with date:', selectedDate);

      const params = route.params;
      console.log('Route params from useRoute:', params);

      if (params) {
        if (params.newReminders && params.newReminders.length > 0) {
          console.log('Processing new reminders array:', params.newReminders.length);
          console.log('New reminders:', JSON.stringify(params.newReminders));

          const reminderDates = params.newReminders.map((r) => r.date);
          console.log('Reminder dates:', reminderDates);

          if (!reminderDates.includes(selectedDate) && reminderDates.length > 0) {
            console.log('Auto-selecting date:', reminderDates[0]);
            setSelectedDate(reminderDates[0]);
          }

          setReminders((currentReminders) => {
            const newArray = [...currentReminders, ...params.newReminders!];
            console.log('New reminders array length:', newArray.length);
            return newArray;
          });

          navigation.setParams({
            newReminders: undefined,
          });
        } else if (params.newReminder) {
          console.log('Processing single new reminder');

          if (params.newReminder.date !== selectedDate) {
            console.log('Auto-selecting date for single reminder:', params.newReminder.date);
            setSelectedDate(params.newReminder.date);
          }

          setReminders((currentReminders) => [...currentReminders, params.newReminder!]);

          navigation.setParams({
            newReminder: undefined,
          });
        }

        if (params.updatedReminder) {
          console.log('Processing updated reminder');
          updateReminder(params.updatedReminder);

          navigation.setParams({
            updatedReminder: undefined,
          });
        }
      }
    });

    return unsubscribe;
  }, [navigation, selectedDate, route.params]);

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
      prevReminders.map((reminder) => (reminder.id === id ? { ...reminder, status: 'taken' } : reminder)),
    );
  };

  const closeOtherRows = (id: string) => {
    rowRefs.current.forEach((ref, key) => {
      if (key !== id) {
        ref.close();
      }
    });
  };

  const renderRightActions = (id: string) => {
    return (
      <RectButton style={styles.deleteButton} onPress={() => deleteReminder(id)}>
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
            {format(addWeeks(new Date(), weekOffset), 'LLLL yyyy', { locale: ru }).charAt(0).toUpperCase() +
              format(addWeeks(new Date(), weekOffset), 'LLLL yyyy ', { locale: ru }).slice(1)}
            • {getISOWeek(addWeeks(new Date(), weekOffset))} неделя
          </Text>
          <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)} style={styles.arrowButton}>
            <Icon name="chevron-right" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.weekContainer}>
          <View style={styles.weekdayRow}>
            {weekDates.map((day, index: number) => (
              <Text key={index} style={styles.weekdayText}>
                {day.dayLabel}
              </Text>
            ))}
          </View>
          <View style={styles.datesRow}>
            {weekDates.map((day) => (
              <TouchableOpacity
                key={day.fullDate}
                onPress={() => setSelectedDate(day.fullDate)}
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
                  {getDayStatusDots(day.fullDate).map((dot, index: number) => (
                    <View key={index} style={[styles.dot, { backgroundColor: dot.color }]} />
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
              <View style={[styles.reminderItem, { borderLeftColor: statusColors[item.status] }]}>
                <TouchableWithoutFeedback
                  onPress={() =>
                    navigation.navigate('ReminderEdit', {
                      reminder: item,
                    })
                  }
                >
                  <View style={styles.reminderContent}>
                    <Icon name={typeIcons[item.type]} size={24} color={statusColors[item.status]} style={styles.icon} />
                    <View style={styles.textContainer}>
                      <Text style={styles.reminderTitle}>{item.name}</Text>
                      <Text style={styles.reminderDetails}>
                        {item.dosage} @ {item.time}
                      </Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>

                {item.status !== 'taken' && (
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

        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            navigation.navigate('ReminderAdd', { selectedDate });
          }}
        >
          <Icon name="plus" size={30} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Main;
