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
    ChevronDown,
    LogOut,
    Sun,
    Moon,
    Award,
    FileBadge,
    ShieldCheck,
    ScrollText,
} from 'lucide-react';
import { useCert } from '../context/CertContext';
import { useTheme } from '../context/ThemeContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    // ── Original QuantumVault nav items (exact match) ──
    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/pqc-keys', label: 'PQC Keys', icon: <Key size={20} /> },
        { path: '/authentication-keys', label: 'Authentication Keys', icon: <Shield size={20} /> },
        { path: '/policies', label: 'Policies', icon: <FileText size={20} /> },
        { path: '/audit-logs', label: 'Audit Logs', icon: <Activity size={20} /> },
        { path: '/billing', label: 'Billing', icon: <CreditCard size={20} /> },
        { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    // ── NEW: Certificate Manager sub-items ──
    const certNavItems = [
        { path: '/cert-manager', label: 'Overview', icon: <Award size={20} />, end: true },
        { path: '/cert-manager/certificates', label: 'Certificates', icon: <FileBadge size={20} />, end: false },
        { path: '/cert-manager/keys', label: 'Cert Keys', icon: <ShieldCheck size={20} />, end: false },
        { path: '/cert-manager/csr', label: 'Generate CSR', icon: <ScrollText size={20} />, end: false },
        { path: '/cert-manager/internal-ca', label: 'Internal CA', icon: <Shield size={20} />, end: false },
        { path: '/cert-manager/audit', label: 'Cert Audit Logs', icon: <Activity size={20} />, end: false },
    ];

    const location = useLocation();
    const isCertActive = location.pathname.startsWith('/cert-manager');
    const [certOpen, setCertOpen] = useState(isCertActive);

    useEffect(() => {
        if (isCertActive) {
            setCertOpen(true);
        }
    }, [isCertActive]);

    // Mirror the same hook API as the original (logout + user)
    const { logout, user } = useCert();
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

                {/* ── Logo — exact same as original, uses /3.svg and /4.svg ── */}
                <div className="sidebar-header">
                    <div className="logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={isDark ? '/3.svg' : '/4.svg'}
                            alt="QuantumVault"
                            style={{ width: '180px', height: 'auto', objectFit: 'contain' }}
                        />
                    </div>
                </div>

                {/* ── Navigation ── */}
                <nav className="sidebar-nav">
                    {/* Original nav items — rendered identically to quantavault_front */}
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
                </nav>

                {/* ── User Info Footer — exact same as original ── */}
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
