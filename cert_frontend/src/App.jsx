import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CertProvider } from './context/CertContext';
import {
    Dashboard, PQCKeys, AuthenticationKeys, Policies,
    AuditLogs, Billing, Settings
} from './pages/PlaceholderPages';
import CertManagerOverview from './pages/cert-manager/CertManagerOverview';
import CertificatesPage from './pages/cert-manager/CertificatesPage';
import CertKeysPage from './pages/cert-manager/CertKeysPage';
import GenerateCSRPage from './pages/cert-manager/GenerateCSRPage';
import InternalCAPage from './pages/cert-manager/InternalCAPage';
import CertAuditLogsPage from './pages/cert-manager/CertAuditLogsPage';
import './styles/design-tokens.css';
import './styles/global.css';
import './App.css';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isDark } = useTheme();

    return (
        <div className="app">
            {/* Mobile Header — exact same as quantavault_front */}
            <header className="mobile-header">
                <button
                    className="hamburger-toggle"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div className="mobile-logo-container">
                    <img
                        src={isDark ? '/3.svg' : '/4.svg'}
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
    );
};

function App() {
    return (
        <ThemeProvider>
            <CertProvider>
                <Toaster position="top-center" />
                <Router>
                    <Routes>
                        <Route element={<MainLayout />}>
                            <Route index element={<Navigate to="/dashboard" replace />} />

                            {/* ── Original QuantumVault routes (placeholders) ── */}
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
        </ThemeProvider>
    );
}

export default App;
