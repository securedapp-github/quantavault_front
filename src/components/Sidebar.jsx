import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Key,
    Shield,
    FileText,
    Activity,
    CreditCard,
    Settings,
    ChevronRight,
    LogOut,
    Sun,
    Moon,
    Award,
    FileBadge,
    ShieldCheck,
    ScrollText,
    Database,
    AlertTriangle,
    GitPullRequest,
    Scan,
    Cookie,
} from 'lucide-react';
import { useQuantum } from '../context/QuantumContext';
import { useTheme } from '../context/ThemeContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/pqc-keys', label: 'PQC Keys', icon: <Key size={20} /> },
        { path: '/authentication-keys', label: 'Authentication Keys', icon: <Shield size={20} /> },
        { path: '/policies', label: 'Policies', icon: <FileText size={20} /> },
        { path: '/audit-logs', label: 'Audit Logs', icon: <Activity size={20} /> },
        { path: '/billing', label: 'Billing', icon: <CreditCard size={20} /> },
        { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    // Certificate Manager sub-items
    const certNavItems = [
        { path: '/cert-manager', label: 'Overview', icon: <Award size={20} />, end: true },
        { path: '/cert-manager/certificates', label: 'Certificates', icon: <FileBadge size={20} />, end: false },
        { path: '/cert-manager/keys', label: 'Cert Keys', icon: <ShieldCheck size={20} />, end: false },
        { path: '/cert-manager/csr', label: 'Generate CSR', icon: <ScrollText size={20} />, end: false },
        { path: '/cert-manager/internal-ca', label: 'Internal CA', icon: <Shield size={20} />, end: false },
        { path: '/cert-manager/audit', label: 'Cert Audit Logs', icon: <Activity size={20} />, end: false },
    ];

    // CBOM sub-items
    const cbomNavItems = [
        { path: '/cbom', label: 'Dashboard', icon: <Scan size={20} />, end: true },
        { path: '/cbom/inventory', label: 'Asset Inventory', icon: <Database size={20} />, end: false },
        { path: '/cbom/risk', label: 'Risk Analysis', icon: <AlertTriangle size={20} />, end: false },
        { path: '/cbom/migration', label: 'Migration Strategy', icon: <GitPullRequest size={20} />, end: false },
        { path: '/cbom/logs', label: 'Scan Audit Logs', icon: <Activity size={20} />, end: false },
    ];

    const location = useLocation();
    const isCertActive = location.pathname.startsWith('/cert-manager');
    const isCbomActive = location.pathname.startsWith('/cbom');
    const [certOpen, setCertOpen] = useState(isCertActive);
    const [cbomOpen, setCbomOpen] = useState(isCbomActive);

    useEffect(() => {
        if (isCertActive) setCertOpen(true);
    }, [isCertActive]);

    useEffect(() => {
        if (isCbomActive) setCbomOpen(true);
    }, [isCbomActive]);

    // Use context for logout and user info
    const { logout, user } = useQuantum();
    const { theme, setTheme, isDark } = useTheme();

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    const handleLogout = (e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to log out?')) {
            logout();
            window.location.href = '/login';
        }
    };

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
                onClick={onClose}
            />
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-header">
                    <div className="logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={isDark ? "/3.svg" : "/4.svg"}
                            alt="QuantumVault"
                            style={{ width: '180px', height: 'auto', objectFit: 'contain' }}
                        />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'active' : ''}`
                            }
                            onClick={() => window.innerWidth < 1024 && onClose()}
                        >
                            {({ isActive }) => (
                                <>
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label">{item.label}</span>
                                    {isActive && <ChevronRight size={16} className="nav-chevron" />}
                                </>
                            )}
                        </NavLink>
                    ))}

                    {/* Collapsible Certificate Manager Group */}
                    <div className="nav-group">
                        <button
                            type="button"
                            className={`nav-item nav-item-parent ${isCertActive ? 'active' : ''} ${certOpen ? 'expanded' : ''}`}
                            onClick={() => setCertOpen(!certOpen)}
                        >
                            <span className="nav-icon"><Award size={20} /></span>
                            <span className="nav-label">Certificate Manager</span>
                            <ChevronRight
                                size={16}
                                className={`nav-expand-chevron ${certOpen ? 'open' : ''}`}
                            />
                        </button>

                        <div className={`nav-subitems ${certOpen ? 'open' : ''}`}>
                            {certNavItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `nav-subitem ${isActive ? 'active' : ''}`
                                    }
                                    onClick={() => window.innerWidth < 1024 && onClose()}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <span className="nav-icon">{item.icon}</span>
                                            <span className="nav-label">{item.label}</span>
                                            {isActive && <ChevronRight size={14} className="nav-chevron-sub" />}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    {/* Collapsible CBOM Group */}
                    <div className="nav-group">
                        <button
                            type="button"
                            className={`nav-item nav-item-parent ${isCbomActive ? 'active' : ''} ${cbomOpen ? 'expanded' : ''}`}
                            onClick={() => setCbomOpen(!cbomOpen)}
                        >
                            <span className="nav-icon"><Scan size={20} /></span>
                            <span className="nav-label">CBOM</span>
                            <ChevronRight
                                size={16}
                                className={`nav-expand-chevron ${cbomOpen ? 'open' : ''}`}
                            />
                        </button>

                        <div className={`nav-subitems ${cbomOpen ? 'open' : ''}`}>
                            {cbomNavItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `nav-subitem ${isActive ? 'active' : ''}`
                                    }
                                    onClick={() => window.innerWidth < 1024 && onClose()}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <span className="nav-icon">{item.icon}</span>
                                            <span className="nav-label">{item.label}</span>
                                            {isActive && <ChevronRight size={14} className="nav-chevron-sub" />}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* User Info Footer */}
                <div className="sidebar-footer">
                    <div className="user-info-header">
                        <div className="user-info">
                            <div className="user-avatar">
                                {user?.avatar && user.avatar.startsWith('http') ? (
                                    <>
                                        <img
                                            src={user.avatar}
                                            alt="Profile"
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                        <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    </>
                                ) : (
                                    user?.avatar || (user?.name ? user.name.charAt(0).toUpperCase() : 'U')
                                )}
                            </div>
                            <div className="user-details">
                                <div className="user-name">{user?.name || 'User'}</div>
                                <div className="user-account">{user?.email || 'user@example.com'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-actions-row">
                        <button className="logout-button-compact" onClick={handleLogout} title="Logout">
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                        <button
                            className="theme-toggle-compact"
                            onClick={() => window.CookieConsent?.openPreferences()}
                            title="Cookie Consent & Privacy Preferences"
                            style={{ cursor: 'pointer' }}
                        >
                            <Cookie size={18} />
                        </button>
                        <button
                            className="theme-toggle-compact"
                            onClick={toggleTheme}
                            title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
