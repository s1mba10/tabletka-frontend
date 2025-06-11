import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

import { styles } from './styles';
import { AddReminderScreenNavigationProp, AddReminderScreenRouteProp, typeIcons } from './types';
import { Reminder, MedicationType } from '../../types';
import useReminders from '../../hooks/useReminders';

const ReminderAdd: React.FC = () => {
  const navigation = useNavigation<AddReminderScreenNavigationProp>();
  const route = useRoute<AddReminderScreenRouteProp>();
  const { selectedDate } = route.params || {};

  const { scheduleReminders, syncLocal } = useReminders();

  useEffect(() => {
    syncLocal();
  }, [syncLocal]);

  console.log('AddReminderScreen opened with date:', selectedDate);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [type, setType] = useState<MedicationType>('tablet');

  const [times, setTimes] = useState<string[]>([format(new Date(), 'HH:mm')]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentEditingTime, setCurrentEditingTime] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState(() => {
    const date = new Date();
    date.setHours(9, 0, 0, 0);
    return date;
  });

  const addTime = (timeString: string) => {
    if (times.includes(timeString)) {
      Alert.alert('Предупреждение', 'Это время уже добавлено');
      return;
    }

    const newTimes = [...times, timeString].sort();
    setTimes(newTimes);
  };

  const startEditingTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    setSelectedTime(date);
    setCurrentEditingTime(time);
    setShowTimePicker(true);
  };

  const removeTime = (timeToRemove: string) => {
    if (times.length <= 1) {
      Alert.alert('Предупреждение', 'Должно быть добавлено хотя бы одно время');
      return;
    }

    setTimes(times.filter((t) => t !== timeToRemove));
  };

  const handleTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedDate) {
      setSelectedTime(selectedDate);

      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      if (Platform.OS === 'android') {
        confirmTimeSelection(timeString);
      }
    }
  };

  const openTimePicker = () => {
    setCurrentEditingTime(null);
    setShowTimePicker(true);
  };

  const confirmTimeSelection = (timeString: string) => {
    if (currentEditingTime) {
      if (currentEditingTime !== timeString) {
        const newTimes = times.filter((t) => t !== currentEditingTime);

        if (newTimes.includes(timeString)) {
          Alert.alert('Предупреждение', 'Это время уже добавлено');
        } else {
          setTimes([...newTimes, timeString].sort());
        }
      }
    } else {
      addTime(timeString);
    }

    setCurrentEditingTime(null);
    setShowTimePicker(false);
  };

  const confirmTime = () => {
    const hours = selectedTime.getHours().toString().padStart(2, '0');
    const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    confirmTimeSelection(timeString);
  };

  const cancelTimePicker = () => {
    setCurrentEditingTime(null);
    setShowTimePicker(false);
  };

  const typeOptions: Array<{ label: string; value: MedicationType }> = [
    { label: 'Таблетка', value: 'tablet' },
    { label: 'Капсула', value: 'capsule' },
    { label: 'Жидкость', value: 'liquid' },
    { label: 'Инъекция', value: 'injection' },
  ];

  const saveNewReminders = async () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите название напоминания');
      return;
    }

    if (!dosage.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите дозировку');
      return;
    }

    const reminderDate = selectedDate || format(new Date(), 'yyyy-MM-dd');

    const newReminders: Reminder[] = times.map((time) => {
      const id = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);

      return {
        id,
        name,
        dosage,
        type,
        time,
        status: 'pending',
        date: reminderDate,
      };
    });

    console.log('Created reminders:', JSON.stringify(newReminders));

    try {
      await scheduleReminders(newReminders);
    } catch (error) {
      console.error('Failed to schedule reminders:', error);
      Alert.alert('Ошибка', 'Не удалось связаться с сервером. Напоминания сохранены локально.');
    }

    navigation.navigate('Main', {
      newReminders,
      forceRefresh: Date.now(),
    });

    const reminderText = newReminders.length === 1 ? 'напоминание' : 'напоминания';
    Alert.alert('Добавлено', `${newReminders.length} ${reminderText} успешно создано!`);
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {/* Сделать чтобы было похоже на листание с правой станицы на левую, а не наоборот */}
          <TouchableOpacity onPress={() => navigation.navigate('Main')}>
            <Icon name="arrow-left" size={28} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Добавить напоминание</Text>
        </View>
        <Text style={styles.dateInfo}>Дата: {selectedDate || format(new Date(), 'yyyy-MM-dd')}</Text>

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
              style={[styles.typeOption, type === option.value && styles.selectedType]}
              onPress={() => setType(option.value)}
            >
              <Icon name={typeIcons[option.value]} size={24} color={type === option.value ? '#007AFF' : '#888'} />
              <Text style={[styles.typeText, type === option.value && styles.selectedTypeText]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Время</Text>
        <View style={styles.timesList}>
          {times.map((time) => (
            <View key={time} style={styles.timeItem}>
              <Text style={styles.timeItemText}>{time}</Text>
              <View style={styles.timeActions}>
                <TouchableOpacity onPress={() => startEditingTime(time)} style={styles.timeActionButton}>
                  <Icon name="pencil" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeTime(time)} style={styles.timeActionButton}>
                  <Icon name="delete" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={openTimePicker} style={styles.addTimeButton}>
          <Icon name="plus-circle" size={24} color="#007AFF" />
          <Text style={styles.addTimeText}>Добавить время</Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && showTimePicker && (
          <Modal transparent={true} animationType="slide" visible={showTimePicker}>
            <TouchableWithoutFeedback onPress={cancelTimePicker}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <TouchableOpacity onPress={cancelTimePicker}>
                        <Text style={styles.cancelButton}>Отмена</Text>
                      </TouchableOpacity>
                      <Text style={styles.modalTitle}>{currentEditingTime ? 'Изменить время' : 'Добавить время'}</Text>
                      <TouchableOpacity onPress={confirmTime}>
                        <Text style={styles.doneButton}>{currentEditingTime ? 'Сохранить' : 'Добавить'}</Text>
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

export default ReminderAdd;
