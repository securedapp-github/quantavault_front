import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, FileText, ArrowRight, Shield, Activity } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { useQuantum } from '../context/QuantumContext';
import { STATUS } from '../utils/constants';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { pqcKeys, authKeys, auditLogs, dashboardStats } = useQuantum();

    // Use backend stats if available, fallback to local counts
    const stats = dashboardStats || {};
    const pqcCount = stats.pqcKeys ?? pqcKeys.length;
    const authCount = stats.authKeys ?? authKeys.length;

    // Filter audit logs to last 24 hours
    // Capture current time on mount to avoid impure Date.now() during render
    // eslint-disable-next-line react-hooks/purity
    const nowRef = React.useRef(Date.now());
    const now = nowRef.current;
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    const recentLogs = auditLogs.filter(log => new Date(log.createdAt).getTime() > twentyFourHoursAgo);
    const totalOps = recentLogs.length;
    const successfulEvents = recentLogs.filter(log => log.result === STATUS.SUCCESS).length;

    return (
        <div className="page">
            <PageHeader
                title="Dashboard"
                subtitle="Overview of your quantum-safe cryptographic operations"
                action={<div className="free-plan-badge">Free Plan</div>}
            />

            <div className="page-content">
                {/* Metrics Grid */}
                <div className="metrics-grid">
                    <Card className="metric-card">
                        <div className="metric-header">
                            <span className="metric-label">Active PQC Keys</span>
                            <Key size={16} className="metric-icon" />
                        </div>
                        <div className="metric-value">{pqcCount}</div>
                        <div className="metric-sublabel">Post-quantum cryptographic keys</div>
                    </Card>

                    <Card className="metric-card">
                        <div className="metric-header">
                            <span className="metric-label">Authentication Keys</span>
                            <Shield size={16} className="metric-icon" />
                        </div>
                        <div className="metric-value">{authCount}</div>
                        <div className="metric-sublabel">Identity keys for access control</div>
                    </Card>

                    <Card className="metric-card">
                        <div className="metric-header">
                            <span className="metric-label">Crypto Operations</span>
                            <Activity size={16} className="metric-icon" />
                        </div>
                        <div className="metric-value">{totalOps}</div>
                        <div className="metric-sublabel">Last 24 hours</div>
                    </Card>

                    <Card className="metric-card">
                        <div className="metric-header">
                            <span className="metric-label">Audit Events</span>
                            <FileText size={16} className="metric-icon" />
                        </div>
                        <div className="metric-value">{successfulEvents}</div>
                        <div className="metric-sublabel">Last 24 hours</div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <section className="section quick-actions-section">
                    <Card style={{ padding: '24px' }}>
                        <h2 className="section-title" style={{ marginTop: 0 }}>Quick Actions</h2>
                        <div className="quick-actions-grid" style={{ marginTop: '16px' }}>
                            <button
                                className="qa-button"
                                onClick={() => navigate('/pqc-keys', { state: { openCreateModal: true } })}
                            >
                                <span className="qa-icon">+</span>
                                Create PQC Key
                            </button>
                            <button
                                className="qa-button"
                                onClick={() => navigate('/authentication-keys', { state: { openCreateModal: true } })}
                            >
                                <span className="qa-icon">+</span>
                                Create Authentication Key
                            </button>
                            <button
                                className="qa-button"
                                onClick={() => navigate('/audit-logs')}
                            >
                                <FileText size={16} className="qa-icon-svg" />
                                View Audit Logs
                            </button>
                            <button
                                className="qa-button qa-button-primary"
                                onClick={() => navigate('/billing')}
                            >
                                <ArrowRight size={16} className="qa-icon-svg" />
                                Upgrade Plan
                            </button>
                        </div>
                    </Card>
                </section>

                {/* Developer Tier Banner */}
                <section className="section upgrade-section">
                    <div className="developer-tier-card">
                        <h3 className="tier-title">Developer Tier (Free)</h3>
                        <p className="tier-description">
                            You're currently on the free developer tier with software-based PQC keys. Upgrade for HSM-backed security and production features.
                        </p>
                        <Button
                            className="tier-upgrade-btn"
                            onClick={() => navigate('/billing')}
                        >
                            Upgrade to Production
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
