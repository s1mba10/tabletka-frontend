import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Picker } from '@react-native-picker/picker';
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
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={entry.goal}
            onValueChange={value => setEntry(prev => ({ ...prev, goal: value }))}
            style={styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Похудение" value="Похудение" />
            <Picker.Item label="Набор массы" value="Набор массы" />
            <Picker.Item label="Поддержание формы" value="Поддержание формы" />
          </Picker>
        </View>

        <Text style={styles.label}>Рост (см)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={entry.height}
          onChangeText={text => setEntry(prev => ({ ...prev, height: text }))}
        />

        <Text style={styles.label}>Вес (кг)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={entry.weight}
          onChangeText={text => setEntry(prev => ({ ...prev, weight: text }))}
        />

        <Text style={styles.label}>Обхват шеи (см)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={entry.neck}
          onChangeText={text => setEntry(prev => ({ ...prev, neck: text }))}
        />

        <Text style={styles.label}>Обхват талии (см)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={entry.waist}
          onChangeText={text => setEntry(prev => ({ ...prev, waist: text }))}
        />

        <Text style={styles.label}>Обхват бедер (см)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={entry.hips}
          onChangeText={text => setEntry(prev => ({ ...prev, hips: text }))}
        />

        <Text style={styles.label}>Уровень физической активности</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={entry.activity}
            onValueChange={value =>
              setEntry(prev => ({ ...prev, activity: value }))
            }
            style={styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Низкий" value="Низкий" />
            <Picker.Item label="Средний" value="Средний" />
            <Picker.Item label="Высокий" value="Высокий" />
          </Picker>
        </View>

        <Text style={styles.label}>Среднедневное количество шагов за неделю</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={entry.steps}
          onChangeText={text => setEntry(prev => ({ ...prev, steps: text }))}
        />

        <TouchableOpacity style={styles.saveButton} onPress={save}>
          <Text style={styles.saveButtonText}>Сохранить</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BodyDiaryScreen;

