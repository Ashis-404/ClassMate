
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Planner } from './pages/Planner';
import { ScheduleView } from './pages/ScheduleView';
import { Settings } from './pages/Settings';
import { BulkImport } from './pages/BulkImport';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';

// A layout for authenticated users who have completed onboarding
const ProtectedLayout: React.FC = () => {
  const { firebaseUser, isOnboarded } = useApp();

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

// A component to handle routes for unauthenticated users
const PublicRoutes: React.FC = () => {
  const { firebaseUser, isOnboarded } = useApp();
  
  if (firebaseUser) {
    const path = isOnboarded ? '/dashboard' : '/onboarding';
    return <Navigate to={path} replace />;
  }

  return <Outlet />;
}

const AppRoutes: React.FC = () => {
  const { authLoading } = useApp();

  if (authLoading) {
    // This can be a moreye sophisticated loading spinner
    return <div className="min-h-screen bg-void" />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      
      {/* Public routes that redirect if logged in */}
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>
      
      {/* Onboarding is a special case, needs auth but not onboarding completion */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Protected routes requiring auth and onboarding */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/schedule" element={<ScheduleView />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/bulk-import" element={<BulkImport />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
};

export default App;
