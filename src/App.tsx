import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { ExportData } from './pages/ExportData';
import { EngagementForm } from './pages/EngagementForm';
import { ActivityMaster } from './pages/ActivityMaster';
import { MapAnalytics } from './pages/MapAnalytics';
import { Prioritization } from './pages/Prioritization';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, location, navigate]);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/engagement-form" element={<EngagementForm />} />
        <Route path="/activity-master" element={<ActivityMaster />} />
        <Route path="/export-data" element={<ExportData />} />
        <Route path="/map-analytics" element={<MapAnalytics />} />
        <Route path="/prioritization" element={<Prioritization />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}

