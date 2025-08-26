import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../../navigation';
import { NormalizedEntry, FavoriteItem } from '../../nutrition/types';
import { loadFavorites, saveFavorites } from '../../nutrition/storage';
import { formatNumber } from '../../utils/number';
import { styles } from './styles';

export type FoodEditRouteProp = RouteProp<RootStackParamList, 'FoodEdit'>;
export type FoodEditNavProp = StackNavigationProp<RootStackParamList, 'FoodEdit'>;

const FoodEditScreen: React.FC = () => {
  const navigation = useNavigation<FoodEditNavProp>();
  const { params } = useRoute<FoodEditRouteProp>();
  const { entry, onSave } = params;

  const [portion, setPortion] = useState(
    entry.portionGrams ? String(entry.portionGrams) : '',
  );
  const [note, setNote] = useState(entry.note || '');
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const favKey = entry.sourceRefId || entry.id;
  const isFavorite = favorites.some(f => f.sourceId === favKey);

  useEffect(() => {
    loadFavorites().then(setFavorites);
  }, []);

  const toggleFavorite = async () => {
    if (isFavorite) {
      const updated = favorites.filter(f => f.sourceId !== favKey);
      setFavorites(updated);
      const ok = await saveFavorites(updated);
      if (!ok) setFavorites(favorites);
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
      if (!ok) setFavorites(favorites);
    }
  };

  const handleSave = () => {
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
    onSave(updated);
    navigation.goBack();
  };

  const handleDelete = () => {
    onSave(null);
    navigation.goBack();
  };

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
