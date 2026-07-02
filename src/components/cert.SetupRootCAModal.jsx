import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { useCert } from '../context/cert.CertContext';
import toast from 'react-hot-toast';

const SetupRootCAModal = () => {
    const { setupRootCA, loading: contextLoading } = useCert();
    const [form, setForm] = useState({
        commonName: '',
        organizationName: '',
        country: ''
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleCountryChange = (e) => {
        const val = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
        setForm(prev => ({ ...prev, country: val }));
    };

    const validate = () => {
        const errs = {};
        if (!form.commonName.trim()) {
            errs.commonName = 'Root CA Name (Common Name) is required';
        } else if (form.commonName.length > 64) {
            errs.commonName = 'Max length is 64 characters';
        }

        if (!form.organizationName.trim()) {
            errs.organizationName = 'Organization Name is required';
        } else if (form.organizationName.length > 64) {
            errs.organizationName = 'Max length is 64 characters';
        }

        if (form.country && form.country.length !== 2) {
            errs.country = 'Country code must be exactly 2 characters';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            await setupRootCA({
                commonName: form.commonName.trim(),
                organizationName: form.organizationName.trim(),
                country: form.country.trim()
            });
            // Success toast is already handled in CertContext.jsx
        } catch (err) {
            toast.error(err.message || 'Failed to setup Root CA');
        } finally {
            setSubmitting(false);
        }
    };

    const dnPreview = `CN=${form.commonName || '—'}, O=${form.organizationName || '—'}, C=${form.country || '—'}`;

    return (
        <Modal
            isOpen={true}
            onClose={() => {}}
            title="Setup Root Certificate Authority (CA)"
            hideClose={true}
            size="medium"
        >
            <div style={{ padding: '4px 0' }}>
                <p className="form-hint" style={{ marginBottom: 20, fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
                    To enable certificate manager operations, you must first initialize your HSM partition with a self-signed Root CA. 
                    This Root CA will act as the trust anchor for all internal intermediate and leaf certificates.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Root CA Name (Common Name) <span className="required">*</span></label>
                        <input
                            type="text"
                            className={`form-input ${errors.commonName ? 'form-input-error' : ''}`}
                            placeholder="e.g. Acme Corp Root CA G1"
                            maxLength={64}
                            value={form.commonName}
                            onChange={e => setForm(prev => ({ ...prev, commonName: e.target.value }))}
                            disabled={submitting}
                        />
                        {errors.commonName ? (
                            <p className="form-error-msg">{errors.commonName}</p>
                        ) : (
                            <p className="form-hint">Used as the primary identity (CN) of your Root CA</p>
                        )}
                    </div>

                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Organization <span className="required">*</span></label>
                        <input
                            type="text"
                            className={`form-input ${errors.organizationName ? 'form-input-error' : ''}`}
                            placeholder="e.g. Acme Corporation"
                            maxLength={64}
                            value={form.organizationName}
                            onChange={e => setForm(prev => ({ ...prev, organizationName: e.target.value }))}
                            disabled={submitting}
                        />
                        {errors.organizationName ? (
                            <p className="form-error-msg">{errors.organizationName}</p>
                        ) : (
                            <p className="form-hint">Organization Name (O) for the certificate Subject</p>
                        )}
                    </div>

                    <div className="form-group" style={{ marginBottom: 20 }}>
                        <label className="form-label">Country Code (Optional)</label>
                        <input
                            type="text"
                            className={`form-input ${errors.country ? 'form-input-error' : ''}`}
                            placeholder="e.g. IN, US, GB"
                            maxLength={2}
                            value={form.country}
                            onChange={handleCountryChange}
                            disabled={submitting}
                            style={{ textTransform: 'uppercase' }}
                        />
                        {errors.country ? (
                            <p className="form-error-msg">{errors.country}</p>
                        ) : (
                            <p className="form-hint">Two-letter ISO country code (C), automatically capitalized</p>
                        )}
                    </div>

                    {/* DN Preview Box */}
                    <div style={{ 
                        background: 'var(--color-bg-tertiary)', 
                        border: '1px solid var(--color-border)', 
                        borderRadius: 'var(--radius-md)', 
                        padding: '14px', 
                        marginBottom: 24 
                    }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 6, fontWeight: 600 }}>
                            Subject DN Preview
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--color-text-primary)', wordBreak: 'break-all' }}>
                            {dnPreview}
                        </div>
                    </div>

                    {/* Form Action */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Generating Root CA Key & Cert...' : 'Initialize Root CA'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default SetupRootCAModal;
