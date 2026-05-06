import React, { useState, useEffect } from 'react';
import { Download, Upload, Check, ChevronRight, ChevronLeft, Key } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';
import { formatFingerprint } from '../utils/fingerprintFormatter';
import { validateName, truncateName } from '../utils/validation';
import './CreateAuthenticationKeyModal.css';
import './Modal.css';

const CreateAuthenticationKeyModal = ({ isOpen, onClose, onCreate, existingKeys = [] }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        algorithm: 'RSA',
        source: 'upload', // 'upload' or 'generate'
        publicKey: '',
        publicKey1: '', // For Hybrid ML-DSA component
        publicKey2: '', // For Hybrid ECDSA component
        privateKey: '', // Only for generated
    });
    const [isCreating, setIsCreating] = useState(false);
    const [createdKey, setCreatedKey] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                setStep(1);
                    setFormData({
                        name: '',
                        algorithm: 'RSA',
                        source: 'upload',
                        publicKey: '',
                        publicKey1: '',
                        publicKey2: '',
                        privateKey: '',
                    });
                setCreatedKey(null);
                setError(null);
                setIsCreating(false);
            }, 0);
        }
    }, [isOpen]);

    const isDuplicateName = existingKeys.some(key => 
        key.name.toLowerCase() === formData.name.trim().toLowerCase()
    );

    const isNameInvalid = !validateName(formData.name);

    if (!isOpen) return null;

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleCreate = async () => {
        setIsCreating(true);
        setError(null);
        try {
            let payload = {
                name: formData.name,
                algorithm: formData.algorithm,
            };

            if (formData.source === 'upload') {
                if (formData.algorithm === 'Hybrid') {
                    payload.publicKey = formData.publicKey2; // ECDSA (Classical)
                    payload.publicKeyDsa = formData.publicKey1; // ML-DSA (PQC)
                } else if (formData.algorithm === 'ML-DSA') {
                    payload.publicKey = '';
                    payload.publicKeyDsa = formData.publicKey;
                } else {
                    payload.publicKey = formData.publicKey;
                }
            }

            const result = await onCreate(payload);
            
            setCreatedKey(result);
            setStep(4); // Move to Success Step
        } catch (err) {
            setError(err.message || 'Failed to create authentication key');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDownload = () => {
        let keyToDownload = createdKey?.privateKey || formData.privateKey;
        if (createdKey?.privateKeyDsa) {
            keyToDownload += '\n\n' + createdKey.privateKeyDsa;
        }
        if (!keyToDownload) return;

        const element = document.createElement("a");
        const file = new Blob([keyToDownload], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        
        const fileName = createdKey?.name || formData.name || 'private_key';
        const safeName = fileName.replace(/\s+/g, '_');
        element.download = `${safeName}_private_key.pem`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-center-container modal--medium create-auth-key-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Create Authentication Key</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {step <= 3 && (
                    <div className="modal-subtitle">
                        Step {step} of 3: {step === 1 ? 'Key Details' : step === 2 ? 'Key Source' : 'Review'}
                    </div>
                )}

                <div className="modal-body">
                    {/* Step 1: Details */}
                    {step === 1 && (
                        <div className="modal-step">
                            <Input
                                label="Key Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Production API Key"
                                autoFocus
                                maxLength={50}
                                error={
                                    isNameInvalid ? "Name must be alphanumeric with only '_' or '-' and under 50 characters." :
                                    isDuplicateName ? `A key with the name "${formData.name}" already exists.` : null
                                }
                            />

                            <div className="form-group" style={{ marginTop: '24px' }}>
                                <label className="form-label">Algorithm</label>
                                <div className="radio-group">
                                    {['RSA', 'ECDSA', 'ML-DSA', 'Hybrid'].map((algo) => (
                                        <label key={algo} className="radio-option">
                                            <input
                                                type="radio"
                                                name="algorithm"
                                                value={algo}
                                                checked={formData.algorithm === algo}
                                                onChange={() => setFormData({ ...formData, algorithm: algo })}
                                            />
                                            <div className="radio-content">
                                                <div className="radio-title">{algo}</div>
                                                <div className="radio-description">
                                                    {algo === 'RSA' && 'Industry standard, widely supported'}
                                                    {algo === 'ECDSA' && 'Elliptic Curve Digital Signature Algorithm'}
                                                    {algo === 'ML-DSA' && 'Advanced: Post-quantum authentication (FIPS 204)'}
                                                    {algo === 'Hybrid' && 'Combined ML-DSA and ECDSA signatures'}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Source */}
                    {step === 2 && (
                        <div className="modal-step">
                            <div className="form-group">
                                <label className="form-label">Key Source</label>
                                <div className="auth-key-source-options">
                                    <label className={`source-option ${formData.source === 'upload' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="source"
                                            value="upload"
                                            checked={formData.source === 'upload'}
                                            onChange={() => setFormData({ ...formData, source: 'upload' })}
                                        />
                                        <div className="source-content">
                                            <div className="source-title">Upload Public Key</div>
                                            <div className="source-description">Paste your existing public key</div>
                                        </div>
                                    </label>

                                    <label className={`source-option ${formData.source === 'generate' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="source"
                                            value="generate"
                                            checked={formData.source === 'generate'}
                                            onChange={() => setFormData({ ...formData, source: 'generate' })}
                                        />
                                        <div className="source-content">
                                            <div className="source-title">Generate Key Pair</div>
                                            <div className="source-description">Create a new key pair on the secure vault</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {formData.source === 'upload' ? (
                                <div className="key-display-area">
                                    {formData.algorithm === 'Hybrid' ? (
                                        <div className="hybrid-inputs">
                                            <div className="form-group">
                                                <label className="form-label">ML-DSA Public Key (Post-Quantum Component)</label>
                                                <textarea
                                                    className="key-textarea"
                                                    placeholder="04a1b2c3d4e5f6... (Paste Hexadecimal ML-DSA Public Key)"
                                                    value={formData.publicKey1}
                                                    onChange={(e) => setFormData({ ...formData, publicKey1: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginTop: '16px' }}>
                                                <label className="form-label">ECDSA Public Key (Classical Component)</label>
                                                <textarea
                                                    className="key-textarea"
                                                    placeholder="-----BEGIN PUBLIC KEY-----&#10;MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...&#10;-----END PUBLIC KEY-----"
                                                    value={formData.publicKey2}
                                                    onChange={(e) => setFormData({ ...formData, publicKey2: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <label className="form-label">{formData.algorithm} Public Key</label>
                                            <textarea
                                                className="key-textarea"
                                                placeholder={
                                                    formData.algorithm === 'RSA' ? "-----BEGIN PUBLIC KEY-----\n(Paste RSA Public Key here)\n-----END PUBLIC KEY-----" :
                                                    formData.algorithm === 'ECDSA' ? "-----BEGIN PUBLIC KEY-----\n(Paste ECDSA Public Key here)\n-----END PUBLIC KEY-----" :
                                                    "04a1b2c3d4e5f6... (Paste Hexadecimal ML-DSA Public Key)"
                                                }
                                                value={formData.publicKey}
                                                onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
                                            />
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="key-display-area">
                                    <div className="info-box">
                                        <Key size={18} />
                                        <span>The private key will be generated securely and shown to you exactly once in the final step.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="modal-step">
                            <div className="summary">
                                <div className="summary-item">
                                    <span className="summary-label">Key Name:</span>
                                    <span className="summary-value" title={formData.name}>{truncateName(formData.name)}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Algorithm:</span>
                                    <span className="summary-value">{formData.algorithm}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Source:</span>
                                    <span className="summary-value">
                                        {formData.source === 'upload' ? 'Imported Public Key' : 'Generate on Server'}
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <div className="error-message" style={{ marginTop: '16px' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ marginTop: '24px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                <p>By creating this key, you are authorizing it to authenticate against the Quantum Vault API. {formData.source === 'generate' && "Make sure to download the private key in the next step."}</p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Success / Private Key Display */}
                    {step === 4 && (
                        <div className="modal-step success-step">
                            <div className="success-header">
                                <div className="success-icon-container">
                                    <Check size={32} />
                                </div>
                                <h3 className="success-title">Success! Key Created</h3>
                                <p className="success-desc">Your authentication key has been provisioned.</p>
                            </div>

                            {createdKey?.privateKey ? (
                                <div className="private-key-reveal">
                                    <label className="form-label">Private Key (Copy & Store Securely)</label>
                                    <div className="key-warning">
                                        ⚠️ This will never be shown again. Download it now.
                                    </div>
                                    <textarea
                                        className="key-textarea private-textarea"
                                        readOnly
                                        value={createdKey.privateKeyDsa ? `${createdKey.privateKey}\n\n${createdKey.privateKeyDsa}` : createdKey.privateKey}
                                    />
                                    <Button variant="secondary" className="full-width-btn" onClick={handleDownload} style={{ marginTop: '12px' }}>
                                        <Download size={18} style={{ marginRight: '8px' }} />
                                        Download Private Key
                                    </Button>
                                </div>
                            ) : (
                                <div className="summary" style={{ marginTop: '20px' }}>
                                    <div className="summary-item">
                                        <span className="summary-label">Fingerprint:</span>
                                        <span className="summary-value" style={{ fontFamily: 'monospace' }}>
                                            {createdKey?.fingerprint ? formatFingerprint(createdKey.fingerprint) : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {step > 1 && step < 4 && (
                        <Button variant="secondary" onClick={handleBack} disabled={isCreating}>
                            <ChevronLeft size={16} style={{ marginRight: '4px' }} />
                            Back
                        </Button>
                    )}
                    <div style={{ flex: 1 }} />
                    {step < 3 ? (
                        <Button
                            onClick={handleNext}
                            disabled={
                                (step === 1 && (!formData.name || isDuplicateName || isNameInvalid)) ||
                                (step === 2 && formData.source === 'upload' && (
                                    formData.algorithm === 'Hybrid' 
                                        ? (!formData.publicKey1 || !formData.publicKey2)
                                        : !formData.publicKey
                                ))
                            }
                        >
                            Next
                            <ChevronRight size={16} style={{ marginLeft: '4px' }} />
                        </Button>
                    ) : step === 3 ? (
                        <Button onClick={handleCreate} variant="primary" loading={isCreating}>
                            {isCreating ? 'Creating...' : 'Create Authentication Key'}
                        </Button>
                    ) : (
                        <Button onClick={onClose} variant="primary">
                            Done
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateAuthenticationKeyModal;
