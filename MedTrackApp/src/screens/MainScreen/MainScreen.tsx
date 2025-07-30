import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../../navigation';
import { styles } from './styles';

type NavigationProp = StackNavigationProp<RootStackParamList, 'MainScreen'>;

const MainScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const isPro = false; // placeholder
  const userName = 'Иван';
  const userImage: string | undefined = undefined;

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
    </SafeAreaView>
  );
};

export default MainScreen;
