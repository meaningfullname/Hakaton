import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './components/pages/LoginPage';
import HomePage from './components/pages/HomePage';
import TodoPage from './components/pages/TodoPage';
import RoomsPage from './components/pages/RoomsPage'; // Import the new RoomsPage
import MapPage from './components/pages/MapPage';
import PhoenixPage from './components/pages/PhoenixPage';
import ClubsPage from './components/pages/ClubsPage';
import ProfilePage from './components/pages/ProfilePage';
import AdminDashboard from './components/pages/AdminDashboard';

const App = () => {
  const [currentView, setCurrentView] = useState('home');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage setCurrentView={setCurrentView} />;
      case 'todo':
        return <TodoPage />;
      case 'rooms': // Add the rooms case
        return <RoomsPage />;
      case 'map':
        return <MapPage />;
      case 'phoenix':
        return <PhoenixPage />;
      case 'clubs':
        return <ClubsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <HomePage setCurrentView={setCurrentView} />;
    }
  };

  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Layout currentView={currentView} setCurrentView={setCurrentView}>
          {renderCurrentView()}
        </Layout>
      </div>
    </AuthProvider>
  );
};

export default App;