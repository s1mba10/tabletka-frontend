import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AddFoodModalProps,
  CatalogItem,
  FavoriteItem,
  RecentItem,
  UserCatalogItem,
  NormalizedEntry,
} from '../../nutrition/types';
import { localCatalog } from '../../nutrition/catalog';
import { formatNumber } from '../../utils/number';
import { showToast } from '../../utils/toast';
import {
  loadFavorites,
  loadRecents,
  saveFavorites,
  addRecent,
  loadUserCatalog,
  saveUserCatalog,
  loadAllNutritionData,
} from '../../nutrition/storage';

import { styles } from './styles';
import HeaderBar from './HeaderBar';
import TabsCarousel from './TabsCarousel';
import DetailsSheet from './DetailsSheet';
import IngredientPickerModal from './IngredientPickerModal';

const mealTitles: Record<string, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус/Другое',
};

type SearchItem =
  | { type: 'catalog'; item: CatalogItem }
  | { type: 'user'; item: UserCatalogItem }
  | { type: 'favorite'; item: FavoriteItem };

type TabKey = 'search' | 'recents' | 'favorites' | 'recipes';

const TABS: { key: TabKey; title: string }[] = [
  { key: 'search',    title: 'Поиск еды' },
  { key: 'recents',   title: 'Недавно' },
  { key: 'favorites', title: 'Избранное' },
  { key: 'recipes',   title: 'Рецепты' },
];

const SCREEN_W = Dimensions.get('window').width;
const BOTTOM_BAR_HEIGHT = 56;
const DETAILS_HEIGHT = 240;

