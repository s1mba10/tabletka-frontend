import { StyleSheet, Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    marginBottom: 12,
  },
  note: {
    minHeight: 60,
    maxHeight: 72,
    textAlignVertical: 'top',
  },
  photoBox: {
    height: 140,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  photoText: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoActions: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
  },
  photoActionButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
    borderRadius: 12,
    marginLeft: 4,
  },
  photoCaption: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favorite: {
    padding: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 'auto',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  macroPanel: {
    marginBottom: 16,
  },
  macroRow: {
    flexDirection: 'row',
  },
  macroBox: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    margin: 4,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  macroLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 4,
  },
  macroValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
