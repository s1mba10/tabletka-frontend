import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';

export type EditReminderScreenRouteProp = RouteProp<RootStackParamList, 'ReminderEdit'>;
export type EditReminderScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ReminderEdit'>;
