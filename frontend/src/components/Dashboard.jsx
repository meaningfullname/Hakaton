import React, { useState } from 'react';
import Header from './layout/Header';
import HomePage from './pages/HomePage';
import TodoListPage from './pages/TodoListPage';
import PhoenixFocusPage from './pages/PhoenixFocusPage';
import ClubsPage from './pages/ClubsPage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('home');

  const renderContent = () => {
    switch (currentView) {
      case 'todo': 
        return <TodoListPage />;
      case 'phoenix': 
        return <PhoenixFocusPage />;
      case 'clubs': 
        return <ClubsPage />;
      case 'map': 
        return <MapPage />;
      case 'profile': 
        return <ProfilePage />;
      default: 
        return <HomePage setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div style={{
      fontFamily: 'Arial, Helvetica, sans-serif',
      margin: '0',
      background: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600"><rect fill="%2300529b" width="1000" height="600"/></svg>') no-repeat center center/cover fixed`,
      minHeight: '100vh'
    }}>
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main style={{ padding: '40px 20px', maxWidth: '1000px', margin: 'auto' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;