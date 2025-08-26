import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../../navigation';
import { NormalizedEntry, FavoriteItem } from '../../nutrition/types';
import {
  loadFavorites,
  saveFavorites,
  loadDiary,
  saveDiary,
} from '../../nutrition/storage';
import { formatNumber } from '../../utils/number';
import { styles } from './styles';

export type FoodEditRouteProp = RouteProp<RootStackParamList, 'FoodEdit'>;
export type FoodEditNavProp = StackNavigationProp<RootStackParamList, 'FoodEdit'>;

const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(message);
  }
};

const FoodEditScreen: React.FC = () => {
  const navigation = useNavigation<FoodEditNavProp>();
  const { params } = useRoute<FoodEditRouteProp>();
  const { date, meal, entryId } = params;

  const [entry, setEntry] = useState<NormalizedEntry | null>(null);
  const [portion, setPortion] = useState('');
  const [note, setNote] = useState('');
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const favKey = entry?.sourceRefId || entry?.id || '';
  const isFavorite = favKey
    ? favorites.some(f => f.sourceId === favKey)
    : false;

  useEffect(() => {
    loadFavorites().then(setFavorites);
    loadDiary()
      .then(data => {
        const day = data[date];
        const found = day?.[meal].find(e => e.id === entryId) || null;
        if (found) {
          setEntry(found);
          setPortion(found.portionGrams ? String(found.portionGrams) : '');
          setNote(found.note || '');
        } else {
          navigation.goBack();
        }
      })
      .catch(() => {
        showToast('Не удалось загрузить данные');
        navigation.goBack();
      });
  }, [date, meal, entryId, navigation]);

  const toggleFavorite = async () => {
    if (!entry) return;
    if (isFavorite) {
      const updated = favorites.filter(f => f.sourceId !== favKey);
      setFavorites(updated);
      const ok = await saveFavorites(updated);
      if (!ok) {
        setFavorites(favorites);
        showToast('Не удалось сохранить изменения');
      } else {
        showToast('Удалено из избранного');
      }
    } else {
      const factor = entry.portionGrams ? 100 / entry.portionGrams : undefined;
      const per100g =
        factor !== undefined
          ? {
              calories: entry.calories * factor,
              protein: entry.protein * factor,
              fat: entry.fat * factor,
              carbs: entry.carbs * factor,
            }
          : undefined;
      const newFav: FavoriteItem = {
        id: Math.random().toString(),
        sourceId: favKey,
        name: entry.name || '',
        defaultPortionGrams: entry.portionGrams,
        per100g,
        createdAt: Date.now(),
      };
      const updated = [newFav, ...favorites];
      setFavorites(updated);
      const ok = await saveFavorites(updated);
      if (!ok) {
        setFavorites(favorites);
        showToast('Не удалось сохранить изменения');
      } else {
        showToast('Добавлено в избранное');
      }
    }
  };

  const handleSave = async () => {
    if (!entry) return;
    const p = parseFloat(portion.replace(',', '.'));
    if (!entry.portionGrams || isNaN(p) || p <= 0) {
      navigation.goBack();
      return;
    }
    const factor = p / entry.portionGrams;
    const updated: NormalizedEntry = {
      ...entry,
      portionGrams: p,
      calories: entry.calories * factor,
      protein: entry.protein * factor,
      fat: entry.fat * factor,
      carbs: entry.carbs * factor,
      note: note || undefined,
    };
    const diary = await loadDiary();
    const day = diary[date];
    if (!day) {
      showToast('Не удалось сохранить изменения');
      return;
    }
    day[entry.mealType] = day[entry.mealType].map(e =>
      e.id === entryId ? updated : e,
    );
    diary[date] = day;
    const ok = await saveDiary(diary);
    if (ok) {
      showToast('Сохранено');
      navigation.goBack();
    } else {
      showToast('Не удалось сохранить изменения');
    }
  };

  const handleDelete = async () => {
    const diary = await loadDiary();
    const day = diary[date];
    if (!day) {
      showToast('Не удалось сохранить изменения');
      return;
    }
    day[meal] = day[meal].filter(e => e.id !== entryId);
    diary[date] = day;
    const ok = await saveDiary(diary);
    if (ok) {
      showToast('Удалено');
      navigation.goBack();
    } else {
      showToast('Не удалось сохранить изменения');
    }
  };

  if (!entry) return null;

  const portionNum = parseFloat(portion.replace(',', '.'));
  const factor =
    entry.portionGrams && !isNaN(portionNum) && portionNum > 0
      ? portionNum / entry.portionGrams
      : 1;
  const currentCalories = entry.calories * factor;
  const currentFat = entry.fat * factor;
  const currentCarbs = entry.carbs * factor;
  const currentProtein = entry.protein * factor;
  const percent = entry.portionGrams ? Math.round(factor * 100) : 100;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{entry.name}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={portion}
        onChangeText={setPortion}
        placeholder="Граммы"
        placeholderTextColor="rgba(255,255,255,0.6)"
      />
      <TextInput
        style={[styles.input, styles.note]}
        value={note}
        onChangeText={setNote}
        placeholder="Заметка"
        placeholderTextColor="rgba(255,255,255,0.6)"
        multiline
        numberOfLines={3}
        maxLength={200}
      />
      <View style={styles.macroPanel}>
        <View style={styles.macroRow}>
          <View style={styles.macroBox}>
            <Text style={styles.macroLabel}>Калории ({percent}%)</Text>
            <Text style={styles.macroValue}>
              {formatNumber(currentCalories, 0)}
            </Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroLabel}>Жир</Text>
            <Text style={styles.macroValue}>
              {formatNumber(currentFat, 1)}
            </Text>
          </View>
        </View>
        <View style={styles.macroRow}>
          <View style={styles.macroBox}>
            <Text style={styles.macroLabel}>Углев</Text>
            <Text style={styles.macroValue}>
              {formatNumber(currentCarbs, 1)}
            </Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroLabel}>Белок</Text>
            <Text style={styles.macroValue}>
              {formatNumber(currentProtein, 1)}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favorite}>
          <Icon
            name={isFavorite ? 'star' : 'star-outline'}
            size={24}
            color="#FFD700"
          />
        </TouchableOpacity>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.deleteText}>Удалить</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>Сохранить</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default FoodEditScreen;
