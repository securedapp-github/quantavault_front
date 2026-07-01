import { useNavigate } from 'react-router-dom';
import {
    Award, FileBadge, ShieldCheck, ArrowRight, Clock, XCircle,
    Crown, Network, Key
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { useCert } from '../../context/CertContext';
import './CertManagerOverview.css';
import '../cert-shared.css';

const statusBadge = (status) => {
    const s = status.toLowerCase();
    let variant = 'default';
    if (s === 'active') variant = 'success';
    else if (s === 'pending') variant = 'warning';
    else if (s === 'expired') variant = 'error';
    else if (s === 'revoked') variant = 'error';
    return <Badge variant={variant}>{status}</Badge>;
};

const CertManagerOverview = () => {
    const navigate = useNavigate();
    const { stats, certificates, auditLogs, keys, loading } = useCert();

    const recentCerts = certificates.slice(0, 4);
    const recentLogs = auditLogs.slice(0, 4);

    // CA hierarchy summary
    const rootKeys = keys.filter(k => k.caType === 'ROOT');
    const icaKeys = keys.filter(k => k.caType === 'INTERMEDIATE');
    const endEntityKeys = keys.filter(k => k.caType === 'NONE' || !k.caType);

    return (
        <div className="page dashboard-page">
            <PageHeader
                title="Certificate Manager"
                subtitle="Manage your PKI infrastructure — Keys, CSRs, Certificates, and Lifecycle"
                action={
                    <span className="free-plan-badge" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Award size={14} /> QuantumVault PKI
                    </span>
                }
            />

            <div className="page-content">
                {loading ? (
                    <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                        Loading overview metrics...
                    </div>
                ) : (
                    <>
                        {/* Metrics Grid */}
                        <div className="metrics-grid">
                            <Card className="metric-card">
                                <div className="metric-header">
                                    <span className="metric-label">Total Certificates</span>
                                    <FileBadge size={16} className="metric-icon" />
                                </div>
                                <div className="metric-value">{stats.total}</div>
                                <div className="metric-sublabel">All registered certificates</div>
                            </Card>

                            <Card className="metric-card">
                                <div className="metric-header">
                                    <span className="metric-label">Active</span>
                                    <ShieldCheck size={16} className="metric-icon" />
                                </div>
                                <div className="metric-value" style={{ color: 'var(--color-success)' }}>
                                    {stats.active}
                                </div>
                                <div className="metric-sublabel">Currently valid certificates</div>
                            </Card>

                            <Card className="metric-card">
                                <div className="metric-header">
                                    <span className="metric-label">Expiring Soon</span>
                                    <Clock size={16} className="metric-icon" />
                                </div>
                                <div className="metric-value" style={{ color: 'var(--color-warning)' }}>
                                    {stats.expiringSoon}
                                </div>
                                <div className="metric-sublabel">Renewals within 30 days</div>
                            </Card>

                            <Card className="metric-card">
                                <div className="metric-header">
                                    <span className="metric-label">Revoked</span>
                                    <XCircle size={16} className="metric-icon" />
                                </div>
                                <div className="metric-value" style={{ color: 'var(--color-danger)' }}>
                                    {stats.revoked}
                                </div>
                                <div className="metric-sublabel">Invalidated certificates</div>
                            </Card>
                        </div>

                        {/* CA Hierarchy Summary */}
                        <section className="section" style={{ marginBottom: 32 }}>
                            <h2 className="section-title" style={{ marginBottom: 16 }}>PKI Hierarchy Status</h2>
                            <div className="pki-hierarchy-summary">
                                <div className="pki-tier-card pki-tier-root" onClick={() => navigate('/cert-manager/keys')}>
                                    <div className="pki-tier-icon"><Crown size={20} /></div>
                                    <div className="pki-tier-info">
                                        <div className="pki-tier-name">Root CA</div>
                                        <div className="pki-tier-count">{rootKeys.length} key{rootKeys.length !== 1 ? 's' : ''}</div>
                                        <div className="pki-tier-desc">Tier 0 · Self-signed</div>
                                    </div>
                                </div>
                                <div className="pki-tier-arrow">→</div>
                                <div className="pki-tier-card pki-tier-ica" onClick={() => navigate('/cert-manager/internal-ca')}>
                                    <div className="pki-tier-icon"><Network size={20} /></div>
                                    <div className="pki-tier-info">
                                        <div className="pki-tier-name">Issuing CA</div>
                                        <div className="pki-tier-count">{icaKeys.length} key{icaKeys.length !== 1 ? 's' : ''}</div>
                                        <div className="pki-tier-desc">Tier 1 · Signs leaf certs</div>
                                    </div>
                                </div>
                                <div className="pki-tier-arrow">→</div>
                                <div className="pki-tier-card pki-tier-leaf" onClick={() => navigate('/cert-manager/certificates')}>
                                    <div className="pki-tier-icon"><FileBadge size={20} /></div>
                                    <div className="pki-tier-info">
                                        <div className="pki-tier-name">Leaf Certificates</div>
                                        <div className="pki-tier-count">{stats.active} active</div>
                                        <div className="pki-tier-desc">Tier 2 · TLS/mTLS/Code-sign</div>
                                    </div>
                                </div>
                                <div className="pki-tier-arrow">+</div>
                                <div className="pki-tier-card pki-tier-keys" onClick={() => navigate('/cert-manager/keys')}>
                                    <div className="pki-tier-icon"><Key size={20} /></div>
                                    <div className="pki-tier-info">
                                        <div className="pki-tier-name">End-Entity Keys</div>
                                        <div className="pki-tier-count">{endEntityKeys.length} key{endEntityKeys.length !== 1 ? 's' : ''}</div>
                                        <div className="pki-tier-desc">CSR generation only</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Quick Actions */}
                        <section className="section quick-actions-section">
                            <Card style={{ padding: '24px' }}>
                                <h2 className="section-title" style={{ marginTop: 0 }}>Quick Actions</h2>
                                <div className="quick-actions-grid" style={{ marginTop: '16px' }}>
                                    <button
                                        className="qa-button"
                                        onClick={() => navigate('/cert-manager/keys')}
                                    >
                                        <span className="qa-icon">+</span>
                                        Manage Cert Keys
                                    </button>
                                    <button
                                        className="qa-button"
                                        onClick={() => navigate('/cert-manager/csr')}
                                    >
                                        <span className="qa-icon">+</span>
                                        Generate CSR
                                    </button>
                                    <button
                                        className="qa-button"
                                        onClick={() => navigate('/cert-manager/internal-ca')}
                                    >
                                        <span className="qa-icon">+</span>
                                        Sign Internally
                                    </button>
                                    <button
                                        className="qa-button qa-button-primary"
                                        onClick={() => navigate('/cert-manager/certificates')}
                                    >
                                        <ArrowRight size={16} className="qa-icon-svg" />
                                        View All Certificates
                                    </button>
                                </div>
                            </Card>
                        </section>

                        {/* Side-by-side layout: Recent Certificates & Activity */}
                        <div className="dashboard-columns">
                            {/* Recent Certificates */}
                            <Card style={{ padding: 0 }}>
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
                                    <h2 className="section-title" style={{ margin: 0 }}>
                                        Recent Certificates
                                    </h2>
                                </div>
                                <div style={{ overflow: 'hidden', borderRadius: '0 0 12px 12px' }}>
                                    {recentCerts.length === 0 ? (
                                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                            No certificates found. Generate a CSR or sign one to get started.
                                        </div>
                                    ) : (
                                        recentCerts.map(cert => (
                                            <div key={cert.id} style={{
                                                display: 'flex', alignItems: 'center', gap: 12,
                                                padding: '14px 24px',
                                                borderBottom: '1px solid var(--color-border)',
                                                transition: 'background var(--transition-fast)',
                                                cursor: 'pointer'
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                onClick={() => navigate('/cert-manager/certificates')}
                                            >
                                                <FileBadge size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {cert.name}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {cert.subject}
                                                    </div>
                                                </div>
                                                {statusBadge(cert.status)}
                                            </div>
                                        ))
                                    )}
                                    <div style={{ padding: '12px 24px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => navigate('/cert-manager/certificates')}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-family-base)', fontWeight: 500 }}
                                        >
                                            View all certificates →
                                        </button>
                                    </div>
                                </div>
                            </Card>

                            {/* Recent Activity */}
                            <Card style={{ padding: 0 }}>
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
                                    <h2 className="section-title" style={{ margin: 0 }}>
                                        Recent Activity
                                    </h2>
                                </div>
                                <div style={{ padding: '0 24px' }}>
                                    {recentLogs.length === 0 ? (
                                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                            No activity logs found.
                                        </div>
                                    ) : (
                                        recentLogs.map(log => (
                                            <div key={log.id} className="audit-item" style={{
                                                display: 'flex',
                                                gap: 12,
                                                padding: '16px 0',
                                                borderBottom: '1px solid var(--color-border)'
                                            }}>
                                                <div className="audit-body" style={{ flex: 1 }}>
                                                    <span className="audit-action-badge" style={{
                                                        fontSize: 10,
                                                        fontWeight: 600,
                                                        padding: '2px 8px',
                                                        borderRadius: 4,
                                                        background: 'rgba(99,102,241,0.1)',
                                                        color: 'var(--color-primary)',
                                                        border: '1px solid rgba(99,102,241,0.2)',
                                                        display: 'inline-block',
                                                        marginBottom: 6
                                                    }}>
                                                        {log.action.replace(/_/g, ' ')}
                                                    </span>
                                                    <div className="audit-performer" style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>
                                                        {log.performedBy}
                                                    </div>
                                                    <div className="audit-time" style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                                                        {new Date(log.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div style={{ padding: '12px 24px', textAlign: 'center' }}>
                                    <button
                                        onClick={() => navigate('/cert-manager/audit')}
                                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-family-base)', fontWeight: 500 }}
                                    >
                                        View all audit logs →
                                    </button>
                                </div>
                            </Card>
                        </div>

                        {/* Developer Tier Banner */}
                        <section className="section upgrade-section" style={{ marginTop: 40 }}>
                            <div className="developer-tier-card">
                                <h3 className="tier-title">PKI Developer Tier (Free)</h3>
                                <p className="tier-description">
                                    You are currently on the free developer tier with software-based ECDSA keys. Upgrade to obtain HSM-backed private keys and post-quantum (ML-DSA) root signers.
                                </p>
                                <Button
                                    className="tier-upgrade-btn"
                                    onClick={() => alert('Upgrade tier functionality coming soon')}
                                >
                                    Upgrade to HSM-backed PKI
                                </Button>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};

export default CertManagerOverview;
