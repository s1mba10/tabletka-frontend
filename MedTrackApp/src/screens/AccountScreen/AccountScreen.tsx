import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import { RootStackParamList } from '../../navigation';

import { styles } from './styles';

interface ProfileData {
  lastName: string;
  firstName: string;
  middleName: string;
  phone: string;
  email: string;
  gender: 'Мужской' | 'Женский';
  birthDate: string;
  vk: string;
  instagram: string;
  odnoklassniki: string;
  telegram: string;
}

interface GenderSelectorProps {
  value: 'Мужской' | 'Женский';
  onChange: (gender: 'Мужской' | 'Женский') => void;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({ value, onChange }) => {
  return (
    <View style={styles.genderContainer}>
      <TouchableOpacity
        style={[
          styles.genderButton,
          value === 'Мужской' && styles.genderButtonActive,
        ]}
        onPress={() => onChange('Мужской')}
        accessibilityRole="button"
      >
        <Icon
          name="gender-male"
          size={28}
          color={value === 'Мужской' ? 'white' : '#888'}
        />
        <Text
          style={[
            styles.genderLabel,
            value === 'Мужской' && styles.genderLabelActive,
          ]}
        >
          Мужской
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.genderButton,
          value === 'Женский' && styles.genderButtonActive,
        ]}
        onPress={() => onChange('Женский')}
        accessibilityRole="button"
      >
        <Icon
          name="gender-female"
          size={28}
          color={value === 'Женский' ? 'white' : '#888'}
        />
        <Text
          style={[
            styles.genderLabel,
            value === 'Женский' && styles.genderLabelActive,
          ]}
        >
          Женский
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const STORAGE_KEY = 'userProfile';

const AccountScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Account'>>();
  const [profile, setProfile] = useState<ProfileData>({
    lastName: '',
    firstName: '',
    middleName: '',
    phone: '',
    email: '',
    gender: 'Мужской',
    birthDate: '',
    vk: '',
    instagram: '',
    odnoklassniki: '',
    telegram: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedBirthDateObj, setSelectedBirthDateObj] = useState(new Date());
  const [emailError, setEmailError] = useState('');

  const capitalize = (val: string) =>
    val ? val.charAt(0).toUpperCase() + val.slice(1) : '';

  const formatNameInput = (text: string) =>
    capitalize(text.replace(/[^A-Za-zА-Яа-яЁё]/g, '').slice(0, 30));

  const handleLastNameChange = (text: string) =>
    setProfile(prev => ({ ...prev, lastName: formatNameInput(text) }));

  const handleFirstNameChange = (text: string) =>
    setProfile(prev => ({ ...prev, firstName: formatNameInput(text) }));

  const handleMiddleNameChange = (text: string) =>
    setProfile(prev => ({ ...prev, middleName: formatNameInput(text) }));

  const handleSocialChange = (key: 'vk' | 'instagram' | 'odnoklassniki' | 'telegram') =>
    (text: string) =>
      setProfile(prev => ({
        ...prev,
        [key]: text.replace(/[^A-Za-z0-9_.]/g, '').slice(0, 32),
      }));

  const handleEmailChange = (text: string) => {
    const trimmed = text.trim().slice(0, 64);
    setEmailError(
      trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
        ? 'Некорректный email'
        : '',
    );
    setProfile(prev => ({ ...prev, email: trimmed }));
  };

  const handlePhoneChange = (text: string) => {
    let digits = text.replace(/\D/g, '').slice(0, 11);
    if (!digits) {
      setProfile(prev => ({ ...prev, phone: '' }));
      return;
    }
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7')) digits = '7' + digits;
    setProfile(prev => ({ ...prev, phone: '+' + digits }));
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    let out = '+7';
    if (digits.length > 1) out += ` (${digits.slice(1, 4)}`;
    if (digits.length >= 4) out += `) ${digits.slice(4, 7)}`;
    if (digits.length >= 7) out += `-${digits.slice(7, 9)}`;
    if (digits.length >= 9) out += `-${digits.slice(9, 11)}`;
    return out;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<ProfileData>;
          const gender = parsed.gender === 'Женский' ? 'Женский' : 'Мужской';
          setProfile(prev => ({ ...prev, ...parsed, gender }));
        }
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  const openDatePicker = () => {
    setSelectedBirthDateObj(
      profile.birthDate ? new Date(profile.birthDate) : new Date(),
    );
    setShowDatePicker(true);
  };

  const handleBirthChange = (_e: DateTimePickerEvent, date?: Date) => {
    if (!date) return;
    const today = new Date();
    const minAllowed = new Date();
    minAllowed.setFullYear(today.getFullYear() - 10);
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (date > minAllowed) {
        Alert.alert('Ошибка', 'Возраст должен быть не менее 10 лет');
        return;
      }
      setProfile(prev => ({ ...prev, birthDate: date.toISOString() }));
    } else {
      setSelectedBirthDateObj(date);
    }
  };

  const confirmDate = () => {
    const today = new Date();
    const minAllowed = new Date();
    minAllowed.setFullYear(today.getFullYear() - 10);
    if (selectedBirthDateObj > minAllowed) {
      Alert.alert('Ошибка', 'Возраст должен быть не менее 10 лет');
      return;
    }
    setProfile(prev => ({ ...prev, birthDate: selectedBirthDateObj.toISOString() }));
    setShowDatePicker(false);
  };

  const cancelDatePicker = () => {
    setShowDatePicker(false);
  };

