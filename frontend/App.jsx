import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import AppRouter from './src/components/AppRouter';

const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;