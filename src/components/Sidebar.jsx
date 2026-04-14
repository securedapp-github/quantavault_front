import React from 'react';
import { NavLink } from 'react-router-dom';
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
    ChevronUp,
    Sun,
    Moon
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
            // Navigation handled by protected route or manual redirect if needed, 
            // but for now we'll force it to login page just to be safe in this demo:
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
                {/* Collapse Toggle - Visual Match */}
                {/* Collapse Toggle Removed */}

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
                                                e.target.style.display = 'none'; // Hide image
                                                e.target.nextSibling.style.display = 'flex'; // Show text fallback
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
