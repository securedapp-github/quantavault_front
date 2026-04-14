import { formatDate } from '../utils/dateFormatter';
import './KeyDetailsModal.css';

const KeyDetailsModal = ({ isOpen, onClose, keyData }) => {
    if (!isOpen || !keyData) return null;

    // Determine operations based on algorithm
    let operationsList = [];
    const alg = keyData.algorithm;
    if (['ML-DSA', 'ECDSA', 'Hybrid-DSA'].includes(alg)) {
        operationsList = ['sign', 'verify'];
    } else if (['ML-KEM', 'Hybrid-KEM'].includes(alg)) {
        operationsList = ['encapsulate', 'decapsulate'];
    } else if (alg === 'AES-256') {
        operationsList = ['encrypt', 'decrypt'];
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="key-details-panel"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="panel-header">
                    <div>
                        <h2 className="panel-title">PQC Key Details</h2>
                        <div className="panel-subtitle">View information about this post-quantum cryptographic key</div>
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
                                <div className="detail-value-large">{keyData.name}</div>
                            </div>
                            <span className={`status-badge-large ${keyData.status?.toLowerCase()}`}>
                                {keyData.status}
                            </span>
                        </div>

                        {/* Row 2: Algorithm and Environment */}
                        <div className="detail-grid">
                            <div className="detail-group">
                                <label>Algorithm</label>
                                <div className="detail-value alg-badge">{keyData.algorithm}</div>
                            </div>
                            <div className="detail-group">
                                <label>Environment</label>
                                <div className="detail-value strong">{keyData.environment}</div>
                            </div>
                            <div className="detail-group">
                                <label>Version</label>
                                <div className="detail-value strong">Version {keyData.version || 1}</div>
                            </div>
                        </div>

                        {/* Row 3: Operations */}
                        <div className="detail-group">
                            <label>Allowed Operations</label>
                            <div className="operations-list">
                                {operationsList.map((op, index) => (
                                    <span key={index} className="operation-pill">
                                        {op}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Row 4: Created */}
                        <div className="detail-group spacer-top">
                            <label>Created</label>
                            <div className="detail-value">{formatDate(keyData.created)}</div>
                        </div>
                    </div>

                    {/* Security Note */}
                    <div className="security-note">
                        <strong>Security:</strong> Private keys are stored securely and never exposed. All cryptographic operations are performed within QuantumVault's infrastructure.
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

export default KeyDetailsModal;
