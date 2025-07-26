import React from 'react';
import Header from './Header';

const Layout = ({ children, currentView, setCurrentView }) => {
  return (
    <div style={{
      fontFamily: 'Arial, Helvetica, sans-serif',
      margin: '0',
      minHeight: '100vh'
    }}>
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main style={{ padding: '40px 20px', maxWidth: '1000px', margin: 'auto' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;