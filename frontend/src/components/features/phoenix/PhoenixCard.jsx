import React from 'react';

const PhoenixCard = ({ phoenix }) => (
  <div style={{
    textAlign: 'center',
    padding: '1rem',
    borderRadius: '10px',
    border: '2px solid #667eea',
    background: 'linear-gradient(135deg, #f8f9ff, #e8f2ff)',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)'
  }}>
    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
      {phoenix.emoji}
    </div>
    <p style={{ fontSize: '10px', fontWeight: 'bold', margin: '0', color: '#333' }}>
      {phoenix.name}
    </p>
    <p style={{ fontSize: '9px', color: '#666', margin: '4px 0 0' }}>
      {Math.floor(phoenix.timeStudied / 60)}min
    </p>
  </div>
);

export default PhoenixCard;