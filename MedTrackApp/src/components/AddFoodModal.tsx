import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';

import { localCatalog, CatalogItem } from '../data/nutritionCatalog';
import {
  FavoriteItem,
  RecentItem,
  getFavorites,
  getRecents,
  saveFavorites,
  addRecent,
} from '../utils/nutritionStorage';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type NormalizedEntry = {
  id: string;
  mealType: MealType;
  name?: string;
  note?: string;
  portionGrams?: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  source: 'search-catalog' | 'favorite' | 'recent' | 'manual';
  sourceRefId?: string;
  createdAt: number;
};

export type AddFoodModalProps = {
  mealType: MealType;
  onCancel: () => void;
  onConfirm: (entry: NormalizedEntry) => void;
  dayTotals?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  dayTargets?: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
  };
};

type Tab = 'search' | 'fav' | 'recent' | 'manual';

const MEAL_TITLES: Record<MealType, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус/Другое',
};

const AddFoodModal: React.FC<AddFoodModalProps> = ({
  mealType,
  onCancel,
  onConfirm,
  dayTotals,
  dayTargets,
}) => {
  const [tab, setTab] = useState<Tab>('search');
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [recents, setRecents] = useState<RecentItem[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<{
    item: CatalogItem | FavoriteItem | RecentItem | null;
    type: 'catalog' | 'favorite' | 'recent' | 'manual';
  }>({ item: null, type: 'manual' });
  const [mass, setMass] = useState('');
  const [note, setNote] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');
  const [saveFav, setSaveFav] = useState(false);

  useEffect(() => {
    getFavorites().then(setFavorites);
    getRecents().then(setRecents);
  }, []);

  const filteredCatalog = localCatalog.filter(it => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      it.name.toLowerCase().includes(q) ||
      (it.brand ? it.brand.toLowerCase().includes(q) : false)
    );
  });

  const resetForm = () => {
    setMass('');
    setNote('');
    setCalories('');
    setProtein('');
    setFat('');
    setCarbs('');
    setSaveFav(false);
    setSelected({ item: null, type: 'manual' });
  };

  const handleAdd = useCallback(() => {
    const grams = parseFloat(mass.replace(',', '.'));
    const cal = parseFloat(calories.replace(',', '.'));
    const p = parseFloat(protein.replace(',', '.'));
    const f = parseFloat(fat.replace(',', '.'));
    const c = parseFloat(carbs.replace(',', '.'));
    if (isNaN(cal) || isNaN(p) || isNaN(f) || isNaN(c)) return;
    const entry: NormalizedEntry = {
      id: Date.now().toString(),
      mealType,
      name:
        selected.type === 'manual'
          ? selected.item && 'name' in selected.item
            ? (selected.item as any).name
            : undefined
          : 'name' in (selected.item as any)
          ? (selected.item as any).name
          : undefined,
      note,
      portionGrams: !isNaN(grams) ? grams : undefined,
      calories: cal,
      protein: p,
      fat: f,
      carbs: c,
      source:
        selected.type === 'catalog'
          ? 'search-catalog'
          : selected.type === 'favorite'
          ? 'favorite'
          : selected.type === 'recent'
          ? 'recent'
          : 'manual',
      sourceRefId:
        selected.item && 'id' in selected.item ? (selected.item as any).id : undefined,
      createdAt: Date.now(),
    };
    onConfirm(entry);
    addRecent({
      id: Date.now().toString(),
      name: entry.name || 'Без названия',
      portionGrams: entry.portionGrams,
      calories: entry.calories,
      protein: entry.protein,
      fat: entry.fat,
      carbs: entry.carbs,
      createdAt: Date.now(),
    });
    if (saveFav && entry.name) {
      const newFav: FavoriteItem = {
        id: Date.now().toString(),
        name: entry.name,
        defaultPortionGrams: entry.portionGrams,
        per100g: entry.portionGrams
          ? {
              calories: (entry.calories / entry.portionGrams) * 100,
              protein: (entry.protein / entry.portionGrams) * 100,
              fat: (entry.fat / entry.portionGrams) * 100,
              carbs: (entry.carbs / entry.portionGrams) * 100,
            }
          : undefined,
        createdAt: Date.now(),
      };
      const list = [...favorites, newFav];
      setFavorites(list);
      saveFavorites(list);
    }
    resetForm();
  }, [mealType, mass, calories, protein, fat, carbs, note, selected, favorites, saveFav, onConfirm]);

  const confirmDisabled =
    !calories || !protein || !fat || !carbs || isNaN(parseFloat(calories.replace(',', '.')));

  const dayFooter = () => {
    if (!dayTotals) return null;
    const { protein, fat, carbs, calories } = dayTotals;
    if (dayTargets) {
      const { protein: pt, fat: ft, carbs: ct, calories: kt } = dayTargets;
      const remaining = kt ? kt - calories : undefined;
      return (
        <Text style={styles.footerText} testID="addfood-footer-dayline">
          За день: Б {protein}/{pt ?? '—'} • Ж {fat}/{ft ?? '—'} • У {carbs}/{ct ?? '—'} • Ккал {calories}/{kt ?? '—'}
          {kt !== undefined ? ` (свободно: ${remaining ?? 0})` : ''}
        </Text>
      );
    }
    return (
      <Text style={styles.footerText} testID="addfood-footer-dayline">
        За день: Б {protein} • Ж {fat} • У {carbs} • Ккал {calories}
      </Text>
    );
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onCancel}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} accessibilityLabel="Отмена">
            <Text style={styles.headerBtn}>Отмена</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Добавить еду</Text>
            <Text style={styles.subtitle}>{MEAL_TITLES[mealType]}</Text>
          </View>
          <TouchableOpacity
            onPress={handleAdd}
            disabled={confirmDisabled}
            accessibilityLabel="Готово"
          >
            <Text style={[styles.headerBtn, confirmDisabled && { opacity: 0.5 }]}>Готово</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'search' && styles.tabActive]}
            onPress={() => setTab('search')}
            testID="addfood-tab-search"
          >
            <Text style={styles.tabText}>Поиск</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'fav' && styles.tabActive]}
            onPress={() => setTab('fav')}
            testID="addfood-tab-fav"
          >
            <Text style={styles.tabText}>Избранное</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'recent' && styles.tabActive]}
            onPress={() => setTab('recent')}
            testID="addfood-tab-recents"
          >
            <Text style={styles.tabText}>Последние</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'manual' && styles.tabActive]}
            onPress={() => setTab('manual')}
            testID="addfood-tab-manual"
          >
            <Text style={styles.tabText}>Вручную</Text>
          </TouchableOpacity>
        </View>
        {tab === 'search' && (
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.searchInput}
              placeholder="Что вы ели?"
              value={search}
              onChangeText={setSearch}
              testID="addfood-search-input"
            />
            <FlatList
              data={filteredCatalog}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => {
                    setSelected({ item, type: 'catalog' });
                    setCalories(String(item.per100g.calories));
                    setProtein(String(item.per100g.protein));
                    setFat(String(item.per100g.fat));
                    setCarbs(String(item.per100g.carbs));
                  }}
                  testID={`addfood-search-item-${item.id}`}
                >
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <Text style={styles.itemSub}>
                    на 100 г: {item.per100g.calories} ккал • Б {item.per100g.protein} • Ж {item.per100g.fat} • У {item.per100g.carbs}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Ничего не найдено. Попробуйте вкладку “Вручную”.
                </Text>
              }
            />
          </View>
        )}
        {tab === 'fav' && (
          <FlatList
            data={favorites}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setSelected({ item, type: 'favorite' });
                  if (item.per100g) {
                    setCalories(String(item.per100g.calories));
                    setProtein(String(item.per100g.protein));
                    setFat(String(item.per100g.fat));
                    setCarbs(String(item.per100g.carbs));
                  }
                  setMass(item.defaultPortionGrams ? String(item.defaultPortionGrams) : '');
                }}
              >
                <Text style={styles.itemTitle}>{item.name}</Text>
                {item.defaultPortionGrams && (
                  <Text style={styles.itemSub}>обычно: {item.defaultPortionGrams} г</Text>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Вы ещё не добавляли избранные продукты. Отмечайте ★ в деталях продукта.
              </Text>
            }
          />
        )}
        {tab === 'recent' && (
          <FlatList
            data={recents}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setSelected({ item, type: 'recent' });
                  setCalories(String(item.calories));
                  setProtein(String(item.protein));
                  setFat(String(item.fat));
                  setCarbs(String(item.carbs));
                  setMass(item.portionGrams ? String(item.portionGrams) : '');
                }}
              >
                <Text style={styles.itemTitle}>{item.name}</Text>
                {item.portionGrams && (
                  <Text style={styles.itemSub}>порция: {item.portionGrams} г</Text>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Пока нет недавних записей.</Text>
            }
          />
        )}
        {tab === 'manual' && (
          <ScrollView contentContainerStyle={styles.manualContainer}>
            <TextInput
              style={styles.input}
              placeholder="Без названия"
              value={selected.item && 'name' in selected.item ? (selected.item as any).name : ''}
              onChangeText={text => {
                setSelected({ item: { ...(selected.item as any), name: text }, type: 'manual' });
              }}
            />
            <TextInput
              style={styles.input}
              placeholder="Масса, г"
              keyboardType="numeric"
              value={mass}
              onChangeText={setMass}
            />
            <TextInput
              style={styles.input}
              placeholder="Калории"
              keyboardType="numeric"
              value={calories}
              onChangeText={setCalories}
              testID="addfood-manual-calories"
            />
            <TextInput
              style={styles.input}
              placeholder="Белки"
              keyboardType="numeric"
              value={protein}
              onChangeText={setProtein}
              testID="addfood-manual-protein"
            />
            <TextInput
              style={styles.input}
              placeholder="Жиры"
              keyboardType="numeric"
              value={fat}
              onChangeText={setFat}
              testID="addfood-manual-fat"
            />
            <TextInput
              style={styles.input}
              placeholder="Углеводы"
              keyboardType="numeric"
              value={carbs}
              onChangeText={setCarbs}
              testID="addfood-manual-carbs"
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Заметка"
              value={note}
              onChangeText={setNote}
              multiline
            />
            <TouchableOpacity
              style={styles.favToggle}
              onPress={() => setSaveFav(prev => !prev)}
              testID="addfood-manual-savefav"
            >
              <Text style={{ color: '#fff' }}>{saveFav ? '★ Сохранить в избранное' : '☆ Сохранить в избранное'}</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
        {dayFooter()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#323232',
  },
  headerBtn: { color: '#22C55E', fontSize: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12, textAlign: 'center' },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#323232',
  },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#22C55E' },
  tabText: { color: '#fff' },
  searchInput: {
    margin: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#323232',
    borderRadius: 8,
    color: '#fff',
  },
  listItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#323232' },
  itemTitle: { color: '#fff', fontSize: 16 },
  itemSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  emptyText: { color: 'rgba(255,255,255,0.6)', padding: 20, textAlign: 'center' },
  manualContainer: { padding: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#323232',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    color: '#fff',
  },
  favToggle: { alignItems: 'center', padding: 12 },
  footerText: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    padding: 8,
    fontSize: 12,
  },
});

export default AddFoodModal;
