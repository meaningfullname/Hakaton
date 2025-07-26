import React from 'react';

const DashboardTile = ({ icon, title, description, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 6px rgba(0, 0, 0, .08)',
      padding: '24px',
      textAlign: 'center',
      transition: '.3s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, .12)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, .08)';
    }}
  >
    <div style={{ color: '#00529b', marginBottom: '12px' }}>{icon}</div>
    <h3 style={{ marginBottom: '6px', fontSize: '18px' }}>{title}</h3>
    <p style={{ fontSize: '14px', color: '#666' }}>{description}</p>
  </div>
);

export default DashboardTile;