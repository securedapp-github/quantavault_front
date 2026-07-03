import { useState } from 'react';
import {
    ShieldCheck, Eye, Copy, GitBranch,
    Crown, Network, Shield, Plus, Key
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Table from '../components/Table';
import EmptyState from '../components/EmptyState';
import ActionMenu from '../components/ActionMenu';

import { useCert } from '../context/cert.CertContext';
import { formatDate } from '../utils/dateFormatter';
import {
    truncateName,
    validateKeyName,
    validateDisplayName,
    validateSubjectDN,
    validateICAValidity
} from '../utils/cert.validation';
import './cert.CertKeysPage.css';
import '../styles/cert.shared.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

const caTypeLabel = (caType) => {
    if (caType === 'ROOT') return { label: 'Root CA', variant: 'info', icon: <Crown size={10} /> };
    if (caType === 'INTERMEDIATE') return { label: 'Issuing CA', variant: 'warning', icon: <Network size={10} /> };
    return null;
};

// ── Create Key Modal ──────────────────────────────────────────────────────────

const CreateKeyModal = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleNameChange = (val) => {
        setName(val);
        setError(validateKeyName(val));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validateKeyName(name);
        if (err) {
            setError(err);
            toast.error(err);
            return;
        }
        setLoading(true);
        try {
            await onCreate({ name });
            setName('');
            setError(null);
            onClose();
        } catch (_err) {
            // Error is handled in context/toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => { setName(''); setError(null); onClose(); }}
            title="Create Certificate Key"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Key'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Key Name <span className="required">*</span></label>
                    <input
                        className={`form-input ${error ? 'form-input-error' : ''}`}
                        placeholder="e.g. api-company-com-key"
                        value={name}
                        onChange={e => handleNameChange(e.target.value)}
                        disabled={loading}
                        autoFocus
                    />
                    {error && <p className="form-error-msg">{error}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label">Algorithm</label>
                    <select className="form-select" disabled>
                        <option>ECDSA P-256</option>
                    </select>
                    <p className="form-hint">ECDSA P-256 is currently supported. RSA and ML-DSA coming soon.</p>
                </div>
                <div className="ck-info-box ck-info-box--blue">
                    🔒 An ECDSA P-256 key pair will be generated. The private key is AES-256-GCM encrypted at rest and never returned by the API.
                </div>
            </form>
        </Modal>
    );
};

// ── Issue Intermediate CA Modal ───────────────────────────────────────────────

const IssueIntermediateModal = ({ isOpen, onClose, rootKey, onIssue }) => {
    const [form, setForm] = useState({ name: '', subjectDN: '', validityDays: 1825 });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleFormChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        
        let err = null;
        if (field === 'name') err = validateDisplayName(value);
        if (field === 'subjectDN') err = validateSubjectDN(value);
        if (field === 'validityDays') err = validateICAValidity(value);

        setErrors(prev => ({ ...prev, [field]: err }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nameErr = validateDisplayName(form.name);
        const dnErr = validateSubjectDN(form.subjectDN);
        const validityErr = validateICAValidity(form.validityDays);

        if (nameErr || dnErr || validityErr) {
            setErrors({ name: nameErr, subjectDN: dnErr, validityDays: validityErr });
            toast.error(nameErr || dnErr || validityErr);
            return;
        }

        setLoading(true);
        try {
            await onIssue(rootKey.id, {
                name: form.name,
                subjectDN: form.subjectDN,
                validityDays: parseInt(form.validityDays) || 1825
            });
            setForm({ name: '', subjectDN: '', validityDays: 1825 });
            setErrors({});
            onClose();
        } catch (_err) {
            // Error is handled in context/toast
        } finally {
            setLoading(false);
        }
    };

    if (!rootKey) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => { setForm({ name: '', subjectDN: '', validityDays: 1825 }); setErrors({}); onClose(); }}
            title="Issue Intermediate CA"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Issuing...' : 'Issue CA'}
                    </Button>
                </>
            }
        >
            <div className="ck-info-box ck-info-box--purple" style={{ marginBottom: 20 }}>
                <Crown size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                    <strong>Root CA:</strong> {rootKey.name}
                    <div style={{ fontSize: 11, marginTop: 2, opacity: 0.8 }}>
                        This Intermediate CA will be signed by the above Root CA and can then sign leaf certificates.
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Intermediate CA Name <span className="required">*</span></label>
                    <input
                        className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                        placeholder="e.g. QuantumVault Issuing CA G2"
                        value={form.name}
                        onChange={e => handleFormChange('name', e.target.value)}
                        disabled={loading}
                        autoFocus
                    />
                    {errors.name ? (
                        <p className="form-error-msg">{errors.name}</p>
                    ) : (
                        <p className="form-hint">Display name for this Intermediate CA key.</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Subject DN <span className="required">*</span></label>
                    <input
                        className={`form-input ${errors.subjectDN ? 'form-input-error' : ''}`}
                        placeholder="CN=QuantumVault Issuing CA G2,O=QuantumVault,C=US"
                        value={form.subjectDN}
                        onChange={e => handleFormChange('subjectDN', e.target.value)}
                        disabled={loading}
                    />
                    {errors.subjectDN ? (
                        <p className="form-error-msg">{errors.subjectDN}</p>
                    ) : (
                        <p className="form-hint">X.509 Distinguished Name — e.g. CN=Issuing CA,O=Org,C=US</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Validity (Days)</label>
                    <input
                        className={`form-input ${errors.validityDays ? 'form-input-error' : ''}`}
                        type="number"
                        value={form.validityDays}
                        min={30}
                        max={1825}
                        onChange={e => handleFormChange('validityDays', e.target.value)}
                        disabled={loading}
                    />
                    {errors.validityDays ? (
                        <p className="form-error-msg">{errors.validityDays}</p>
                    ) : (
                        <p className="form-hint">Max 1825 days (5 years). The backend enforces this cap.</p>
                    )}
                </div>
            </form>
        </Modal>
    );
};

// ── Key Detail Modal ──────────────────────────────────────────────────────────

const KeyDetailModal = ({ certKey, isOpen, onClose }) => {
    if (!certKey) return null;
    const caInfo = caTypeLabel(certKey.caType);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Key Details"
            footer={<Button variant="secondary" onClick={onClose}>Close</Button>}
        >
            <div className="detail-grid">
                <div className="detail-row">
                    <span className="detail-key">Name</span>
                    <span className="detail-value" style={{ fontFamily: 'inherit', fontWeight: 600 }}>{certKey.name}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-key">ID</span>
                    <span className="detail-value">{certKey.id}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-key">Algorithm</span>
                    <span className="detail-value">{certKey.algorithm} {certKey.parameters || 'P-256'}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-key">CA Type</span>
                    <span className="detail-value" style={{ fontFamily: 'inherit' }}>
                        {caInfo
                            ? <Badge variant={caInfo.variant}>{caInfo.icon} {caInfo.label}</Badge>
                            : <span style={{ color: 'var(--color-text-muted)' }}>End-Entity (None)</span>
                        }
                    </span>
                </div>
                {certKey.caType === 'INTERMEDIATE' && certKey.parentKeyId && (
                    <div className="detail-row">
                        <span className="detail-key">Parent Root</span>
                        <span className="detail-value" style={{ fontSize: '0.72rem' }}>{certKey.parentKeyId}</span>
                    </div>
                )}
                {certKey.pathLenConstraint !== null && certKey.pathLenConstraint !== undefined && (
                    <div className="detail-row">
                        <span className="detail-key">Path Length</span>
                        <span className="detail-value" style={{ fontFamily: 'inherit' }}>
                            {certKey.pathLenConstraint === 1 ? 'pathLen:1 (can issue 1 sub-CA)' : 'pathLen:0 (leaf certs only)'}
                        </span>
                    </div>
                )}
                <div className="detail-row">
                    <span className="detail-key">Status</span>
                    <span className="detail-value" style={{ fontFamily: 'inherit' }}>
                        <Badge variant={certKey.status === 'active' || certKey.status === 'ACTIVE' ? 'success' : 'error'}>
                            {String(certKey.status).toUpperCase()}
                        </Badge>
                    </span>
                </div>
                <div className="detail-row">
                    <span className="detail-key">Created</span>
                    <span className="detail-value">{formatDate(certKey.createdAt)}</span>
                </div>
            </div>
            <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 6 }}>Public Key PEM</div>
                <div className="pem-box">{certKey.publicKeyPem}</div>
            </div>
            <div style={{ marginTop: 12 }}>
                <Button variant="secondary" size="sm" onClick={() => {
                    navigator.clipboard.writeText(certKey.publicKeyPem);
                    toast.success('Public Key copied to clipboard');
                }}>Copy Public Key</Button>
            </div>
            <div className="ck-info-box ck-info-box--red" style={{ marginTop: 16 }}>
                🔒 Private key is AES-256-GCM encrypted at rest and never returned by the API.
            </div>
        </Modal>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const CertKeysPage = () => {
    const { keys, createKey, issueIntermediate, loading } = useCert();
    const [createOpen, setCreateOpen] = useState(false);
    const [selectedKey, setSelectedKey] = useState(null);
    const [issueICARoot, setIssueICARoot] = useState(null); // root key for which to issue ICA

    const handleCreateKey = async (keyData) => {
        await createKey(keyData.name);
        setCreateOpen(false);
    };

    const handleIssueIntermediate = async (rootKeyId, payload) => {
        await issueIntermediate(rootKeyId, payload);
    };

    const columns = [
        {
            header: 'Key Name',
            key: 'name',
            render: (row) => {
                const caInfo = caTypeLabel(row.caType);
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} title={row.name}>
                        <span className="ck-key-icon">
                            {row.caType === 'ROOT' ? <Crown size={14} style={{ color: '#a855f7' }} /> :
                             row.caType === 'INTERMEDIATE' ? <Network size={14} style={{ color: '#00A8FF' }} /> :
                             <Key size={14} style={{ color: 'var(--color-text-muted)' }} />}
                        </span>
                        <span style={{ fontWeight: 500 }}>{truncateName(row.name)}</span>
                        {caInfo && (
                            <span className={`ck-ca-badge ck-ca-badge--${row.caType.toLowerCase()}`}>
                                {caInfo.icon}{caInfo.label}
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Algorithm',
            key: 'algorithm',
            render: (row) => <Badge variant="warning">{row.algorithm} {row.parameters || 'P-256'}</Badge>
        },
        {
            header: 'CA Hierarchy',
            key: 'caHierarchy',
            render: (row) => {
                if (row.caType === 'ROOT') {
                    return (
                        <div className="ck-hierarchy-cell">
                            <span className="ck-hierarchy-pill ck-hierarchy-pill--root">Tier 0 · Root</span>
                        </div>
                    );
                }
                if (row.caType === 'INTERMEDIATE') {
                    return (
                        <div className="ck-hierarchy-cell">
                            <span className="ck-hierarchy-pill ck-hierarchy-pill--ica">Tier 1 · Issuing CA</span>
                        </div>
                    );
                }
                return (
                    <div className="ck-hierarchy-cell">
                        <span className="ck-hierarchy-pill ck-hierarchy-pill--leaf">Tier 2 · End-Entity</span>
                    </div>
                );
            }
        },
        {
            header: 'Status',
            key: 'status',
            render: (row) => {
                const status = (row.status || '').toLowerCase();
                let variant = 'default';
                if (status === 'active') variant = 'success';
                else if (status === 'disabled') variant = 'error';
                return <Badge variant={variant}>{String(row.status).toUpperCase()}</Badge>;
            }
        },
        {
            header: 'Created',
            key: 'createdAt',
            render: (row) => formatDate(row.createdAt)
        },
        {
            header: 'Actions',
            key: 'actions',
            render: (row) => {
                const isActive = row.status && row.status.toLowerCase() === 'active';
                const actions = [
                    {
                        label: 'View Details',
                        icon: <Eye size={14} />,
                        onClick: () => setSelectedKey(row)
                    },
                    {
                        label: 'Copy Key ID',
                        icon: <Copy size={14} />,
                        onClick: () => {
                            navigator.clipboard.writeText(row.id);
                            toast.success('Key ID copied to clipboard');
                        }
                    }
                ];

                // Only ROOT CA keys can issue Intermediate CAs
                if (row.caType === 'ROOT' && isActive) {
                    actions.push({
                        label: 'Issue Intermediate CA',
                        icon: <GitBranch size={14} />,
                        onClick: () => setIssueICARoot(row)
                    });
                }

                return <ActionMenu actions={actions} />;
            }
        },
    ];

    // Sort: ROOT first, then INTERMEDIATE, then NONE; active before inactive
    const sortedKeys = [...keys].sort((a, b) => {
        const tierOrder = { ROOT: 0, INTERMEDIATE: 1, NONE: 2 };
        const aTier = tierOrder[a.caType] ?? 2;
        const bTier = tierOrder[b.caType] ?? 2;
        if (aTier !== bTier) return aTier - bTier;
        const aActive = a.status?.toLowerCase() === 'active' ? 0 : 1;
        const bActive = b.status?.toLowerCase() === 'active' ? 0 : 1;
        return aActive - bActive;
    });

    return (
        <div className="page cert-keys-page">
            <PageHeader
                title="Certificate Keys"
                subtitle="ECDSA keys used for CSR generation and the 3-tier CA hierarchy (Root → Issuing CA → Leaf)"
                action={<Button onClick={() => setCreateOpen(true)}><Plus size={16} /> Create Key</Button>}
            />

            <div className="page-content">
                {/* CA Hierarchy Legend */}
                {keys.length > 0 && (
                    <div className="ck-hierarchy-legend">
                        <div className="ck-legend-item">
                            <Crown size={14} style={{ color: '#a855f7' }} />
                            <span className="ck-ca-badge ck-ca-badge--root">Root CA</span>
                            <span>Tier 0 — self-signed, created at startup. Can only issue Intermediate CAs.</span>
                        </div>
                        <div className="ck-legend-item">
                            <Network size={14} style={{ color: '#00A8FF' }} />
                            <span className="ck-ca-badge ck-ca-badge--intermediate">Issuing CA</span>
                            <span>Tier 1 — signed by Root. Signs all day-to-day leaf certificates.</span>
                        </div>
                        <div className="ck-legend-item">
                            <Shield size={14} style={{ color: 'var(--color-text-muted)' }} />
                            <span className="ck-ca-badge ck-ca-badge--none">End-Entity</span>
                            <span>Tier 2 — regular key for generating CSRs. Cannot sign anything.</span>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="ck-loading">Loading certificate keys...</div>
                ) : sortedKeys.length === 0 ? (
                    <EmptyState
                        icon={<ShieldCheck size={48} />}
                        title="No certificate keys yet"
                        description="Create an ECDSA key to start generating CSRs and certificates"
                        actionLabel="+ Create Key"
                        onAction={() => setCreateOpen(true)}
                    />
                ) : (
                    <div className="table-wrapper">
                        <div className="table-header-title">All Keys ({sortedKeys.length})</div>
                        <Table columns={columns} data={sortedKeys} />
                    </div>
                )}
            </div>

            <CreateKeyModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreateKey} />
            <KeyDetailModal certKey={selectedKey} isOpen={!!selectedKey} onClose={() => setSelectedKey(null)} />
            <IssueIntermediateModal
                isOpen={!!issueICARoot}
                onClose={() => setIssueICARoot(null)}
                rootKey={issueICARoot}
                onIssue={handleIssueIntermediate}
            />
        </div>
    );
};

export default CertKeysPage;
