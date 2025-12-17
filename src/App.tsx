import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { VoteResults } from './pages/VoteResults';
import { EngagementForm } from './pages/EngagementForm';
import { ActivityMaster } from './pages/ActivityMaster';
import { MapAnalytics } from './pages/MapAnalytics';
import { Prioritization } from './pages/Prioritization';
import { DataImport } from './pages/DataImport';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vote-results" element={<VoteResults />} />
        <Route path="/engagement-form" element={<EngagementForm />} />
        <Route path="/activity-master" element={<ActivityMaster />} />
        <Route path="/map-analytics" element={<MapAnalytics />} />
        <Route path="/prioritization" element={<Prioritization />} />
        <Route path="/data-import" element={<DataImport />} />
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

