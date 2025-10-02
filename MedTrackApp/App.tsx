import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { MedicationsProvider } from './src/hooks/useMedications';
import { CoursesProvider } from './src/hooks/useCourses';
import { AuthProvider } from './src/auth/AuthContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <MedicationsProvider>
        <CoursesProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </CoursesProvider>
      </MedicationsProvider>
    </SafeAreaProvider>
  );
};

export default App;
