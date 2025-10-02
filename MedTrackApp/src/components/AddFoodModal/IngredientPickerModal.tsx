import React from 'react';
import { Modal, View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { styles } from './styles';

type SearchItem = any;

type Props = {
  visible: boolean;
  topInset: number;
  bottomInset: number;
  ingredientSelected: SearchItem | null;
  ingredientSearch: string;
  onIngredientSearchChange: (v: string) => void;
  ingredientResults: SearchItem[];
  itemKey: (item: any, type: any) => string;
  onPickItem: (item: SearchItem) => void;

  ingredientMass: string;
  onIngredientMassChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

const IngredientPickerModal: React.FC<Props> = ({
  visible,
  topInset,
  bottomInset,
  ingredientSelected,
  ingredientSearch,
  onIngredientSearchChange,
  ingredientResults,
  itemKey,
  onPickItem,
  ingredientMass,
  onIngredientMassChange,
  onSave,
  onCancel,
}) => {
  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onCancel}>
      <View style={[styles.container, { paddingTop: topInset, paddingBottom: bottomInset }]}>
        {!ingredientSelected ? (
          <>
            <TextInput
              placeholder="Поиск ингредиента"
              placeholderTextColor="#999"
              style={styles.input}
              value={ingredientSearch}
              onChangeText={onIngredientSearchChange}
            />
            <FlatList
              data={ingredientResults}
              keyExtractor={(i: any) => itemKey(i.item as any, i.type)}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.listItem} onPress={() => onPickItem(item)}>
                  <Text style={styles.itemName}>{item.item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={onCancel} style={styles.favToggle}>
              <Text style={styles.headerButton}>Отмена</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Масса, г</Text>
            <TextInput
              style={styles.input}
              value={ingredientMass}
              keyboardType="numeric"
              onChangeText={onIngredientMassChange}
            />
            <View style={styles.dishButtons}>
              <TouchableOpacity style={styles.saveDishButton} onPress={onSave}>
                <Text style={styles.saveDishText}>Сохранить</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelDishButton} onPress={onCancel}>
                <Text style={styles.cancelDishText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default IngredientPickerModal;
