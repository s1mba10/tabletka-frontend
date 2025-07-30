import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdherenceDisplay, CategorySummaryCard } from '../../components';
import { useAdherence } from '../../hooks';

import { RootStackParamList } from '../../navigation';
import { styles } from './styles';

type NavigationProp = StackNavigationProp<RootStackParamList, 'MainScreen'>;

const MainScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { percentage, reloadStats } = useAdherence();

  useFocusEffect(
    React.useCallback(() => {
      reloadStats();
    }, [reloadStats])
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

  const isPro = true; // placeholder
  const userName = 'Иван Иванов'; // placeholder
  const userImage: string | undefined = undefined;

  const getAdherenceColor = (value: number) => {
    if (value >= 80) return '#4CAF50';
    if (value >= 60) return '#FFC107';
    return '#FF5722';
  };
  const adherenceColor = getAdherenceColor(percentage);

  const getStatusLabel = (value: number) => {
    if (value >= 80) return 'Отлично';
    if (value >= 60) return 'Можно лучше';
    return 'Низкий результат';
  };

  const summaries = [
    { name: 'Лекарства', icon: '💊', value: percentage },
    { name: 'Тренировки', icon: '🏋️', value: 72 },
    { name: 'Питание', icon: '🍎', value: 65 },
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
      <TouchableOpacity
        style={styles.profileRow}
        onPress={() => navigation.navigate('Account')}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>{renderAvatar()}</View>
        <View style={styles.infoRow}>
          <Text style={userName ? styles.profileName : styles.placeholderName}>
            {userName || 'Имя не указано'}
          </Text>
          {isPro && (
            <Icon name="crown" size={18} color="#FFD700" style={styles.crown} />
          )}
          <Icon
            name="chevron-right"
            size={24}
            color="#888"
            style={styles.chevron}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.featuresContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {features.map(feature => (
            <TouchableOpacity
              key={feature.title}
              activeOpacity={0.8}
              onPress={() => handleFeaturePress(feature)}
            >
              <ImageBackground
                source={undefined}
                style={styles.featureCard}
                imageStyle={styles.featureCardImage}
              >
                <View style={styles.featureContent}>
                  <Icon
                    name={feature.icon as any}
                    size={40}
                    color="#fff"
                    style={styles.featureIcon}
                  />
                  <Text style={styles.featureLabel} numberOfLines={2}>
                    {feature.title}
                  </Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.adherenceWrapper}>
        <AdherenceDisplay percentage={percentage} color={adherenceColor} />
      </View>

      <View style={styles.summaryRow}>
        {summaries.map(item => (
          <CategorySummaryCard
            key={item.name}
            icon={item.icon}
            percentage={Math.round(item.value)}
            status={getStatusLabel(item.value)}
            color={getAdherenceColor(item.value)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

export default MainScreen;
