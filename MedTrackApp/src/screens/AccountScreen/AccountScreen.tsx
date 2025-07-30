import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './styles';

const AccountScreen: React.FC = () => (
  <SafeAreaView edges={['top']} style={styles.container}>
    <View style={styles.content}>
      <Text style={styles.title}>Account Screen</Text>
    </View>
  </SafeAreaView>
);

export default AccountScreen;
