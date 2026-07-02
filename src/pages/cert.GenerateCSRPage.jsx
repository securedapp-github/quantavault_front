import React, { useState } from 'react';
import { ScrollText, Copy, Check, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { useCert } from '../context/cert.CertContext';
import { validateSubjectDN, validateSANs, validateKeyUsages, validateEKUs } from '../utils/cert.validation';
import '../styles/cert.shared.css';

const GenerateCSRPage = () => {
    const { keys, generateCSR } = useCert();
    const [form, setForm] = useState({
        keyId: '',
        subjectDN: '',
        sans: '',
        keyUsage: '',
        eku: '',
    });
    const [errors, setErrors] = useState({});
    const [csrOutput, setCsrOutput] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFormChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));

        let err = null;
        if (field === 'keyId') err = value ? null : 'Key selection is required';
        if (field === 'subjectDN') err = validateSubjectDN(value);
        if (field === 'sans') err = validateSANs(value);
        if (field === 'keyUsage') err = validateKeyUsages(value);
        if (field === 'eku') err = validateEKUs(value);

        setErrors(prev => ({ ...prev, [field]: err }));
    };

    const handleGenerate = async () => {
        const keyErr = form.keyId ? null : 'Key selection is required';
        const dnErr = validateSubjectDN(form.subjectDN);
        const sansErr = validateSANs(form.sans);
        const kuErr = validateKeyUsages(form.keyUsage);
        const ekuErr = validateEKUs(form.eku);

        if (keyErr || dnErr || sansErr || kuErr || ekuErr) {
            setErrors({ keyId: keyErr, subjectDN: dnErr, sans: sansErr, keyUsage: kuErr, eku: ekuErr });
            toast.error(keyErr || dnErr || sansErr || kuErr || ekuErr);
            return;
        }

        setLoading(true);
        try {
            const result = await generateCSR(form.keyId, {
                subjectDN: form.subjectDN,
                sans: form.sans,
                keyUsage: form.keyUsage,
                extendedKeyUsage: form.eku
            });
            setCsrOutput(result.csr);
            setErrors({});
        } catch (err) {
            // Error is handled in context/toast
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!csrOutput) return;
        navigator.clipboard.writeText(csrOutput);
        setCopied(true);
        toast.success('CSR copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClear = () => {
        setForm({ keyId: '', subjectDN: '', sans: '', keyUsage: '', eku: '' });
        setErrors({});
        setCsrOutput('');
        toast.success('Form cleared');
    };

    // Filter to active keys only, excluding ROOT CA keys (only INTERMEDIATE and NONE/leaf can generate CSR)
    const activeKeys = keys.filter(
        k => (k.status === 'active' || k.status === 'ACTIVE') && k.caType !== 'ROOT'
    );

    return (
        <div className="page">
            <PageHeader
                title="Generate CSR"
                subtitle="Generate a Certificate Signing Request from a key stored in QuantumVault"
                action={<span className="info-chip">🔒 Signed inside HSM</span>}
            />

            <div className="page-content" style={{ maxWidth: 720 }}>
                <Card>
                    <div className="form-group">
                        <label className="form-label">Key <span className="required">*</span></label>
                        <select
                            className={`form-select ${errors.keyId ? 'form-input-error' : ''}`}
                            value={form.keyId}
                            onChange={e => handleFormChange('keyId', e.target.value)}
                        >
                            <option value="">— Select a key —</option>
                            {activeKeys.map(k => (
                                <option key={k.id} value={k.id}>{k.name} ({k.algorithm} {k.parameters || 'P-256'})</option>
                            ))}
                        </select>
                        {errors.keyId && <p className="form-error-msg">{errors.keyId}</p>}
                        {activeKeys.length === 0 && (
                            <p className="form-hint" style={{ color: 'var(--color-warning)', marginTop: 8 }}>
                                ⚠ No active signing keys found. Go to <strong>Cert Keys</strong> and create a key or issue an Intermediate CA first.
                            </p>
                        )}
                        {activeKeys.length > 0 && !errors.keyId && (
                            <p className="form-hint">The private key stays in the HSM. Only the public key is embedded in the CSR.</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Subject DN <span className="required">*</span></label>
                        <input
                            className={`form-input ${errors.subjectDN ? 'form-input-error' : ''}`}
                            placeholder="CN=api.company.com,O=Company,C=US"
                            value={form.subjectDN}
                            onChange={e => handleFormChange('subjectDN', e.target.value)}
                        />
                        {errors.subjectDN ? (
                            <p className="form-error-msg">{errors.subjectDN}</p>
                        ) : (
                            <p className="form-hint">Distinguished Name — e.g. CN=domain.com,O=Org,C=US</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Subject Alternative Names (SANs)</label>
                        <input
                            className={`form-input ${errors.sans ? 'form-input-error' : ''}`}
                            placeholder="api.company.com, www.company.com (comma-separated)"
                            value={form.sans}
                            onChange={e => handleFormChange('sans', e.target.value)}
                        />
                        {errors.sans ? (
                            <p className="form-error-msg">{errors.sans}</p>
                        ) : (
                            <p className="form-hint">DNS names, IPs, or email addresses separated by commas.</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Key Usage</label>
                        <input
                            className={`form-input ${errors.keyUsage ? 'form-input-error' : ''}`}
                            placeholder="DigitalSignature, KeyEncipherment (comma-separated)"
                            value={form.keyUsage}
                            onChange={e => handleFormChange('keyUsage', e.target.value)}
                        />
                        {errors.keyUsage && <p className="form-error-msg">{errors.keyUsage}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Extended Key Usage (EKU)</label>
                        <input
                            className={`form-input ${errors.eku ? 'form-input-error' : ''}`}
                            placeholder="ServerAuth, ClientAuth, CodeSigning (comma-separated)"
                            value={form.eku}
                            onChange={e => handleFormChange('eku', e.target.value)}
                        />
                        {errors.eku ? (
                            <p className="form-error-msg">{errors.eku}</p>
                        ) : (
                            <p className="form-hint">Supported: ServerAuth · ClientAuth · CodeSigning · EmailProtection · TimeStamping · OCSPSigning</p>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--color-border)', marginTop: 8 }}>
                        <Button variant="secondary" onClick={handleClear}>Clear</Button>
                        <Button variant="primary" onClick={handleGenerate} disabled={loading}>
                            {loading ? (
                                <>
                                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                                    Generating…
                                </>
                            ) : (
                                <><Zap size={16} /> Generate CSR</>
                            )}
                        </Button>
                    </div>

                    {csrOutput && (
                        <div style={{ marginTop: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-success)' }}>
                                    CSR Output
                                </span>
                                <Button variant="secondary" size="sm" onClick={handleCopy}>
                                    {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                                </Button>
                            </div>
                            <div className="csr-output">{csrOutput}</div>
                            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8, marginBottom: 0 }}>
                                Submit this CSR to your external CA, or use the <strong style={{ color: 'var(--color-text-secondary)' }}>Internal CA</strong> tab to sign it inside QuantumVault.
                            </p>
                        </div>
                    )}
                </Card>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default GenerateCSRPage;
