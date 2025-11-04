import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ImageBackground,
  Animated,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import Svg, { Circle } from 'react-native-svg';

import { CategorySummaryCard } from '../../components';
import { useAdherence } from '../../hooks';
import { RootStackParamList } from '../../navigation';
import { styles } from './styles';
import { useAuth } from '../../auth/AuthContext';

// питание
import AddFoodModal from '../../components/AddFoodModal/AddFoodModal';
import { MealType, NormalizedEntry } from '../../nutrition/types';
import { loadDiary, saveDiary } from '../../nutrition/storage';
import { aggregateMeals } from '../../nutrition/aggregate';
import { createEmptyDay } from '../../nutrition/utils';
import { STORAGE_KEYS } from '../../constants/storageKeys';

type NavigationProp = StackNavigationProp<RootStackParamList, 'MainScreen'>;

type Feature = {
  title: string;
  icon?: string;
  tab?: string;
  background?: ImageSourcePropType;
  overlay?: boolean;
};

const weekDays = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const getThisWeek = () => {
  const today = new Date();
  const day = (today.getDay() + 6) % 7; // 0=Пн
  const monday = new Date(today);
  monday.setDate(today.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label: weekDays[i], date: d.getDate(), isToday: i === day };
  });
};

const fmtKcal = (kcal: number) => `${Math.round(kcal)} ккал`;
const DAILY_TARGET_KCAL = 3300;

// Константы воды (как на DietScreen)
const DEFAULT_GLASS_ML = 250;

// ===== Мини-кольцо (SVG) — точное заполнение по проценту =====
const MiniRing: React.FC<{
  size: number;
  stroke: number;
  percent: number; // 0..100
  color: string;
  trackColor: string;
  centerBg: string;
  center?: React.ReactNode;
}> = ({ size, stroke, percent, color, trackColor, centerBg, center }) => {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, percent));
  const dashoffset = C - (C * pct) / 100;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={cx} cy={cy} r={r} stroke={trackColor} strokeWidth={stroke} fill="transparent" />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={C}
          strokeDashoffset={dashoffset}
          transform={`rotate(-90, ${cx}, ${cy})`}
        />
      </Svg>
      <View
        style={[
          styles.weekRingCenter,
          { width: size - stroke * 2.2, height: size - stroke * 2.2, borderRadius: (size - stroke * 2.2) / 2, backgroundColor: centerBg },
        ]}
      >
        {center}
      </View>
    </View>
  );
};

// Тема карточки по статусу + динамическая плашка (общая)
const getStatusTheme = (pct: number) => {
  if (pct >= 70)
    return {
      tint: '#4CAF50',
      bg: '#162016',
      badgeBg: 'rgba(76,175,80,0.18)',
      badgeIcon: 'leaf',
      badgeText: 'Соблюдение',
      badgeTint: '#CDE7CD',
    };
  if (pct >= 30)
    return {
      tint: '#FFC107',
      bg: '#201E12',
      badgeBg: 'rgba(255,193,7,0.16)',
      badgeIcon: 'lightning-bolt-outline',
      badgeText: 'Баланс',
      badgeTint: '#F7E7B6',
    };
  return {
    tint: '#FF5722',
    bg: '#201312',
    badgeBg: 'rgba(255,87,34,0.16)',
    badgeIcon: 'fire',
    badgeText: 'Активность',
    badgeTint: '#F8C2B6',
  };
};

// ВОДА: монохромная голубая палитра
const getWaterTheme = (pct: number) => {
  if (pct >= 70)
    return {
      tint: '#00B6FF',
      badgeBg: 'rgba(0,182,255,0.18)',
      badgeTint: '#CFEFFF',
    };
  if (pct >= 30)
    return {
      tint: '#4FC3F7',
      badgeBg: 'rgba(79,195,247,0.16)',
      badgeTint: '#DAF2FF',
    };
  return {
    tint: '#1E88E5',
    badgeBg: 'rgba(30,136,229,0.16)',
    badgeTint: '#CFE3FF',
  };
};

const MainScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { percentage: medicinePct, reloadStats } = useAdherence();

  const [userImage, setUserImage] = useState<string | undefined>();
  const { isAuthenticated, profile } = useAuth();
  const isPro = isAuthenticated;
  const profileName = profile?.name?.trim();
  const profileEmail = profile?.email?.trim();
  const displayName = profileName || profileEmail || 'Профиль';
  const profileInitial = (profileName || profileEmail || '').charAt(0).toUpperCase();

  // питание
  const selectedDate = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const [entriesByDate, setEntriesByDate] = useState<
    Record<string, Record<MealType, NormalizedEntry[]>>
  >({});
  const isLoaded = useRef(false);
  const [activeMeal, setActiveMeal] = useState<MealType | null>(null);

  const dayEntries = entriesByDate[selectedDate] || createEmptyDay();
  const { mealTotals, dayTotals } = useMemo(() => aggregateMeals(dayEntries), [dayEntries]);
  const totalKcal = dayTotals.calories || 0;
  const isOverTarget = totalKcal > DAILY_TARGET_KCAL;

  // Моки для процентов «Тренировки» и «Питание»
  const workoutPct = 0;
  const nutritionPct = 65;

  // Среднее соблюдение (лекарства + тренировки + питание)
  const avgPct = Math.round((Math.round(medicinePct) + workoutPct + nutritionPct) / 3);
  const theme = getStatusTheme(avgPct);

  // ===== ВОДА: локальное состояние главного экрана (пассивная статистика)
  const [waterByDate, setWaterByDate] = useState<Record<string, number>>({});
  const [dailyWaterTotal, setDailyWaterTotal] = useState<number>(10);
  const glassMl = DEFAULT_GLASS_ML;

  const todayKey = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const waterToday = waterByDate[todayKey] ?? 0;
  const waterLiters = (waterToday * glassMl) / 1000;
  const waterTotalLiters = (dailyWaterTotal * glassMl) / 1000;
  const waterPct = dailyWaterTotal > 0 ? Math.min(100, Math.round((waterToday / dailyWaterTotal) * 100)) : 0;

  const loadWater = useCallback(async () => {
    try {
      // Загружаем оба значения за один I/O запрос
      const [[, waterByDateRaw], [, waterTotalRaw]] = await AsyncStorage.multiGet([
        STORAGE_KEYS.WATER_BY_DATE,
        STORAGE_KEYS.WATER_TOTAL,
      ]);

      if (waterByDateRaw) {
        setWaterByDate(JSON.parse(waterByDateRaw));
      }
      if (waterTotalRaw) {
        const parsed = parseInt(waterTotalRaw, 10);
        if (!Number.isNaN(parsed) && parsed > 0) {
          setDailyWaterTotal(parsed);
        }
      }
    } catch {}
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      reloadStats();

      const loadProfile = async () => {
        try {
          const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
          if (stored) {
            const parsed = JSON.parse(stored);
            setUserImage(parsed.avatarUri || undefined);
          } else {
            setUserImage(undefined);
          }
        } catch {
          setUserImage(undefined);
        }
      };

      const loadFood = async () => {
        try {
          const data = await loadDiary();
          setEntriesByDate(data);
          isLoaded.current = true;
        } catch {}
      };

      loadProfile();
      loadFood();
      loadWater(); // <— загрузка воды
    }, [reloadStats, loadWater]),
  );

  useEffect(() => {
    if (!isLoaded.current) return;
    saveDiary(entriesByDate).catch(() => {});
  }, [entriesByDate]);

  const features: Feature[] = [
    { title: 'Продуктовые корзины', background: require('../../../assets/cards/darkRoundPlate.png') },
    { title: 'Тренировки',          background: require('../../../assets/cards/darkFitnessTimer.png') },
    { title: 'Дневник лекарств',    background: require('../../../assets/cards/pillsDiary1.png'), tab: 'Лекарства' },
    { title: 'ИИ-помощники',        background: require('../../../assets/cards/AI-helpers.png') },
    { title: 'Интересные факты',    icon: 'lightbulb-on-outline', background: require('../../../assets/cards/lamp1.png') },
  ];

  const handleFeaturePress = (feature: { title: string; tab?: string }) => {
    if (feature.tab) navigation.getParent()?.navigate(feature.tab as never);
    else Alert.alert(feature.title);
  };

  const FeatureButton: React.FC<{ feature: Feature }> = ({ feature }) => {
    const scale = React.useRef(new Animated.Value(1)).current;
    const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    return (
      <TouchableOpacity
        key={feature.title}
        activeOpacity={0.9}
        onPress={() => handleFeaturePress(feature)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View style={[styles.featureCard, { transform: [{ scale }] }]}>
          <ImageBackground source={feature.background} style={styles.imageBackground} imageStyle={styles.featureCardImage}>
            {feature.background && feature.overlay !== false && <View style={styles.featureOverlay} />}
            <View style={[styles.featureContent, feature.background ? styles.featureContentBottom : undefined]}>
              {feature.icon && !feature.background && (
                <View style={styles.iconWrapper}>
                  <Icon name={feature.icon as any} size={30} color="#F0F0F0" />
                </View>
              )}
              <Text
                numberOfLines={2}
                style={[
                  styles.featureLabel,
                  feature.background ? [styles.featureLabelImage, { color: '#FFFFFF' }] : undefined,
                ]}
              >
                {feature.title}
              </Text>
            </View>
          </ImageBackground>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const summaries = [
    { label: 'Лекарства', icon: 'pill', value: medicinePct },
    { label: 'Тренировки', icon: 'dumbbell', value: workoutPct },
    { label: 'Питание', icon: 'food-apple', value: nutritionPct },
  ];

  const renderAvatar = () => {
    if (userImage) return <Image source={{ uri: userImage }} style={styles.avatarImage} />;
    if (profileInitial) return <Text style={styles.avatarInitial}>{profileInitial}</Text>;
    return <Icon name="account" size={24} color="#888" />;
  };

  const MiniStat: React.FC<{
    icon: string; label: string; value: string;
    accent?: 'orange'|'green'|'yellow'|'gray';
    onPress?: () => void; borderWidth?: number;
    }> = ({ icon, label, value, accent='gray', onPress, borderWidth = 2.5 }) => {
    const border =
      accent==='orange' ? '#FF5722' :
      accent==='green'  ? '#4CAF50' :
      accent==='yellow' ? '#FFC107' : 'rgba(255,255,255,0.06)';

    return (
      <TouchableOpacity
        style={[styles.miniStat, { borderColor: border, borderWidth }]}
        onPress={onPress}
        activeOpacity={0.8}
    >
      <View style={styles.miniIconBubble}><Icon name={icon as any} size={18} color="#EDEDED" /></View>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue}>{value}</Text>
    </TouchableOpacity>
    );
  };

  const WeekStrip: React.FC = () => {
    const week = getThisWeek();
    return (
      <View style={styles.weekStrip}>
        {week.map((d) => (
          <View key={`${d.label}${d.date}`} style={[styles.weekCell, d.isToday ? styles.weekCellActive : undefined]}>
            <Text style={[styles.weekCellText, d.isToday ? styles.weekCellTextActive : undefined]}>{d.label}</Text>
            <Text style={[styles.weekCellDay, d.isToday ? styles.weekCellTextActive : undefined]}>{d.date}</Text>
          </View>
        ))}
      </View>
    );
  };

  const MealRow: React.FC<{
    title: string;
    kcal?: number;
    onAdd: () => void;
    showWarn: boolean;
  }> = ({ title, kcal, onAdd, showWarn }) => (
    <View style={styles.mealRow}>
      <View style={styles.mealLeft}>
        <Icon name="fire" size={16} color="#FFB74D" />
        <Text style={styles.mealTitle}>{title}</Text>
        {typeof kcal === 'number' && kcal > 0 && (
          <Text style={[styles.mealKcal, showWarn ? styles.mealKcalWarning : undefined]}>
            {fmtKcal(kcal)}
            {showWarn ? ' !' : ''}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.mealAddBtn} activeOpacity={0.8} onPress={onAdd}>
        <Icon name="plus" size={18} color="#111" />
      </TouchableOpacity>
    </View>
  );

  const StatsQuickGrid: React.FC = () => (
    <View style={styles.grid4}>
      <MiniStat icon="run" label="Спорт" value="2.0 ч" accent="green" />
      <MiniStat icon="heart-pulse" label="Пульс" value="86" accent="orange" />
      <MiniStat icon="scale-bathroom" label="Вес" value="72.8" accent="yellow" />
      <MiniStat icon="water" label="Вода" value={`${waterToday}/${dailyWaterTotal}`} />
    </View>
  );

  const handleConfirmFood = (entry: NormalizedEntry) => {
    setEntriesByDate(prev => {
      const day = prev[selectedDate] || createEmptyDay();
      const updated = { ...day, [entry.mealType]: [...day[entry.mealType], entry] };
      const merged = { ...prev, [selectedDate]: updated };
      saveDiary(merged).catch(() => {});
      return merged;
    });
    setActiveMeal(null);
  };

  // Карточка воды — переход к вложенному экрану Diet внутри таба "Питание"
  const WaterStatCard: React.FC = () => {
    const t = getWaterTheme(waterPct);
    const goToWater = () => {
      const parent = navigation.getParent();
      if (parent) {
        // Родитель — TabNavigator. Переходим в таб "Питание" и сразу во вложенный стек на экран "Diet".
        (parent as any).navigate('Питание', {
          screen: 'Diet',
          params: { jumpTo: 'water' },
        });
      } else {
        // Фоллбэк (на случай, если Diet окажется в этом же стеке)
        (navigation as any).navigate('Diet', { jumpTo: 'water' });
      }
    };

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={goToWater}
        style={[styles.weeklyCard, { backgroundColor: '#171717', marginBottom: 12, borderColor: 'rgba(255,255,255,0.06)' }]}
      >
        <View style={[styles.weeklyLeft, { paddingRight: 12 }]}>
          <View style={[styles.badge, { backgroundColor: t.badgeBg }]}>
            <Icon name="cup-water" size={14} color={t.badgeTint} />
            <Text style={[styles.badgeText, { color: t.badgeTint }]}>Водный баланс</Text>
          </View>
          <Text style={styles.weeklyTitle}>Вода сегодня</Text>
          <Text style={[styles.miniLabel, { marginTop: 6 }]}>
            {waterToday}/{dailyWaterTotal} ст. • {waterLiters.toFixed(waterLiters < 1 ? 2 : 1)} л
          </Text>
          <Text style={[styles.miniLabel, { marginTop: 2 }]}>
            Цель: {waterTotalLiters.toFixed(1)} л
          </Text>
        </View>

        <MiniRing
          size={72}
          stroke={8}
          percent={waterPct}
          trackColor="rgba(255,255,255,0.12)"
          color={t.tint}
          centerBg="#171717"
          center={
            <View style={styles.ringLabel}>
              <Text style={styles.ringDays}>{waterPct}</Text>
              <Text style={styles.ringSub}>%</Text>
            </View>
          }
        />
      </TouchableOpacity>
    );
  };

  const openAuthStack = () => {
    navigation.navigate('AuthStack', { screen: 'Login' });
  };

  const handleProfilePress = () => {
    if (isAuthenticated) {
      navigation.navigate('Account');
    } else {
      openAuthStack();
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Профиль */}
      {isAuthenticated ? (
        <TouchableOpacity style={styles.profileRow} onPress={handleProfilePress} activeOpacity={0.7}>
          <View style={styles.avatar}>{renderAvatar()}</View>
          <View style={styles.infoRow}>
            <Text style={profileName ? styles.profileName : styles.profileNamePlaceholder}>
              {displayName}
            </Text>
            {isPro && <Icon name="crown" size={16} color="#FFD700" style={styles.crown} />}
            <Icon name="chevron-right" size={22} color="#888" style={styles.chevron} />
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.loginPrompt} onPress={openAuthStack} activeOpacity={0.8}>
          <View style={styles.loginIconWrapper}>
            <Icon name="account-arrow-right" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.loginPromptText}>Войдите в аккаунт</Text>
          <Icon name="chevron-right" size={22} color="#9E9E9E" />
        </TouchableOpacity>
      )}
      <ScrollView style={styles.verticalScroll} contentContainerStyle={Platform.OS === 'ios' ? styles.scrollContentIOS : styles.scrollContent} showsVerticalScrollIndicator>
        <View style={[styles.weeklyCard, { backgroundColor: theme.bg }]}>
          <View style={styles.weeklyLeft}>
            <View style={[styles.badge, { backgroundColor: theme.badgeBg }]}>
              <Icon name={theme.badgeIcon as any} size={14} color={theme.badgeTint} />
              <Text style={[styles.badgeText, { color: theme.badgeTint }]}>{theme.badgeText}</Text>
            </View>
            <Text style={styles.weeklyTitle}>Прогресс недели</Text>
          </View>
          <MiniRing
            size={72}
            stroke={8}
            percent={avgPct}
            trackColor="rgba(255,255,255,0.12)"
            color={theme.tint}
            centerBg={theme.bg}
            center={
              <View style={styles.ringLabel}>
                <Text style={styles.ringDays}>{avgPct}</Text>
                <Text style={styles.ringSub}>%</Text>
              </View>
            }
          />
        </View>

        {/* Быстрые метрики */}
        <View style={styles.quickRow}>
          <MiniStat icon="walk" label="Шаги за день" value="5 500" accent="yellow" />
          <MiniStat icon="cup-water" label="Вода" value={`${waterToday}/${dailyWaterTotal}`} />
        </View>

        {/* Карточка воды */}
        <WaterStatCard />

        {/* Календарная лента недели */}
        <WeekStrip />

        {/* Приёмы пищи */}
        <View style={styles.mealsBlock}>
          <MealRow title="Завтрак"  kcal={mealTotals.breakfast.calories} showWarn={isOverTarget && mealTotals.breakfast.calories > 0} onAdd={() => setActiveMeal('breakfast')} />
          <MealRow title="Обед"     kcal={mealTotals.lunch.calories}     showWarn={isOverTarget && mealTotals.lunch.calories > 0}     onAdd={() => setActiveMeal('lunch')} />
          <MealRow title="Ужин"     kcal={mealTotals.dinner.calories}    showWarn={isOverTarget && mealTotals.dinner.calories > 0}    onAdd={() => setActiveMeal('dinner')} />
          <MealRow title="Перекус"  kcal={mealTotals.snack.calories}     showWarn={isOverTarget && mealTotals.snack.calories > 0}     onAdd={() => setActiveMeal('snack')} />
        </View>

        {/* 2x2 */}
        <StatsQuickGrid />

        {/* Саммари */}
        <View style={styles.summaryRow}>
          {summaries.map((item) => (
            <CategorySummaryCard key={item.label} icon={item.icon} label={item.label} percentage={item.value} />
          ))}
        </View>
      </ScrollView>

      {/* AddFoodModal */}
      {activeMeal && (
        <AddFoodModal
          mealType={activeMeal}
          onCancel={() => setActiveMeal(null)}
          onConfirm={handleConfirmFood}
          dayTotals={dayTotals}
          dayTargets={{ calories: DAILY_TARGET_KCAL }}
        />
      )}
    </SafeAreaView>
  );
};

export default MainScreen;