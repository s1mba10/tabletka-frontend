import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ImageBackground,
  useColorScheme,
  Pressable,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdherenceDisplay, CategorySummaryCard } from '../../components';
import { useAdherence } from '../../hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from '../../navigation';
import { styles } from './styles';

type NavigationProp = StackNavigationProp<RootStackParamList, 'MainScreen'>;

const MainScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { percentage, reloadStats } = useAdherence();
  const [userName, setUserName] = useState<string | undefined>();
  const [userImage, setUserImage] = useState<string | undefined>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

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

  const features = [
    { title: 'Продуктовые корзины', icon: 'basket' },
    { title: 'Тренировки', icon: 'dumbbell' },
    { title: 'Дневник лекарств', icon: 'clipboard-text', tab: 'Лекарства' },
    { title: 'ИИ-помощники', icon: 'robot' },
    { title: 'Интересные факты', icon: 'lightbulb-on-outline' },
  ];

  const handleFeaturePress = (feature: { title: string; tab?: string }) => {
    if (feature.tab) {
      navigation.getParent()?.navigate(feature.tab as never);
    } else {
      Alert.alert(feature.title);
    }
  };

  const FeatureItem: React.FC<{ feature: { title: string; icon: string; tab?: string } }> = ({ feature }) => {
    const scale = useRef(new Animated.Value(1)).current;
    return (
      <Pressable
        onPress={() => handleFeaturePress(feature)}
        android_ripple={{
          color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderless: false,
        }}
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.97,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }).start()
        }
        style={styles.featurePressable}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <ImageBackground
            source={undefined}
            style={[
              styles.featureCard,
              isDark ? styles.featureCardDark : styles.featureCardLight,
            ]}
            imageStyle={styles.featureCardImage}
          >
            <View style={styles.featureContent}>
              <Icon
                name={feature.icon as any}
                size={32}
                color={isDark ? '#fff' : '#000'}
                style={styles.featureIcon}
              />
              <Text
                style={[
                  styles.featureLabel,
                  isDark ? styles.featureLabelDark : styles.featureLabelLight,
                ]}
                numberOfLines={2}
              >
                {feature.title}
              </Text>
            </View>
          </ImageBackground>
        </Animated.View>
      </Pressable>
    );
  };

  const isPro = true; // placeholder

  const getAdherenceColor = (value: number) => {
    if (value >= 80) {
      return '#4CAF50';
    }
    if (value >= 60) {
      return '#FFC107';
    }
    return '#FF5722';
  };
  const adherenceColor = getAdherenceColor(percentage);

  const summaries = [
    { label: 'Лекарства', icon: 'pill', value: percentage },
    { label: 'Тренировки', icon: 'dumbbell', value: 90 },
    { label: 'Питание', icon: 'food-apple', value: 65 },
  ];

  const renderAvatar = () => {
    if (userImage) {
      return <Image source={{ uri: userImage }} style={styles.avatarImage} />;
    }
    if (userName) {
      return <Text style={styles.avatarInitial}>{userName[0]}</Text>;
    }
    return <Icon name="account" size={28} color="#888" />;
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
    >
      <TouchableOpacity style={styles.profileRow} onPress={() => navigation.navigate('Account')} activeOpacity={0.7}>
        <View style={styles.avatar}>{renderAvatar()}</View>
        <View style={styles.infoRow}>
          <Text style={userName ? styles.profileName : styles.profileNamePlaceholder}>
            {userName || 'Имя не указано'}
          </Text>
          {isPro && <Icon name="crown" size={18} color="#FFD700" style={styles.crown} />}
          <Icon name="chevron-right" size={24} color="#888" style={styles.chevron} />
        </View>
      </TouchableOpacity>

      <View style={styles.featuresContainer}>
        {features.map((feature) => (
          <FeatureItem key={feature.title} feature={feature} />
        ))}
      </View>

      <View style={styles.adherenceWrapper}>
        <AdherenceDisplay percentage={percentage} color={adherenceColor} />
      </View>

      <View style={styles.summaryRow}>
        {summaries.map((item) => (
          <CategorySummaryCard key={item.label} icon={item.icon} label={item.label} percentage={item.value} />
        ))}
      </View>
    </SafeAreaView>
  );
};

export default MainScreen;
