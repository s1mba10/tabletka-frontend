import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  ScrollView,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AddFoodModalProps,
  CatalogItem,
  FavoriteItem,
  RecentItem,
  UserCatalogItem,
  NormalizedEntry,
} from '../nutrition/types';
import { localCatalog } from '../nutrition/catalog';
import { formatNumber } from '../utils/number';
import {
  loadFavorites,
  loadRecents,
  saveFavorites,
  addRecent,
  loadUserCatalog,
  saveUserCatalog,
} from '../nutrition/storage';

const mealTitles: Record<string, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус/Другое',
};


const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(message);
  }
};

type SearchItem =
  | { type: 'catalog'; item: CatalogItem }
  | { type: 'user'; item: UserCatalogItem }
  | { type: 'favorite'; item: FavoriteItem };

const AddFoodModal: React.FC<AddFoodModalProps> = ({
  mealType,
  onCancel,
  onConfirm,
  dayTotals,
  dayTargets,
}) => {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'search' | 'favorites' | 'recents' | 'manual'>('search');
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favView, setFavView] = useState<FavoriteItem[]>([]);
  const [recents, setRecents] = useState<RecentItem[]>([]);
  const [userCatalog, setUserCatalog] = useState<UserCatalogItem[]>([]);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogItem | null>(null);
  const [selectedSource, setSelectedSource] = useState<'catalog' | 'user' | null>(null);
  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteItem | null>(null);
  const [selectedRecent, setSelectedRecent] = useState<RecentItem | null>(null);
  const [portion, setPortion] = useState('');
  const [note, setNote] = useState('');

  const [manualName, setManualName] = useState('');
  const [manualMass, setManualMass] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [manualSaveFav, setManualSaveFav] = useState(false);
  const [manualMode, setManualMode] = useState<'product' | 'dish'>('product');

  const [dishName, setDishName] = useState('');
  const [dishWeight, setDishWeight] = useState('');
  const [dishNote, setDishNote] = useState('');
  const [dishIngredients, setDishIngredients] = useState<
    {
      id: string;
      name: string;
      grams: number;
      per100g: { calories: number; protein: number; fat: number; carbs: number };
    }[]
  >([]);
  const [ingredientPickerVisible, setIngredientPickerVisible] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [ingredientResults, setIngredientResults] = useState<SearchItem[]>([]);
  const [ingredientSelected, setIngredientSelected] = useState<SearchItem | null>(null);
  const [ingredientMass, setIngredientMass] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    loadFavorites().then(f => {
      setFavorites(f);
      setFavView(f);
    });
    loadRecents().then(setRecents);
    loadUserCatalog().then(setUserCatalog);
  }, []);

  useEffect(() => {
    if (tab !== 'favorites') {
      setFavView(favorites);
    }
  }, [favorites, tab]);

  useEffect(() => {
    if (!ingredientPickerVisible) return;
    const q = ingredientSearch.trim().toLowerCase();
    const timer = setTimeout(() => {
      if (!q) {
        setIngredientResults(allSearchItems.slice(0, 15));
      } else {
        setIngredientResults(
          allSearchItems.filter(it =>
            it.item.name.toLowerCase().includes(q),
          ),
        );
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [ingredientSearch, allSearchItems, ingredientPickerVisible]);


  const favKey = (f: FavoriteItem) => f.sourceId || `fav-${f.id}`;

  const itemKey = (
    item: CatalogItem | UserCatalogItem | FavoriteItem,
    type: 'catalog' | 'user' | 'favorite',
  ) => (type === 'favorite' ? favKey(item as FavoriteItem) : item.id);

  const allSearchItems = useMemo<SearchItem[]>(() => {
    const map = new Map<string, SearchItem>();
    localCatalog.forEach(it => map.set(itemKey(it, 'catalog'), { type: 'catalog', item: it }));
    userCatalog.forEach(it => map.set(itemKey(it, 'user'), { type: 'user', item: it }));
    favorites.forEach(it =>
      map.set(itemKey(it, 'favorite'), { type: 'favorite', item: it }),
    );
    return Array.from(map.values()).sort((a, b) =>
      a.item.name.localeCompare(b.item.name, 'ru'),
    );
  }, [userCatalog, favorites]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    const timer = setTimeout(() => {
      if (!q) {
        if (tab === 'search') {
          setSearchResults(allSearchItems.slice(0, 15));
        } else {
          setSearchResults([]);
        }
        return;
      }
      const res = allSearchItems.filter(it => {
        const name = it.item.name.toLowerCase();
        const brand = (it.type === 'catalog' && it.item.brand
          ? it.item.brand.toLowerCase()
          : '');
        return name.includes(q) || brand.includes(q);
      });
      setSearchResults(res);
    }, 350);
    return () => clearTimeout(timer);
  }, [query, allSearchItems, tab]);

  const portionNum = useMemo(() => parseFloat(portion.replace(',', '.')) || 0, [portion]);

  const selectedName =
    selectedCatalog?.name || selectedFavorite?.name || selectedRecent?.name || '';

  const dishWeightNum = useMemo(
    () =>
      parseFloat(dishWeight.replace(',', '.')) ||
      dishIngredients.reduce((s, i) => s + i.grams, 0),
    [dishWeight, dishIngredients],
  );

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

  const dishPer100 = useMemo(() => {
    if (!dishWeightNum)
      return { calories: 0, protein: 0, fat: 0, carbs: 0 };
    const factor = 100 / dishWeightNum;
    return {
      calories: dishTotals.calories * factor,
      protein: dishTotals.protein * factor,
      fat: dishTotals.fat * factor,
      carbs: dishTotals.carbs * factor,
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
    if (tab === 'manual' && manualMode === 'dish') {
      const totalWeight = dishIngredients.reduce((s, i) => s + i.grams, 0);
      const weight = parseFloat(dishWeight.replace(',', '.')) || totalWeight;
      if (dishName.trim() && weight > 0 && dishIngredients.length > 0) {
        return {
          id: Math.random().toString(),
          mealType,
          name: dishName.trim(),
          portionGrams: weight,
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
    if (tab === 'manual' && manualMode === 'product') {
      const mass = parseFloat(manualMass.replace(',', '.'));
      const cal = parseFloat(manualCalories.replace(',', '.'));
      const prot = parseFloat(manualProtein.replace(',', '.'));
      const fat = parseFloat(manualFat.replace(',', '.'));
      const carb = parseFloat(manualCarbs.replace(',', '.'));
      if (mass > 0 && !isNaN(cal) && !isNaN(prot) && !isNaN(fat) && !isNaN(carb)) {
        return {
          id: Math.random().toString(),
          mealType,
          name: manualName || undefined,
          portionGrams: mass,
          calories: (cal * mass) / 100,
          protein: (prot * mass) / 100,
          fat: (fat * mass) / 100,
          carbs: (carb * mass) / 100,
          note: manualNote || undefined,
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
    portionNum,
    computed,
    note,
    tab,
    manualCalories,
    manualProtein,
    manualFat,
    manualCarbs,
    manualName,
    manualMass,
    manualNote,
    dishName,
    dishWeight,
    dishIngredients,
    dishNote,
    dishTotals,
  ]);

  const resetSelection = () => {
    setSelectedCatalog(null);
    setSelectedSource(null);
    setSelectedFavorite(null);
    setSelectedRecent(null);
    setPortion('');
    setNote('');
  };

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
      if (editingIndex !== null) {
        list[editingIndex] = newIng;
      } else {
        list.push(newIng);
      }
      return list;
    });
    setIngredientPickerVisible(false);
    setIngredientSelected(null);
    setIngredientMass('');
    setIngredientSearch('');
    setEditingIndex(null);
  };

  const handleConfirm = async () => {
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
    if (pendingEntry.source === 'manual') {
      if (manualMode === 'dish') {
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
      } else {
        const mass = parseFloat(manualMass.replace(',', '.'));
        const per100 = {
          calories: parseFloat(manualCalories.replace(',', '.')),
          protein: parseFloat(manualProtein.replace(',', '.')),
          fat: parseFloat(manualFat.replace(',', '.')),
          carbs: parseFloat(manualCarbs.replace(',', '.')),
        };
        if (manualName) {
          const existing = userCatalog.find(
            u => u.name.toLowerCase() === manualName.toLowerCase(),
          );
          const userItem: UserCatalogItem = {
            id: existing ? existing.id : Math.random().toString(),
            name: manualName,
            per100g: per100,
            createdAt: Date.now(),
          };
          const others = userCatalog.filter(u => u.id !== userItem.id);
          const newCat = [userItem, ...others];
          setUserCatalog(newCat);
          await saveUserCatalog(newCat);
          if (manualSaveFav) {
            const fav: FavoriteItem = {
              id: Math.random().toString(),
              sourceId: userItem.id,
              name: manualName,
              defaultPortionGrams: mass,
              per100g: per100,
              createdAt: Date.now(),
            };
            const prev = favorites;
            const newList = [fav, ...favorites];
            setFavorites(newList);
            const ok = await saveFavorites(newList);
            if (!ok) {
              setFavorites(prev);
              showToast('Не удалось сохранить изменения');
            }
          }
        }
      }
    }
    showToast(`Добавлено в ${mealTitles[mealType]}`);
    onCancel();
  };

  const toggleFavorite = async (it: SearchItem) => {
    const key = itemKey(it.item as any, it.type);
    if (favorites.some(f => favKey(f) === key)) {
      const prev = favorites;
      const updated = favorites.filter(f => favKey(f) !== key);
      setFavorites(updated);
      const ok = await saveFavorites(updated);
      if (ok) {
        showToast('Удалено из избранного');
      } else {
        setFavorites(prev);
        showToast('Не удалось сохранить изменения');
      }
    } else {
      const base = it.item as CatalogItem | UserCatalogItem | FavoriteItem;
      const newFav: FavoriteItem = {
        id: Math.random().toString(),
        sourceId: (base as any).sourceId || (base as any).id,
        name: base.name,
        per100g: (base as any).per100g,
        defaultPortionGrams: (base as any).defaultPortionGrams,
        createdAt: Date.now(),
      };
      const prev = favorites;
      const newList = [newFav, ...favorites];
      setFavorites(newList);
      const ok = await saveFavorites(newList);
      if (ok) {
        showToast('Добавлено в избранное');
      } else {
        setFavorites(prev);
        showToast('Не удалось сохранить изменения');
      }
    }
  };

  const toggleFavoriteRecent = async (item: RecentItem) => {
    const key = item.id;
    if (favorites.some(f => favKey(f) === key)) {
      const prev = favorites;
      const updated = favorites.filter(f => favKey(f) !== key);
      setFavorites(updated);
      const ok = await saveFavorites(updated);
      if (ok) {
        showToast('Удалено из избранного');
      } else {
        setFavorites(prev);
        showToast('Не удалось сохранить изменения');
      }
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
      if (ok) {
        showToast('Добавлено в избранное');
      } else {
        setFavorites(prev);
        showToast('Не удалось сохранить изменения');
      }
    }
  };

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
              setPortion(
                (data as FavoriteItem).defaultPortionGrams
                  ? String((data as FavoriteItem).defaultPortionGrams)
                  : '',
              );
            } else {
              setSelectedCatalog(data as CatalogItem);
              setSelectedSource(item.type === 'catalog' ? 'catalog' : 'user');
            }
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.itemName}>{data.name}</Text>
            {data.brand && <Text style={styles.itemBrand}> {data.brand}</Text>}
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
            setPortion(
              item.defaultPortionGrams ? String(item.defaultPortionGrams) : '',
            );
          }}
        >
          <Text style={styles.itemName}>{item.name}</Text>
          {item.defaultPortionGrams && (
            <Text style={styles.itemDetails}>
              обычно: {formatNumber(item.defaultPortionGrams)} г
            </Text>
          )}
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
          {item.portionGrams && (
            <Text style={styles.itemDetails}>
              порция: {formatNumber(item.portionGrams)} г
            </Text>
          )}
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

  const footerLine = useMemo(() => {
    if (!dayTotals) return null;
    const { protein, fat, carbs, calories } = dayTotals;
    if (dayTargets) {
      const tp =
        dayTargets.protein !== undefined
          ? formatNumber(dayTargets.protein)
          : '—';
      const tf =
        dayTargets.fat !== undefined ? formatNumber(dayTargets.fat) : '—';
      const tc =
        dayTargets.carbs !== undefined ? formatNumber(dayTargets.carbs) : '—';
      const tcal =
        dayTargets.calories !== undefined
          ? formatNumber(dayTargets.calories)
          : '—';
      const free =
        typeof dayTargets.calories === 'number'
          ? dayTargets.calories - calories
          : undefined;
      return (
        `За день: Б ${formatNumber(protein)}/${tp} • Ж ${formatNumber(fat)}/${tf} • У ${formatNumber(carbs)}/${tc} • Ккал ${formatNumber(calories)}/${tcal}` +
        (free !== undefined ? ` (свободно: ${formatNumber(free)})` : '')
      );
    }
    return `За день: Б ${formatNumber(protein)} • Ж ${formatNumber(fat)} • У ${formatNumber(carbs)} • Ккал ${formatNumber(calories)}`;
  }, [dayTotals, dayTargets]);

  const renderDetails = () => {
    if (!selectedName) return null;

    const currentKey = (() => {
      if (selectedCatalog) {
        const type = selectedSource === 'user' ? 'user' : 'catalog';
        return itemKey(selectedCatalog, type);
      }
      if (selectedFavorite) {
        return favKey(selectedFavorite);
      }
      if (selectedRecent) {
        return selectedRecent.id;
      }
      return null;
    })();

    const isFav = currentKey
      ? favorites.some(f => favKey(f) === currentKey)
      : false;

    const handleToggle = () => {
      if (selectedCatalog) {
        const type = selectedSource === 'user' ? 'user' : 'catalog';
        toggleFavorite({ type, item: selectedCatalog });
      } else if (selectedFavorite) {
        toggleFavorite({ type: 'favorite', item: selectedFavorite });
      } else if (selectedRecent) {
        toggleFavoriteRecent(selectedRecent);
      }
    };

    return (
      <View style={[styles.details, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.detailsTitle}>{selectedName}</Text>
        <Text style={styles.label}>Порция, г</Text>
        <TextInput
          testID="addfood-details-mass-input"
          style={styles.input}
          value={portion}
          keyboardType="numeric"
          onChangeText={setPortion}
        />
        {computed && portionNum > 0 && (
          <Text style={styles.itemDetails}>
            итого: {formatNumber(computed.calories)} ккал • Б {formatNumber(computed.protein)} • Ж {formatNumber(computed.fat)} • У {formatNumber(computed.carbs)}
          </Text>
        )}
        <Text style={styles.label}>Заметка (опционально)</Text>
        <TextInput style={styles.input} value={note} onChangeText={setNote} />
        <View testID="details-fav-row" style={styles.favRow}>
          <TouchableOpacity
            testID="details-fav-star"
            accessibilityLabel={
              isFav
                ? 'В избранном. Нажмите, чтобы убрать'
                : 'Не в избранном. Нажмите, чтобы добавить'
            }
            onPress={handleToggle}
            style={styles.starButton}
          >
            <Text style={[styles.star, isFav && { color: '#22C55E' }]}>★</Text>
          </TouchableOpacity>
          <Text style={[styles.favLabel, isFav && { color: '#22C55E' }]}>В избранное</Text>
        </View>
      </View>
    );
  };

  const renderManualProduct = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom }}>
      <Text style={styles.helper}>КБЖУ указываются на 100 г. Для добавления укажите массу порции.</Text>
      <Text style={styles.label}>Название</Text>
      <TextInput
        placeholder="Без названия"
        style={styles.input}
        value={manualName}
        onChangeText={setManualName}
      />
      <Text style={styles.label}>Масса, г</Text>
      <TextInput
        style={styles.input}
        value={manualMass}
        keyboardType="numeric"
        onChangeText={setManualMass}
      />
      <Text style={styles.label}>Калории (на 100 г)</Text>
      <TextInput
        testID="addfood-manual-calories"
        style={styles.input}
        value={manualCalories}
        keyboardType="numeric"
        onChangeText={setManualCalories}
      />
      <Text style={styles.label}>Белки (на 100 г)</Text>
      <TextInput
        testID="addfood-manual-protein"
        style={styles.input}
        value={manualProtein}
        keyboardType="numeric"
        onChangeText={setManualProtein}
      />
      <Text style={styles.label}>Жиры (на 100 г)</Text>
      <TextInput
        testID="addfood-manual-fat"
        style={styles.input}
        value={manualFat}
        keyboardType="numeric"
        onChangeText={setManualFat}
      />
      <Text style={styles.label}>Углеводы (на 100 г)</Text>
      <TextInput
        testID="addfood-manual-carbs"
        style={styles.input}
        value={manualCarbs}
        keyboardType="numeric"
        onChangeText={setManualCarbs}
      />
      <Text style={styles.label}>Заметка</Text>
      <TextInput style={styles.input} value={manualNote} onChangeText={setManualNote} />
      <TouchableOpacity onPress={() => setManualSaveFav(!manualSaveFav)} style={styles.favToggle}>
        <Text style={{ color: manualSaveFav ? '#22C55E' : '#fff' }}>★ Сохранить в избранное</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderManualDish = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom }}>
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
      <Text style={styles.helper}>
        Если оставить пустым, масса будет рассчитана как сумма ингредиентов
      </Text>
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
            <Text style={styles.smallBtnText}>Изменить массу</Text>
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
  );

  const renderManual = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.segment}>
        <TouchableOpacity
          style={[styles.segmentBtn, manualMode === 'product' && styles.segmentBtnActive]}
          onPress={() => setManualMode('product')}
        >
          <Text style={styles.segmentText}>Продукт</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, manualMode === 'dish' && styles.segmentBtnActive]}
          onPress={() => setManualMode('dish')}
        >
          <Text style={styles.segmentText}>Блюдо из ингредиентов</Text>
        </TouchableOpacity>
      </View>
      {manualMode === 'product' ? renderManualProduct() : renderManualDish()}
    </View>
  );

  const renderIngredientModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={ingredientPickerVisible}
      onRequestClose={() => setIngredientPickerVisible(false)}
    >
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        {!ingredientSelected ? (
          <>
            <TextInput
              placeholder="Поиск"
              placeholderTextColor="#999"
              style={styles.input}
              value={ingredientSearch}
              onChangeText={setIngredientSearch}
            />
            <FlatList
              data={ingredientResults}
              keyExtractor={i => itemKey(i.item as any, i.type)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => setIngredientSelected(item)}
                >
                  <Text style={styles.itemName}>{item.item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setIngredientPickerVisible(false)}
              style={styles.favToggle}
            >
              <Text style={styles.headerButton}>Отмена</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Масса, г</Text>
            <TextInput
              style={styles.input}
              value={ingredientMass}
              keyboardType="numeric"
              onChangeText={setIngredientMass}
            />
            <View style={styles.dishButtons}>
              <TouchableOpacity
                style={styles.saveDishButton}
                onPress={handleSaveIngredient}
              >
                <Text style={styles.saveDishText}>Сохранить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelDishButton}
                onPress={() => {
                  setIngredientSelected(null);
                  setIngredientMass('');
                  if (editingIndex === null) setIngredientPickerVisible(false);
                }}
              >
                <Text style={styles.cancelDishText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );

  const renderTab = () => {
    switch (tab) {
      case 'search':
        return (
          <View style={{ flex: 1 }}>
            <TextInput
              testID="addfood-search-input"
              placeholder="Что вы ели?"
              placeholderTextColor="#999"
              style={styles.input}
              value={query}
              onChangeText={setQuery}
            />
            {searchResults.length === 0 && query.length > 0 ? (
              <Text style={styles.empty}>Ничего не найдено. Попробуйте вкладку “Вручную”.</Text>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={i => itemKey(i.item as any, i.type)}
                renderItem={renderSearchItem}
                contentContainerStyle={{ paddingBottom: insets.bottom }}
              />
            )}
            {renderDetails()}
          </View>
        );
      case 'favorites':
        return (
          <View style={{ flex: 1 }}>
            {favView.length === 0 ? (
              <Text style={styles.empty}>
                Вы ещё не добавляли избранные продукты. Отмечайте ★ в деталях продукта.
              </Text>
            ) : (
              <FlatList
                data={favView}
                keyExtractor={i => i.id}
                renderItem={renderFavoriteItem}
                contentContainerStyle={{ paddingBottom: insets.bottom }}
              />
            )}
            {renderDetails()}
          </View>
        );
      case 'recents':
        return (
          <View style={{ flex: 1 }}>
            {recents.length === 0 ? (
              <Text style={styles.empty}>Пока нет недавних записей.</Text>
            ) : (
              <FlatList
                data={recents}
                keyExtractor={i => i.id}
                renderItem={renderRecentItem}
                contentContainerStyle={{ paddingBottom: insets.bottom }}
              />
            )}
            {renderDetails()}
          </View>
        );
      case 'manual':
        return renderManual();
      default:
        return null;
    }
  };

  return (
    <Modal animationType="slide" transparent={false} visible onRequestClose={onCancel}>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} accessibilityLabel="Отмена">
            <Text style={styles.headerButton}>Отмена</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Добавить еду</Text>
            <Text style={styles.headerSubtitle}>{mealTitles[mealType]}</Text>
          </View>
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!pendingEntry}
            accessibilityLabel="Готово"
          >
            <Text
              style={[styles.headerButton, { color: pendingEntry ? '#22C55E' : '#777' }]}
            >
              Готово
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity
            testID="addfood-tab-search"
            style={[styles.tab, tab === 'search' && styles.tabActive]}
            onPress={() => {
              resetSelection();
              setTab('search');
            }}
          >
            <Text style={styles.tabText}>Поиск</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="addfood-tab-fav"
            style={[styles.tab, tab === 'favorites' && styles.tabActive]}
            onPress={() => {
              resetSelection();
              setTab('favorites');
            }}
          >
            <Text style={styles.tabText}>Избранное</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="addfood-tab-recents"
            style={[styles.tab, tab === 'recents' && styles.tabActive]}
            onPress={() => {
              resetSelection();
              setTab('recents');
            }}
          >
            <Text style={styles.tabText}>Последние</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="addfood-tab-manual"
            style={[styles.tab, tab === 'manual' && styles.tabActive]}
            onPress={() => {
              resetSelection();
              setTab('manual');
            }}
          >
            <Text style={styles.tabText}>Вручную</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>{renderTab()}</View>
        {footerLine && (
          <Text testID="addfood-footer-dayline" style={styles.footer}>
            {footerLine}
          </Text>
        )}
      </View>
      {renderIngredientModal()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerButton: { color: '#22C55E', fontSize: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: '#ccc', fontSize: 12 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#333' },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#22C55E' },
  tabText: { color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 8,
    color: '#fff',
    margin: 8,
  },
  listItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  itemName: { color: '#fff', fontSize: 16 },
  itemBrand: { color: '#aaa', fontSize: 16 },
  itemDetails: { color: '#aaa', fontSize: 12, marginTop: 2 },
  empty: { color: '#aaa', padding: 16, textAlign: 'center' },
  details: { padding: 12, borderTopWidth: 1, borderTopColor: '#333' },
  detailsTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  label: { color: '#fff', marginHorizontal: 8, marginTop: 8 },
  helper: { color: '#aaa', margin: 8, fontSize: 12 },
  favToggle: { margin: 8 },
  favRow: { flexDirection: 'row', alignItems: 'center', margin: 8 },
  favLabel: { color: '#fff', marginLeft: 4 },
  starButton: { padding: 8 },
  star: { color: '#777', fontSize: 18 },
  footer: {
    color: '#aaa',
    textAlign: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  segment: {
    flexDirection: 'row',
    margin: 8,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentBtn: { flex: 1, padding: 8, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: '#333' },
  segmentText: { color: '#fff', fontSize: 14 },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ingredientName: { color: '#fff', fontSize: 16 },
  ingredientInfo: { color: '#aaa', fontSize: 12 },
  smallBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  smallBtnText: { color: '#22C55E', fontSize: 12 },
  addIngredientBtn: {
    margin: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 8,
  },
  totalsBlock: { margin: 8 },
  totalsLine: { color: '#fff', fontSize: 12, marginVertical: 2 },
  dishButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 16,
  },
  saveDishButton: {
    backgroundColor: '#22C55E',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  saveDishText: { color: '#000', fontWeight: 'bold' },
  cancelDishButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#777',
    minWidth: 120,
    alignItems: 'center',
  },
  cancelDishText: { color: '#fff' },
});

export default AddFoodModal;
