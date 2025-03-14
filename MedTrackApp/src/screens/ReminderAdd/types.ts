import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';

export type MedicationType = 'tablet' | 'capsule' | 'liquid' | 'injection';

export const typeIcons: Record<MedicationType, string> = {
  tablet: 'pill',
  capsule: 'pill',
  liquid: 'bottle-tonic-plus',
  injection: 'needle',
};

export type AddReminderScreenRouteProp = RouteProp<RootStackParamList, 'ReminderAdd'>;
export type AddReminderScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ReminderAdd'>;
