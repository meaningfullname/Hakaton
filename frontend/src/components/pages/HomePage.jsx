import React from 'react';
import { Clock, MapPin, Flame, BarChart3, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardTile from '../layout/DashboardTile';

const HomePage = ({ setCurrentView }) => {
  const { user } = useAuth();
  
  const newsData = [
    { title: "New Cafeteria Opening", text: "Opening August 1st in Building 3." },
    { title: "Schedule Changes", text: "Lectures start 15 minutes earlier." },
    { title: "Campus Tech Hackathon 2025", text: "Registration open until August 5th!" }
  ];

  const tiles = [
    { icon: <Clock size={40} />, title: 'To-do List', desc: 'Your current assignments', view: 'todo' },
    { icon: <Home size={40} />, title: 'Rooms', desc: 'Campus room availability', view: 'rooms' },
    { icon: <MapPin size={40} />, title: 'Map', desc: 'Campus map', view: 'map' },
    { icon: <Flame size={40} />, title: 'Focus Phoenix', desc: 'Study timer', view: 'phoenix' },
    { icon: <BarChart3 size={40} />, title: 'Clubs', desc: 'Student clubs', view: 'clubs' }
  ];

  return (
    <div>
      <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: '20px' }}>
        Welcome, {user?.firstName || user?.username}!
      </h1>
      
      {/* Tiles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
        marginTop: '30px'
      }}>
        {tiles.map((tile, i) => (
          <DashboardTile
            key={i}
            icon={tile.icon}
            title={tile.title}
            description={tile.desc}
            onClick={() => setCurrentView(tile.view)}
          />
        ))}
      </div>

      {/* News */}
      <section style={{ marginTop: '50px' }}>
        <h2 style={{ textAlign: 'center', color: '#00529b' }}>Campus News</h2>
        <div style={{ maxWidth: '800px', margin: '20px auto', padding: '0 20px' }}>
          {newsData.map((news, i) => (
            <div
              key={i}
              style={{
                background: '#fff',
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,.1)',
                padding: '15px 20px',
                marginBottom: '12px'
              }}
            >
              <h3 style={{ margin: '0 0 6px', fontSize: '18px', color: '#00529b' }}>
                {news.title}
              </h3>
              <p style={{ margin: '0', fontSize: '14px', color: '#333' }}>{news.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;