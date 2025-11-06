import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StatusBar,
  Alert,
  Animated,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  format,
  addWeeks,
  getISOWeek,
  setISOWeek,
  setISOWeekYear,
  startOfISOWeek,
  differenceInCalendarISOWeeks,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView, Swipeable, RectButton, Gesture, GestureDetector } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, RouteProp } from '@react-navigation/native';
import ReanimatedAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  withDecay,
} from 'react-native-reanimated';

import { styles } from './styles';
import WeekPickerModal from './WeekPickerModal';
import { NavigationProp } from './types';
import { RootStackParamList } from '../../navigation';
import { Reminder } from '../../types';
import { getWeekDates } from './utils';
import { statusColors, typeIcons } from './constants';
import { useCountdown, useCourses } from '../../hooks';
import MedicationDayStatsButton from '../../components/MedicationDayStatsButton';

const applyStatusRules = (items: Reminder[]): Reminder[] => {
  const now = Date.now();
  return items.map((r) => {
    if (r.status === 'taken' || r.status === 'missed') return r;
    const due = new Date(`${r.date}T${r.time}`);
    return now >= due.getTime() + 15 * 60 * 1000
      ? { ...r, status: 'missed' }
      : { ...r, status: 'pending' };
  });
};

const MedCalendarScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'MedCalendar'>>();
  const { removeCourse } = useCourses();

  const insets = useSafeAreaInsets();
  // На Android даём ровно высоту статус-бара/выреза; снизу — 0 (без лишней чёрной полосы)
  const androidTopPad = Platform.OS === 'android' ? Math.max(insets.top, 8) : 0;

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const fabPressAnim = useRef(new Animated.Value(1)).current;

  // Reanimated shared values for day sliding
  const isDragging = useSharedValue(false);
  const containerTranslateX = useSharedValue(0); // For container sliding during drag

  const SCREEN_WIDTH = Dimensions.get('window').width;

  const FAB_SIZE = 60;
  const FAB_MARGIN = 16;
  const ACTION_SPACING = 8;
  const ACTION_MARGIN = 4;
  const fabBottom = FAB_MARGIN;
  const actionsBottom = fabBottom + FAB_SIZE + ACTION_SPACING + ACTION_MARGIN;

  useEffect(() => {
    Animated.timing(fabAnim, {
      toValue: fabOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fabOpen, fabAnim]);

  const weekDates = getWeekDates(weekOffset);
  const rowRefs = useRef<Map<string, Swipeable>>(new Map());

  // Helper to get adjacent dates for sliding effect
  const getAdjacentDates = () => {
    const currentIndex = weekDates.findIndex(d => d.fullDate === selectedDate);
    return {
      prevDate: currentIndex > 0 ? weekDates[currentIndex - 1].fullDate : null,
      currentDate: selectedDate,
      nextDate: currentIndex < weekDates.length - 1 ? weekDates[currentIndex + 1].fullDate : null,
    };
  };

  const animateToDate = (newDate: string) => {
    const currentIndex = weekDates.findIndex(d => d.fullDate === selectedDate);
    const newIndex = weekDates.findIndex(d => d.fullDate === newDate);

    if (currentIndex === newIndex) return;

    const direction = newIndex > currentIndex ? 'left' : 'right';
    const slideDistance = direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH;

    // Animate the container to slide to the next/prev day
    containerTranslateX.value = withSpring(slideDistance, {
      damping: 15,
      stiffness: 150,
      mass: 0.8,
      overshootClamping: false,
    }, (finished) => {
      if (finished) {
        // After animation completes, update the date and reset position
        runOnJS(setSelectedDate)(newDate);
        containerTranslateX.value = 0; // Reset to center for next transition
      }
    });
  };

  // Helper function to handle gesture end
  const handleGestureEnd = (translationX: number, velocityX: number) => {
    const currentIndex = weekDates.findIndex(d => d.fullDate === selectedDate);

    // Calculate threshold (30% of screen width or fast swipe)
    const swipeThreshold = SCREEN_WIDTH * 0.3;
    const velocityThreshold = 500; // pixels per second

    // Check if at boundaries
    const isAtStart = currentIndex === 0;
    const isAtEnd = currentIndex === weekDates.length - 1;

    // Fast swipe detection
    const isFastSwipeLeft = velocityX < -velocityThreshold;
    const isFastSwipeRight = velocityX > velocityThreshold;

    // Determine direction based on distance or velocity
    const shouldGoNext = (translationX < -swipeThreshold || isFastSwipeLeft) && !isAtEnd;
    const shouldGoPrev = (translationX > swipeThreshold || isFastSwipeRight) && !isAtStart;

    if (shouldGoNext) {
      // Slide to next day
      const slideDistance = -SCREEN_WIDTH;
      containerTranslateX.value = withSpring(slideDistance, {
        damping: 15,
        stiffness: 150,
        mass: 0.8,
        overshootClamping: false,
      }, (finished) => {
        if (finished) {
          runOnJS(setSelectedDate)(weekDates[currentIndex + 1].fullDate);
          containerTranslateX.value = 0; // Reset for next transition
        }
      });
    } else if (shouldGoPrev) {
      // Slide to previous day
      const slideDistance = SCREEN_WIDTH;
      containerTranslateX.value = withSpring(slideDistance, {
        damping: 15,
        stiffness: 150,
        mass: 0.8,
        overshootClamping: false,
      }, (finished) => {
        if (finished) {
          runOnJS(setSelectedDate)(weekDates[currentIndex - 1].fullDate);
          containerTranslateX.value = 0; // Reset for next transition
        }
      });
    } else {
      // Snap back to center
      containerTranslateX.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
        mass: 0.8,
        overshootClamping: false,
      });
    }
  };

  // Rubber band effect for edge resistance
  const applyRubberBand = (translation: number, isAtStart: boolean, isAtEnd: boolean) => {
    'worklet';
    const maxOverscroll = 80; // Maximum pixels allowed to drag past edge

    // If dragging right at start, apply resistance
    if (isAtStart && translation > 0) {
      return maxOverscroll * (1 - Math.exp(-translation / maxOverscroll));
    }

    // If dragging left at end, apply resistance
    if (isAtEnd && translation < 0) {
      return -maxOverscroll * (1 - Math.exp(translation / maxOverscroll));
    }

    return translation;
  };

  // Gesture handler for interactive dragging between days
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])  // Requires 10px horizontal movement (lower for more responsive)
    .failOffsetY([-15, 15])     // Fails if vertical movement exceeds 15px (for FlatList scrolling)
    .enableTrackpadTwoFingerGesture(false)
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      const currentIndex = weekDates.findIndex(d => d.fullDate === selectedDate);
      const isAtStart = currentIndex === 0;
      const isAtEnd = currentIndex === weekDates.length - 1;

      // Apply rubber band effect at edges for smooth, elastic feel
      containerTranslateX.value = applyRubberBand(event.translationX, isAtStart, isAtEnd);
    })
    .onEnd((event) => {
      isDragging.value = false;
      runOnJS(handleGestureEnd)(event.translationX, event.velocityX);
    });

  // Animated style for container that holds all three days
  // The container starts offset by -SCREEN_WIDTH to show the middle (current) day
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -SCREEN_WIDTH + containerTranslateX.value }],
  }));

  const handleWeekSelect = (year: number, week: number) => {
    const target = startOfISOWeek(setISOWeek(setISOWeekYear(new Date(), year), week));
    const offset = differenceInCalendarISOWeeks(target, startOfISOWeek(new Date()));
    setWeekOffset(offset);
    setSelectedDate(format(target, 'yyyy-MM-dd'));
    setPickerVisible(false);
  };

  useEffect(() => {
    const loadReminders = async () => {
      try {
        const storedReminders = await AsyncStorage.getItem('reminders');
        if (storedReminders) setReminders(applyStatusRules(JSON.parse(storedReminders)));
      } catch (error) {
        console.error('Failed to load reminders:', error);
      }
    };
    loadReminders();

    const interval = setInterval(() => setReminders(prev => applyStatusRules(prev)), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('reminders', JSON.stringify(reminders));
        const total_taken = reminders.filter(r => r.status === 'taken').length;
        const total_missed = reminders.filter(r => r.status === 'missed').length;
        const total = total_taken + total_missed;
        const adherence_percentage = total > 0 ? (total_taken / total) * 100 : 0;
        await AsyncStorage.setItem(
          'userStats',
          JSON.stringify({ total_taken, total_missed, adherence_percentage }),
        );
      } catch (error) {
        console.error('Failed to save reminders:', error);
      }
    };
    if (reminders.length > 0) saveData();
  }, [reminders]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const params = route.params;
      if (params?.forceRefresh) {
        AsyncStorage.getItem('reminders').then(stored => {
          if (!stored) return setReminders([]);
          try { setReminders(applyStatusRules(JSON.parse(stored))); }
          catch { setReminders([]); }
        });
        navigation.setParams({ forceRefresh: undefined });
      }

      if (!params) return;

      if (params.newReminders?.length) {
        setReminders(prev => applyStatusRules([...prev, ...params.newReminders!]));
        const ds = params.newReminders.map(r => r.date);
        if (!ds.includes(selectedDate) && ds.length > 0) setSelectedDate(ds[0]);
        navigation.setParams({ newReminders: undefined });
      } else if (params.newReminder) {
        if (params.newReminder.date !== selectedDate) setSelectedDate(params.newReminder.date);
        setReminders(prev => applyStatusRules([...prev, params.newReminder!]));
        navigation.setParams({ newReminder: undefined });
      }

      if (params.updatedReminder) {
        setReminders(prev =>
          applyStatusRules(
            prev.map(reminder =>
              reminder.id === params.updatedReminder!.id ? params.updatedReminder! : reminder,
            ),
          ),
        );
        navigation.setParams({ updatedReminder: undefined });
      }
    });
    return unsubscribe;
  }, [navigation, selectedDate, route.params]);

  const getDayStatusDots = (date: string) =>
    reminders
      .filter(reminder => reminder.date === date)
      .slice(0, 5)
      .map(reminder => ({ color: statusColors[reminder.status] }));

  const deleteReminder = (id: string) => {
    Alert.alert('Удалить напоминание', 'Вы уверены, что хотите удалить это напоминание?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            rowRefs.current.get(id)?.close();
            const reminder = reminders.find(i => i.id === id);
            const updated = reminders.filter(i => i.id !== id);
            setReminders(applyStatusRules(updated));
            await AsyncStorage.setItem('reminders', JSON.stringify(updated));
            if (reminder?.courseId) {
              const exists = updated.some(r => r.courseId === reminder.courseId);
              if (!exists) await removeCourse(reminder.courseId);
            }
          } catch (e) {
            console.error('Failed to delete reminder:', e);
            Alert.alert('Ошибка', 'Не удалось удалить напоминание');
          }
        },
      },
    ]);
  };

  const markAsMissed = (id: string) =>
    setReminders(prev => prev.map(r => (r.id === id ? { ...r, status: 'missed' } : r)));
  const markAsTaken = (item: Reminder) =>
    setReminders(prev => prev.map(r => (r.id === item.id ? { ...r, status: 'taken' } : r)));

  const closeOtherRows = (id: string) => {
    rowRefs.current.forEach((ref, key) => { if (key !== id) ref.close(); });
  };

  const renderRightActions = (id: string) => (
    <RectButton style={styles.deleteButton} onPress={() => deleteReminder(id)}>
      <Icon name="delete" size={24} color="white" />
      <Text style={styles.deleteText}>Удалить</Text>
    </RectButton>
  );

  // Component to render content for a specific day
  const DayContent: React.FC<{ date: string | null }> = ({ date }) => {
    if (!date) return null;

    const dayReminders = reminders
      .filter(reminder => reminder.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));

    return (
      <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
        <MedicationDayStatsButton
          date={date}
          takenCount={dayReminders.filter(r => r.status === 'taken').length}
          scheduledCount={dayReminders.length}
        />

        <FlatList
          data={dayReminders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReminderCard item={item} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyListContainer}>
              <Image
                source={require("/Users/s1mba/PycharmProjects/tabletka-grok/frontend/MedTrackApp/assets/heart_pill.png")}
                style={styles.emptyListImage}
                resizeMode="contain"
              />
              <Text style={styles.emptyListText}>Нет напоминаний на этот день</Text>
              <Text style={styles.emptyListSubText}>Нажмите на + чтобы добавить</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 0 }}
        />
      </View>
    );
  };

  const ReminderCard: React.FC<{ item: Reminder }> = ({ item }) => {
    const due = new Date(`${item.date}T${item.time}`);
    const now = Date.now();
    const active =
      item.status === 'pending' && now >= due.getTime() && now < due.getTime() + 15 * 60 * 1000;
    const { minutes, seconds, progress } = useCountdown(due, active, () => markAsMissed(item.id));
    const progressColor = progress > 0.5 ? '#4CAF50' : progress > 0.2 ? '#FFEB3B' : '#F44336';

    return (
      <Swipeable
        ref={ref => { if (ref) rowRefs.current.set(item.id, ref); }}
        renderRightActions={() => renderRightActions(item.id)}
        onSwipeableOpen={() => closeOtherRows(item.id)}
        friction={2}
        overshootRight={false}
      >
        <View style={[styles.reminderItem, { borderLeftColor: statusColors[item.status] }]}>
          <TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate('ReminderEdit', { reminder: item, mainKey: route.key })
            }
          >
            <View style={styles.reminderContent}>
              <Icon
                name={typeIcons[item.type]}
                size={24}
                color={statusColors[item.status]}
                style={styles.icon}
              />
              <View style={styles.textContainer}>
                <Text style={styles.reminderTitle}>{item.name}</Text>
                <Text style={styles.reminderDetails}>
                  {item.dosage} @ {item.time}
                </Text>
                {active && (
                  <View style={styles.countdownContainer}>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${progress * 100}%`, backgroundColor: progressColor },
                        ]}
                      />
                    </View>
                    <Text style={[styles.countdownText, { color: progressColor }]}>
                      {minutes}:{seconds}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>

          <TouchableOpacity
            onPress={() => (item.status === 'taken' ? markAsMissed(item.id) : markAsTaken(item))}
            style={[styles.takeButton, { backgroundColor: statusColors[item.status] }]}
          >
            <Text style={styles.buttonText}>
              {item.status === 'taken' ? 'Пропустить' : 'Принять'}
            </Text>
          </TouchableOpacity>
        </View>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        translucent={Platform.OS === 'ios'}
        backgroundColor={Platform.OS === 'android' ? '#000' : 'transparent'}
        barStyle="light-content"
      />

      <SafeAreaView edges={Platform.OS === 'ios' ? ['top', 'bottom'] : []} style={styles.container}>
        <View style={{ flex: 1, paddingTop: androidTopPad }}>
          {/* Week Navigation */}
          <View style={styles.weekHeader}>
            <TouchableOpacity
              onPress={() => setWeekOffset(weekOffset - 1)}
              style={styles.arrowButton}
              accessibilityRole="button"
            >
              <Icon name="chevron-left" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" onPress={() => setPickerVisible(true)}>
              <Text style={styles.weekText}>
                {format(addWeeks(new Date(), weekOffset), 'LLLL yyyy', { locale: ru }).charAt(0).toUpperCase() +
                  format(addWeeks(new Date(), weekOffset), 'LLLL yyyy ', { locale: ru }).slice(1)}
                • {getISOWeek(addWeeks(new Date(), weekOffset))} неделя
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setWeekOffset(weekOffset + 1)}
              style={styles.arrowButton}
              accessibilityRole="button"
            >
              <Icon name="chevron-right" size={30} color="white" />
            </TouchableOpacity>
          </View>

          {/* Week Dates */}
          <View style={styles.weekContainer}>
            <View style={styles.weekdayRow}>
              {getWeekDates(weekOffset).map((day, index) => (
                <Text key={index} style={styles.weekdayText}>
                  {day.dayLabel}
                </Text>
              ))}
            </View>
            <View style={styles.datesRow}>
              {getWeekDates(weekOffset).map((day) => (
                <TouchableOpacity
                  key={day.fullDate}
                  onPress={() => animateToDate(day.fullDate)}
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
                    {getDayStatusDots(day.fullDate).map((dot, idx) => (
                      <View key={idx} style={[styles.dot, { backgroundColor: dot.color }]} />
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <GestureDetector gesture={panGesture}>
            <ReanimatedAnimated.View style={[{ flex: 1, overflow: 'hidden' }]}>
              <ReanimatedAnimated.View
                style={[
                  {
                    flex: 1,
                    flexDirection: 'row',
                    width: SCREEN_WIDTH * 3,
                  },
                  animatedContainerStyle
                ]}
              >
                {/* Previous Day */}
                <DayContent date={getAdjacentDates().prevDate} />

                {/* Current Day */}
                <DayContent date={getAdjacentDates().currentDate} />

                {/* Next Day */}
                <DayContent date={getAdjacentDates().nextDate} />
              </ReanimatedAnimated.View>
            </ReanimatedAnimated.View>
          </GestureDetector>

          {/* Speed Dial FAB */}
          {fabOpen && (
            <TouchableWithoutFeedback onPress={() => setFabOpen(false)}>
              <View style={styles.overlay} />
            </TouchableWithoutFeedback>
          )}
          <Animated.View
            pointerEvents={fabOpen ? 'auto' : 'none'}
            style={[
              styles.speedDialActions,
              {
                bottom: actionsBottom,
                opacity: fabAnim,
                transform: [
                  {
                    translateY: fabAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.speedDialAction}
              onPress={() => {
                setFabOpen(false);
                navigation.navigate('Medications');
              }}
            >
              <Icon name="medical-bag" size={24} color="white" />
              <Text style={styles.speedDialLabel}>Препараты</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.speedDialAction}
              onPress={() => {
                setFabOpen(false);
                navigation.navigate('ReminderAdd', { selectedDate, mainKey: route.key });
              }}
            >
              <Icon name="bell-plus" size={24} color="white" />
              <Text style={styles.speedDialLabel}>Добавить напоминание</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.fab, { bottom: fabBottom, transform: [{ scale: fabPressAnim }] }]}>
            <TouchableOpacity
              style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
              onPress={() => setFabOpen(prev => !prev)}
              onPressIn={() => {
                Animated.spring(fabPressAnim, {
                  toValue: 0.85,
                  useNativeDriver: true,
                  speed: 50,
                  bounciness: 0,
                }).start();
              }}
              onPressOut={() => {
                Animated.spring(fabPressAnim, {
                  toValue: 1,
                  useNativeDriver: true,
                  speed: 20,
                  bounciness: 8,
                }).start();
              }}
              activeOpacity={1}
            >
              <Icon name={fabOpen ? 'close' : 'plus'} size={30} color="white" />
            </TouchableOpacity>
          </Animated.View>

          <WeekPickerModal
            visible={pickerVisible}
            onClose={() => setPickerVisible(false)}
            onSelect={handleWeekSelect}
            initialYear={Number(format(addWeeks(new Date(), weekOffset), 'yyyy'))}
            initialWeek={getISOWeek(addWeeks(new Date(), weekOffset))}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default MedCalendarScreen;