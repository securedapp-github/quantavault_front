import { formatDate } from '../utils/dateFormatter';
import { truncateName } from '../utils/validation';
import './PolicyDetailsModal.css';
import { useQuantum } from '../context/QuantumContext';

const PolicyDetailsModal = ({ isOpen, onClose, policyData, onEdit }) => {
    const { authKeys, pqcKeys } = useQuantum();

    if (!isOpen || !policyData) return null;

    // Helper to get key algorithm
    const getAuthKeyAlgo = (name) => {
        const key = authKeys.find(k => k.name === name);
        return key ? key.algorithm : 'RSA'; // Default or fallback
    };

    const getPQCKeyAlgo = (name) => {
        const key = pqcKeys.find(k => k.name === name);
        return key ? key.algorithm : 'Hybrid'; // Default or fallback
    };

    // Helper to get key IDs
    const getPolicyId = () => policyData.id;

    const getAuthKeyId = () => {
        if (policyData.authKeyId) return policyData.authKeyId;
        const key = authKeys.find(k => k.name === policyData.authKey);
        return key ? key.id : 'Unknown';
    };

    const getPQCKeyId = () => {
        if (policyData.pqcKeyId) return policyData.pqcKeyId;
        const key = pqcKeys.find(k => k.name === policyData.pqcKey);
        return key ? key.id : 'Unknown';
    };


    const getOperationsList = (ops) => {
        if (!ops) return [];
        if (Array.isArray(ops)) return ops;
        if (typeof ops === 'string') return ops.split(', ');
        return Object.entries(ops)
            .filter(([, value]) => value)
            .map(([k]) => k);
    };

    const operationsList = getOperationsList(policyData.operations);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="key-details-panel"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="panel-header">
                    <div>
                        <h2 className="panel-title">Access Policy Details</h2>
                        <div className="panel-subtitle">View information about this access policy</div>
                    </div>
                    <button className="panel-close" onClick={onClose}>×</button>
                </div>

                <div className="panel-actions" style={{ padding: '0 24px', marginBottom: '16px' }}>
                    <button 
                        className="edit-policy-btn" 
                        onClick={() => {
                            onEdit(policyData);
                            onClose();
                        }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Edit Policy Settings
                    </button>
                </div>

                <div className="panel-content">
                    {/* Top Card: Name and Created */}
                    <div className="details-card">
                        <div className="detail-row header-row">
                            <div className="detail-group">
                                <label>Policy Name</label>
                                <div className="detail-value-large" title={policyData.name}>
                                    {truncateName(policyData.name)}
                                </div>
                            </div>
                            <span className={`status-badge-large ${policyData.status?.toLowerCase() || 'active'}`}>
                                {policyData.status || 'Active'}
                            </span>
                        </div>
                        <div className="detail-group spacer-top">
                            <label>Created</label>
                            <div className="detail-value">{formatDate(policyData.created)}</div>
                        </div>
                    </div>

                    {/* Access Flow Section */}
                    <div className="section-container">
                        <label className="section-title">Access Flow</label>
                        <div className="access-flow-container">
                            <div className="flow-card auth-flow">
                                <label>Authentication Key</label>
                                <div className="flow-value" title={policyData.authKey}>{truncateName(policyData.authKey || 'trial')}</div>
                                <span className="flow-badge">{getAuthKeyAlgo(policyData.authKey)}</span>
                            </div>
                            <div className="flow-arrow">→</div>
                            <div className="flow-card pqc-flow">
                                <label>PQC Key</label>
                                <div className="flow-value" title={policyData.pqcKey}>{truncateName(policyData.pqcKey || 'trial')}</div>
                                <span className="flow-badge">{getPQCKeyAlgo(policyData.pqcKey)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Allowed Operations Section */}
                    <div className="section-container">
                        <label className="section-title">Allowed Operations</label>
                        <div className="operations-list">
                            {operationsList.length > 0 ? operationsList.map((op, index) => (
                                <span key={index} className="operation-pill">
                                    {op}
                                </span>
                            )) : <div className="detail-value">No operations specified</div>}
                        </div>
                    </div>

                    {/* Authorization Note */}
                    <div className="security-note">
                        <strong>Authorization:</strong> This policy grants the authentication key permission to perform the specified operations. All operations are logged in the audit trail.
                    </div>

                    {/* Footer IDs */}
                    <div className="footer-ids-card">
                        <div className="footer-id-group">
                            <label>Policy ID</label>
                            <div className="key-id-box">{getPolicyId()}</div>
                        </div>
                        <div className="footer-id-group">
                            <label>Auth Key ID</label>
                            <div className="key-id-box">{getAuthKeyId()}</div>
                        </div>
                        <div className="footer-id-group">
                            <label>PQC Key ID </label>
                            <div className="key-id-box">{getPQCKeyId()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyDetailsModal;
