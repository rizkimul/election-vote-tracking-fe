import React, { useState } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { VoteResults } from './pages/VoteResults';
import { EngagementForm } from './pages/EngagementForm';
import { MapAnalytics } from './pages/MapAnalytics';
import { DataImport } from './pages/DataImport';
import { Settings } from './pages/Settings';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'vote-results':
        return <VoteResults />;
      case 'engagement-form':
        return <EngagementForm />;
      case 'map-analytics':
        return <MapAnalytics />;
      case 'data-import':
        return <DataImport />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </DashboardLayout>
      <Toaster />
    </>
  );
}
