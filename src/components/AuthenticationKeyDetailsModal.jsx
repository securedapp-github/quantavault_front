import React from 'react';
import './AuthenticationKeyDetailsModal.css';
import { formatFingerprint } from '../utils/fingerprintFormatter';
import { truncateName } from '../utils/validation';

const AuthenticationKeyDetailsModal = ({ isOpen, onClose, keyData }) => {
    if (!isOpen || !keyData) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="key-details-panel"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="panel-header">
                    <div>
                        <h2 className="panel-title">Authentication Key Details</h2>
                        <div className="panel-subtitle">View information about this identity key</div>
                    </div>
                    <button className="panel-close" onClick={onClose}>×</button>
                </div>

                <div className="panel-content">
                    {/* Main Details Card */}
                    <div className="details-card">
                        {/* Row 1: Name and Status */}
                        <div className="detail-row header-row">
                            <div className="detail-group">
                                <label>Key Name</label>
                                <div className="detail-value-large" title={keyData.name}>
                                    {truncateName(keyData.name)}
                                </div>
                            </div>
                            <span className={`status-badge-large ${keyData.status?.toLowerCase() || 'active'}`}>
                                {keyData.status || 'Active'}
                            </span>
                        </div>

                        {/* Row 2: Algorithm and Fingerprint */}
                        <div className="detail-grid">
                            <div className="detail-group">
                                <label>Algorithm</label>
                                <div className="detail-value alg-badge">{keyData.algorithm}</div>
                            </div>
                            <div className="detail-group">
                                <label>Fingerprint</label>
                                <div className="detail-value fingerprint-badge">
                                    {keyData.fingerprint ? formatFingerprint(keyData.fingerprint) : 'Pending...'}
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Created */}
                        <div className="detail-group spacer-top">
                            <label>Created</label>
                            <div className="detail-value">{keyData.created || 'Feb 3, 2026 at 8:35 PM'}</div>
                        </div>
                    </div>

                    {/* Public Key Section */}
                    <div className="public-key-section">
                        <label>Public Key {keyData.algorithm === 'Hybrid' ? '(ECDSA)' : ''}</label>
                        <div className="public-key-box" style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                            {keyData.publicKey || 'No public key data available'}
                        </div>
                    </div>

                    {keyData.publicKeyDsa && (
                        <div className="public-key-section" style={{ marginTop: '16px' }}>
                            <label>Public Key (ML-DSA)</label>
                            <div className="public-key-box" style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                {keyData.publicKeyDsa}
                            </div>
                        </div>
                    )}

                    {/* Access Control Note */}
                    <div className="security-note">
                        <strong>Access Control:</strong> This authentication key can only perform operations on PQC keys that have been explicitly allowed through access policies.
                    </div>

                    {/* Key ID Footer */}
                    <div className="key-id-section">
                        <label>Key ID </label>
                        <div className="key-id-box">
                            {keyData.id}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthenticationKeyDetailsModal;
