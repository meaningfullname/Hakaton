import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ErrorMessage from '../ui/ErrorMessage';

const LoginPage = () => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await apiService.login(credentials);
      
      if (result.token && result.user) {
        login(result.token, result.user);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>
            University Kazakhstan Licensed Campus
          </h1>
          <p style={{ color: '#666', margin: 0 }}>
            Sign in to your account
          </p>
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            required
            placeholder="Enter your username"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
          />

          <Button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '5px',
          fontSize: '14px',
          color: '#666'
        }}>
          Demo credentials:<br/>
          <strong>Admin:</strong> admin / admin123<br/>
          <strong>Student:</strong> student / student123
        </div>
      </div>
    </div>
  );
};

export default LoginPage;