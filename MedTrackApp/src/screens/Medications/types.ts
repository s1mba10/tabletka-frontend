import { NavigationProp } from '@react-navigation/native';
import { Medication } from '../../types';

export type MedicationsScreenNavigationProp = NavigationProp<any>;

export interface MedicationFormData {
  id?: number;
  name: string;
  dosage: string;
}
