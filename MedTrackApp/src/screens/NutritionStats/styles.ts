import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    padding: 16,
    backgroundColor: '#000',
    flexGrow: 1,
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: '48%',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    overflow: 'visible',
  },
  ringWrap: {
    width: 120,
    height: 120,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelCenter: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percent: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
});

