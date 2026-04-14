import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PQCKeys from './pages/PQCKeys';
import AuthenticationKeys from './pages/AuthenticationKeys';
import Policies from './pages/Policies';
import AuditLogs from './pages/AuditLogs';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { QuantumProvider, useQuantum } from './context/QuantumContext';
import GlobalLoader from './components/GlobalLoader';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useQuantum();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RedirectIfAuth = ({ children }) => {
  const { isAuthenticated } = useQuantum();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <RequireAuth>
        <div className="app">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <main className="main-content">
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <Outlet />
          </main>
        </div>
      </RequireAuth>
    </GoogleOAuthProvider>
  );
};

function App() {
  return (
    <QuantumProvider>
      <GlobalLoader />
      <Toaster position="top-center" />
      <Router>
        <Routes>
          <Route path="/login" element={
            <RedirectIfAuth>
              <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
                <Login />
              </GoogleOAuthProvider>
            </RedirectIfAuth>
          } />
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pqc-keys" element={<PQCKeys />} />
            <Route path="authentication-keys" element={<AuthenticationKeys />} />
            <Route path="policies" element={<Policies />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="billing" element={<Billing />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </QuantumProvider>
  );
}

export default App;
