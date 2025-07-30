import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Circle } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../../navigation';
import { styles } from './styles';

type NavigationProp = StackNavigationProp<RootStackParamList, 'MainScreen'>;

const MainScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const isPro = false; // placeholder
  const userName = 'Иван';
  const userImage: string | undefined = undefined;
  const progress = 72;

  const renderAvatar = () => {
    if (userImage) {
      return <Image source={{ uri: userImage }} style={styles.avatarImage} />;
    }
    if (userName) {
      return <Text style={styles.avatarInitial}>{userName[0]}</Text>;
    }
    return <Icon name="account" size={24} color="#888" />;
  };

  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <TouchableOpacity
        style={styles.profileRow}
        onPress={() => navigation.navigate('Account')}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>{renderAvatar()}</View>
        <Text style={userName ? styles.profileName : styles.placeholderName}>
          {userName || 'Имя не указано'}
        </Text>
        {isPro && (
          <Icon name="crown" size={18} color="#FFD700" style={styles.crown} />
        )}
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <Svg width={radius * 2} height={radius * 2}>
          <Circle
            cx={radius}
            cy={radius}
            r={radius}
            stroke="#2C2C2C"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={radius}
            cy={radius}
            r={radius}
            stroke="#4CAF50"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        </Svg>
        <View style={styles.progressInner}>
          <Text style={styles.progressText}>{progress}%</Text>
          <Text style={styles.progressLabel}>на неделе</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MainScreen;
