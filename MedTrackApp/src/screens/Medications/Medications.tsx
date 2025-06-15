import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useMedications } from '../../hooks/useMedications';
import { useCourses, useReminders } from '../../hooks';
import { MedicationsScreenNavigationProp, MedicationFormData } from './types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { styles } from './styles';

const Medications: React.FC = () => {
  const navigation = useNavigation<MedicationsScreenNavigationProp>();
  const { medications, createMedication, updateMedication, removeMedication } = useMedications();
  const { courses, removeCourse } = useCourses();
  const { deleteByCourse } = useReminders();

  const [form, setForm] = useState<MedicationFormData>({ name: '', dosage: '' });

  const formatDate = (iso: string) =>
    format(new Date(iso), 'd MMMM', { locale: ru });

  const startEdit = (id: number) => {
    const med = medications.find(m => m.id === id);
    if (med) {
      setForm({ id: med.id, name: med.name, dosage: med.dosage });
    }
  };

  const clearForm = () => setForm({ name: '', dosage: '' });

  const save = async () => {
    if (!form.name.trim()) return;
    if (form.id) {
      await updateMedication(form.id, { name: form.name, dosage: form.dosage });
    } else {
      await createMedication({ name: form.name, dosage: form.dosage });
    }
    clearForm();
  };

  const today = new Date().toISOString().slice(0, 10);
  const activeCourses = courses.filter(
    c => c.startDate <= today && c.endDate >= today,
  );
  const finishedCourses = courses.filter(c => c.endDate < today);

  const stopCourse = async (id: number) => {
    await removeCourse(id);
    await deleteByCourse(id);
    navigation.navigate('Главная', {
      screen: 'Main',
      params: { forceRefresh: Date.now() },
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <View style={styles.header}>
        {navigation.canGoBack() && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={28} color="#007AFF" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Лекарства</Text>
      </View>
      <ScrollView>
        {activeCourses.length > 0 && (
          <Text style={styles.sectionTitle}>Активные</Text>
        )}
        {activeCourses.map(c => (
          <View key={c.id} style={styles.courseItem}>
            <Text style={styles.courseTitle}>{c.name}</Text>
            <Text style={styles.courseSubtitle}>
              {c.dosage} • с {formatDate(c.startDate)} по {formatDate(c.endDate)}
            </Text>
            <TouchableOpacity onPress={() => stopCourse(c.id)}>
              <Text style={{ color: '#FF3B30', marginTop: 4 }}>Остановить</Text>
            </TouchableOpacity>
          </View>
        ))}

        {finishedCourses.length > 0 && (
          <Text style={styles.sectionTitle}>Завершенные</Text>
        )}
        {finishedCourses.map(c => (
          <View key={c.id} style={styles.courseItem}>
            <Text style={styles.courseTitle}>{c.name}</Text>
            <Text style={styles.courseSubtitle}>
              {c.dosage} • с {formatDate(c.startDate)} по {formatDate(c.endDate)}
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Список лекарств</Text>
        {medications.map(m => (
          <View key={m.id} style={styles.listItem}>
            <View>
              <Text style={styles.listText}>{m.name}</Text>
              {!!m.dosage && (
                <Text style={styles.listText}>{m.dosage}</Text>
              )}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => startEdit(m.id)}
              >
                <Icon name="pencil" size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => removeMedication(m.id)}
              >
                <Icon name="delete" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TextInput
          placeholder="Название"
          placeholderTextColor="#666"
          style={styles.input}
          value={form.name}
          onChangeText={name => setForm(prev => ({ ...prev, name }))}
        />
        <TextInput
          placeholder="Дозировка"
          placeholderTextColor="#666"
          style={styles.input}
          value={form.dosage}
          onChangeText={dosage => setForm(prev => ({ ...prev, dosage }))}
        />
        <TouchableOpacity style={styles.addButton} onPress={save}>
          <Text style={styles.addButtonText}>
            {form.id ? 'Сохранить' : 'Добавить'}
          </Text>
        </TouchableOpacity>
        {form.id && (
          <TouchableOpacity style={styles.addButton} onPress={clearForm}>
            <Text style={styles.addButtonText}>Отмена</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Medications;
