import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export type Props = {
  onAddReminder: () => void;
  selectedDate: Date;
  style?: import('react-native').ViewStyle;
};

const EmptyDayState: React.FC<Props> = ({ onAddReminder, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../../assets/Happy_Pill_Dive.png')}
        style={styles.image}
        accessibilityLabel="Пустой список напоминаний"
      />
      <Text style={styles.title}>На этот день нет напоминаний</Text>
      <Text style={styles.subtitle}>Запланируйте приём, чтобы ничего не забыть</Text>
      <TouchableOpacity
        onPress={onAddReminder}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Добавить напоминание на сегодня"
      >
        <Text style={styles.buttonText}>Добавить напоминание на сегодня</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmptyDayState;
