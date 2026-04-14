import React, { useState } from 'react';
import { Key, Eye, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Table from '../components/Table';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import CreatePQCKeyModal from '../components/CreatePQCKeyModal';
import KeyDetailsModal from '../components/KeyDetailsModal';
import ActionMenu from '../components/ActionMenu';

import { useLocation } from 'react-router-dom';
import { useQuantum } from '../context/QuantumContext';
import { formatDate } from '../utils/dateFormatter';
import './PQCKeys.css';

const PQCKeys = () => {
    const { pqcKeys, addPQCKey, updatePQCKey, rotatePQCKey } = useQuantum();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const location = useLocation();

    // Check for navigation state to open modal
    React.useEffect(() => {
        if (location.state?.openCreateModal) {
            setIsCreateModalOpen(true);
            // Clear state to prevent reopening on generic re-renders (optional but good practice)
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Details Modal State
    const [selectedKeyForDetails, setSelectedKeyForDetails] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Edit Modal State
    const [keyToEdit, setKeyToEdit] = useState(null);

    const handleCreateKey = (keyData) => {
        if (keyToEdit) {
            // Update existing key
            updatePQCKey({
                ...keyToEdit,
                name: keyData.name,
                algorithm: keyData.algorithm,
                parameters: keyData.parameters,
                operations: keyData.operations, // Send raw object to backend
                environment: keyData.environment,
                hybridConfig: keyData.hybridConfig,
            });
            setKeyToEdit(null);
        } else {
            // Create new key
            const newKey = {
                name: keyData.name,
                algorithm: keyData.algorithm,
                parameters: keyData.parameters,
                operations: keyData.operations, // Send raw object to backend
                environment: keyData.environment,
                hybridConfig: keyData.hybridConfig,
                status: 'active',
            };
            addPQCKey(newKey);
        }
        setIsCreateModalOpen(false);
    };

    const getOperationBadges = (algorithm) => {
        let ops = [];
        if (['ML-DSA', 'ECDSA', 'Hybrid-DSA'].includes(algorithm)) {
            ops = ['sign', 'verify'];
        } else if (['ML-KEM', 'Hybrid-KEM'].includes(algorithm)) {
            ops = ['encapsulate', 'decapsulate'];
        } else if (algorithm === 'AES-256') {
            ops = ['encrypt', 'decrypt'];
        }

        const maxVisible = 2; // Show only 2 items before overflow
        const visibleOps = ops.slice(0, maxVisible);
        const overflowCount = ops.length - maxVisible;

        return (
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
                {visibleOps.map(op => (
                    <span key={op} style={{
                        display: 'inline-block',
                        backgroundColor: 'var(--tag-bg)',
                        color: 'var(--tag-text)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '12px',
                        marginRight: '4px',
                        whiteSpace: 'nowrap',
                        border: '1px solid var(--tag-border)'
                    }}>
                        {op}
                    </span>
                ))}
                {overflowCount > 0 && (
                    <span style={{
                        display: 'inline-block',
                        backgroundColor: 'var(--tag-bg)',
                        color: 'var(--tag-text)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        border: '1px solid var(--tag-border)'
                    }}>
                        +{overflowCount}
                    </span>
                )}
            </div>
        );
    };

    const columns = [
        { header: 'Key Name', key: 'name' },
        {
            header: 'Algorithm',
            key: 'algorithm',
            render: (row) => <Badge variant="warning">{row.algorithm}</Badge>,
        },
        {
            header: 'Operations',
            key: 'operations',
            render: (row) => getOperationBadges(row.algorithm)
        },
        { header: 'Environment', key: 'environment' },
        {
            header: 'Status',
            key: 'status',
            render: (row) => {
                const status = (row.status || '').toLowerCase();
                let variant = 'default';
                let label = row.status;
                
                if (status === 'active') variant = 'success';
                else if (status === 'rotated') {
                    variant = 'warning';
                    label = 'Rotated';
                }
                else if (status === 'disabled') variant = 'error';
                
                return <Badge variant={variant}>{label}</Badge>;
            },
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
                const isActive = row.status && row.status.toLowerCase() === 'active';
                const actions = [
                    {
                        label: 'View Details',
                        icon: <Eye size={14} />,
                        onClick: () => {
                            setSelectedKeyForDetails(row);
                            setIsDetailsModalOpen(true);
                        }
                    },
                    {
                        label: 'Copy Key ID',
                        icon: <Copy size={14} />,
                        onClick: () => {
                            navigator.clipboard.writeText(row.id);
                            toast.success('Key ID copied to clipboard');
                        }
                    }
                ];

                if (isActive) {
                    actions.push(
                        {
                            label: 'Rotate Key',
                            icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 0-18.8 4.3" /></svg>,
                            onClick: () => {
                                if (window.confirm('Rotate this key? The current key will be marked as rotated and a new key will be generated. All policies will be migrated.')) {
                                    rotatePQCKey(row.id);
                                }
                            }
                        },
                        {
                            label: 'Disable Key',
                            icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>,
                            variant: 'danger',
                            onClick: () => {
                                if (window.confirm('Disable this key? It will no longer be usable for cryptographic operations.')) {
                                    updatePQCKey({ id: row.id, status: 'disabled' });
                                }
                            }
                        }
                    );
                }

                return <ActionMenu actions={actions} />;
            },
        },
    ];

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setKeyToEdit(null); // Reset edit state on close
    };

    return (
        <div className="page">
            <PageHeader
                title="PQC Keys"
                subtitle="Manage your post-quantum cryptographic keys"
                action={
                    <Button onClick={() => setIsCreateModalOpen(true)}>+ Create PQC Key</Button>
                }
            />

            <div className="page-content">
                {pqcKeys.length === 0 ? (
                    <EmptyState
                        icon={<Key size={48} />}
                        title="No PQC keys yet"
                        description="Create your first post-quantum cryptographic key to get started"
                        actionLabel="+ Create PQC Key"
                        onAction={() => setIsCreateModalOpen(true)}
                    />
                ) : (
                    <div className="table-wrapper">
                        <div className="table-header-title">
                            All Keys ({pqcKeys.length})
                        </div>
                        <Table 
                            columns={columns} 
                            data={[...pqcKeys].sort((a, b) => {
                                // Sort Active keys to the top
                                if (a.status === 'active' && b.status !== 'active') return -1;
                                if (a.status !== 'active' && b.status === 'active') return 1;
                                return new Date(b.created).getTime() - new Date(a.created).getTime();
                            })} 
                        />
                    </div>
                )}
            </div>

            <CreatePQCKeyModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onCreate={handleCreateKey}
                initialData={keyToEdit}
                existingKeys={pqcKeys}
            />

            <KeyDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                keyData={selectedKeyForDetails}
            />
        </div>
    );
};

export default PQCKeys;
