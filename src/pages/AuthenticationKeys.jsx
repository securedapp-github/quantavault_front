import React, { useState } from 'react';
import { Shield, Eye, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Table from '../components/Table';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import CreateAuthenticationKeyModal from '../components/CreateAuthenticationKeyModal';
import AuthenticationKeyDetailsModal from '../components/AuthenticationKeyDetailsModal';
import ActionMenu from '../components/ActionMenu';
import { formatDate } from '../utils/dateFormatter';
import { formatFingerprint } from '../utils/fingerprintFormatter';
import './AuthenticationKeys.css';

import { useQuantum } from '../context/QuantumContext';
import { useLocation } from 'react-router-dom';
import { STATUS } from '../utils/constants';

const AuthenticationKeys = () => {
    const { authKeys, addAuthKey, updateAuthKey } = useQuantum();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const location = useLocation();

    // Details Modal State
    const [selectedKey, setSelectedKey] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Check for navigation state to open modal
    React.useEffect(() => {
        if (location.state?.openCreateModal) {
            setIsModalOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const columns = [
        { header: 'Key Name', key: 'name' },
        {
            header: 'Algorithm',
            key: 'algorithm',
            render: (row) => (
                <Badge variant="info" style={{ fontFamily: 'monospace' }}>
                    {row.algorithm}
                </Badge>
            )
        },
        {
            header: 'Fingerprint',
            key: 'fingerprint',
            render: (row) => (
                <span style={{ fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                    {row.fingerprint ? formatFingerprint(row.fingerprint) : 'Pending...'}
                </span>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (row) => <Badge variant={row.status.toLowerCase() === STATUS.ACTIVE ? 'success' : 'error'}>{row.status}</Badge>,
        },
        {
            header: 'Created',
            key: 'created',
            render: (row) => formatDate(row.created)
        },
        {
            header: 'Actions',
            key: 'actions',
            render: (row) => {
                const isActive = row.status.toLowerCase() === STATUS.ACTIVE;
                const toggleStatus = () => {
                    const newStatus = isActive ? STATUS.DISABLED : STATUS.ACTIVE;
                    updateAuthKey({ ...row, status: newStatus });
                };

                return (
                    <ActionMenu
                        actions={[
                            {
                                label: 'View Details',
                                icon: <Eye size={14} />,
                                onClick: () => {
                                    setSelectedKey(row);
                                    setIsDetailsOpen(true);
                                }
                            },
                            {
                                label: 'Copy Key ID',
                                icon: <Copy size={14} />,
                                onClick: () => {
                                    navigator.clipboard.writeText(row.id);
                                    toast.success('Key ID copied to clipboard');
                                }
                            },
                            {
                                label: isActive ? 'Disable Key' : 'Enable Key',
                                icon: isActive ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg> : <Shield size={14} />, // Using Shield or check for enable
                                variant: isActive ? 'danger' : 'default', // Danger for disable, Default (Success-ish) for enable
                                onClick: () => {
                                    if (window.confirm(`Are you sure you want to ${isActive ? 'disable' : 'enable'} this key?`)) {
                                        toggleStatus();
                                    }
                                }
                            }
                        ]}
                    />
                );
            },
        },
    ];

    const handleCreateKey = async (newKey) => {
        try {
            return await addAuthKey({
                ...newKey,
                status: STATUS.ACTIVE,
                created: newKey.created || new Date().toISOString()
            });
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    return (
        <div className="page">
            <PageHeader
                title="Authentication Keys"
                subtitle="Manage identity keys for accessing PQC keys"
                action={
                    <Button onClick={() => setIsModalOpen(true)}>+ Create Authentication Key</Button>
                }
            />

            <div className="page-content">
                {authKeys.length === 0 ? (
                    <EmptyState
                        icon={<Shield size={48} />}
                        title="No authentication keys yet"
                        description="Create your first authentication key to control access to PQC keys"
                        actionLabel="+ Create Authentication Key"
                        onAction={() => setIsModalOpen(true)}
                    />
                ) : (
                    <div className="authentication-keys-table-container">
                        <div className="table-header-title">
                            All Authentication Keys ({authKeys.length})
                        </div>
                        <Table columns={columns} data={authKeys} />
                    </div>
                )}
            </div>

            <CreateAuthenticationKeyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateKey}
                existingKeys={authKeys}
            />

            <AuthenticationKeyDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                keyData={selectedKey}
            />
        </div>
    );
};

export default AuthenticationKeys;
