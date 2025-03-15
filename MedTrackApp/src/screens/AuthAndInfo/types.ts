import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';
export type FormType = 'register' | 'login';

export type AuthNavigationProp = StackNavigationProp<RootStackParamList, 'AuthAndInfo'>;
