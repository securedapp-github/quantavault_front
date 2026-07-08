import React, { useState } from 'react';
import { ScrollText, Copy, Check, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { useCert } from '../context/cert.CertContext';
import { validateCN, validateO, validateC, validateSANs } from '../utils/cert.validation';
import { 
    KEY_USAGE_OPTIONS, 
    EKU_OPTIONS, 
    CERT_PROFILES, 
    detectProfile, 
    checkEkuCompatibility 
} from '../utils/cert.certProfiles';
import '../styles/cert.shared.css';

const GenerateCSRPage = () => {
    const { keys, generateCSR } = useCert();
    const [form, setForm] = useState({
        keyId: '',
        commonName: '',
        organizationName: '',
        country: '',
        sans: '',
        selectedKus: [],
        selectedEkus: [],
        validityDays: 365,
    });
    
    const [errors, setErrors] = useState({});
    const [csrOutput, setCsrOutput] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [manuallyModifiedKus, setManuallyModifiedKus] = useState(false);

    const handleFormChange = (field, value) => {
        let normalizedValue = value;
        if (field === 'country') {
            normalizedValue = value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
        }

        setForm(prev => ({ ...prev, [field]: normalizedValue }));

        let err = null;
        if (field === 'keyId') err = normalizedValue ? null : 'Key selection is required';
        if (field === 'commonName') err = validateCN(normalizedValue);
        if (field === 'organizationName') err = validateO(normalizedValue);
        if (field === 'country') err = validateC(normalizedValue);
        if (field === 'sans') err = validateSANs(normalizedValue);

        setErrors(prev => ({ ...prev, [field]: err }));
    };

    const handleEkuChange = (ekuValue, checked) => {
        let newEkus = [...form.selectedEkus];
        if (checked) {
            newEkus.push(ekuValue);
        } else {
            newEkus = newEkus.filter(e => e !== ekuValue);
        }

        const profileKey = detectProfile(newEkus);
        const profile = profileKey ? CERT_PROFILES[profileKey] : null;

        let newKus = [...form.selectedKus];
        if (profile && profileKey !== 'CUSTOM' && !manuallyModifiedKus) {
            newKus = profile.recommendedKus || [];
        } else if (!profile) {
            if (!manuallyModifiedKus) newKus = [];
        }

        let newValidity = form.validityDays;
        const maxVal = profile ? profile.maxValidityDays : 825;
        if (newValidity > maxVal) {
            newValidity = maxVal;
        }

        setForm(prev => ({
            ...prev,
            selectedEkus: newEkus,
            selectedKus: newKus,
            validityDays: newValidity
        }));

        const compWarning = checkEkuCompatibility(newEkus);
        setErrors(prev => ({
            ...prev,
            ekuCompatibility: compWarning,
            validityDays: null
        }));
    };

    const handleKuChange = (kuValue, checked) => {
        setManuallyModifiedKus(true);
        setForm(prev => {
            let newKus = [...prev.selectedKus];
            if (checked) {
                newKus.push(kuValue);
            } else {
                newKus = newKus.filter(k => k !== kuValue);
            }
            return { ...prev, selectedKus: newKus };
        });
    };

    const handleValidityChange = (e) => {
        const val = parseInt(e.target.value) || 0;
        setForm(prev => ({ ...prev, validityDays: val }));

        const profileKey = detectProfile(form.selectedEkus);
        const profile = profileKey ? CERT_PROFILES[profileKey] : null;
        const maxVal = profile ? profile.maxValidityDays : 825;

        let err = null;
        if (val < 1) {
            err = 'Validity must be at least 1 day';
        } else if (val > maxVal) {
            err = `Validity must be between 1 and ${maxVal} days for the detected profile`;
        }

        setErrors(prev => ({ ...prev, validityDays: err }));
    };

    const handleGenerate = async () => {
        const keyErr = form.keyId ? null : 'Key selection is required';
        const cnErr = validateCN(form.commonName);
        const oErr = validateO(form.organizationName);
        const cErr = validateC(form.country);
        const sansErr = validateSANs(form.sans);

        const profileKey = detectProfile(form.selectedEkus);
        const profile = profileKey ? CERT_PROFILES[profileKey] : null;
        const maxVal = profile ? profile.maxValidityDays : 825;

        let valErr = null;
        if (form.validityDays < 1 || form.validityDays > maxVal) {
            valErr = `Validity days must be between 1 and ${maxVal}`;
        }

        if (keyErr || cnErr || oErr || cErr || sansErr || valErr) {
            setErrors({ 
                keyId: keyErr, 
                commonName: cnErr, 
                organizationName: oErr, 
                country: cErr, 
                sans: sansErr,
                validityDays: valErr 
            });
            toast.error(keyErr || cnErr || oErr || cErr || sansErr || valErr);
            return;
        }

        if (profileKey === 'TLS_SERVER' && !form.sans.trim()) {
            const sanErrMsg = 'SAN (Subject Alternative Name) is strictly required for TLS Server certificates.';
            setErrors(prev => ({ ...prev, sans: sanErrMsg }));
            toast.error(sanErrMsg);
            return;
        }

        const compWarning = checkEkuCompatibility(form.selectedEkus);
        if (compWarning) {
            const proceed = window.confirm(`${compWarning}\n\nDo you want to proceed with this non-standard profile configuration?`);
            if (!proceed) return;
        }

        setLoading(true);
        try {
            const dnComponents = [];
            dnComponents.push(`CN=${form.commonName.trim()}`);
            if (form.organizationName.trim()) dnComponents.push(`O=${form.organizationName.trim()}`);
            if (form.country.trim()) dnComponents.push(`C=${form.country.trim().toUpperCase()}`);
            const subjectDN = dnComponents.join(',');

            const result = await generateCSR(form.keyId, {
                subjectDN,
                sans: form.sans,
                keyUsage: form.selectedKus.join(','),
                extendedKeyUsage: form.selectedEkus.join(',')
            });
            setCsrOutput(result.csr);
            setErrors({});
        } catch (err) {
            // Error logged by context/toast
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
        setForm({
            keyId: '',
            commonName: '',
            organizationName: '',
            country: '',
            sans: '',
            selectedKus: [],
            selectedEkus: [],
            validityDays: 365,
        });
        setErrors({});
        setCsrOutput('');
        setManuallyModifiedKus(false);
        toast.success('Form cleared');
    };

    const activeKeys = keys.filter(
        k => (k.status === 'active' || k.status === 'ACTIVE') && k.caType !== 'ROOT'
    );

    const dnComponentsPreview = [];
    if (form.commonName) dnComponentsPreview.push(`CN=${form.commonName}`);
    if (form.organizationName) dnComponentsPreview.push(`O=${form.organizationName}`);
    if (form.country) dnComponentsPreview.push(`C=${form.country}`);
    const dnPreview = dnComponentsPreview.join(', ') || 'CN=—';

    const detectedProfileKey = detectProfile(form.selectedEkus);
    const isTlsServer = detectedProfileKey === 'TLS_SERVER';
    const profileMetadata = detectedProfileKey ? CERT_PROFILES[detectedProfileKey] : null;

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

                    <section style={{ margin: '24px 0', borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
                        <h4 style={{ margin: '0 0 16px 0', color: 'var(--color-text-primary)' }}>Subject Identity (Distinguished Name)</h4>
                        
                        <div className="form-group">
                            <label className="form-label">Common Name (CN) <span className="required">*</span></label>
                            <input
                                type="text"
                                className={`form-input ${errors.commonName ? 'form-input-error' : ''}`}
                                placeholder="e.g. api.company.com"
                                value={form.commonName}
                                onChange={e => handleFormChange('commonName', e.target.value)}
                            />
                            {errors.commonName && <p className="form-error-msg">{errors.commonName}</p>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Organization (O)</label>
                            <input
                                type="text"
                                className={`form-input ${errors.organizationName ? 'form-input-error' : ''}`}
                                placeholder="e.g. Acme Corporation"
                                value={form.organizationName}
                                onChange={e => handleFormChange('organizationName', e.target.value)}
                            />
                            {errors.organizationName && <p className="form-error-msg">{errors.organizationName}</p>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Country Code (C)</label>
                            <input
                                type="text"
                                className={`form-input ${errors.country ? 'form-input-error' : ''}`}
                                placeholder="e.g. US, IN, GB"
                                value={form.country}
                                onChange={e => handleFormChange('country', e.target.value)}
                                style={{ textTransform: 'uppercase' }}
                            />
                            {errors.country && <p className="form-error-msg">{errors.country}</p>}
                        </div>

                        <div style={{ 
                            background: 'var(--color-bg-tertiary)', 
                            border: '1px solid var(--color-border)', 
                            borderRadius: 'var(--radius-md)', 
                            padding: '12px 14px', 
                            marginTop: 16
                        }}>
                            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 4, fontWeight: 700 }}>
                                Subject DN Preview
                            </div>
                            <div style={{ fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>
                                {dnPreview}
                            </div>
                        </div>
                    </section>

                    <section style={{ margin: '24px 0', borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
                        <h4 style={{ margin: '0 0 4px 0', color: 'var(--color-text-primary)' }}>Extended Key Usages (EKU)</h4>
                        <p className="form-hint" style={{ marginBottom: 14 }}>Select usages to identify the certificate profile. Recommended KUs will auto-fill.</p>
                        
                        <div className="checkbox-grid">
                            {EKU_OPTIONS.map(opt => {
                                const isChecked = form.selectedEkus.includes(opt.value);
                                return (
                                    <label key={opt.value} className={`checkbox-item ${isChecked ? 'checked' : ''}`}>
                                        <input
                                            type="checkbox"
                                            className="checkbox-input"
                                            checked={isChecked}
                                            onChange={e => handleEkuChange(opt.value, e.target.checked)}
                                        />
                                        <div className="checkbox-label-container">
                                            <span className="checkbox-label-title">{opt.label}</span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>

                        {profileMetadata && detectedProfileKey !== 'CUSTOM' && (
                            <div className="profile-banner" style={{ marginTop: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ShieldCheck size={16} style={{ color: 'var(--color-success)' }} />
                                    <span className="profile-banner-title">{profileMetadata.name} Profile Detected</span>
                                </div>
                                <span className="profile-banner-desc">{profileMetadata.hint} Recommended Key Usages auto-applied.</span>
                            </div>
                        )}

                        {errors.ekuCompatibility && (
                            <div className="warning-banner" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <AlertTriangle size={16} />
                                <span>{errors.ekuCompatibility}</span>
                            </div>
                        )}
                    </section>

                    <section style={{ margin: '24px 0', borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
                        <h4 style={{ margin: '0 0 4px 0', color: 'var(--color-text-primary)' }}>Key Usages (KU)</h4>
                        <p className="form-hint" style={{ marginBottom: 14 }}>Define how the private key can be used under the X.509 standard.</p>
                        
                        <div className="checkbox-grid">
                            {KEY_USAGE_OPTIONS.map(opt => {
                                const isChecked = form.selectedKus.includes(opt.value);
                                return (
                                    <label key={opt.value} className={`checkbox-item ${isChecked ? 'checked' : ''}`}>
                                        <input
                                            type="checkbox"
                                            className="checkbox-input"
                                            checked={isChecked}
                                            onChange={e => handleKuChange(opt.value, e.target.checked)}
                                        />
                                        <div className="checkbox-label-container">
                                            <span className="checkbox-label-title">{opt.label}</span>
                                            <span className="checkbox-label-desc">{opt.desc}</span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </section>

                    <div className="form-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
                        <label className="form-label">Subject Alternative Names (SANs) {isTlsServer && <span className="required">*</span>}</label>
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

                        {isTlsServer && !form.sans.trim() && (
                            <div className="san-warning" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <AlertTriangle size={15} />
                                <span>Subject Alternative Name (SAN) is required for TLS Server certificates.</span>
                            </div>
                        )}
                    </div>

                    <div className="form-group" style={{ marginBottom: 24 }}>
                        <label className="form-label">Validity Period Request (Days)</label>
                        <input
                            type="number"
                            className={`form-input ${errors.validityDays ? 'form-input-error' : ''}`}
                            value={form.validityDays}
                            onChange={handleValidityChange}
                        />
                        {errors.validityDays ? (
                            <p className="form-error-msg">{errors.validityDays}</p>
                        ) : (
                            <p className="form-hint">
                                Recommended Maximum: {profileMetadata ? profileMetadata.maxValidityDays : 825} days.
                            </p>
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

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .checkbox-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 12px;
                    margin-top: 8px;
                }
                .checkbox-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    padding: 10px 12px;
                    background: var(--color-bg-tertiary);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .checkbox-item:hover {
                    border-color: var(--color-primary);
                    background: rgba(0, 168, 255, 0.03);
                }
                .checkbox-item.checked {
                    border-color: var(--color-primary);
                    background: rgba(0, 168, 255, 0.06);
                }
                .checkbox-input {
                    margin-top: 3px;
                    cursor: pointer;
                }
                .checkbox-label-container {
                    display: flex;
                    flex-direction: column;
                }
                .checkbox-label-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--color-text-primary);
                }
                .checkbox-label-desc {
                    font-size: 11px;
                    color: var(--color-text-muted);
                    margin-top: 2px;
                    line-height: 1.3;
                }
                .profile-banner {
                    background: rgba(0, 208, 132, 0.08);
                    border: 1px solid rgba(0, 208, 132, 0.3);
                    border-radius: var(--radius-md);
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .profile-banner-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--color-success);
                }
                .profile-banner-desc {
                    font-size: 11.5px;
                    color: var(--color-text-secondary);
                }
                .warning-banner {
                    background: rgba(255, 176, 32, 0.08);
                    border: 1px solid rgba(255, 176, 32, 0.3);
                    border-radius: var(--radius-md);
                    padding: 10px 12px;
                    font-size: 12px;
                    color: var(--color-warning);
                }
                .san-warning {
                    background: rgba(255, 71, 87, 0.08);
                    border: 1px solid rgba(255, 71, 87, 0.3);
                    border-radius: var(--radius-md);
                    padding: 10px 12px;
                    font-size: 12px;
                    color: var(--color-error);
                }
            `}</style>
        </div>
    );
};

export default GenerateCSRPage;
