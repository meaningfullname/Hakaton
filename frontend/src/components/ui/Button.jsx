import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  disabled = false, 
  type = 'button',
  icon,
  ...props 
}) => {
  const variants = {
    primary: '#667eea',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8'
  };

  const sizes = {
    small: '0.4rem 0.8rem',
    medium: '0.6rem 1.2rem',
    large: '0.8rem 1.6rem'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#ccc' : variants[variant],
        color: variant === 'warning' ? '#333' : 'white',
        padding: sizes[size],
        border: 'none',
        borderRadius: '5px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: icon ? '8px' : '0',
        ...props.style
      }}
      {...props}
    >
      {icon && icon}
      {children}
    </button>
  );
};

export default Button;