const AddFoodModal: React.FC<AddFoodModalProps> = ({
  mealType,
  onCancel,
  onConfirm,
}) => {
  const insets = useSafeAreaInsets();

  // ------- Состояния данных -------
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [recents, setRecents] = useState<RecentItem[]>([]);
  const [userCatalog, setUserCatalog] = useState<UserCatalogItem[]>([]);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);

  // выбор из списков
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogItem | UserCatalogItem | null>(null);
  const [selectedSource, setSelectedSource] = useState<'catalog' | 'user' | null>(null);
  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteItem | null>(null);
  const [selectedRecent, setSelectedRecent] = useState<RecentItem | null>(null);
  const [portion, setPortion] = useState('');
  const [note, setNote] = useState('');

  // ------- Рецепты (создание) -------
  const [recipeMode, setRecipeMode] = useState<'mine' | 'create'>('mine');
  const [dishName, setDishName] = useState('');
  const [dishWeight, setDishWeight] = useState('');
  const [dishNote, setDishNote] = useState('');
  const [dishIngredients, setDishIngredients] = useState<
    { id: string; name: string; grams: number; per100g: { calories: number; protein: number; fat: number; carbs: number } }[]
  >([]);

  // пикер ингредиента
  const [ingredientPickerVisible, setIngredientPickerVisible] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [ingredientResults, setIngredientResults] = useState<SearchItem[]>([]);
  const [ingredientSelected, setIngredientSelected] = useState<SearchItem | null>(null);
  const [ingredientMass, setIngredientMass] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // ------- Карусель вкладок -------
  const [tabIndex, setTabIndex] = useState(0);
  const pagerRef = useRef<FlatList>(null);
  const go = useCallback((nextIdx: number) => {
    const clamped = Math.max(0, Math.min(TABS.length - 1, nextIdx));
    setTabIndex(clamped);
    pagerRef.current?.scrollToIndex({ index: clamped, animated: true });
  }, []);

  // ------- Загрузка -------
  useEffect(() => {
    // Загружаем все nutrition данные за один I/O запрос
    loadAllNutritionData().then(({ favorites, recents, userCatalog }) => {
      setFavorites(favorites);
      setRecents(recents);
      setUserCatalog(userCatalog);
    });
  }, []);

  // ------- Утилиты ключей -------
  const favKey = (f: FavoriteItem) => f.sourceId || `fav-${f.id}`;
  const itemKey = (
    item: CatalogItem | UserCatalogItem | FavoriteItem,
    type: 'catalog' | 'user' | 'favorite',
  ) => (type === 'favorite' ? favKey(item as FavoriteItem) : (item as CatalogItem | UserCatalogItem).id);

  // ------- Поиск данных -------
  const allSearchItems = useMemo<SearchItem[]>(() => {
    const map = new Map<string, SearchItem>();
    localCatalog.forEach(it => map.set(itemKey(it, 'catalog'), { type: 'catalog', item: it }));
    userCatalog.forEach(it => map.set(itemKey(it, 'user'), { type: 'user', item: it }));
    favorites.forEach(it => map.set(itemKey(it, 'favorite'), { type: 'favorite', item: it }));
    return Array.from(map.values()).sort((a, b) => a.item.name.localeCompare(b.item.name, 'ru'));
  }, [userCatalog, favorites]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    const t = setTimeout(() => {
      if (!q) {
        if (TABS[tabIndex].key === 'search') setSearchResults(allSearchItems.slice(0, 15));
        else setSearchResults([]);
        return;
      }
      setSearchResults(
        allSearchItems.filter(it => it.item.name.toLowerCase().includes(q)),
      );
    }, 300);
    return () => clearTimeout(t);
  }, [query, allSearchItems, tabIndex]);

  // Поиск для пикера ингредиента
  useEffect(() => {
    if (!ingredientPickerVisible) return;
    const q = ingredientSearch.trim().toLowerCase();
    const t = setTimeout(() => {
      if (!q) setIngredientResults(allSearchItems.slice(0, 20));
      else setIngredientResults(allSearchItems.filter(it => it.item.name.toLowerCase().includes(q)));
    }, 250);
    return () => clearTimeout(t);
  }, [ingredientSearch, allSearchItems, ingredientPickerVisible]);

  // ------- Вычисления -------
  const portionNum = useMemo(() => parseFloat(portion.replace(',', '.')) || 0, [portion]);

  const selectedName =
    selectedCatalog?.name || selectedFavorite?.name || selectedRecent?.name || '';

  const dishTotals = useMemo(
    () =>
      dishIngredients.reduce(
        (acc, ing) => {
          acc.calories += (ing.per100g.calories * ing.grams) / 100;
          acc.protein += (ing.per100g.protein * ing.grams) / 100;
          acc.fat += (ing.per100g.fat * ing.grams) / 100;
          acc.carbs += (ing.per100g.carbs * ing.grams) / 100;
          return acc;
        },
        { calories: 0, protein: 0, fat: 0, carbs: 0 },
      ),
    [dishIngredients],
  );

  const dishWeightNum = useMemo(
    () =>
      parseFloat(dishWeight.replace(',', '.')) ||
      dishIngredients.reduce((s, i) => s + i.grams, 0),
    [dishWeight, dishIngredients],
  );

  const dishPer100 = useMemo(() => {
    if (!dishWeightNum) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
    const k = 100 / dishWeightNum;
    return {
      calories: dishTotals.calories * k,
      protein: dishTotals.protein * k,
      fat: dishTotals.fat * k,
      carbs: dishTotals.carbs * k,
    };
  }, [dishTotals, dishWeightNum]);

  const computed = useMemo(() => {
    if (selectedCatalog) {
      const base = selectedCatalog.per100g;
      return {
        calories: (base.calories * portionNum) / 100,
        protein: (base.protein * portionNum) / 100,
        fat: (base.fat * portionNum) / 100,
        carbs: (base.carbs * portionNum) / 100,
      };
    }
    if (selectedFavorite && selectedFavorite.per100g) {
      const base = selectedFavorite.per100g;
      return {
        calories: (base.calories * portionNum) / 100,
        protein: (base.protein * portionNum) / 100,
        fat: (base.fat * portionNum) / 100,
        carbs: (base.carbs * portionNum) / 100,
      };
    }
    if (selectedRecent) {
      const p = selectedRecent.portionGrams || portionNum;
      const factor = p ? portionNum / p : 1;
      return {
        calories: selectedRecent.calories * factor,
        protein: selectedRecent.protein * factor,
        fat: selectedRecent.fat * factor,
        carbs: selectedRecent.carbs * factor,
      };
    }
    return null;
  }, [selectedCatalog, selectedFavorite, selectedRecent, portionNum]);

  const pendingEntry: NormalizedEntry | null = useMemo(() => {
    if (selectedCatalog && computed && portionNum > 0) {
      return {
        id: Math.random().toString(),
        mealType,
        name: selectedCatalog.name,
        portionGrams: portionNum,
        calories: computed.calories,
        protein: computed.protein,
        fat: computed.fat,
        carbs: computed.carbs,
        note,
        source: selectedSource === 'catalog' ? 'search-catalog' : 'search-saved',
        sourceRefId: selectedCatalog.id,
        createdAt: Date.now(),
      };
    }
    if (selectedFavorite && computed && portionNum > 0) {
      return {
        id: Math.random().toString(),
        mealType,
        name: selectedFavorite.name,
        portionGrams: portionNum,
        calories: computed.calories,
        protein: computed.protein,
        fat: computed.fat,
        carbs: computed.carbs,
        note,
        source: 'favorite',
        sourceRefId: selectedFavorite.id,
        createdAt: Date.now(),
      };
    }
    if (selectedRecent && computed && portionNum > 0) {
      return {
        id: Math.random().toString(),
        mealType,
        name: selectedRecent.name,
        portionGrams: portionNum,
        calories: computed.calories,
        protein: computed.protein,
        fat: computed.fat,
        carbs: computed.carbs,
        note,
        source: 'recent',
        sourceRefId: selectedRecent.id,
        createdAt: Date.now(),
      };
    }
    if (TABS[tabIndex].key === 'recipes' && recipeMode === 'create') {
      const totalWeight =
        parseFloat(dishWeight.replace(',', '.')) ||
        dishIngredients.reduce((s, i) => s + i.grams, 0);
      if (dishName.trim() && totalWeight > 0 && dishIngredients.length > 0) {
        return {
          id: Math.random().toString(),
          mealType,
          name: dishName.trim(),
          portionGrams: totalWeight,
          calories: dishTotals.calories,
          protein: dishTotals.protein,
          fat: dishTotals.fat,
          carbs: dishTotals.carbs,
          note: dishNote || undefined,
          source: 'manual',
          createdAt: Date.now(),
        };
      }
    }
    return null;
  }, [
    selectedCatalog,
    selectedFavorite,
    selectedRecent,
    selectedSource,
    portionNum,
    computed,
    note,
    tabIndex,
    recipeMode,
    dishName,
    dishWeight,
    dishIngredients,
    dishTotals,
    mealType,
  ]);

  const resetSelection = () => {
    setSelectedCatalog(null);
    setSelectedSource(null);
    setSelectedFavorite(null);
    setSelectedRecent(null);
    setPortion('');
    setNote('');
  };

  // ------- Ингредиенты рецепта -------
  const handleAddIngredient = () => {
    setIngredientPickerVisible(true);
    setIngredientSelected(null);
    setIngredientMass('');
    setIngredientSearch('');
    setEditingIndex(null);
  };

  const handleEditIngredient = (index: number) => {
    const ing = dishIngredients[index];
    setIngredientSelected({
      type: 'user',
      item: { id: ing.id, name: ing.name, per100g: ing.per100g } as UserCatalogItem,
    });
    setIngredientMass(String(ing.grams));
    setIngredientPickerVisible(true);
    setEditingIndex(index);
  };

  const handleRemoveIngredient = (index: number) => {
    setDishIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveIngredient = () => {
    if (!ingredientSelected) return;
    const base: any = ingredientSelected.item;
    const grams = parseFloat(ingredientMass.replace(',', '.'));
    if (!base.per100g || grams <= 0) return;
    setDishIngredients(prev => {
      const list = [...prev];
      const newIng = {
        id: itemKey(base, ingredientSelected.type),
        name: base.name,
        grams,
        per100g: base.per100g,
      };
      if (editingIndex !== null) list[editingIndex] = newIng;
      else list.push(newIng);
      return list;
    });
    setIngredientPickerVisible(false);
    setIngredientSelected(null);
    setIngredientMass('');
    setIngredientSearch('');
    setEditingIndex(null);
  };

  // ------- Confirm -------
  const handleConfirmPress = async () => {
    if (!pendingEntry) return;
    onConfirm(pendingEntry);

    await addRecent({
      id: Math.random().toString(),
      name: pendingEntry.name || '',
      portionGrams: pendingEntry.portionGrams,
      calories: pendingEntry.calories,
      protein: pendingEntry.protein,
      fat: pendingEntry.fat,
      carbs: pendingEntry.carbs,
      createdAt: Date.now(),
    });

    if (pendingEntry.source === 'manual' && recipeMode === 'create') {
      const weight =
        parseFloat(dishWeight.replace(',', '.')) ||
        dishIngredients.reduce((s, i) => s + i.grams, 0);
      const userItem: UserCatalogItem = {
        id: Math.random().toString(),
        name: dishName.trim(),
        per100g: dishPer100,
        createdAt: Date.now(),
        type: 'composite',
        ingredients: dishIngredients,
        dishWeight: weight,
        note: dishNote || undefined,
      };
      const newCat = [userItem, ...userCatalog];
      setUserCatalog(newCat);
      await saveUserCatalog(newCat);
    }

    showToast(`Добавлено в ${mealTitles[mealType]}`);
    onCancel();
  };

  // ------- Избранное -------
  const toggleFavorite = async (it: SearchItem) => {
    const key = itemKey(it.item as any, it.type);
    if (favorites.some(f => favKey(f) === key)) {
      const prev = favorites;
      const updated = favorites.filter(f => favKey(f) !== key);
      setFavorites(updated);
      const ok = await saveFavorites(updated);
      if (!ok) setFavorites(prev);
      showToast(ok ? 'Удалено из избранного' : 'Не удалось сохранить изменения');
    } else {
      const base = it.item as CatalogItem | UserCatalogItem | FavoriteItem;
      const newFav: FavoriteItem = {
        id: Math.random().toString(),
        sourceId: (base as any).sourceId || (base as any).id,
        name: (base as any).name,
        per100g: (base as any).per100g,
        defaultPortionGrams: (base as any).defaultPortionGrams,
        createdAt: Date.now(),
      };
      const prev = favorites;
      const newList = [newFav, ...favorites];
      setFavorites(newList);
      const ok = await saveFavorites(newList);
      if (!ok) setFavorites(prev);
      showToast(ok ? 'Добавлено в избранное' : 'Не удалось сохранить изменения');
    }
  };

  const toggleFavoriteRecent = async (item: RecentItem) => {
    const key = item.id;
    if (favorites.some(f => favKey(f) === key)) {
      const prev = favorites;
      const updated = favorites.filter(f => favKey(f) !== key);
      setFavorites(updated);
      const ok = await saveFavorites(updated);
      if (!ok) setFavorites(prev);
      showToast(ok ? 'Удалено из избранного' : 'Не удалось сохранить изменения');
    } else {
      const factor = item.portionGrams ? 100 / item.portionGrams : undefined;
      const per100g =
        factor !== undefined
          ? {
              calories: item.calories * factor,
              protein: item.protein * factor,
              fat: item.fat * factor,
              carbs: item.carbs * factor,
            }
          : undefined;
      const newFav: FavoriteItem = {
        id: Math.random().toString(),
        sourceId: item.id,
        name: item.name,
        defaultPortionGrams: item.portionGrams,
        per100g,
        createdAt: Date.now(),
      };
      const prev = favorites;
      const newList = [newFav, ...favorites];
      setFavorites(newList);
      const ok = await saveFavorites(newList);
      if (!ok) setFavorites(prev);
      showToast(ok ? 'Добавлено в избранное' : 'Не удалось сохранить изменения');
    }
  };

  // ------- Рендер элементов списков -------
  const renderSearchItem = ({ item }: { item: SearchItem }) => {
    const data = item.item as any;
    const key = itemKey(data, item.type);
    const isFav = favorites.some(f => favKey(f) === key);
    return (
      <View style={styles.listItemRow}>
        <TouchableOpacity
          testID={`addfood-search-item-${data.id}`}
          style={{ flex: 1 }}
          onPress={() => {
            resetSelection();
            if (item.type === 'favorite') {
              setSelectedFavorite(data as FavoriteItem);
              setPortion((data as FavoriteItem).defaultPortionGrams ? String((data as FavoriteItem).defaultPortionGrams) : '');
            } else {
              setSelectedCatalog(data as CatalogItem | UserCatalogItem);
              setSelectedSource(item.type === 'catalog' ? 'catalog' : 'user');
            }
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.itemName}>{data.name}</Text>
          </View>
          {data.per100g && (
            <Text style={styles.itemDetails}>
              на 100 г: {formatNumber(data.per100g.calories)} ккал • Б {formatNumber(data.per100g.protein)} • Ж {formatNumber(data.per100g.fat)} • У {formatNumber(data.per100g.carbs)}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          testID={`list-star-${key}`}
          style={styles.starButton}
          onPress={() => toggleFavorite(item)}
        >
          <Text style={[styles.star, isFav && { color: '#22C55E' }]}>★</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteItem }) => {
    const key = favKey(item);
    const isFav = favorites.some(f => favKey(f) === key);
    return (
      <View style={styles.listItemRow}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            resetSelection();
            setSelectedFavorite(item);
            setPortion(item.defaultPortionGrams ? String(item.defaultPortionGrams) : '');
          }}
        >
          <Text style={styles.itemName}>{item.name}</Text>
          {item.defaultPortionGrams && <Text style={styles.itemDetails}>обычно: {formatNumber(item.defaultPortionGrams)} г</Text>}
          {item.per100g && (
            <Text style={styles.itemDetails}>
              на 100 г: {formatNumber(item.per100g.calories)} ккал • Б {formatNumber(item.per100g.protein)} • Ж {formatNumber(item.per100g.fat)} • У {formatNumber(item.per100g.carbs)}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          testID={`list-star-${key}`}
          style={styles.starButton}
          onPress={() => toggleFavorite({ type: 'favorite', item })}
        >
          <Text style={[styles.star, isFav && { color: '#22C55E' }]}>★</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRecentItem = ({ item }: { item: RecentItem }) => {
    const key = item.id;
    const isFav = favorites.some(f => favKey(f) === key);
    return (
      <View style={styles.listItemRow}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            resetSelection();
            setSelectedRecent(item);
            setPortion(item.portionGrams ? String(item.portionGrams) : '');
          }}
        >
          <Text style={styles.itemName}>{item.name}</Text>
          {item.portionGrams && <Text style={styles.itemDetails}>порция: {formatNumber(item.portionGrams)} г</Text>}
          <Text style={styles.itemDetails}>
            итого: {formatNumber(item.calories)} ккал • Б {formatNumber(item.protein)} • Ж {formatNumber(item.fat)} • У {formatNumber(item.carbs)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID={`list-star-${key}`}
          style={styles.starButton}
          onPress={() => toggleFavoriteRecent(item)}
        >
          <Text style={[styles.star, isFav && { color: '#22C55E' }]}>★</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ------- Мои/Создать рецепт -------
  const myRecipes = useMemo(
    () => userCatalog.filter(u => (u as any).type === 'composite'),
    [userCatalog],
  );

  const renderRecipes = () => (
    <View style={{ flex: 1 }}>
      {/* Сегмент "Мои | Создать" */}
      <View style={styles.segment}>
        <TouchableOpacity
          style={[styles.segmentBtn, recipeMode === 'mine' && styles.segmentBtnActive]}
          onPress={() => {
            resetSelection();
            setRecipeMode('mine');
          }}
        >
          <Text style={styles.segmentText}>Мои</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, recipeMode === 'create' && styles.segmentBtnActive]}
          onPress={() => {
            resetSelection();
            setRecipeMode('create');
          }}
        >
          <Text style={styles.segmentText}>Создать</Text>
        </TouchableOpacity>
      </View>

      {recipeMode === 'mine' ? (
        myRecipes.length === 0 ? (
          <Text style={styles.empty}>Пока нет сохранённых рецептов. Создайте свой на вкладке «Создать».</Text>
        ) : (
          <FlatList
            data={myRecipes}
            keyExtractor={i => i.id}
            contentContainerStyle={{
              paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + (selectedName ? DETAILS_HEIGHT + 12 : 0),
            }}
            renderItem={({ item }) => (
              <View style={styles.listItemRow}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => {
                    resetSelection();
                    setSelectedCatalog(item);
                    setSelectedSource('user');
                    setPortion(String((item as any).dishWeight || 100));
                  }}
                >
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    на 100 г: {formatNumber(item.per100g.calories)} ккал • Б {formatNumber(item.per100g.protein)} • Ж {formatNumber(item.per100g.fat)} • У {formatNumber(item.per100g.carbs)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + (selectedName ? DETAILS_HEIGHT + 12 : 0),
          }}
        >
          <Text style={styles.label}>Название блюда</Text>
          <TextInput
            style={styles.input}
            value={dishName}
            placeholder="Без названия"
            placeholderTextColor="#777"
            onChangeText={setDishName}
          />
          <Text style={styles.label}>Масса готового блюда, г</Text>
          <TextInput
            style={styles.input}
            value={dishWeight}
            keyboardType="numeric"
            onChangeText={setDishWeight}
          />
          <Text style={styles.helper}>Если пусто — масса = сумме ингредиентов</Text>
          <Text style={styles.label}>Заметка</Text>
          <TextInput
            style={[styles.input, { height: 72, textAlignVertical: 'top' }]}
            value={dishNote}
            onChangeText={setDishNote}
            multiline
            numberOfLines={3}
          />
          <Text style={styles.label}>Ингредиенты</Text>
          {dishIngredients.map((ing, idx) => (
            <View key={idx} style={styles.ingredientRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ingredientName}>{ing.name}</Text>
                <Text style={styles.ingredientInfo}>
                  {formatNumber(ing.grams)} г — {formatNumber(ing.per100g.calories)} ккал, {formatNumber(ing.per100g.protein)} Б, {formatNumber(ing.per100g.fat)} Ж, {formatNumber(ing.per100g.carbs)} У
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleEditIngredient(idx)} style={styles.smallBtn}>
                <Text style={styles.smallBtnText}>Изменить</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRemoveIngredient(idx)} style={styles.smallBtn}>
                <Text style={styles.smallBtnText}>Удалить</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={handleAddIngredient} style={styles.addIngredientBtn}>
            <Text style={{ color: '#22C55E' }}>Добавить ингредиент</Text>
          </TouchableOpacity>
          <View style={styles.totalsBlock}>
            <Text style={styles.totalsLine}>
              Итог за блюдо — {formatNumber(dishTotals.calories)} Ккал, {formatNumber(dishTotals.protein)} Б, {formatNumber(dishTotals.fat)} Ж, {formatNumber(dishTotals.carbs)} У
            </Text>
            <Text style={styles.totalsLine}>
              За 100 г — {formatNumber(dishPer100.calories)} Ккал, {formatNumber(dishPer100.protein)} Б, {formatNumber(dishPer100.fat)} Ж, {formatNumber(dishPer100.carbs)} У
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );

  // ------- Общие тела вкладок -------
  const contentPad = { paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + (selectedName ? DETAILS_HEIGHT + 12 : 0) };

  const TabSearch = (
    <View style={{ width: SCREEN_W }}>
      <TextInput
        testID="addfood-search-input"
        placeholder="Что вы ели?"
        placeholderTextColor="#999"
        style={styles.input}
        value={query}
        onChangeText={setQuery}
      />
      {searchResults.length === 0 && query.length > 0 ? (
        <Text style={styles.empty}>Ничего не найдено. Попробуйте выбрать из недавно или из рецептов.</Text>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={i => itemKey(i.item as any, i.type)}
          renderItem={renderSearchItem}
          contentContainerStyle={contentPad}
        />
      )}
    </View>
  );

  const TabRecents = (
    <View style={{ width: SCREEN_W }}>
      {recents.length === 0 ? (
        <Text style={styles.empty}>Пока нет недавних записей.</Text>
      ) : (
        <FlatList
          data={recents}
          keyExtractor={i => i.id}
          renderItem={renderRecentItem}
          contentContainerStyle={contentPad}
        />
      )}
    </View>
  );

  const TabFavorites = (
    <View style={{ width: SCREEN_W }}>
      {favorites.length === 0 ? (
        <Text style={styles.empty}>Вы ещё не добавляли избранные продукты. Отмечайте ★ в деталях продукта.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={i => i.id}
          renderItem={renderFavoriteItem}
          contentContainerStyle={contentPad}
        />
      )}
    </View>
  );

  return (
    <Modal animationType="slide" transparent={false} visible onRequestClose={onCancel}>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <HeaderBar
          title="Добавить еду"
          subtitle={mealTitles[mealType]}
          onCancel={onCancel}
          onConfirm={handleConfirmPress}
          confirmEnabled={!!pendingEntry}
        />

        <TabsCarousel
          titles={TABS.map(t => t.title)}
          index={tabIndex}
          onPrev={() => go(tabIndex - 1)}
          onNext={() => go(tabIndex + 1)}
        />

        {/* Pager */}
        <FlatList
          ref={pagerRef}
          horizontal
          pagingEnabled
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
            if (idx !== tabIndex) {
              resetSelection();
              setTabIndex(idx);
            }
          }}
          showsHorizontalScrollIndicator={false}
          data={[
            TabSearch,
            TabRecents,
            TabFavorites,
            <View key="recipes" style={{ width: SCREEN_W, flex: 1 }}>{renderRecipes()}</View>,
          ]}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => <View style={{ width: SCREEN_W, flex: 1 }}>{item}</View>}
        />

        {/* Детали выбранного элемента */}
        {selectedName && (
          <DetailsSheet
            title={selectedName}
            portion={portion}
            onPortionChange={setPortion}
            note={note}
            onNoteChange={setNote}
            computed={computed}
            onToggleFavorite={() => {
              if (selectedCatalog) {
                const type = selectedSource === 'user' ? 'user' : 'catalog';
                if (type === 'catalog') toggleFavorite({ type: 'catalog', item: selectedCatalog as CatalogItem });
                else toggleFavorite({ type: 'user', item: selectedCatalog as UserCatalogItem });
              } else if (selectedFavorite) toggleFavorite({ type: 'favorite', item: selectedFavorite });
              else if (selectedRecent) toggleFavoriteRecent(selectedRecent);
            }}
            onClose={resetSelection}
            bottomOffset={BOTTOM_BAR_HEIGHT}
            height={DETAILS_HEIGHT}
          />
        )}

        {/* Нижний бар */}
        <View style={[styles.bottomBar, { height: BOTTOM_BAR_HEIGHT }]}>
          <Text style={styles.toAddTitle}>К добавлению</Text>
          {pendingEntry ? (
            <Text style={styles.toAddVals}>
              {formatNumber(pendingEntry.calories)} ккал • Б {formatNumber(pendingEntry.protein)} • Ж {formatNumber(pendingEntry.fat)} • У {formatNumber(pendingEntry.carbs)}
            </Text>
          ) : (
            <Text style={[styles.toAddVals, { color: '#777' }]}>ничего не выбрано</Text>
          )}
        </View>
      </View>

      {/* Модалка ингредиента */}
      <IngredientPickerModal
        visible={ingredientPickerVisible}
        topInset={insets.top}
        bottomInset={insets.bottom}
        ingredientSelected={ingredientSelected}
        ingredientSearch={ingredientSearch}
        onIngredientSearchChange={setIngredientSearch}
        ingredientResults={ingredientResults}
        itemKey={itemKey as any}
        onPickItem={setIngredientSelected}
        ingredientMass={ingredientMass}
        onIngredientMassChange={setIngredientMass}
        onSave={handleSaveIngredient}
        onCancel={() => {
          setIngredientSelected(null);
          setIngredientMass('');
          if (editingIndex === null) setIngredientPickerVisible(false);
        }}
      />
    </Modal>
  );
};

export default AddFoodModal;
