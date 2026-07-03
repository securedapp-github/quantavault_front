import { useState } from 'react';
import {
    FileBadge, Download, RotateCcw,
    XCircle, Search, Eye, Link2
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
import { validateDisplayName, validateCertPem } from '../utils/cert.validation';
import '../styles/cert.shared.css';

const statusBadge = (status) => {
    const map = {
        'ACTIVE': 'success',
        'PENDING': 'info',
        'EXPIRED': 'warning',
        'REVOKED': 'error',
    };
    return <Badge variant={map[status] || 'default'}>{status}</Badge>;
};

// ── Import Cert Modal ─────────────────────────────────────────────────────────
const ImportCertModal = ({ isOpen, onClose, onImport, keys }) => {
    const [form, setForm] = useState({ name: '', certPem: '', chainPem: '', keyId: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleFormChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        
        let err = null;
        if (field === 'name') err = value.trim() ? validateDisplayName(value) : null;
        if (field === 'certPem') err = validateCertPem(value);
        if (field === 'chainPem' && value.trim()) {
            if (!value.includes('-----BEGIN ') || !value.includes('-----END ')) {
                err = 'Must contain valid PEM headers (e.g. -----BEGIN CERTIFICATE-----)';
            }
        }

        setErrors(prev => ({ ...prev, [field]: err }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nameErr = form.name.trim() ? validateDisplayName(form.name) : null;
        const certErr = validateCertPem(form.certPem);
        let chainErr = null;
        if (form.chainPem.trim() && (!form.chainPem.includes('-----BEGIN ') || !form.chainPem.includes('-----END '))) {
            chainErr = 'Must contain valid PEM headers (e.g. -----BEGIN CERTIFICATE-----)';
        }

        if (nameErr || certErr || chainErr) {
            setErrors({ name: nameErr, certPem: certErr, chainPem: chainErr });
            toast.error(nameErr || certErr || chainErr);
            return;
        }

        setLoading(true);
        try {
            await onImport(form.certPem, form.name || null, form.keyId || null, form.chainPem || null);
            setForm({ name: '', certPem: '', chainPem: '', keyId: '' });
            setErrors({});
            onClose();
        } catch (_err) {
            // Error is handled in context/toast
        } finally {
            setLoading(false);
        }
    };

    const activeKeys = keys.filter(k => k.status === 'active' || k.status === 'ACTIVE');

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => { setForm({ name: '', certPem: '', chainPem: '', keyId: '' }); setErrors({}); onClose(); }}
            title="Import Certificate"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Importing...' : 'Import Certificate'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Certificate Name</label>
                    <input
                        className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                        placeholder="e.g. api.company.com TLS Cert"
                        value={form.name}
                        onChange={e => handleFormChange('name', e.target.value)}
                        disabled={loading}
                    />
                    {errors.name && <p className="form-error-msg">{errors.name}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label">Bind to Key <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span></label>
                    <select
                        className="form-select"
                        value={form.keyId}
                        onChange={e => handleFormChange('keyId', e.target.value)}
                        disabled={loading}
                    >
                        <option value="">— No key binding —</option>
                        {activeKeys.map(k => (
                            <option key={k.id} value={k.id}>{k.name} ({k.algorithm} {k.parameters || 'P-256'})</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Certificate PEM <span className="required">*</span></label>
                    <textarea
                        className={`form-textarea ${errors.certPem ? 'form-input-error' : ''}`}
                        rows={6}
                        placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                        value={form.certPem}
                        onChange={e => handleFormChange('certPem', e.target.value)}
                        disabled={loading}
                    />
                    {errors.certPem && <p className="form-error-msg">{errors.certPem}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label">Chain PEM <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span></label>
                    <textarea
                        className={`form-textarea ${errors.chainPem ? 'form-input-error' : ''}`}
                        rows={3}
                        placeholder="Intermediate / Root CA PEM (optional)"
                        value={form.chainPem}
                        onChange={e => handleFormChange('chainPem', e.target.value)}
                        disabled={loading}
                    />
                    {errors.chainPem && <p className="form-error-msg">{errors.chainPem}</p>}
                </div>
            </form>
        </Modal>
    );
};

// ── Cert Detail Modal ─────────────────────────────────────────────────────────
const CertDetailModal = ({ cert, isOpen, onClose, onRenew, onRevoke, onDownload, onDownloadChain }) => {
    if (!cert) return null;

    const handleDownload = async () => {
        try {
            const data = await onDownload(cert.id);
            const blob = new Blob([data.pem], { type: 'application/x-pem-file' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${cert.name.replace(/\s+/g, '_')}.pem`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (_err) {
            // Handled in context
        }
    };

    const handleDownloadChainFile = async () => {
        try {
            const data = await onDownloadChain(cert.id);
            const pem = data.chainPem || '';
            if (!pem) { toast.error('No chain PEM available'); return; }
            const blob = new Blob([pem], { type: 'application/x-pem-file' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${cert.name.replace(/\s+/g, '_')}_chain.pem`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (_err) {
            // Handled in context
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Certificate Details"
            size="wide"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    {cert.issuedInternally && cert.status !== 'PENDING' && (
                        <Button variant="secondary" onClick={handleDownloadChainFile}>
                            <Link2 size={14} /> Download Chain
                        </Button>
                    )}
                    {cert.status === 'ACTIVE' && (
                        <Button variant="secondary" onClick={async () => {
                            if (window.confirm('Request renewal for this certificate?')) {
                                await onRenew(cert.id);
                                onClose();
                            }
                        }}>
                            <RotateCcw size={14} /> Renew
                        </Button>
                    )}
                    {cert.status !== 'REVOKED' && cert.status !== 'PENDING' && (
                        <Button variant="danger" onClick={async () => {
                            if (window.confirm('Are you sure you want to revoke this certificate? This cannot be undone.')) {
                                await onRevoke(cert.id);
                                onClose();
                            }
                        }}>
                            <XCircle size={14} /> Revoke
                        </Button>
                    )}
                </>
            }
        >
            <div className="detail-grid">
                <div className="detail-row">
                    <span className="detail-key">Name</span>
                    <span className="detail-value" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 600 }}>{cert.name}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-key">Status</span>
                    <span className="detail-value" style={{ fontFamily: 'inherit' }}>{statusBadge(cert.status)}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-key">Subject</span>
                    <span className="detail-value">{cert.subject || '—'}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-key">Issuer</span>
                    <span className="detail-value">{cert.issuer || '—'}</span>
                </div>
                {cert.issuingKeyId && (
                    <div className="detail-row">
                        <span className="detail-key">Issuing CA Key</span>
                        <span className="detail-value">{cert.issuingKeyId}</span>
                    </div>
                )}
                {cert.parentCertificateId && (
                    <div className="detail-row">
                        <span className="detail-key">Parent Cert</span>
                        <span className="detail-value">{cert.parentCertificateId}</span>
                    </div>
                )}
                <div className="detail-row">
                    <span className="detail-key">Serial #</span>
                    <span className="detail-value">{cert.serialNumber || '—'}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-key">Thumbprint</span>
                    <span className="detail-value">{cert.thumbprint || '—'}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-key">Algorithm</span>
                    <span className="detail-value">{cert.publicKeyAlgorithm || '—'}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-key">Not Before</span>
                    <span className="detail-value">{cert.notBefore ? new Date(cert.notBefore).toLocaleString() : '—'}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-key">Not After</span>
                    <span className="detail-value">{cert.notAfter ? new Date(cert.notAfter).toLocaleString() : '—'}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-key">Issued Internally</span>
                    <span className="detail-value" style={{ fontFamily: 'inherit' }}>
                        {cert.issuedInternally
                            ? <Badge variant="success">✓ QuantumVault CA</Badge>
                            : <span style={{ color: 'var(--color-text-muted)' }}>External CA</span>
                        }
                    </span>
                </div>
            </div>
            {cert.status !== 'PENDING' && (
                <>
                    <div style={{ marginTop: 20 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 6 }}>Certificate PEM</div>
                        <div className="pem-box">{cert.certificatePem || 'Loading PEM...'}</div>
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Button variant="secondary" size="sm" onClick={() => {
                            if (cert.certificatePem) {
                                navigator.clipboard.writeText(cert.certificatePem);
                                toast.success('Certificate PEM copied to clipboard');
                            }
                        }}>Copy PEM</Button>
                        <Button variant="secondary" size="sm" onClick={handleDownload}>
                            <Download size={12} /> Download
                        </Button>
                    </div>
                </>
            )}
        </Modal>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const CertificatesPage = () => {
    const {
        certificates,
        keys,
        importCertificate,
        downloadCert,
        downloadChain,
        renewCert,
        revokeCert,
        loading
    } = useCert();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [importOpen, setImportOpen] = useState(false);
    const [selectedCert, setSelectedCert] = useState(null);

    const filtered = certificates.filter(c => {
        const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.subject || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusFilter || c.status === statusFilter;
        const matchType = !typeFilter || c.certType === typeFilter;
        
        let matchSource = true;
        if (sourceFilter === 'internal') matchSource = c.issuedInternally === true;
        else if (sourceFilter === 'external') matchSource = c.issuedInternally === false;

        return matchSearch && matchStatus && matchType && matchSource;
    });

    const handleSelectCert = async (certRow) => {
        try {
            const detailed = await downloadCert(certRow.id);
            setSelectedCert({ ...certRow, certificatePem: detailed.pem });
        } catch (_err) {
            setSelectedCert(certRow);
        }
    };

    const handleDownloadOnly = async (certRow) => {
        try {
            const detailed = await downloadCert(certRow.id);
            const blob = new Blob([detailed.pem], { type: 'application/x-pem-file' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${certRow.name.replace(/\s+/g, '_')}.pem`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Certificate downloaded successfully');
        } catch (_err) {
            // Handled
        }
    };

    const handleDownloadChainOnly = async (certRow) => {
        try {
            const data = await downloadChain(certRow.id);
            const pem = data.chainPem || '';
            if (!pem) { toast.error('No chain PEM available'); return; }
            const blob = new Blob([pem], { type: 'application/x-pem-file' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${certRow.name.replace(/\s+/g, '_')}_chain.pem`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (_err) {
            // Handled
        }
    };

    const columns = [
        {
            header: 'Certificate Name',
            key: 'name',
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                        <span>{row.name}</span>
                        {row.certType === 'ROOT' && <Badge variant="error">Root CA</Badge>}
                        {row.certType === 'INTERMEDIATE' && <Badge variant="warning">Intermediate CA</Badge>}
                        {row.certType === 'LEAF' && <Badge variant="info">Leaf</Badge>}
                        
                        {row.issuedInternally ? (
                            <Badge variant="success">Internal</Badge>
                        ) : (
                            <Badge variant="default">External</Badge>
                        )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'monospace', marginTop: 4 }}>{row.subject}</div>
                </div>
            )
        },
        {
            header: 'Issuer',
            key: 'issuer',
            render: (row) => <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>{row.issuer ? row.issuer.split(',')[0] : '—'}</span>
        },
        {
            header: 'Status',
            key: 'status',
            render: (row) => statusBadge(row.status)
        },
        {
            header: 'Algorithm',
            key: 'publicKeyAlgorithm',
            render: (row) => <Badge variant="warning">{row.publicKeyAlgorithm}</Badge>
        },
        {
            header: 'Expires',
            key: 'notAfter',
            render: (row) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{row.notAfter ? new Date(row.notAfter).toLocaleDateString() : '—'}</span>
        },
        {
            header: 'Actions',
            key: 'actions',
            render: (row) => {
                const actions = [
                    {
                        label: 'View Details',
                        icon: <Eye size={14} />,
                        onClick: () => handleSelectCert(row)
                    }
                ];
                if (row.status !== 'PENDING') {
                    actions.push({
                        label: 'Download PEM',
                        icon: <Download size={14} />,
                        onClick: () => handleDownloadOnly(row)
                    });
                }
                // Chain download available for internally-issued certs
                if (row.issuedInternally && row.status !== 'PENDING') {
                    actions.push({
                        label: 'Download Chain',
                        icon: <Link2 size={14} />,
                        onClick: () => handleDownloadChainOnly(row)
                    });
                }
                if (row.status === 'ACTIVE') {
                    actions.push({
                        label: 'Renew',
                        icon: <RotateCcw size={14} />,
                        onClick: async () => {
                            if (window.confirm('Renew this certificate? This will generate a new CSR.')) {
                                await renewCert(row.id);
                            }
                        }
                    });
                }
                if (row.status !== 'REVOKED' && row.status !== 'PENDING') {
                    actions.push({
                        label: 'Revoke',
                        icon: <XCircle size={14} />,
                        variant: 'danger',
                        onClick: async () => {
                            if (window.confirm('Are you sure you want to revoke this certificate?')) {
                                await revokeCert(row.id);
                            }
                        }
                    });
                }
                return <ActionMenu actions={actions} />;
            }
        },
    ];

    return (
        <div className="page">
            <PageHeader
                title="Certificates"
                subtitle="View and manage all X.509 certificates in your PKI"
                action={<Button onClick={() => setImportOpen(true)}>+ Import Certificate</Button>}
            />

            <div className="page-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '0 0 220px' }}>
                        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            className="table-search"
                            style={{ paddingLeft: 34, width: '100%', background: 'var(--input-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', padding: '8px 12px 8px 34px', color: 'var(--color-text-primary)', fontSize: 13 }}
                            placeholder="Search certificates…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        style={{ background: 'var(--input-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', color: 'var(--color-text-primary)', fontSize: 13 }}
                        value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PENDING">Pending</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="REVOKED">Revoked</option>
                    </select>

                    <select
                        style={{ background: 'var(--input-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', color: 'var(--color-text-primary)', fontSize: 13 }}
                        value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="ROOT">Root CA</option>
                        <option value="INTERMEDIATE">Intermediate CA</option>
                        <option value="LEAF">Leaf Certificate</option>
                    </select>

                    <select
                        style={{ background: 'var(--input-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', color: 'var(--color-text-primary)', fontSize: 13 }}
                        value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
                    >
                        <option value="">All Issuers</option>
                        <option value="internal">Issued Internally</option>
                        <option value="external">Issued Externally</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                        Loading certificates...
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={<FileBadge size={48} />}
                        title="No certificates found"
                        description="Import your first certificate or generate a CSR to get started"
                        actionLabel="+ Import Certificate"
                        onAction={() => setImportOpen(true)}
                    />
                ) : (
                    <div className="table-wrapper">
                        <div className="table-header-title">All Certificates ({filtered.length})</div>
                        <Table columns={columns} data={filtered} />
                    </div>
                )}
            </div>

            <ImportCertModal isOpen={importOpen} onClose={() => setImportOpen(false)} onImport={importCertificate} keys={keys} />
            <CertDetailModal
                cert={selectedCert}
                isOpen={!!selectedCert}
                onClose={() => setSelectedCert(null)}
                onRenew={renewCert}
                onRevoke={revokeCert}
                onDownload={downloadCert}
                onDownloadChain={downloadChain}
            />
        </div>
    );
};

export default CertificatesPage;
