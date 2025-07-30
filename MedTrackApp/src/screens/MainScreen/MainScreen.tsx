import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './styles';

const MainScreen: React.FC = () => (
  <SafeAreaView edges={['top']} style={styles.container}>
    <View>
      <Text style={{ color: 'white' }}>MainScreen</Text>
    </View>
  </SafeAreaView>
);

export default MainScreen;
