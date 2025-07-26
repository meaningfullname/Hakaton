import React, { useState } from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import { TodoProvider } from './src/contexts/TodoContext';
import Layout from './src/components/layout/Layout';
import LoginPage from './src/components/pages/LoginPage';
import HomePage from './src/components/pages/HomePage';
import TodoListPage from './src/components/pages/TodoListPage';
import RoomsPage from './src/components/pages/RoomsPage';
import MapPage from './src/components/pages/MapPage';
import PhoenixFocusPage from './src/components/pages/PhoenixFocusPage';
import ClubsPage from './src/components/pages/ClubsPage';
import ProfilePage from './src/components/pages/ProfilePage';
import AdminPanelPage from './src/components/pages/AdminPanelPage';
import { useAuth } from './src/contexts/AuthContext';

const AppContent = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('home');

  // If user is not logged in, show login page
  if (!user) {
    return <LoginPage />;
  }

  // If user is admin, show admin panel
  if (user.role === 'admin') {
    return <AdminPanelPage />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage setCurrentView={setCurrentView} />;
      case 'todo':
        return <TodoListPage />;
      case 'rooms':
        return <RoomsPage />;
      case 'map':
        return <MapPage />;
      case 'phoenix':
        return <PhoenixFocusPage />;
      case 'clubs':
        return <ClubsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Layout currentView={currentView} setCurrentView={setCurrentView}>
        {renderCurrentView()}
      </Layout>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <TodoProvider>
        <AppContent />
      </TodoProvider>
    </AuthProvider>
  );
};

export default App;