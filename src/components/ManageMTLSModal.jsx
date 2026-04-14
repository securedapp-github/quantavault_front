import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { Trash2, Plus, Lock, AlertCircle, Download, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import './ManageMTLSModal.css';

const ManageMTLSModal = ({ isOpen, onClose, onCertificateIssued }) => {
    const [certificates, setCertificates] = useState([]);
    const [csr, setCSR] = useState('');
    const [certificateName, setCertificateName] = useState('');
    const [issuing, setIssuing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);
    const debounceTimerRef = useRef(null);

    // Load certificates on modal open
    useEffect(() => {
        if (isOpen) {
            loadCertificates();
            resetForm();
        }
    }, [isOpen]);

    const loadCertificates = async () => {
        setLoading(true);
        try {
            const result = await api.getActiveMTLSCertificates();
            setCertificates(result.certificates || []);
        } catch (err) {
            console.error('Failed to load certificates:', err.message);
            setError('Failed to load certificates');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCSR('');
        setCertificateName('');
        setError('');
        setSuccess(false);
    };

    // Handle CSR file upload
    const handleCSRUpload = (file) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            if (typeof content === 'string') {
                setCSR(content);
                setError('');
            }
        };
        reader.onerror = () => {
            setError('Failed to read file');
        };
        reader.readAsText(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleCSRUpload(file);
        }
    };

    // Debounced issue certificate with double-tap prevention
    const handleIssueCertificate = async () => {
        // Clear any existing debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set debounce to prevent double-tap
        debounceTimerRef.current = setTimeout(async () => {
            if (!validateForm()) {
                return;
            }

            setIssuing(true);
            setError('');

            try {
                const result = await api.issueMTLSCertificate(csr, certificateName);
                
                setSuccess(true);
                setError('');

                // Download certificates immediately
                await downloadCertificates(result.certificate);

                // Reload certificates list
                await loadCertificates();

                // Notify parent
                if (onCertificateIssued) {
                    onCertificateIssued(result.certificate);
                }

                // Reset form and close after success
                resetForm();
                setTimeout(() => {
                    setSuccess(false);
                }, 2000);
            } catch (err) {
                console.error('Failed to issue certificate:', err);
                setError(err.message || 'Failed to issue certificate');
            } finally {
                setIssuing(false);
            }
        }, 300); // 300ms debounce
    };

    const validateForm = () => {
        if (!csr.trim()) {
            setError('Please upload a CSR file');
            return false;
        }
        if (!certificateName.trim()) {
            setError('Please enter a certificate name');
            return false;
        }
        if (certificateName.trim().length < 3) {
            setError('Certificate name must be at least 3 characters');
            return false;
        }
        return true;
    };

    const handleDownloadCertificates = async (certificateId) => {
        try {
            // Prevent double-tap on download
            await new Promise(resolve => setTimeout(resolve, 300));
            const certData = await api.downloadMTLSCertificates(certificateId);
            
            // Re-map the API payload to be compatible with our local unpacker
            const downloadPayload = {
                clientCert: certData.certificates?.clientCrt,
                caCert: certData.certificates?.caCrt,
                serverCert: certData.certificates?.serverCrt
            };
            
            await downloadCertificates(downloadPayload);
        } catch (err) {
            console.error('Failed to download certificates:', err);
            toast.error('Failed to download certificates');
        }
    };

    const downloadCertificates = async (certificate) => {
        try {
            // Extract the certificates depending on whether it came from issuing or fetching
            const clientCert = certificate.clientCert || certificate.clientCrt;
            const caCert = certificate.caCert || certificate.caCrt;
            const serverCert = certificate.serverCert || certificate.serverCrt;

            const certsToDownload = [
                { filename: 'client.crt', content: clientCert },
                { filename: 'ca.crt', content: caCert },
                { filename: 'server.crt', content: serverCert }
            ];

            for (const cert of certsToDownload) {
                if (cert.content) {
                    const blob = new Blob([cert.content], { type: 'application/x-x509-ca-cert' });
                    const url = URL.createObjectURL(blob);
                    const element = document.createElement('a');
                    element.href = url;
                    element.download = cert.filename;
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                    URL.revokeObjectURL(url);
                    // Add a tiny delay between downloads to prevent browser blocking
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            toast.success('Certificates downloaded successfully');
        } catch (err) {
            console.error('Failed to download:', err);
            toast.error('Failed to prepare download');
        }
    };

    const handleRevokeCertificate = async (certificateId) => {
        if (!window.confirm('Are you sure you want to revoke this certificate? It will no longer work for authentication.')) {
            return;
        }

        try {
            await api.revokeMTLSCertificate(certificateId);
            toast.success('Certificate revoked successfully');
            await loadCertificates();
        } catch (err) {
            console.error('Failed to revoke certificate:', err);
            toast.error('Failed to revoke certificate');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage MTLS Certificates" size="large">
            <div className="mtls-modal-body">
                {/* Issue New Certificate Section */}
                <div className="mtls-issue-section">
                    <h3 className="mtls-section-title">
                        <Lock size={18} />
                        Issue New Certificate
                    </h3>

                    <div className="mtls-form-group">
                        <label className="mtls-label">CSR File (Certificate Signing Request)</label>
                        <div className="mtls-file-upload">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csr,.pem"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                            <button
                                className="mtls-upload-btn"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Plus size={16} />
                                {csr ? 'Change CSR' : 'Upload CSR'}
                            </button>
                            {csr && (
                                <div className="mtls-csr-preview">
                                    <Check size={14} style={{ color: '#4ade80' }} />
                                    <span>CSR file uploaded ({csr.split('\n').length} lines)</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mtls-form-group">
                        <label className="mtls-label">Certificate Name</label>
                        <input
                            type="text"
                            value={certificateName}
                            onChange={(e) => {
                                setCertificateName(e.target.value);
                                setError('');
                            }}
                            placeholder="e.g., Production Server, API Client"
                            className="mtls-input"
                        />
                        <span className="mtls-hint">Unique name to identify this certificate</span>
                    </div>

                    {error && (
                        <div className="mtls-error">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mtls-success">
                            <Check size={14} />
                            <span>Certificate issued successfully! Download has started.</span>
                        </div>
                    )}

                    <button
                        className="mtls-issue-btn"
                        onClick={handleIssueCertificate}
                        disabled={issuing || !csr || !certificateName}
                    >
                        {issuing ? 'Issuing...' : 'Issue Certificate'}
                    </button>
                </div>

                {/* Active Certificates List */}
                <div className="mtls-certs-section">
                    <h3 className="mtls-section-title">
                        <Lock size={18} />
                        Active Certificates
                    </h3>

                    {loading ? (
                        <div className="mtls-loading">Loading certificates...</div>
                    ) : certificates.length === 0 ? (
                        <div className="mtls-empty">
                            <Lock size={24} />
                            <p>No certificates issued yet</p>
                            <p className="mtls-empty-hint">Issue a certificate above to get started</p>
                        </div>
                    ) : (
                        <div className="mtls-cert-list">
                            {certificates.map((cert) => (
                                <div key={cert.id} className="mtls-cert-card">
                                    <div className="mtls-cert-header">
                                        <h4 className="mtls-cert-name">{cert.certificateName}</h4>
                                        <span className="mtls-cert-status">Active</span>
                                    </div>

                                    <div className="mtls-cert-details">
                                        <div className="mtls-detail-row">
                                            <span className="mtls-detail-label">Serial Number</span>
                                            <code className="mtls-detail-value">{cert.serialNumber}</code>
                                        </div>
                                        <div className="mtls-detail-row">
                                            <span className="mtls-detail-label">Issued</span>
                                            <span className="mtls-detail-value">
                                                {new Date(cert.issuedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="mtls-detail-row">
                                            <span className="mtls-detail-label">Valid Until</span>
                                            <span className="mtls-detail-value">
                                                {new Date(cert.validUntil).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mtls-cert-actions">
                                        <button
                                            className="mtls-action-btn download"
                                            onClick={() => handleDownloadCertificates(cert.id)}
                                            title="Download certificates"
                                        >
                                            <Download size={14} />
                                            Download
                                        </button>
                                        <button
                                            className="mtls-action-btn revoke"
                                            onClick={() => handleRevokeCertificate(cert.id)}
                                            title="Revoke certificate"
                                        >
                                            <Trash2 size={14} />
                                            Revoke
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mtls-modal-footer">
                    <button className="mtls-close-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ManageMTLSModal;
