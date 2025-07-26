import React from 'react';
import { MapPin } from 'lucide-react';

const MapPage = () => (
  <div style={{
    background: 'white',
    borderRadius: '10px',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    textAlign: 'center'
  }}>
    <h1 style={{ color: '#00529b', marginBottom: '2rem' }}>Campus Map</h1>
    <div style={{
      background: '#f8f9fa',
      border: '2px dashed #dee2e6',
      borderRadius: '10px',
      padding: '4rem 2rem',
      color: '#6c757d'
    }}>
      <MapPin size={64} style={{ marginBottom: '1rem' }} />
      <h3>Interactive Campus Map</h3>
      <p>Campus map functionality would be implemented here</p>
      <p>Features could include:</p>
      <ul style={{ textAlign: 'left', maxWidth: '300px', margin: '1rem auto' }}>
        <li>Building locations</li>
        <li>Room finder</li>
        <li>Navigation routes</li>
        <li>Points of interest</li>
      </ul>
    </div>
  </div>
);

export default MapPage;