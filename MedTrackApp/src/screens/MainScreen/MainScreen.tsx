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

  const FeatureButton: React.FC<{ feature: { title: string; icon: string; tab?: string } }> = ({
    feature,
  }) => {
    const scale = React.useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
    };

    const onPressOut = () => {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    };

    return (
      <TouchableOpacity
        key={feature.title}
        activeOpacity={0.9}
        onPress={() => handleFeaturePress(feature)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View style={[styles.featureCard, { transform: [{ scale }] }]}>
          <ImageBackground
            source={undefined}
            style={styles.imageBackground}
            imageStyle={styles.featureCardImage}
          >
            <View style={styles.featureContent}>
              <View style={styles.iconWrapper}>
                <Icon name={feature.icon as any} size={30} color="#F0F0F0" />
              </View>
              <Text style={styles.featureLabel} numberOfLines={2}>
                {feature.title}
              </Text>
            </View>
          </ImageBackground>
        </Animated.View>
      </TouchableOpacity>
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
    <SafeAreaView edges={['top']} style={styles.container}>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {features.map((feature) => (
            <FeatureButton key={feature.title} feature={feature} />
          ))}
        </ScrollView>
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
