import { StyleSheet, Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  content: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
  },
  noInsets: {
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  contentPad: {
    paddingBottom: Platform.OS === 'ios' ? 80 : 16,
  },
  chevron: {
    position: 'absolute',
    right: 4,
    top: '50%',
    marginTop: -8,
    pointerEvents: 'none',
  },
});
