import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  toggleButton: {
    alignSelf: 'center',
    backgroundColor: '#2C2C2C',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginBottom: 30,
  },
  toggleText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: 'white',
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 10,
    marginTop: -10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
