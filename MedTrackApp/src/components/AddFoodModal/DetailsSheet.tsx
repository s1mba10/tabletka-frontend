import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styles } from './styles';
import { formatNumber } from '../../utils/number';

export type Macros = { calories: number; protein: number; fat: number; carbs: number } | null;

type Props = {
  title: string;
  portion: string;
  onPortionChange: (v: string) => void;
  note: string;
  onNoteChange: (v: string) => void;
  computed: Macros;
  onToggleFavorite: () => void;
  onClose: () => void;
  bottomOffset: number;       // usually BOTTOM_BAR_HEIGHT
  height: number;             // DETAILS_HEIGHT
};

const DetailsSheet: React.FC<Props> = ({
  title,
  portion,
  onPortionChange,
  note,
  onNoteChange,
  computed,
  onToggleFavorite,
  onClose,
  bottomOffset,
  height,
}) => {
  return (
    <View style={[styles.detailsSheet, { height, bottom: bottomOffset, paddingBottom: 12 }]}>
      <View style={styles.detailsSheetHeader}>
        <Text style={styles.detailsTitle}>{title}</Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.closeText}>Скрыть</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Порция, г</Text>
      <TextInput
        testID="addfood-details-mass-input"
        style={styles.input}
        value={portion}
        keyboardType="numeric"
        onChangeText={onPortionChange}
      />

      {computed && Number(portion) > 0 && (
        <Text style={[styles.itemDetails, { marginHorizontal: 8 }]}>
          к добавлению: {formatNumber(computed.calories)} ккал • Б {formatNumber(computed.protein)} • Ж {formatNumber(computed.fat)} • У {formatNumber(computed.carbs)}
        </Text>
      )}

      <Text style={styles.label}>Заметка (опционально)</Text>
      <TextInput style={styles.input} value={note} onChangeText={onNoteChange} />

      <View testID="details-fav-row" style={[styles.favRow, { marginBottom: 0 }]}>
        <TouchableOpacity testID="details-fav-star" onPress={onToggleFavorite} style={styles.starButton}>
          <Text style={[styles.star, { color: '#22C55E' }]}>★</Text>
        </TouchableOpacity>
        <Text style={[styles.favLabel, { color: '#22C55E' }]}>В избранное</Text>
      </View>
    </View>
  );
};

export default DetailsSheet;
