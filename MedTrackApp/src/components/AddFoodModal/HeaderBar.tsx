import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

type Props = {
  title: string;
  subtitle: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmEnabled: boolean;
};

const HeaderBar: React.FC<Props> = ({ title, subtitle, onCancel, onConfirm, confirmEnabled }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onCancel} accessibilityLabel="Отмена">
        <Text style={styles.headerButton}>Отмена</Text>
      </TouchableOpacity>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
      <TouchableOpacity onPress={onConfirm} disabled={!confirmEnabled} accessibilityLabel="Готово">
        <Text style={[styles.headerButton, { color: confirmEnabled ? '#22C55E' : '#777' }]}>Готово</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HeaderBar;
