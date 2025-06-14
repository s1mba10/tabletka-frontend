import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { MedicationsProvider } from './src/hooks/useMedications';

const App = () => {
  return (
    <MedicationsProvider>
      <AppNavigator />
    </MedicationsProvider>
  );
};

export default App;
