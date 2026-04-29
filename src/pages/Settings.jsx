import React, { useState, useEffect, useRef } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { Shield, LogOut, User, Copy, Check, AlertCircle, Sun, Moon, Monitor, Globe, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';
import api from '../utils/api';
import IpWhitelistModal from '../components/IpWhitelistModal';
import ManageMTLSModal from '../components/ManageMTLSModal';
import './Settings.css';
import { useQuantum } from '../context/QuantumContext';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
    const { user, logout } = useQuantum();
    const { theme, setTheme } = useTheme();

    // 2FA State
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [setupMode, setSetupMode] = useState(false);
    const [setupSecret, setSetupSecret] = useState(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [setupError, setSetupError] = useState('');
    const [setupSuccess, setSetupSuccess] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const verifyInputRef = useRef(null);

    // IP Whitelist State
    const [ipMode, setIpMode] = useState('any');
    const [ipWhitelist, setIpWhitelist] = useState([]);
    const [ipModalOpen, setIpModalOpen] = useState(false);
    const [ipLoading, setIpLoading] = useState(true);
    const [ipSaveStatus, setIpSaveStatus] = useState('');

    // MTLS State
    const [mtlsMode, setMtlsMode] = useState('standard');
    const [mtlsLoading, setMtlsLoading] = useState(true);
    const [mtlsModalOpen, setMtlsModalOpen] = useState(false);

    // Load 2FA status and IP whitelist on mount
    useEffect(() => {
        const load2FAStatus = async () => {
            try {
                const result = await api.get2FAStatus();
                setIs2FAEnabled(result.enabled);
            } catch (err) {
                console.error('Failed to load 2FA status:', err.message);
            } finally {
                setLoadingStatus(false);
            }
        };
        const loadIpWhitelist = async () => {
            try {
                const result = await api.getIpWhitelist();
                setIpMode(result.mode || 'any');
                setIpWhitelist(result.whitelist || []);
            } catch (err) {
                console.error('Failed to load IP whitelist:', err.message);
            } finally {
                setIpLoading(false);
            }
        };
        const loadMTLSSettings = async () => {
            try {
                const result = await api.getMTLSSettings();
                setMtlsMode(result.mtlsMode || 'standard');
            } catch (err) {
                console.error('Failed to load MTLS settings:', err.message);
            } finally {
                setMtlsLoading(false);
            }
        };
        load2FAStatus();
        loadIpWhitelist();
        loadMTLSSettings();
    }, []);

    // Handle IP mode change
    const handleIpModeChange = async (newMode) => {
        setIpMode(newMode);
        try {
            await api.updateIpWhitelist({ mode: newMode, whitelist: ipWhitelist });
            toast.success('IP Restriction mode updated');
        } catch (err) {
            console.error('Failed to update IP mode:', err.message);
            toast.error('Failed to update IP mode');
        }
    };

    // Handle saving IP list from modal
    const handleSaveIpWhitelist = async (newIps) => {
        try {
            const result = await api.updateIpWhitelist({ mode: ipMode, whitelist: newIps });
            setIpWhitelist(result.whitelist || newIps);
            toast.success('IP Whitelist saved successfully');
        } catch (err) {
            console.error('Failed to save IP whitelist:', err.message);
            toast.error('Failed to save IP whitelist');
        }
    };

    // Handle MTLS mode change
    const handleMTLSModeChange = async (newMode) => {
        setMtlsMode(newMode);
        try {
            await api.updateMTLSSettings(newMode);
            toast.success(`MTLS mode changed to ${newMode === 'mtls' ? 'MTLS Protected' : 'Standard Access'}`);
        } catch (err) {
            console.error('Failed to update MTLS settings:', err.message);
            toast.error('Failed to update MTLS settings');
            // Revert on error
            setMtlsMode(mtlsMode);
        }
    };

    // Start 2FA Setup — get secret from backend
    const handleEnable2FA = async () => {
        try {
            const result = await api.setup2FA();
            setSetupSecret(result.secret);

            // Generate QR code from the otpauth URI
            const qrUrl = await QRCode.toDataURL(result.qrData, {
                width: 200,
                margin: 2,
                color: { dark: '#000000', light: '#ffffff' }
            });
            setQrCodeUrl(qrUrl);

            setSetupMode(true);
            setSetupError('');
            setSetupSuccess(false);
            setVerifyCode('');
        } catch (err) {
            console.error('2FA setup error:', err);
            setSetupError('Failed to start 2FA setup. Please try again.');
        }
    };

    // Verify the code during setup — send to backend
    const handleVerifySetup = async () => {
        if (verifyCode.length !== 6) {
            setSetupError('Please enter a 6-digit code');
            return;
        }

        try {
            await api.verifySetup2FA(verifyCode, setupSecret);
            setIs2FAEnabled(true);
            setSetupSuccess(true);
            setSetupError('');

            setTimeout(() => {
                setSetupMode(false);
                setSetupSuccess(false);
            }, 2000);
        } catch (err) {
            console.error('Verification error:', err);
            setSetupError(err.message || 'Invalid code. Make sure your authenticator is synced and try again.');
            setVerifyCode('');
            verifyInputRef.current?.focus();
        }
    };

    // Disable 2FA — call backend
    const handleDisable2FA = async () => {
        if (window.confirm('Are you sure you want to disable Two-Factor Authentication? This will remove the extra security layer from your account.')) {
            try {
                await api.disable2FA();
                setIs2FAEnabled(false);
                setSetupMode(false);
                setSetupSecret(null);
                setQrCodeUrl('');
            } catch (err) {
                console.error('Failed to disable 2FA:', err);
            }
        }
    };

    const handleCopySecret = () => {
        if (setupSecret) {
            navigator.clipboard.writeText(setupSecret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            logout();
        }
    };

    return (
        <div className="page">
            <PageHeader
                title="Settings"
                subtitle="Manage your profile and security preferences"
            />
            <div className="page-content settings-layout">

                {/* Profile Section */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <User size={20} /> User Profile
                    </h2>
                    <Card className="settings-card profile-card">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {user.avatar && user.avatar.startsWith('http') ? (
                                    <>
                                        <img
                                            src={user.avatar}
                                            alt="Profile"
                                            className="avatar-image"
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '24px', backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)' }}>
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '24px', backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)' }}>
                                        {user.avatar || user.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="profile-info">
                                <h3 className="profile-name">{user.name || 'Guest User'}</h3>
                                <p className="profile-email">{user.email || 'guest@example.com'}</p>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Security Section */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <Shield size={20} /> Security
                    </h2>
                    <Card className="settings-card">
                        <div className="setting-row">
                            <div className="setting-info">
                                <h3 className="setting-name">Two-Factor Authentication</h3>
                                <p className="setting-description">
                                    Add an extra layer of security to your account using an authenticator app.
                                </p>
                            </div>
                                <div className="setting-action">
                                    {loadingStatus ? (
                                        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Loading...</span>
                                    ) : (
                                        <div className="tfa-action-container">
                                            <button 
                                                className={`tfa-action-btn ${is2FAEnabled ? 'disable' : 'enable'}`}
                                                onClick={is2FAEnabled ? handleDisable2FA : handleEnable2FA}
                                            >
                                                {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                        </div>

                        {/* 2FA Setup Flow */}
                        {setupMode && !is2FAEnabled && (
                            <div className="tfa-setup-section">
                                <div className="tfa-setup-steps">
                                    <div className="tfa-step">
                                        <span className="tfa-step-number">1</span>
                                        <span className="tfa-step-text">Scan this QR code with your authenticator app</span>
                                    </div>

                                    <div className="tfa-qr-container">
                                        {qrCodeUrl && (
                                            <img src={qrCodeUrl} alt="TOTP QR Code" className="tfa-qr-image" />
                                        )}
                                    </div>

                                    <div className="tfa-manual-entry">
                                        <p className="tfa-manual-label">Or enter this key manually:</p>
                                        <div className="tfa-secret-display">
                                            <code className="tfa-secret-code">{setupSecret}</code>
                                            <button className="tfa-copy-btn" onClick={handleCopySecret}>
                                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                                {copied ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="tfa-step">
                                        <span className="tfa-step-number">2</span>
                                        <span className="tfa-step-text">Enter the 6-digit code from your app to verify</span>
                                    </div>

                                    <div className="tfa-verify-setup">
                                        <input
                                            ref={verifyInputRef}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={verifyCode}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                setVerifyCode(val);
                                                setSetupError('');
                                            }}
                                            placeholder="000000"
                                            className="tfa-setup-input"
                                        />
                                        <Button
                                            variant="primary"
                                            onClick={handleVerifySetup}
                                            disabled={verifyCode.length !== 6}
                                            className="tfa-setup-verify-btn"
                                        >
                                            Verify & Enable
                                        </Button>
                                    </div>

                                    {setupError && (
                                        <div className="tfa-setup-error">
                                            <AlertCircle size={14} />
                                            <span>{setupError}</span>
                                        </div>
                                    )}

                                    {setupSuccess && (
                                        <div className="tfa-setup-success">
                                            <Check size={14} />
                                            <span>2FA enabled successfully!</span>
                                        </div>
                                    )}

                                    <button className="tfa-cancel-setup" onClick={() => setSetupMode(false)}>
                                        Cancel Setup
                                    </button>
                                </div>
                            </div>
                        )}
                    </Card>
                </section>

                {/* IP Restriction Section */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <Globe size={20} /> IP Restriction
                    </h2>
                    <Card className="settings-card">
                        <div className="setting-row">
                            <div className="setting-info">
                                <h3 className="setting-name">IP Access Control</h3>
                                <p className="setting-description">
                                    Restrict cryptographic operations (Sign, Verify, etc.) to authorized IP addresses.
                                </p>
                            </div>
                        </div>

                        {ipLoading ? (
                            <div style={{ padding: '16px 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>Loading...</div>
                        ) : (
                            <div className="ip-radio-group">
                                <button
                                    className={`ip-radio-card ${ipMode === 'any' ? 'active' : ''}`}
                                    onClick={() => handleIpModeChange('any')}
                                >
                                    <div className="ip-radio-dot">
                                        {ipMode === 'any' && <div className="ip-radio-dot-inner" />}
                                    </div>
                                    <div className="ip-radio-content">
                                        <span className="ip-radio-title">Any IP</span>
                                        <span className="ip-radio-desc">Allow operations from all IP addresses.</span>
                                    </div>
                                </button>

                                <button
                                    className={`ip-radio-card ${ipMode === 'selected' ? 'active' : ''}`}
                                    onClick={() => handleIpModeChange('selected')}
                                >
                                    <div className="ip-radio-dot">
                                        {ipMode === 'selected' && <div className="ip-radio-dot-inner" />}
                                    </div>
                                    <div className="ip-radio-content">
                                        <span className="ip-radio-title">Whitelisted IPs</span>
                                        <span className="ip-radio-desc">Only allow operations from your saved IP list.</span>
                                    </div>
                                </button>
                            </div>
                        )}

                        {ipMode === 'selected' && !ipLoading && (
                            <div className="ip-manage-row">
                                <button className="ip-manage-btn" onClick={() => setIpModalOpen(true)}>
                                    <Globe size={14} />
                                    Manage IP Whitelist
                                    {ipWhitelist.length > 0 && (
                                        <span className="ip-manage-count">{ipWhitelist.length}</span>
                                    )}
                                </button>
                                {ipWhitelist.length === 0 && (
                                    <span className="ip-warning-text">
                                        <AlertCircle size={12} />
                                        No IPs added - all crypto operations will be blocked
                                    </span>
                                )}
                            </div>
                        )}
                    </Card>
                </section>

                <IpWhitelistModal
                    isOpen={ipModalOpen}
                    onClose={() => setIpModalOpen(false)}
                    whitelist={ipWhitelist}
                    onSave={handleSaveIpWhitelist}
                />

                {/* MTLS Section */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <Lock size={20} /> Mutual TLS (MTLS)
                    </h2>
                    <Card className="settings-card">
                        <div className="setting-row">
                            <div className="setting-info">
                                <h3 className="setting-name">Certificate-Based Access Control</h3>
                                <p className="setting-description">
                                    Implement an additional layer of identity verification using client-side certificates for cryptographically secure access.
                                </p>
                            </div>
                        </div>

                        {mtlsLoading ? (
                            <div style={{ padding: '16px 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>Loading...</div>
                        ) : (
                            <div className="mtls-radio-group">
                                <button
                                    className={`mtls-radio-card ${mtlsMode === 'standard' ? 'active' : ''}`}
                                    onClick={() => handleMTLSModeChange('standard')}
                                >
                                    <div className="mtls-radio-dot">
                                        {mtlsMode === 'standard' && <div className="mtls-radio-dot-inner" />}
                                    </div>
                                    <div className="mtls-radio-content">
                                        <span className="mtls-radio-title">Standard Access</span>
                                        <span className="mtls-radio-desc">Access your account with authentication key and auth key id only.</span>
                                    </div>
                                </button>

                                <button
                                    className={`mtls-radio-card ${mtlsMode === 'mtls' ? 'active' : ''}`}
                                    onClick={() => handleMTLSModeChange('mtls')}
                                >
                                    <div className="mtls-radio-dot">
                                        {mtlsMode === 'mtls' && <div className="mtls-radio-dot-inner" />}
                                    </div>
                                    <div className="mtls-radio-content">
                                        <span className="mtls-radio-title">MTLS Protected</span>
                                        <span className="mtls-radio-desc">Access your account with additional mtls for enhanced security.</span>
                                    </div>
                                </button>
                            </div>
                        )}

                        {mtlsMode === 'mtls' && !mtlsLoading && (
                            <div className="mtls-manage-row">
                                <button className="mtls-manage-btn" onClick={() => setMtlsModalOpen(true)}>
                                    <Lock size={14} />
                                    Manage MTLS
                                </button>
                            </div>
                        )}
                    </Card>
                </section>

                <ManageMTLSModal
                    isOpen={mtlsModalOpen}
                    onClose={() => setMtlsModalOpen(false)}
                    onCertificateIssued={() => {
                        // Reload MTLS settings if needed
                    }}
                />

                {/* Theme Section */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <Sun size={20} /> Appearance
                    </h2>
                    <Card className="settings-card">
                        <div className="setting-row">
                            <div className="setting-info">
                                <h3 className="setting-name">Theme Preference</h3>
                                <p className="setting-description">
                                    Choose how QuantumVault looks to you. Select a theme or sync with your system.
                                </p>
                            </div>
                            <div className="setting-action">
                                <div className="theme-selector">
                                    <div className="theme-options desktop-only">
                                        <button
                                            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                                            onClick={() => setTheme('light')}
                                        >
                                            <Sun size={16} />
                                            <span>Light</span>
                                        </button>
                                        <button
                                            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                                            onClick={() => setTheme('dark')}
                                        >
                                            <Moon size={16} />
                                            <span>Dark</span>
                                        </button>
                                        <button
                                            className={`theme-option ${theme === 'system' ? 'active' : ''}`}
                                            onClick={() => setTheme('system')}
                                        >
                                            <Monitor size={16} />
                                            <span>System</span>
                                        </button>
                                    </div>
                                    <div className="theme-dropdown-container mobile-only">
                                        <select 
                                            className="theme-dropdown" 
                                            value={theme} 
                                            onChange={(e) => setTheme(e.target.value)}
                                        >
                                            <option value="light">Light</option>
                                            <option value="dark">Dark</option>
                                            <option value="system">System</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Account Actions */}
                <section className="settings-section logout-section">
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={18} style={{ marginRight: '8px' }} />
                        Log Out
                    </button>
                </section>
            </div>
        </div>
    );
};

export default Settings;
