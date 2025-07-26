import React from 'react';
import { X } from 'lucide-react';

const SuccessMessage = ({ message, onClose }) => (
  <div style={{
    background: '#d4edda',
    color: '#155724',
    padding: '0.8rem',
    borderRadius: '5px',
    marginBottom: '1rem',
    border: '1px solid #c3e6cb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <span>{message}</span>
    {onClose && (
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#155724',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        <X size={16} />
      </button>
    )}
  </div>
);

export default SuccessMessage;