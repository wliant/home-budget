import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Layout
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AxiosProvider } from './contexts/AxiosProvider';
import { AppThemeProvider } from './contexts/ThemeContext';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AppThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AxiosProvider>
          <AuthProvider>
            <NotificationProvider>
              <Router>
                <Routes>
                  {/* Public routes */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    }
                  />

                  {/* Protected routes */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/expenses"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Expenses />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/budgets"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Budgets />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/categories"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Categories />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Reports />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Settings />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Router>
            </NotificationProvider>
          </AuthProvider>
        </AxiosProvider>
      </LocalizationProvider>
    </AppThemeProvider>
  );
}

export default App;
