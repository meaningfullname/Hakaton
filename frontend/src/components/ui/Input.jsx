import React from 'react';

const Input = ({ 
  label, 
  error, 
  required = false, 
  ...props 
}) => (
  <div style={{ marginBottom: '1rem' }}>
    {label && (
      <label style={{
        display: 'block',
        marginBottom: '0.5rem',
        color: '#555',
        fontWeight: '500'
      }}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </label>
    )}
    <input
      style={{
        width: '100%',
        padding: '0.8rem',
        border: `1px solid ${error ? '#dc3545' : '#ddd'}`,
        borderRadius: '5px',
        fontSize: '1rem'
      }}
      {...props}
    />
    {error && (
      <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.25rem' }}>
        {error}
      </div>
    )}
  </div>
);

export default Input;