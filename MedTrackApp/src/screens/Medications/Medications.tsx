import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useMedications } from '../../hooks/useMedications';
import { MedicationsScreenNavigationProp, MedicationFormData } from './types';
import { styles } from './styles';

const Medications: React.FC = () => {
  const navigation = useNavigation<MedicationsScreenNavigationProp>();
  const { medications, createMedication, updateMedication, removeMedication } = useMedications();

  const [form, setForm] = useState<MedicationFormData>({ name: '', dosage: '' });

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Лекарства</Text>
      </View>
      <ScrollView>
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
    </SafeAreaView>
  );
};

export default Medications;
