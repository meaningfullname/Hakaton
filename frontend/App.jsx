import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import { TodoProvider } from './src/contexts/TodoContext';
import AppRouter from './src/components/AppRouter';

const App = () => {
  return (
    <AuthProvider>
      <TodoProvider>
        <AppRouter />
      </TodoProvider>
    </AuthProvider>
  );
};

export default App;