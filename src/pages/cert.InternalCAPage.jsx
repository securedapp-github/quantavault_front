import { useState } from 'react';
import {
    Shield, Check, Crown, Network, Download,
    Copy, GitBranch, ChevronRight, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { useCert } from '../context/cert.CertContext';
import {
    validateDisplayName,
    validateSubjectDN,
    validateICAValidity,
    validateLeafValidity,
    validateCsrPem
} from '../utils/cert.validation';
import '../styles/cert.shared.css';
import './cert.InternalCAPage.css';

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = () => (
    <span className="ica-spinner" />
);

// ── Tab: Issue Leaf Certificate ───────────────────────────────────────────────
const IssueLeafTab = ({ keys, signCsrInternally }) => {
    const [form, setForm] = useState({
        issuingKeyId: '',
        name: '',
        csrPem: '',
        validityDays: 365,
    });
    const [errors, setErrors] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFormChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        
        let err = null;
        if (field === 'issuingKeyId') err = value ? null : 'Select an Issuing CA key';
        if (field === 'name' && value.trim()) err = validateDisplayName(value);
        if (field === 'csrPem') err = validateCsrPem(value);
        if (field === 'validityDays') err = validateLeafValidity(value);

        setErrors(prev => ({ ...prev, [field]: err }));
    };

    const handleSign = async () => {
        const keyErr = form.issuingKeyId ? null : 'Select an Issuing CA key';
        const nameErr = form.name.trim() ? validateDisplayName(form.name) : null;
        const csrErr = validateCsrPem(form.csrPem);
        const validityErr = validateLeafValidity(form.validityDays);

        if (keyErr || nameErr || csrErr || validityErr) {
            setErrors({ issuingKeyId: keyErr, name: nameErr, csrPem: csrErr, validityDays: validityErr });
            toast.error(keyErr || nameErr || csrErr || validityErr);
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            const res = await signCsrInternally(
                form.csrPem,
                form.issuingKeyId,
                form.name || null,
                form.validityDays
            );
            setResult(res);
            setErrors({});
        } catch (_err) {
            // Handled in context/toast
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCert = () => {
        if (!result?.certificatePem) return;
        const blob = new Blob([result.certificatePem], { type: 'application/x-pem-file' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(form.name || 'leaf-cert').replace(/\s+/g, '_')}.pem`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Certificate downloaded');
    };

    const handleDownloadChain = () => {
        if (!result?.chainPem) return;
        const blob = new Blob([result.chainPem], { type: 'application/x-pem-file' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(form.name || 'chain').replace(/\s+/g, '_')}_chain.pem`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Chain PEM downloaded (leaf + ICA + Root)');
    };

    // Only INTERMEDIATE CA keys can sign leaf certs
    const icaKeys = keys.filter(k =>
        k.caType === 'INTERMEDIATE' && (k.status === 'active' || k.status === 'ACTIVE')
    );

    return (
        <div>
            <Card>
                <div className="ica-section-header">
                    <Network size={16} style={{ color: 'var(--color-primary)' }} />
                    <div>
                        <h3 className="ica-section-title">Issue Leaf Certificate</h3>
                        <p className="ica-section-sub">Select an Intermediate CA key to sign the CSR and issue a leaf certificate.</p>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Issuing CA Key <span className="required">*</span></label>
                    <select
                        className={`form-select ${errors.issuingKeyId ? 'form-input-error' : ''}`}
                        value={form.issuingKeyId}
                        onChange={e => handleFormChange('issuingKeyId', e.target.value)}
                    >
                        <option value="">— Select Issuing CA key —</option>
                        {icaKeys.map(k => (
                            <option key={k.id} value={k.id}>{k.name} ({k.algorithm} {k.parameters || 'P-256'})</option>
                        ))}
                    </select>
                    {errors.issuingKeyId && <p className="form-error-msg">{errors.issuingKeyId}</p>}
                    {icaKeys.length === 0 && (
                        <p className="form-hint" style={{ color: 'var(--color-warning)' }}>
                            ⚠ No active Intermediate CA keys found. Go to <strong>Cert Keys</strong> and use the "Issue Intermediate CA" action on a Root CA key first.
                        </p>
                    )}
                    {icaKeys.length > 0 && !errors.issuingKeyId && (
                        <p className="form-hint">
                            Only Intermediate CA (Tier 1) keys are listed here. Root CA keys cannot sign leaf certificates directly.
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Certificate Name</label>
                    <input
                        className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                        placeholder="e.g. api.company.com TLS Cert"
                        value={form.name}
                        onChange={e => handleFormChange('name', e.target.value)}
                    />
                    {errors.name && <p className="form-error-msg">{errors.name}</p>}
                </div>

                <div className="form-group">
                    <label className="form-label">CSR PEM <span className="required">*</span></label>
                    <textarea
                        className={`form-textarea ${errors.csrPem ? 'form-input-error' : ''}`}
                        rows={7}
                        placeholder="-----BEGIN CERTIFICATE REQUEST-----&#10;...&#10;-----END CERTIFICATE REQUEST-----"
                        value={form.csrPem}
                        onChange={e => handleFormChange('csrPem', e.target.value)}
                    />
                    {errors.csrPem ? (
                        <p className="form-error-msg">{errors.csrPem}</p>
                    ) : (
                        <p className="form-hint">Paste a CSR generated from the Generate CSR page or any external tool.</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Validity (Days)</label>
                    <input
                        className={`form-input ${errors.validityDays ? 'form-input-error' : ''}`}
                        type="number"
                        value={form.validityDays}
                        min={1}
                        max={825}
                        onChange={e => handleFormChange('validityDays', e.target.value)}
                    />
                    {errors.validityDays ? (
                        <p className="form-error-msg">{errors.validityDays}</p>
                    ) : (
                        <p className="form-hint">Maximum 825 days (~2 years) — industry best practice for leaf certs.</p>
                    )}
                </div>

                <div className="ica-form-footer">
                    <Button variant="primary" onClick={handleSign} disabled={loading || icaKeys.length === 0}>
                        {loading ? <><Spinner /> Signing…</> : <><Zap size={16} /> Issue Certificate</>}
                    </Button>
                </div>

                {result && (
                    <div className="ica-result">
                        <div className="ica-result-header">
                            <Check size={16} style={{ color: 'var(--color-success)' }} />
                            <span>Certificate Issued Successfully</span>
                        </div>
                        <div className="csr-output">{result.certificatePem}</div>
                        {result.chainPem && (
                            <div className="ica-chain-note">
                                Chain PEM available: leaf + Intermediate CA + Root CA
                            </div>
                        )}
                        <div className="ica-result-actions">
                            <Button variant="secondary" size="sm" onClick={() => {
                                navigator.clipboard.writeText(result.certificatePem);
                                toast.success('Certificate PEM copied');
                            }}>
                                <Copy size={12} /> Copy PEM
                            </Button>
                            <Button variant="secondary" size="sm" onClick={handleDownloadCert}>
                                <Download size={12} /> Download Cert
                            </Button>
                            {result.chainPem && (
                                <Button variant="secondary" size="sm" onClick={handleDownloadChain}>
                                    <Download size={12} /> Download Full Chain
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Card>

            {/* How It Works */}
            <div className="ica-info-card">
                <h3 className="ica-info-title">
                    <Shield size={16} style={{ color: 'var(--color-primary)' }} />
                    How Leaf Certificate Issuance Works
                </h3>
                <div className="ica-steps">
                    {[
                        ['Create an end-entity key', 'Go to Cert Keys and create a key with caType: NONE.'],
                        ['Generate a CSR', 'Use the Generate CSR page to create a certificate signing request.'],
                        ['Select Issuing CA key', 'The Intermediate CA (Tier 1) key signs the leaf certificate.'],
                        ['Certificate is issued', 'Chain is built automatically: leaf + ICA cert + Root cert.'],
                    ].map(([step, desc], i) => (
                        <div key={i} className="ica-step">
                            <div className="ica-step-num">{i + 1}</div>
                            <div>
                                <div className="ica-step-title">{step}</div>
                                <div className="ica-step-desc">{desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ── Tab: Issue Intermediate CA ────────────────────────────────────────────────
const IssueICATab = ({ keys, issueIntermediate }) => {
    const [form, setForm] = useState({
        rootKeyId: '',
        name: '',
        subjectDN: '',
        validityDays: 1825,
    });
    const [errors, setErrors] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFormChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        
        let err = null;
        if (field === 'rootKeyId') err = value ? null : 'Select a Root CA key';
        if (field === 'name') err = validateDisplayName(value);
        if (field === 'subjectDN') err = validateSubjectDN(value);
        if (field === 'validityDays') err = validateICAValidity(value);

        setErrors(prev => ({ ...prev, [field]: err }));
    };

    const handleIssue = async () => {
        const keyErr = form.rootKeyId ? null : 'Select a Root CA key';
        const nameErr = validateDisplayName(form.name);
        const dnErr = validateSubjectDN(form.subjectDN);
        const validityErr = validateICAValidity(form.validityDays);

        if (keyErr || nameErr || dnErr || validityErr) {
            setErrors({ rootKeyId: keyErr, name: nameErr, subjectDN: dnErr, validityDays: validityErr });
            toast.error(keyErr || nameErr || dnErr || validityErr);
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            const res = await issueIntermediate(form.rootKeyId, {
                name: form.name,
                subjectDN: form.subjectDN,
                validityDays: parseInt(form.validityDays) || 1825
            });
            setResult(res);
            setErrors({});
        } catch (_err) {
            // Handled in context/toast
        } finally {
            setLoading(false);
        }
    };

    // Only ROOT CA keys can issue Intermediate CAs
    const rootKeys = keys.filter(k =>
        k.caType === 'ROOT' && (k.status === 'active' || k.status === 'ACTIVE')
    );

    return (
        <div>
            <Card>
                <div className="ica-section-header">
                    <Crown size={16} style={{ color: '#a855f7' }} />
                    <div>
                        <h3 className="ica-section-title">Issue Intermediate CA</h3>
                        <p className="ica-section-sub">Create a new Intermediate CA key and certificate signed by a Root CA.</p>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Root CA Key <span className="required">*</span></label>
                    <select
                        className={`form-select ${errors.rootKeyId ? 'form-input-error' : ''}`}
                        value={form.rootKeyId}
                        onChange={e => handleFormChange('rootKeyId', e.target.value)}
                    >
                        <option value="">— Select Root CA key —</option>
                        {rootKeys.map(k => (
                            <option key={k.id} value={k.id}>{k.name} ({k.algorithm} {k.parameters || 'P-256'})</option>
                        ))}
                    </select>
                    {errors.rootKeyId && <p className="form-error-msg">{errors.rootKeyId}</p>}
                    {rootKeys.length === 0 && (
                        <p className="form-hint" style={{ color: 'var(--color-error)' }}>
                            ⚠ No active Root CA keys found. The Root CA is created automatically on server startup. Check your backend seed.
                        </p>
                    )}
                    {rootKeys.length > 0 && !errors.rootKeyId && (
                        <p className="form-hint">Only Root CA (Tier 0) keys are listed. Currently one active ICA per Root is allowed.</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Intermediate CA Name <span className="required">*</span></label>
                    <input
                        className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                        placeholder="e.g. QuantumVault Issuing CA G2"
                        value={form.name}
                        onChange={e => handleFormChange('name', e.target.value)}
                    />
                    {errors.name ? (
                        <p className="form-error-msg">{errors.name}</p>
                    ) : (
                        <p className="form-hint">Display name for this Intermediate CA key record.</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Subject DN <span className="required">*</span></label>
                    <input
                        className={`form-input ${errors.subjectDN ? 'form-input-error' : ''}`}
                        placeholder="CN=QuantumVault Issuing CA G2,O=QuantumVault,C=US"
                        value={form.subjectDN}
                        onChange={e => handleFormChange('subjectDN', e.target.value)}
                    />
                    {errors.subjectDN ? (
                        <p className="form-error-msg">{errors.subjectDN}</p>
                    ) : (
                        <p className="form-hint">X.509 Distinguished Name embedded in the ICA certificate.</p>
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
                    />
                    {errors.validityDays ? (
                        <p className="form-error-msg">{errors.validityDays}</p>
                    ) : (
                        <p className="form-hint">Maximum 1825 days (5 years). The backend enforces this cap.</p>
                    )}
                </div>

                <div className="ica-form-footer">
                    <Button variant="primary" onClick={handleIssue} disabled={loading || rootKeys.length === 0}>
                        {loading ? <><Spinner /> Issuing…</> : <><GitBranch size={16} /> Issue Intermediate CA</>}
                    </Button>
                </div>

                {result && (
                    <div className="ica-result">
                        <div className="ica-result-header">
                            <Check size={16} style={{ color: 'var(--color-success)' }} />
                            <span>Intermediate CA Issued Successfully</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                            <strong>Key ID:</strong> {result.key?.id} — <strong>Cert ID:</strong> {result.cert?.id}
                        </div>
                        <div className="csr-output">{result.cert?.certificatePem || result.chain?.[0]}</div>
                        <div className="ica-result-actions">
                            <Button variant="secondary" size="sm" onClick={() => {
                                const pem = result.cert?.certificatePem || result.chain?.[0] || '';
                                navigator.clipboard.writeText(pem);
                                toast.success('ICA Certificate PEM copied');
                            }}>
                                <Copy size={12} /> Copy ICA Cert
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Info card */}
            <div className="ica-info-card">
                <h3 className="ica-info-title">
                    <Crown size={16} style={{ color: '#a855f7' }} />
                    3-Tier CA Hierarchy — How It Works
                </h3>
                <div className="ica-hierarchy-visual">
                    <div className="ica-hv-node ica-hv-node--root">
                        <Crown size={14} />
                        <div>
                            <div className="ica-hv-node-title">Root CA (Tier 0)</div>
                            <div className="ica-hv-node-sub">Self-signed · 10yr · Created at startup</div>
                        </div>
                    </div>
                    <div className="ica-hv-connector">
                        <ChevronRight size={14} />
                        <span>Signs</span>
                    </div>
                    <div className="ica-hv-node ica-hv-node--ica">
                        <Network size={14} />
                        <div>
                            <div className="ica-hv-node-title">Intermediate CA (Tier 1)</div>
                            <div className="ica-hv-node-sub">Signed by Root · 5yr max · Issue here</div>
                        </div>
                    </div>
                    <div className="ica-hv-connector">
                        <ChevronRight size={14} />
                        <span>Signs</span>
                    </div>
                    <div className="ica-hv-node ica-hv-node--leaf">
                        <Shield size={14} />
                        <div>
                            <div className="ica-hv-node-title">Leaf Certificate (Tier 2)</div>
                            <div className="ica-hv-node-sub">Signed by ICA · 825 days max</div>
                        </div>
                    </div>
                </div>
                <div className="ica-steps" style={{ marginTop: 16 }}>
                    {[
                        ['Root CA is created at startup', 'The backend seed creates the Root CA key and self-signed cert automatically.'],
                        ['Issue Intermediate CA here', 'Use this tab to create an ICA signed by the Root CA.'],
                        ['Use ICA to sign leaf certs', 'Switch to the "Issue Leaf Certificate" tab and select the ICA key.'],
                        ['Download the trust chain', 'Every leaf cert has a chain: leaf + ICA + Root — download it from Certificates page.'],
                    ].map(([step, desc], i) => (
                        <div key={i} className="ica-step">
                            <div className="ica-step-num">{i + 1}</div>
                            <div>
                                <div className="ica-step-title">{step}</div>
                                <div className="ica-step-desc">{desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const InternalCAPage = () => {
    const { keys, signCsrInternally, issueIntermediate } = useCert();
    const [activeTab, setActiveTab] = useState('leaf');

    return (
        <div className="page">
            <PageHeader
                title="Internal CA"
                subtitle="Sign CSRs and manage the 3-tier PKI hierarchy — Root CA → Intermediate CA → Leaf Certificate"
                action={<span className="info-chip"><Shield size={12} /> QuantumVault CA</span>}
            />

            <div className="page-content" style={{ maxWidth: 760 }}>
                {/* Tab Bar */}
                <div className="ica-tabs">
                    <button
                        className={`ica-tab ${activeTab === 'leaf' ? 'ica-tab--active' : ''}`}
                        onClick={() => setActiveTab('leaf')}
                    >
                        <Network size={15} />
                        Issue Leaf Certificate
                    </button>
                    <button
                        className={`ica-tab ${activeTab === 'ica' ? 'ica-tab--active' : ''}`}
                        onClick={() => setActiveTab('ica')}
                    >
                        <Crown size={15} />
                        Issue Intermediate CA
                    </button>
                </div>

                {activeTab === 'leaf' ? (
                    <IssueLeafTab keys={keys} signCsrInternally={signCsrInternally} />
                ) : (
                    <IssueICATab keys={keys} issueIntermediate={issueIntermediate} />
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .ica-spinner {
                    width: 14px; height: 14px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                    display: inline-block;
                    flex-shrink: 0;
                }
            `}</style>
        </div>
    );
};

export default InternalCAPage;
