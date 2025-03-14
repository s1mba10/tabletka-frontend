import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';

export type NavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

export type ReminderStatus = 'taken' | 'pending' | 'missed';
export type MedicationType = 'tablet' | 'capsule' | 'liquid' | 'injection';
