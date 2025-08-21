import { StyleSheet, Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight,
  },
  content: {
    padding: 16,
  },
});
