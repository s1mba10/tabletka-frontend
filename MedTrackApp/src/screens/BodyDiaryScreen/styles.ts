import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  weekPicker: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  weekItem: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  weekItemActive: {
    backgroundColor: '#007AFF',
  },
  weekItemText: {
    color: 'white',
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  label: {
    color: '#aaa',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: 'white',
    padding: 10,
    borderRadius: 8,
  },
  pickerWrapper: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
  },
  picker: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

