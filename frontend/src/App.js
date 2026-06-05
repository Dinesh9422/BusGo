import React from 'react';
import TripTracker from './pages/user/TripTracker';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';

import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/user/DashboardPage';
import AdminDashboard from './pages/admin/AdminDashboard';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚌</div>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'Sora, sans-serif' }}>Loading BusGo...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.is_staff ? children : <Navigate to="/" />;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/book/:tripId" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
      <Route path="/tracker" element={<PrivateRoute><TripTracker /></PrivateRoute>} />
    </Routes>
  </>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 14 },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
