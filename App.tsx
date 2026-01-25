import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Planner } from './pages/Planner';
import { ScheduleView } from './pages/ScheduleView';
import { Settings } from './pages/Settings';
import { BulkImport } from './pages/BulkImport';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/schedule" element={<ScheduleView />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/bulk-import" element={<BulkImport />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
};

export default App;