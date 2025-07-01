import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import { getISOWeeksInYear } from 'date-fns';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (year: number, week: number) => void;
  initialYear: number;
  initialWeek: number;
}

const WeekPickerModal: React.FC<Props> = ({
  visible,
  onClose,
  onSelect,
  initialYear,
  initialWeek,
}) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(initialYear);
  const [week, setWeek] = useState(initialWeek);
  const [weeksInYear, setWeeksInYear] = useState(getISOWeeksInYear(new Date(initialYear, 0, 4)));

  useEffect(() => {
    setWeeksInYear(getISOWeeksInYear(new Date(year, 0, 4)));
    if (week > getISOWeeksInYear(new Date(year, 0, 4))) {
      setWeek(getISOWeeksInYear(new Date(year, 0, 4)));
    }
  }, [year]);

  useEffect(() => {
    setYear(initialYear);
    setWeek(initialWeek);
  }, [initialYear, initialWeek]);

  const yearOptions = [];
  for (let y = 2020; y <= currentYear + 5; y++) {
    yearOptions.push(<Picker.Item key={y} label={String(y)} value={y} />);
  }

  const weekOptions = [];
  for (let w = 1; w <= weeksInYear; w++) {
    weekOptions.push(<Picker.Item key={w} label={String(w)} value={w} />);
  }

  const confirm = () => {
    onSelect(year, week);
  };

  return (
    <Modal
      isVisible={visible}
      swipeDirection="down"
      onSwipeComplete={onClose}
      onBackdropPress={onClose}
      style={styles.modal}
      propagateSwipe
    >
      <View style={styles.content}>
        <Text style={styles.title}>Выберите год и неделю</Text>
        <View style={styles.pickerRow}>
          <Picker
            selectedValue={year}
            style={styles.picker}
            onValueChange={(v) => setYear(v)}
            itemStyle={styles.pickerItem}
          >
            {yearOptions}
          </Picker>
          <Picker
            selectedValue={week}
            style={styles.picker}
            onValueChange={(v) => setWeek(v)}
            itemStyle={styles.pickerItem}
          >
            {weekOptions}
          </Picker>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity accessibilityRole="button" onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Отмена</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" onPress={confirm} style={styles.confirmButton}>
            <Text style={styles.confirmText}>Выбрать</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  content: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    paddingTop: 20,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  pickerRow: {
    flexDirection: 'row',
  },
  picker: {
    flex: 1,
    color: 'white',
  },
  pickerItem: {
    color: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  cancelText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  confirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WeekPickerModal;
