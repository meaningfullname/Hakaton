import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import SuccessMessage from '../ui/SuccessMessage';
import ErrorMessage from '../ui/ErrorMessage';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ProfilePage = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const result = await apiService.updateProfile(token, user._id, profile);
      if (result.message) {
        setMessage('Profile updated successfully');
      }
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const result = await apiService.changePassword(token, passwordData);
      if (result.message) {
        setMessage('Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '' });
        setShowPasswordForm(false);
      }
    } catch (err) {
      setError('Failed to change password');
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '10px',
      padding: '2rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ color: '#333', marginBottom: '2rem' }}>User Profile</h1>

      {message && <SuccessMessage message={message} onClose={() => setMessage('')} />}
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      <div style={{
        background: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>Status:</strong> {user?.isActive ? 'Active' : 'Inactive'}</p>
        <p><strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
      </div>

      <form onSubmit={handleProfileUpdate}>
        <Input
          label="Username"
          type="text"
          value={profile.username}
          onChange={(e) => setProfile({...profile, username: e.target.value})}
        />
        
        <Input
          label="Email"
          type="email"
          value={profile.email}
          onChange={(e) => setProfile({...profile, email: e.target.value})}
        />
        
        <Input
          label="First Name"
          type="text"
          value={profile.firstName}
          onChange={(e) => setProfile({...profile, firstName: e.target.value})}
        />
        
        <Input
          label="Last Name"
          type="text"
          value={profile.lastName}
          onChange={(e) => setProfile({...profile, lastName: e.target.value})}
        />
        
        <Input
          label="Phone Number"
          type="text"
          value={profile.phoneNumber}
          onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})}
        />

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <Button type="submit">Update Profile</Button>
          <Button
            type="button"
            variant="success"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            Change Password
          </Button>
        </div>
      </form>

      {showPasswordForm && (
        <form onSubmit={handlePasswordChange} style={{ 
          padding: '1rem', 
          background: '#f8f9fa', 
          borderRadius: '8px' 
        }}>
          <h3 style={{ marginBottom: '1rem' }}>Change Password</h3>
          
          <Input
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
            required
          />
          
          <Input
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            required
            minLength="6"
          />

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button type="submit" variant="danger">Change Password</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPasswordForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;