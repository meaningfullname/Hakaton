import React from 'react';
import { X } from 'lucide-react';

const ErrorMessage = ({ message, onClose }) => (
  <div style={{
    background: '#f8d7da',
    color: '#721c24',
    padding: '0.8rem',
    borderRadius: '5px',
    marginBottom: '1rem',
    border: '1px solid #f5c6cb',
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
          color: '#721c24',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        <X size={16} />
      </button>
    )}
  </div>
);

export default ErrorMessage;