import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import useReminders from './src/hooks/useReminders';

const App = () => {
  const { syncLocal } = useReminders();

  useEffect(() => {
    syncLocal();
  }, [syncLocal]);

  return <AppNavigator />;
};

export default App;
