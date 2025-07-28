import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

import { styles } from './styles';

interface TaskGroup {
  id: string;
  name: string;
  count: number;
  screen: string;
}

interface FunctionItem {
  id: string;
  title: string;
  icon: string;
  screen: string;
  pro?: boolean;
}

const ProgressRing: React.FC<{ progress: number }> = ({ progress }) => {
  const size = 160;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - circumference * progress;

  return (
    <View style={styles.progressContainer}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2C2C2C"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#007AFF"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <View style={styles.progressLabelContainer}>
        <Text style={styles.progressLabel}>{Math.round(progress * 100)}%</Text>
      </View>
    </View>
  );
};

const MainScreen: React.FC = () => {
  const navigation = useNavigation();
  const isPro = false;

  const tasks: TaskGroup[] = [
    { id: 'med', name: 'Medications', count: 3, screen: 'Medications' },
    { id: 'food', name: 'Food', count: 2, screen: 'Food' },
    { id: 'workout', name: 'Workout', count: 1, screen: 'Workout' },
  ];

  const functions: FunctionItem[] = [
    { id: 'reminders', title: 'Reminders', icon: 'bell-outline', screen: 'Main' },
    { id: 'stats', title: 'Analytics', icon: 'chart-box-outline', screen: 'Profile', pro: true },
    { id: 'medications', title: 'Medications', icon: 'pill', screen: 'Medications' },
    { id: 'settings', title: 'Settings', icon: 'cog-outline', screen: 'Settings' },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>Hello!</Text>
          {isPro && (
            <Icon name="crown" size={20} color="#FFD700" style={styles.crownIcon} />
          )}
        </View>
      </View>

      <View style={styles.progressSection}>
        <ProgressRing progress={0.72} />
      </View>

      <View style={styles.tasksSection}>
        {tasks.map(task => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskCard}
            onPress={() => navigation.navigate(task.screen as never)}
          >
            <Text style={styles.taskTitle}>{task.name}</Text>
            <Text style={styles.taskCount}>{task.count}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.functionsGrid}>
        {functions.map(func => (
          <TouchableOpacity
            key={func.id}
            style={styles.functionCard}
            onPress={() => navigation.navigate(func.screen as never)}
          >
            {func.pro && (
              <View style={styles.proBadge}>
                <Text style={styles.proText}>PRO</Text>
              </View>
            )}
            <Icon name={func.icon} size={36} color="white" />
            <Text style={styles.functionTitle}>{func.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default MainScreen;
