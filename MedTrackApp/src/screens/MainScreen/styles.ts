import { StyleSheet, Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  crownIcon: {
    marginLeft: 8,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressLabelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tasksSection: {
    paddingHorizontal: 20,
  },
  taskCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskTitle: {
    color: 'white',
    fontSize: 16,
  },
  taskCount: {
    color: '#AAA',
    fontSize: 16,
  },
  functionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  functionCard: {
    backgroundColor: '#1E1E1E',
    width: '48%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  functionTitle: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  proBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF4081',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
