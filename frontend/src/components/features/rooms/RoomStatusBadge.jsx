import React from 'react';

const RoomStatusBadge = ({ status, getStatusColor, size = 'medium' }) => {
  const sizeStyles = {
    small: {
      fontSize: '10px',
      padding: '2px 6px',
      borderRadius: '8px'
    },
    medium: {
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '10px'
    },
    large: {
      fontSize: '14px',
      padding: '6px 12px',
      borderRadius: '12px'
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'free':
        return '✓';
      case 'occupied':
        return '●';
      case 'reserved':
        return '📅';
      case 'maintenance':
        return '🔧';
      default:
        return '?';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'free':
        return 'Available';
      case 'occupied':
        return 'Occupied';
      case 'reserved':
        return 'Reserved';
      case 'maintenance':
        return 'Maintenance';
      default:
        return status;
    }
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: getStatusColor(status),
        color: 'white',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        ...sizeStyles[size]
      }}
    >
      <span>{getStatusIcon(status)}</span>
      <span>{getStatusText(status)}</span>
    </div>
  );
};

export default RoomStatusBadge;