  const save = async () => {
    if (profile.lastName.length < 2 || profile.firstName.length < 2) {
      Alert.alert('Ошибка', 'Имя и фамилия должны содержать минимум 2 буквы');
      return;
    }
    if (emailError) {
      Alert.alert('Ошибка', 'Проверьте корректность email');
      return;
    }
    if (profile.phone.replace(/\D/g, '').length < 11) {
      Alert.alert('Ошибка', 'Введите корректный номер телефона');
      return;
    }
    if (
      (profile.vk && profile.vk.length < 3) ||
      (profile.instagram && profile.instagram.length < 3) ||
      (profile.odnoklassniki && profile.odnoklassniki.length < 3) ||
      (profile.telegram && profile.telegram.length < 3)
    ) {
      Alert.alert('Ошибка', 'Неверный формат никнейма в соцсетях');
      return;
    }
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      Alert.alert('Изменения сохранены');
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить данные');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Выберите дату';
    const d = new Date(dateStr);
    return format(d, 'dd.MM.yyyy');
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
              <Icon
                name="arrow-left"
                size={24}
                color="white"
                onPress={navigation.goBack}
              />
              <Text style={styles.headerTitle}>Профиль</Text>
              <View style={{ width: 24 }} />
            </View>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                <Icon name="account" size={40} color="#888" />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Основные данные</Text>
              <Text style={styles.label}>Фамилия</Text>
              <TextInput
                style={styles.input}
                placeholder="Фамилия"
                placeholderTextColor="#666"
                value={profile.lastName}
                onChangeText={handleLastNameChange}
              />
              <Text style={styles.label}>Имя</Text>
              <TextInput
                style={styles.input}
                placeholder="Имя"
                placeholderTextColor="#666"
                value={profile.firstName}
                onChangeText={handleFirstNameChange}
              />
              <Text style={styles.label}>Отчество</Text>
              <TextInput
                style={styles.input}
                placeholder="Отчество"
                placeholderTextColor="#666"
                value={profile.middleName}
                onChangeText={handleMiddleNameChange}
              />
              <Text style={styles.label}>Пол</Text>
              <GenderSelector
                value={profile.gender}
                onChange={gender =>
                  setProfile(prev => ({ ...prev, gender }))
                }
              />
              <TouchableOpacity
                style={styles.birthRow}
                onPress={openDatePicker}
              >
                <View style={styles.birthTexts}>
                  <Text style={styles.birthLabel}>Дата рождения</Text>
                  <Text style={styles.birthValue}>
                    {formatDate(profile.birthDate)}
                  </Text>
                </View>
                <Icon name="calendar" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Контакты</Text>
              <Text style={styles.label}>Телефон</Text>
              <TextInput
                style={styles.input}
                placeholder="Телефон"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
                value={formatPhone(profile.phone)}
                onChangeText={handlePhoneChange}
              />
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                value={profile.email}
                onChangeText={handleEmailChange}
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Соцсети</Text>
              <Text style={styles.label}>ВКонтакте</Text>
              <View style={styles.rowInput}>
                <Icon name="vk" size={20} style={styles.icon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="ВКонтакте"
                  placeholderTextColor="#666"
                  value={profile.vk}
                  onChangeText={handleSocialChange('vk')}
                />
              </View>
              <Text style={styles.label}>Instagram</Text>
              <View style={styles.rowInput}>
                <Icon name="instagram" size={20} style={styles.icon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Instagram"
                  placeholderTextColor="#666"
                  value={profile.instagram}
                  onChangeText={handleSocialChange('instagram')}
                />
              </View>
              <Text style={styles.label}>Одноклассники</Text>
              <View style={styles.rowInput}>
                <Icon name="alpha-o-circle" size={20} style={styles.icon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Одноклассники"
                  placeholderTextColor="#666"
                  value={profile.odnoklassniki}
                  onChangeText={handleSocialChange('odnoklassniki')}
                />
              </View>
              <Text style={styles.label}>Telegram</Text>
              <View style={styles.rowInput}>
                <Icon name="telegram" size={20} style={styles.icon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Telegram"
                  placeholderTextColor="#666"
                  value={profile.telegram}
                  onChangeText={handleSocialChange('telegram')}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={save}>
              <Text style={styles.saveButtonText}>Сохранить</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && showDatePicker && (
              <Modal
                transparent
                animationType="slide"
                visible={showDatePicker}
                onRequestClose={cancelDatePicker}
              >
                <TouchableWithoutFeedback onPress={cancelDatePicker}>
                  <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                      <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                          <TouchableOpacity onPress={cancelDatePicker}>
                            <Text style={styles.cancelButton}>Отмена</Text>
                          </TouchableOpacity>
                          <Text style={styles.modalTitle}>Дата рождения</Text>
                          <TouchableOpacity onPress={confirmDate}>
                            <Text style={styles.doneButton}>Готово</Text>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={selectedBirthDateObj}
                          mode="date"
                          display="spinner"
                          onChange={handleBirthChange}
                          style={styles.timePickerIOS}
                          textColor="white"
                          themeVariant="dark"
                          locale="ru-RU"
                          maximumDate={new Date()}
                        />
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            )}
            {Platform.OS === 'android' && showDatePicker && (
              <DateTimePicker
                value={selectedBirthDateObj}
                mode="date"
                display="default"
                onChange={handleBirthChange}
                maximumDate={new Date()}
                locale="ru-RU"
              />
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AccountScreen;
