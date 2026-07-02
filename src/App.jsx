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
import { useTheme } from './context/ThemeContext';
import GlobalLoader from './components/GlobalLoader';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CertProvider } from './context/cert.CertContext';
import CertManagerOverview from './pages/cert.CertManagerOverview';
import CertificatesPage from './pages/cert.CertificatesPage';
import CertKeysPage from './pages/cert.CertKeysPage';
import GenerateCSRPage from './pages/cert.GenerateCSRPage';
import InternalCAPage from './pages/cert.InternalCAPage';
import CertAuditLogsPage from './pages/cert.CertAuditLogsPage';
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
  const { isDark } = useTheme();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <RequireAuth>
        <div className="app">
          {/* Mobile Header */}
          <header className="mobile-header">
            <button
              className="hamburger-toggle"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <div className="mobile-logo-container">
              <img
                src={isDark ? "/3.svg" : "/4.svg"}
                alt="QuantumVault"
                className="mobile-logo"
              />
            </div>
          </header>

          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <main className="main-content">
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
      <CertProvider>
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

              {/* ── Certificate Manager routes ── */}
              <Route path="cert-manager" element={<CertManagerOverview />} />
              <Route path="cert-manager/certificates" element={<CertificatesPage />} />
              <Route path="cert-manager/keys" element={<CertKeysPage />} />
              <Route path="cert-manager/csr" element={<GenerateCSRPage />} />
              <Route path="cert-manager/internal-ca" element={<InternalCAPage />} />
              <Route path="cert-manager/audit" element={<CertAuditLogsPage />} />
            </Route>
          </Routes>
        </Router>
      </CertProvider>
    </QuantumProvider>
  );
}

export default App;
