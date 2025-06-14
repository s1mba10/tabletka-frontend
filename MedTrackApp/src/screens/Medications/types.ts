import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';
import { Medication } from '../../types';

export type MedicationsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Medications'
>;

export interface MedicationFormData {
  id?: number;
  name: string;
  dosage: string;
}
