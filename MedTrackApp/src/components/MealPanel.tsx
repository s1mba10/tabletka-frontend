import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type MealEntry = {
  id: string;
  name: string;
  amount?: string;
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
};

export type MealPanelProps = {
  icon: string;
  title: string;
  totalCalories: number;
  fat: number;
  carbs: number;
  protein: number;
  rskPercent?: number;
  entries: MealEntry[];
  onAdd?: () => void;
  onSelectEntry?: (id: string) => void;
  onCopyFromYesterday?: () => void;
  onSaveMeal?: () => void;
  onCamera?: () => void;
};

const formatNumber = (value: number) =>
  value.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const MealPanel: React.FC<MealPanelProps> = ({
  icon,
  title,
  totalCalories,
  fat,
  carbs,
  protein,
  rskPercent,
  entries,
  onAdd,
  onSelectEntry,
  onCopyFromYesterday,
  onSaveMeal,
  onCamera,
}) => {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => setExpanded(prev => !prev);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerMain} onPress={toggle} activeOpacity={0.7}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.calorieBlock}>
            <Text style={styles.calories}>{formatNumber(totalCalories)}</Text>
            <Text style={styles.caloriesLabel}>Калории</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAdd}
          activeOpacity={0.7}
          accessibilityLabel={`Добавить запись в раздел ${title}`}
        >
          <Icon name="plus" size={24} color="#22C55E" />
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.metricsRow} onPress={toggle} activeOpacity={0.7}>
        <View style={styles.metrics}>
          <Text style={styles.metric}>{formatNumber(fat)}</Text>
          <Text style={styles.metric}>{formatNumber(carbs)}</Text>
          <Text style={styles.metric}>{formatNumber(protein)}</Text>
          <Text style={styles.metric}>
            {rskPercent !== undefined ? `${rskPercent}%` : '—'}
          </Text>
        </View>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>
      {expanded && (
        <>
          <View style={styles.entries}>
            {entries.length === 0 ? (
              <View style={styles.placeholderRow}>
                <Text style={styles.placeholderText}>Записей пока нет</Text>
              </View>
            ) : (
              entries.map(entry => (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.entryRow}
                  onPress={() => onSelectEntry && onSelectEntry(entry.id)}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.entryName}>{entry.name}</Text>
                      <Text style={styles.entryCalories}>
                        {formatNumber(entry.calories)}
                      </Text>
                    </View>
                    {entry.amount && (
                      <Text style={styles.entryAmount}>{entry.amount}</Text>
                    )}
                    <Text style={styles.entryMetrics}>
                      {formatNumber(entry.fat)} • {formatNumber(entry.carbs)} • {formatNumber(entry.protein)}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#fff" />
                </TouchableOpacity>
              ))
            )}
          </View>
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={styles.action}
              onPress={onCopyFromYesterday}
            >
              <Icon name="content-copy" size={16} color="#22C55E" />
              <Text style={styles.actionText}>Копировать из вчера</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={onSaveMeal}>
              <Icon name="bookmark-plus-outline" size={16} color="#22C55E" />
              <Text style={styles.actionText}>Сохранить Еду</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={onCamera}>
              <Icon name="camera" size={16} color="#22C55E" />
              <Text style={styles.actionText}>Камера</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginHorizontal: 8,
    marginBottom: 12,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  calorieBlock: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  calories: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  caloriesLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#323232',
    marginVertical: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metrics: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
    color: '#fff',
    textAlign: 'center',
  },
  entries: {
    marginTop: 10,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#323232',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  entryName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  entryCalories: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  entryAmount: {
    color: '#22C55E',
    fontSize: 12,
  },
  entryMetrics: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  placeholderRow: {
    paddingVertical: 8,
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontSize: 14,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#323232',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#22C55E',
    fontSize: 12,
    marginLeft: 4,
  },
});

export default MealPanel;
