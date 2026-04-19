import React, { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import './CreatePQCKeyModal.css';
import './Modal.css';

const CreatePQCKeyModal = ({ isOpen, onClose, onCreate, initialData = null, existingKeys = [] }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        algorithm: 'ML-DSA',
        parameters: 'ML-DSA-65', // Default parameter set
        // Operations are implied by algorithm type now
        operations: { sign: true, verify: true, encrypt: false, decrypt: false, encapsulate: false, decapsulate: false },
        environment: 'Development',
        hybridConfig: { classical: 'RSA-4096', pqc: 'ML-KEM-768' }
    });

    // Reset or populate form when opening/initialData changes
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                setStep(1);
                if (initialData) {
                    setFormData({
                        name: initialData.name || '',
                        algorithm: initialData.algorithm || 'ML-DSA',
                        operations: initialData.operationsObj || { sign: true, verify: true, encrypt: false, decrypt: false },
                        environment: initialData.environment || 'Development',
                    });
                } else {
                    setFormData({
                        name: '',
                        algorithm: 'ML-DSA',
                        operations: { sign: true, verify: true, encrypt: false, decrypt: false, encapsulate: false, decapsulate: false },
                        environment: 'Development',
                    });
                }
            }, 0);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleAction = () => {
        onCreate(formData);
        // Form reset happens in useEffect when isOpen changes or explicitly here if needed
    };

    const handleAlgorithmChange = (algorithm) => {
        let defaultParams = '';
        let defaultOps = { sign: false, verify: false, encrypt: false, decrypt: false, encapsulate: false, decapsulate: false };

        if (algorithm === 'ML-DSA') {
            defaultParams = 'ML-DSA-65 (FIPS 204)';
            defaultOps.sign = true; defaultOps.verify = true;
        } else if (algorithm === 'ML-KEM') {
            defaultParams = 'ML-KEM-768 (FIPS 203)';
            defaultOps.encapsulate = true; defaultOps.decapsulate = true;
        } else if (algorithm === 'ECDSA') {
            defaultParams = 'ECDSA P-256 (NIST Curve)';
            defaultOps.sign = true; defaultOps.verify = true;
        } else if (algorithm === 'Hybrid-DSA') {
            defaultParams = 'Hybrid (ML-DSA-65 + ECDSA P-256)';
            defaultOps.sign = true; defaultOps.verify = true;
        } else if (algorithm === 'Hybrid-KEM') {
            defaultParams = 'Hybrid (ML-KEM-768 + X25519)';
            defaultOps.encapsulate = true; defaultOps.decapsulate = true;
        } else if (algorithm === 'AES-256') {
            defaultParams = 'AES-256-GCM Symmetric Key';
            defaultOps.encrypt = true; defaultOps.decrypt = true;
        }

        setFormData({ ...formData, algorithm, parameters: defaultParams, operations: defaultOps });
    };

    const isEditMode = !!initialData;

    const isDuplicateName = existingKeys.some(key => 
        key.name.toLowerCase() === formData.name.trim().toLowerCase() && 
        key.status.toLowerCase() === 'active' &&
        (!isEditMode || key.id !== initialData.id)
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-center-container modal--medium create-pqc-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{isEditMode ? 'Edit PQC Key' : 'Create PQC Key'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Step 1: Name & Algorithm */}
                    {step === 1 && (
                        <div className="modal-step">
                            <Input
                                label="Key Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Production Signing Key"
                                autoFocus
                                error={isDuplicateName ? `An active key with the name "${formData.name}" already exists.` : null}
                            />

                            <div className="form-group">
                                <label className="form-label">Algorithm</label>
                                <div className="radio-group-container">
                                    {[
                                        { label: 'Sign & Verify', algos: ['ML-DSA', 'ECDSA', 'Hybrid-DSA'] },
                                        { label: 'Encapsulate & Decapsulate', algos: ['ML-KEM', 'Hybrid-KEM'] },
                                        { label: 'Encrypt & Decrypt', algos: ['AES-256'] }
                                    ].map((group) => (
                                        <div key={group.label} className="algo-group">
                                            <div className="algo-group-label">{group.label}</div>
                                            <div className="radio-group">
                                                {group.algos.map((algo) => (
                                                    <label key={algo} className="radio-option">
                                                        <input
                                                            type="radio"
                                                            name="algorithm"
                                                            value={algo}
                                                            checked={formData.algorithm === algo}
                                                            onChange={() => handleAlgorithmChange(algo)}
                                                        />
                                                        <div className="radio-content">
                                                            <div className="radio-title">{algo}</div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Step 2: Environment */}
                    {step === 2 && (
                        <div className="modal-step">
                            <div className="form-group">
                                <label className="form-label">Environment</label>
                                <div className="radio-group">
                                    {['Development', 'Production'].map((env) => (
                                        <label key={env} className="radio-option">
                                            <input
                                                type="radio"
                                                name="environment"
                                                value={env}
                                                checked={formData.environment === env}
                                                onChange={() => setFormData({ ...formData, environment: env })}
                                            />
                                            <div className="radio-content">
                                                <div className="radio-title">{env}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 3 && (
                        <div className="modal-step">
                            <div className="summary-card">
                                <div className="summary-row">
                                    <span className="summary-label">Key Name</span>
                                    <span className="summary-value">{formData.name}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Algorithm</span>
                                    <span className="summary-value">{formData.algorithm}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Operations</span>
                                    <span className="summary-value">
                                        {['ML-DSA', 'ECDSA', 'Hybrid-DSA'].includes(formData.algorithm) ? 'sign, verify' :
                                         ['ML-KEM', 'Hybrid-KEM'].includes(formData.algorithm) ? 'encapsulate, decapsulate' :
                                         formData.algorithm === 'AES-256' ? 'encrypt, decrypt' : ''}
                                    </span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Environment</span>
                                    <span className="summary-value">{formData.environment}</span>
                                </div>
                            </div>

                            <div className="info-note">
                                <strong>Note:</strong> Private keys are never exposed. All cryptographic operations are performed securely within the QuantumVault infrastructure.
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {step > 1 && (
                        <Button variant="secondary" onClick={handleBack}>
                            ← Back
                        </Button>
                    )}
                    <div style={{ flex: 1 }} />
                    {step < 3 ? (
                        <Button
                            onClick={handleNext}
                            disabled={step === 1 && (!formData.name || isDuplicateName)}
                        >
                            Next →
                        </Button>
                    ) : (
                        <Button onClick={handleAction}>
                            {isEditMode ? 'Save Changes' : 'Create Key'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatePQCKeyModal;
