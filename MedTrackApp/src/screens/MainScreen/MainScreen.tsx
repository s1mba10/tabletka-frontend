// MainScreen.tsx
import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AdherenceDisplay, CategorySummaryCard } from '../../components';
import { useAdherence } from '../../hooks';
import { RootStackParamList } from '../../navigation';
import { styles } from './styles';

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
const formatKcalRange = (min: number, max: number) => `${min} – ${max} ккал`;

const MainScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { percentage, reloadStats } = useAdherence();

  const [userName, setUserName] = useState<string | undefined>();
  const [userImage, setUserImage] = useState<string | undefined>();
  const isPro = true; // placeholder

  useFocusEffect(
    React.useCallback(() => {
      reloadStats();
      const loadProfile = async () => {
        try {
          const stored = await AsyncStorage.getItem('userProfile');
          if (stored) {
            const parsed = JSON.parse(stored);
            const firstName = parsed.firstName || '';
            const lastName = parsed.lastName || '';
            setUserName(firstName && lastName ? `${firstName} ${lastName}` : undefined);
            setUserImage(parsed.avatarUri || undefined);
          } else {
            setUserName(undefined);
            setUserImage(undefined);
          }
        } catch {
          setUserName(undefined);
          setUserImage(undefined);
        }
      };
      loadProfile();
    }, [reloadStats]),
  );

  // Оставляем данные и компонент карточек фич — рендер ниже закомментирован (как просил).
  const features: Feature[] = [
    { title: 'Продуктовые корзины', background: require('../../../assets/cards/darkRoundPlate.png') },
    { title: 'Тренировки',          background: require('../../../assets/cards/darkFitnessTimer.png') },
    { title: 'Дневник лекарств',    background: require('../../../assets/cards/pillsDiary1.png'), tab: 'Лекарства' },
    { title: 'ИИ-помощники',        background: require('../../../assets/cards/AI-helpers.png') },
    { title: 'Интересные факты',    icon: 'lightbulb-on-outline', background: require('../../../assets/cards/lamp1.png') },
  ];

  const handleFeaturePress = (feature: { title: string; tab?: string }) => {
    if (feature.tab) {
      navigation.getParent()?.navigate(feature.tab as never);
    } else {
      Alert.alert(feature.title);
    }
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

  const getAdherenceColor = (value: number) => {
    if (value >= 80) return '#4CAF50';
    if (value >= 60) return '#FFC107';
    return '#FF5722';
  };

  const summaries = [
    { label: 'Лекарства', icon: 'pill', value: percentage },
    { label: 'Тренировки', icon: 'dumbbell', value: 90 },
    { label: 'Питание', icon: 'food-apple', value: 65 },
  ];

  const renderAvatar = () => {
    if (userImage) return <Image source={{ uri: userImage }} style={styles.avatarImage} />;
    if (userName) return <Text style={styles.avatarInitial}>{userName[0]}</Text>;
    return <Icon name="account" size={24} color="#888" />;
  };

  // ==== мини-компоненты виджетов ====
  const MiniStat: React.FC<{ icon: string; label: string; value: string; accent?: 'orange'|'green'|'yellow'|'gray'; onPress?: () => void; }>
    = ({ icon, label, value, accent='gray', onPress }) => {
      const border =
        accent==='orange' ? '#FF5722' :
        accent==='green'  ? '#4CAF50' :
        accent==='yellow' ? '#FFC107' : 'rgba(255,255,255,0.06)';
      return (
        <TouchableOpacity style={[styles.miniStat, { borderColor: border }]} onPress={onPress} activeOpacity={0.8}>
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

  const MealRow: React.FC<{ title: string; kcalMin: number; kcalMax: number; onAdd?: () => void; }>
    = ({ title, kcalMin, kcalMax, onAdd }) => (
      <View style={styles.mealRow}>
        <View style={styles.mealLeft}>
          <Icon name="fire" size={16} color="#FFB74D" />
          <Text style={styles.mealTitle}>{title}</Text>
          <Text style={styles.mealKcal}>{formatKcalRange(kcalMin, kcalMax)}</Text>
        </View>
        <TouchableOpacity style={styles.mealAddBtn} onPress={onAdd} activeOpacity={0.8}>
          <Icon name="plus" size={18} color="#111" />
        </TouchableOpacity>
      </View>
    );

  const StatsQuickGrid: React.FC = () => (
    <View style={styles.grid4}>
      <MiniStat icon="run" label="Exercise" value="2.0 ч" accent="green" />
      <MiniStat icon="heart-pulse" label="BPM" value="86" accent="orange" />
      <MiniStat icon="scale-bathroom" label="Вес" value="72.8" accent="yellow" />
      <MiniStat icon="water" label="Вода" value="12 стак." />
    </View>
  );

  // ==== UI ====
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Профиль */}
      <TouchableOpacity style={styles.profileRow} onPress={() => navigation.navigate('Account')} activeOpacity={0.7}>
        <View style={styles.avatar}>{renderAvatar()}</View>
        <View style={styles.infoRow}>
          <Text style={userName ? styles.profileName : styles.profileNamePlaceholder}>
            {userName || 'Имя не указано'}
          </Text>
        {isPro && <Icon name="crown" size={16} color="#FFD700" style={styles.crown} />}
          <Icon name="chevron-right" size={22} color="#888" style={styles.chevron} />
        </View>
      </TouchableOpacity>

      {/* Всё содержимое ниже — в вертикальном ScrollView (прокрутка вниз) */}
      <ScrollView style={styles.verticalScroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator>
        {/* ====== БЛОКИ «ПРОДУКТОВЫЕ КОРЗИНЫ / ТРЕНИРОВКИ / ДНЕВНИК ЛЕКАРСТВ / ИИ-ПОМОЩНИКИ / ИНТЕРЕСНЫЕ ФАКТЫ» — ЗАКОММЕНТИРОВАНО ====== */}
        {/*
        <View style={styles.featuresContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {features.map((feature) => (
              <FeatureButton key={feature.title} feature={feature} />
            ))}
          </ScrollView>
        </View>
        */}
        {/* ====== КОНЕЦ ЗАКОММЕНТИРОВАННОГО БЛОКА ФИЧ ====== */}

        {/* Быстрые метрики */}
        <View style={styles.quickRow}>
          <MiniStat
            icon="walk"
            label="Шаги за день"
            value="5 500"
            accent="yellow"
            onPress={() => navigation.getParent()?.navigate('Тренировки' as never)}
          />
          <MiniStat
            icon="cup-water"
            label="Вода"
            value="12 стак."
            accent="green"
            onPress={() => navigation.getParent()?.navigate('Питание' as never)}
          />
        </View>

        {/* Календарная лента недели */}
        <WeekStrip />

        {/* Приёмы пищи */}
        <View style={styles.mealsBlock}>
          <MealRow title="Завтрак" kcalMin={456} kcalMax={512} onAdd={() => Alert.alert('Добавить завтрак')} />
          <MealRow title="Обед"    kcalMin={520} kcalMax={680} onAdd={() => Alert.alert('Добавить обед')} />
        </View>

        {/* Кольцо соблюдения */}
        <View style={styles.adherenceWrapper}>
          <AdherenceDisplay percentage={percentage} color={getAdherenceColor(percentage)} />
        </View>

        {/* Превью статистики 2x2 */}
        <StatsQuickGrid />

        {/* Три карточки-саммари */}
        <View style={styles.summaryRow}>
          {summaries.map((item) => (
            <CategorySummaryCard key={item.label} icon={item.icon} label={item.label} percentage={item.value} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MainScreen;