import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { useReminders } from './src/hooks';

const App = () => {
  const { syncLocal } = useReminders();

  useEffect(() => {
    syncLocal();
  }, []);

  return <AppNavigator />;
};

export default App;
