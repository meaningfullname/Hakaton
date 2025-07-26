import React, { useState } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ currentView, setCurrentView }) => {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: '#00529b',
      color: '#fff',
      padding: '14px 30px'
    }}>
      <div 
        onClick={() => setCurrentView('home')}
        style={{ 
          fontSize: '22px', 
          fontWeight: 'bold', 
          cursor: 'pointer' 
        }}
      >
        University Kazakhstan Licensed Campus
      </div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '28px',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          <User size={28} />
        </button>

        {showMenu && (
          <nav style={{
            position: 'absolute',
            top: '110%',
            right: '0',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '6px',
            minWidth: '160px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, .15)',
            zIndex: 999
          }}>
            <button
              onClick={() => {
                setCurrentView('profile');
                setShowMenu(false);
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                color: '#333'
              }}
            >
              Мой профиль
            </button>
            <button
              onClick={logout}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                color: '#333'
              }}
            >
              Выйти
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;