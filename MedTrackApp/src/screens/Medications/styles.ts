import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    color: 'white',
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  listItem: {
    backgroundColor: '#1E1E1E',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 5,
    marginBottom: 8,
  },
  listText: {
    color: 'white',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    color: '#ccc',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  courseItem: {
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 5,
    marginBottom: 8,
  },
  courseTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 4,
  },
  courseSubtitle: {
    color: '#888',
    fontSize: 14,
  },
});
