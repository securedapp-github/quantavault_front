import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Trash2, Plus, Globe, AlertCircle } from 'lucide-react';
import './IpWhitelistModal.css';

const IpWhitelistModal = ({ isOpen, onClose, whitelist, onSave }) => {
    const [ips, setIps] = useState([]);
    const [newIp, setNewIp] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIps([...whitelist]);
            setNewIp('');
            setError('');
        }
    }, [isOpen, whitelist]);

    const validateIP = (input) => {
        input = input.trim();
        // Basic IPv4 validation
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        // IPv4 CIDR
        const ipv4CidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
        // Basic IPv6 validation (simplified)
        const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

        if (ipv4Regex.test(input)) {
            const parts = input.split('.').map(Number);
            return parts.every(p => p >= 0 && p <= 255);
        }
        if (ipv4CidrRegex.test(input)) {
            const [ip, prefix] = input.split('/');
            const parts = ip.split('.').map(Number);
            const prefixNum = parseInt(prefix, 10);
            return parts.every(p => p >= 0 && p <= 255) && prefixNum >= 0 && prefixNum <= 32;
        }
        if (ipv6Regex.test(input)) return true;

        return false;
    };

    const handleAdd = () => {
        const trimmed = newIp.trim();
        if (!trimmed) return;

        if (!validateIP(trimmed)) {
            setError('Invalid IP address or CIDR format');
            return;
        }

        if (ips.includes(trimmed)) {
            setError('This IP is already in the list');
            return;
        }

        setIps([...ips, trimmed]);
        setNewIp('');
        setError('');
    };

    const handleDelete = (index) => {
        setIps(ips.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(ips);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save whitelist');
        } finally {
            setSaving(false);
        }
    };

    const isCIDR = (ip) => ip.includes('/');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage IP Whitelist" size="medium">
            <div className="ip-modal-body">
                <div className="ip-add-row">
                    <div className="ip-input-wrapper">
                        <input
                            type="text"
                            value={newIp}
                            onChange={(e) => { setNewIp(e.target.value); setError(''); }}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g., 192.168.1.1 or 10.0.0.0/24"
                            className="ip-input"
                            autoFocus
                        />
                    </div>
                    <button className="ip-add-btn" onClick={handleAdd} disabled={!newIp.trim()}>
                        <Plus size={16} />
                        Add
                    </button>
                </div>

                {error && (
                    <div className="ip-error">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="ip-list-section">
                    <span className="ip-list-label">
                        Whitelisted IPs {ips.length > 0 && <span className="ip-count">({ips.length})</span>}
                    </span>

                    {ips.length === 0 ? (
                        <div className="ip-empty">
                            <Globe size={24} />
                            <p>No IP addresses added yet</p>
                            <p className="ip-empty-hint">Add IPs above to restrict crypto operations</p>
                        </div>
                    ) : (
                        <div className="ip-list">
                            {ips.map((ip, index) => (
                                <div key={index} className="ip-row">
                                    <div className="ip-row-info">
                                        <Globe size={14} className="ip-row-icon" />
                                        <code className="ip-address">{ip}</code>
                                        {isCIDR(ip) && <span className="ip-cidr-tag">CIDR</span>}
                                    </div>
                                    <button
                                        className="ip-delete-btn"
                                        onClick={() => handleDelete(index)}
                                        title="Remove IP"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="ip-modal-footer">
                    <button className="ip-cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="ip-save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default IpWhitelistModal;
