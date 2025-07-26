import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';
import LoginForm from './features/auth/LoginForm';
import AdminPanelPage from './pages/AdminPanelPage';
import Dashboard from './Dashboard';

const AppRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoginForm />;
  }

  if (user.role === 'admin') {
    return <AdminPanelPage />;
  }

  return <Dashboard />;
};

export default AppRouter;