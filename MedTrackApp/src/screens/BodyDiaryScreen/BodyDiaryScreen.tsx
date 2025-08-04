import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  isSameWeek,
} from 'date-fns';
import { ru } from 'date-fns/locale';

import { RootStackParamList } from '../../navigation';
import { styles } from './styles';

interface BodyEntry {
  goal: 'Похудение' | 'Набор массы' | 'Поддержание формы';
  height: string;
  weight: string;
  neck: string;
  waist: string;
  hips: string;
  activity: 'Низкий' | 'Средний' | 'Высокий';
  steps: string;
}

const EMPTY_ENTRY: BodyEntry = {
  goal: 'Поддержание формы',
  height: '',
  weight: '',
  neck: '',
  waist: '',
  hips: '',
  activity: 'Средний',
  steps: '',
};

const STORAGE_KEY = 'bodyDiary';

const getWeekKey = (date: Date) =>
  format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');

type NavProp = StackNavigationProp<RootStackParamList, 'BodyDiary'>;

const BodyDiaryScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [selectedWeek, setSelectedWeek] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [entry, setEntry] = useState<BodyEntry>(EMPTY_ENTRY);
  const [data, setData] = useState<Record<string, BodyEntry>>({});
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [tempGoal, setTempGoal] = useState<BodyEntry['goal']>('Поддержание формы');
  const [tempActivity, setTempActivity] = useState<BodyEntry['activity']>('Средний');

  useEffect(() => {
    (async () => {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = json ? JSON.parse(json) : {};
      setData(parsed);
    })();
  }, []);

  useEffect(() => {
    const key = getWeekKey(selectedWeek);
    if (data[key]) {
      setEntry(data[key]);
    } else {
      setEntry(EMPTY_ENTRY);
    }
  }, [selectedWeek, data]);

  const save = async () => {
    const key = getWeekKey(selectedWeek);
    const newData = { ...data, [key]: entry };
    setData(newData);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const openGoalModal = () => {
    setTempGoal(entry.goal);
    setGoalModalVisible(true);
  };

  const confirmGoal = () => {
    setEntry(prev => ({ ...prev, goal: tempGoal }));
    setGoalModalVisible(false);
  };

  const openActivityModal = () => {
    setTempActivity(entry.activity);
    setActivityModalVisible(true);
  };

  const confirmActivity = () => {
    setEntry(prev => ({ ...prev, activity: tempActivity }));
    setActivityModalVisible(false);
  };

  const weeks = Array.from({ length: 52 }, (_, i) =>
    addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), i - 26),
  );

  const renderWeekLabel = (date: Date) => {
    const start = date;
    const end = endOfWeek(date, { weekStartsOn: 1 });
    const sameMonth = start.getMonth() === end.getMonth();
    const startFmt = sameMonth
      ? format(start, 'd', { locale: ru })
      : format(start, 'd MMMM', { locale: ru });
    const endFmt = format(end, 'd MMMM', { locale: ru });
    return sameMonth
      ? `${startFmt}–${endFmt}`
      : `${startFmt} – ${endFmt}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Дневник тела</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.weekPicker}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weeks.map(week => {
            const key = getWeekKey(week);
            const isSelected = isSameWeek(week, selectedWeek, {
              weekStartsOn: 1,
            });
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.weekItem,
                  isSelected && styles.weekItemActive,
                ]}
                onPress={() => setSelectedWeek(week)}
              >
                <Text style={styles.weekItemText}>{renderWeekLabel(week)}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Цель</Text>
        <TouchableOpacity style={styles.selector} onPress={openGoalModal}>
          <Text style={styles.selectorText}>{entry.goal}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Рост (см)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#666"
          value={entry.height}
          onChangeText={text => setEntry(prev => ({ ...prev, height: text }))}
        />

        <Text style={styles.label}>Вес (кг)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#666"
          value={entry.weight}
          onChangeText={text => setEntry(prev => ({ ...prev, weight: text }))}
        />

        <Text style={styles.label}>Обхват шеи (см)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#666"
          value={entry.neck}
          onChangeText={text => setEntry(prev => ({ ...prev, neck: text }))}
        />

        <Text style={styles.label}>Обхват талии (см)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#666"
          value={entry.waist}
          onChangeText={text => setEntry(prev => ({ ...prev, waist: text }))}
        />

        <Text style={styles.label}>Обхват бедер (см)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#666"
          value={entry.hips}
          onChangeText={text => setEntry(prev => ({ ...prev, hips: text }))}
        />

        <Text style={styles.label}>Уровень физической активности</Text>
        <TouchableOpacity style={styles.selector} onPress={openActivityModal}>
          <Text style={styles.selectorText}>{entry.activity}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Среднедневное количество шагов за неделю</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#666"
          value={entry.steps}
          onChangeText={text => setEntry(prev => ({ ...prev, steps: text }))}
        />

        <TouchableOpacity style={styles.saveButton} onPress={save}>
          <Text style={styles.saveButtonText}>Сохранить</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Goal Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={goalModalVisible}
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setGoalModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setGoalModalVisible(false)}>
                    <Text style={styles.cancelButton}>Отмена</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Цель</Text>
                  <TouchableOpacity onPress={confirmGoal}>
                    <Text style={styles.doneButton}>Готово</Text>
                  </TouchableOpacity>
                </View>
                {['Похудение', 'Набор массы', 'Поддержание формы'].map(option => (
                  <TouchableOpacity
                    key={option}
                    style={styles.modalOption}
                    onPress={() => setTempGoal(option as BodyEntry['goal'])}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        tempGoal === option && styles.modalOptionTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Activity Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={activityModalVisible}
        onRequestClose={() => setActivityModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setActivityModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setActivityModalVisible(false)}>
                    <Text style={styles.cancelButton}>Отмена</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Уровень физ. активности</Text>
                  <TouchableOpacity onPress={confirmActivity}>
                    <Text style={styles.doneButton}>Готово</Text>
                  </TouchableOpacity>
                </View>
                {['Низкий', 'Средний', 'Высокий'].map(option => (
                  <TouchableOpacity
                    key={option}
                    style={styles.modalOption}
                    onPress={() => setTempActivity(option as BodyEntry['activity'])}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        tempActivity === option && styles.modalOptionTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default BodyDiaryScreen;

