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

  const onChangeDate = (_: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setProfile(prev => ({ ...prev, birthDate: date.toISOString() }));
    }
  };

  const save = async () => {
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
                onChangeText={lastName => setProfile(prev => ({ ...prev, lastName }))}
              />
              <Text style={styles.label}>Имя</Text>
              <TextInput
                style={styles.input}
                placeholder="Имя"
                placeholderTextColor="#666"
                value={profile.firstName}
                onChangeText={firstName => setProfile(prev => ({ ...prev, firstName }))}
              />
              <Text style={styles.label}>Отчество</Text>
              <TextInput
                style={styles.input}
                placeholder="Отчество"
                placeholderTextColor="#666"
                value={profile.middleName}
                onChangeText={middleName =>
                  setProfile(prev => ({ ...prev, middleName }))
                }
              />
              <Text style={styles.label}>Пол</Text>
              <GenderSelector
                value={profile.gender}
                onChange={gender =>
                  setProfile(prev => ({ ...prev, gender }))
                }
              />
              <Text style={styles.label}>Дата рождения</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: profile.birthDate ? 'white' : '#666' }}>
                  {formatDate(profile.birthDate)}
                </Text>
                <Icon name="calendar" size={20} color="#888" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={profile.birthDate ? new Date(profile.birthDate) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  onChange={onChangeDate}
                />
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Контакты</Text>
              <Text style={styles.label}>Телефон</Text>
              <TextInput
                style={styles.input}
                placeholder="Телефон"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
                value={profile.phone}
                onChangeText={phone => setProfile(prev => ({ ...prev, phone }))}
              />
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                value={profile.email}
                onChangeText={email => setProfile(prev => ({ ...prev, email }))}
              />
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
                  onChangeText={vk => setProfile(prev => ({ ...prev, vk }))}
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
                  onChangeText={instagram =>
                    setProfile(prev => ({ ...prev, instagram }))
                  }
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
                  onChangeText={odnoklassniki =>
                    setProfile(prev => ({ ...prev, odnoklassniki }))
                  }
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
                  onChangeText={telegram =>
                    setProfile(prev => ({ ...prev, telegram }))
                  }
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={save}>
              <Text style={styles.saveButtonText}>Сохранить</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AccountScreen;
