import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useQuantum } from '../context/QuantumContext';
import Button from './Button';
import Input from './Input';
import './CreateAccessPolicyModal.css';
import './Modal.css';

const CreateAccessPolicyModal = ({ isOpen, onClose, onSave, editData = null }) => {
    const { authKeys, pqcKeys } = useQuantum();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        authKey: '',
        pqcKey: '',
        operations: {
            sign: false,
            verify: false,
            encrypt: false,
            decrypt: false,
            encapsulate: false,
            decapsulate: false
        },
        rateLimit: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (editData) {
                // Pre-fill for edit
                const ops = {
                    sign: false, verify: false, encrypt: false, 
                    decrypt: false, encapsulate: false, decapsulate: false
                };
                
                if (editData.operations) {
                    editData.operations.split(',').forEach(op => {
                        const cleanOp = op.trim().toLowerCase();
                        if (ops.hasOwnProperty(cleanOp)) {
                            ops[cleanOp] = true;
                        }
                    });
                }

                setFormData({
                    name: editData.name,
                    authKey: editData.authKey,
                    pqcKey: editData.pqcKey,
                    operations: ops,
                    rateLimit: editData.rateLimit || ''
                });
                setStep(1);
            } else {
                // Reset for create
                setFormData({
                    name: '',
                    authKey: '',
                    pqcKey: '',
                    operations: {
                        sign: false, verify: false, encrypt: false,
                        decrypt: false, encapsulate: false, decapsulate: false
                    },
                    rateLimit: ''
                });
                setStep(1);
            }
        }
    }, [isOpen, editData]);

    if (!isOpen) return null;

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleAction = () => {
        // Find selected key objects to get their IDs and validate operations
        const selectedPQCKeyObj = pqcKeys.find(k => k.name === formData.pqcKey);
        const selectedAuthKeyObj = authKeys.find(k => k.name === formData.authKey);

        const payload = {
            ...(editData ? { id: editData.id } : {}),
            name: formData.name,
            authKey: formData.authKey,
            authKeyId: selectedAuthKeyObj ? selectedAuthKeyObj.id : (editData ? editData.authKeyId : null),
            pqcKey: formData.pqcKey,
            pqcKeyId: selectedPQCKeyObj ? selectedPQCKeyObj.id : (editData ? editData.pqcKeyId : null),
            operations: Object.entries(formData.operations)
                .filter(([op, enabled]) => {
                    if (!enabled) return false;
                    // Only include if supported by the key's algorithm
                    const alg = selectedPQCKeyObj?.algorithm;
                    if (!alg) return true;
                    
                    if (['ML-DSA', 'ECDSA', 'Hybrid-DSA'].includes(alg)) {
                        return op === 'sign' || op === 'verify';
                    }
                    if (['ML-KEM', 'Hybrid-KEM'].includes(alg)) {
                        return op === 'encapsulate' || op === 'decapsulate';
                    }
                    if (alg === 'AES-256') {
                        return op === 'encrypt' || op === 'decrypt';
                    }
                    return false;
                })
                .map(([op]) => op.charAt(0).toUpperCase() + op.slice(1)) // Capitalize
                .join(', '),
            rateLimit: formData.rateLimit,
            status: editData ? editData.status.toLowerCase() : 'active'
        };

        onSave(payload);
        onClose();
    };

    const toggleOperation = (op) => {
        setFormData(prev => ({
            ...prev,
            operations: {
                ...prev.operations,
                [op]: !prev.operations[op]
            }
        }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-center-container modal--medium create-access-policy-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{editData ? 'Edit Access Policy' : 'Create Access Policy'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-subtitle">
                    Step {step} of 4: {
                        step === 1 ? 'Select Keys' :
                            step === 2 ? 'Select Operations' :
                                step === 3 ? 'Optional Constraints' : 'Review'
                    }
                </div>

                <div className="modal-body">
                    {/* Step 1: Select Keys */}
                    {step === 1 && (
                        <div className="modal-step">
                            <Input
                                label="Policy Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Production API Access"
                                autoFocus
                            />

                            <div className="form-group" style={{ marginTop: '24px' }}>
                                <label className="form-label">Authentication Key</label>
                                <div className="select-wrapper">
                                    <select
                                        value={formData.authKey}
                                        onChange={(e) => setFormData({ ...formData, authKey: e.target.value })}
                                    >
                                        <option value="" disabled>Select authentication key</option>
                                        {/* Show currently selected key even if inactive during edit, or all active ones */}
                                        {authKeys.filter(k => k.status === 'active' || k.name === formData.authKey).map(key => (
                                            <option key={key.id} value={key.name}>
                                                {key.name} ({key.algorithm}) {key.status !== 'active' ? `[${key.status.toUpperCase()}]` : ''}
                                            </option>
                                        ))}
                                        {authKeys.length === 0 && <option value="" disabled>No keys available</option>}
                                    </select>
                                </div>
                                <div className="form-helper-text">The identity that will be granted access</div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">PQC Key</label>
                                <div className="select-wrapper">
                                    <select
                                        value={formData.pqcKey}
                                        onChange={(e) => setFormData({ ...formData, pqcKey: e.target.value })}
                                    >
                                        <option value="" disabled>Select PQC key</option>
                                        {pqcKeys.filter(k => k.status === 'active' || k.name === formData.pqcKey).map(key => (
                                            <option key={key.id} value={key.name}>
                                                {key.name} ({key.algorithm}) {key.status !== 'active' ? `[${key.status.toUpperCase()}]` : ''}
                                            </option>
                                        ))}
                                        {pqcKeys.length === 0 && <option value="" disabled>No keys available</option>}
                                    </select>
                                </div>
                                <div className="form-helper-text">The cryptographic key that will be accessed</div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Operations */}
                    {step === 2 && (
                        <div className="modal-step">
                            <div className="form-label" style={{ marginBottom: '4px' }}>Allowed Operations</div>
                            <div className="form-helper-text" style={{ marginBottom: '16px' }}>
                                Select which operations the authentication key can perform on the PQC key.
                                <br />
                                <em>Only operations supported by the selected PQC key ({formData.pqcKey}) are shown.</em>
                            </div>

                            <div className="operations-grid">
                                {[
                                    { id: 'sign', label: 'Sign', desc: 'Create digital signatures' },
                                    { id: 'verify', label: 'Verify', desc: 'Verify digital signatures' },
                                    { id: 'encrypt', label: 'Encrypt', desc: 'Encrypt data' },
                                    { id: 'decrypt', label: 'Decrypt', desc: 'Decrypt data' },
                                    { id: 'encapsulate', label: 'Encapsulate', desc: 'Generate shared secrets' },
                                    { id: 'decapsulate', label: 'Decapsulate', desc: 'Derive shared secrets' }
                                ].filter(op => {
                                    const selectedKeyObj = pqcKeys.find(k => k.name === formData.pqcKey);
                                    if (!selectedKeyObj) return true;
                                    const alg = selectedKeyObj.algorithm;
                                    
                                    if (['ML-DSA', 'ECDSA', 'Hybrid-DSA'].includes(alg)) {
                                        return op.id === 'sign' || op.id === 'verify';
                                    }
                                    if (['ML-KEM', 'Hybrid-KEM'].includes(alg)) {
                                        return op.id === 'encapsulate' || op.id === 'decapsulate';
                                    }
                                    if (alg === 'AES-256') {
                                        return op.id === 'encrypt' || op.id === 'decrypt';
                                    }
                                    return false;
                                }).map((op) => (
                                    <label key={op.id} className="operation-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={formData.operations[op.id]}
                                            onChange={() => toggleOperation(op.id)}
                                        />
                                        <div className="operation-content">
                                            <div className="operation-title">{op.label}</div>
                                            <div className="operation-description">{op.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Optional Constraints */}
                    {step === 3 && (
                        <div className="modal-step">
                            <div className="form-label" style={{ marginBottom: '4px' }}>Optional Constraints</div>
                            <div className="form-helper-text" style={{ marginBottom: '16px' }}>Add additional restrictions to this policy</div>

                            <Input
                                label="Rate Limit (operations per hour)"
                                value={formData.rateLimit}
                                onChange={(e) => setFormData({ ...formData, rateLimit: e.target.value })}
                                placeholder="e.g., 1000"
                            />
                            <div className="form-helper-text" style={{ marginTop: '-12px' }}>Leave empty for no rate limit</div>

                            <div className="future-feature-notice">
                                Additional constraint types (time-based access, IP restrictions) will be available in future updates.
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div className="modal-step">
                            <div className="summary">
                                <div className="summary-item">
                                    <span className="summary-label">Policy Name:</span>
                                    <span className="summary-value">{formData.name}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Authentication Key:</span>
                                    <span className="summary-value">{formData.authKey}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">PQC Key:</span>
                                    <span className="summary-value">{formData.pqcKey}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Operations:</span>
                                    <span className="summary-value">
                                        {Object.entries(formData.operations)
                                            .filter(([, enabled]) => enabled)
                                            .map(([op]) => op.charAt(0).toUpperCase() + op.slice(1))
                                            .join(', ') || 'None'}
                                    </span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Rate Limit:</span>
                                    <span className="summary-value">{formData.rateLimit || 'Unlimited'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {step > 1 && (
                        <Button variant="secondary" onClick={handleBack}>
                            <ChevronLeft size={16} style={{ marginRight: '4px' }} />
                            Back
                        </Button>
                    )}
                    <div style={{ flex: 1 }} />
                    {step < 4 ? (
                        <Button
                            onClick={handleNext}
                            disabled={
                                (step === 1 && (!formData.name || !formData.authKey || !formData.pqcKey)) ||
                                (step === 2 && !Object.entries(formData.operations).some(([key, val]) => {
                                    if (!val) return false;
                                    const selectedKeyObj = pqcKeys.find(k => k.name === formData.pqcKey);
                                    if (!selectedKeyObj) return true;
                                    const alg = selectedKeyObj.algorithm;

                                    if (['ML-DSA', 'ECDSA', 'Hybrid-DSA'].includes(alg)) {
                                        return key === 'sign' || key === 'verify';
                                    }
                                    if (['ML-KEM', 'Hybrid-KEM'].includes(alg)) {
                                        return key === 'encapsulate' || key === 'decapsulate';
                                    }
                                    if (alg === 'AES-256') {
                                        return key === 'encrypt' || key === 'decrypt';
                                    }
                                    return false;
                                }))
                            }
                        >
                            Next
                            <ChevronRight size={16} style={{ marginLeft: '4px' }} />
                        </Button>
                    ) : (
                        <Button onClick={handleAction} variant="primary">
                            {editData ? 'Update Policy' : 'Create Policy'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateAccessPolicyModal;
