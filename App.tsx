import React, { useState, useEffect } from 'react';
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
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard" />} />
            <Route path="/" element={<Landing />} />
            <Route path="/onboarding" element={user ? <Onboarding /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/planner" element={user ? <Planner /> : <Navigate to="/login" />} />
            <Route path="/schedule" element={user ? <ScheduleView /> : <Navigate to="/login" />} />
            <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
            <Route path="/bulk-import" element={user ? <BulkImport /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
