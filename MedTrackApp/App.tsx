import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { MedicationsProvider } from './src/hooks/useMedications';
import { CoursesProvider } from './src/hooks/useCourses';

const App = () => {
  return (
    <SafeAreaProvider>
      <MedicationsProvider>
        <CoursesProvider>
          <AppNavigator />
        </CoursesProvider>
      </MedicationsProvider>
    </SafeAreaProvider>
  );
};

export default App;
