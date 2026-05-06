import React, { useState } from 'react';
import { FileText, Eye } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Table from '../components/Table';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import CreateAccessPolicyModal from '../components/CreateAccessPolicyModal';
import PolicyDetailsModal from '../components/PolicyDetailsModal';
import ActionMenu from '../components/ActionMenu';
import { formatDate } from '../utils/dateFormatter';
import { truncateName } from '../utils/validation';
import './Policies.css';

import { useQuantum } from '../context/QuantumContext';
import { STATUS } from '../utils/constants';

const Policies = () => {
    const { policies, authKeys, pqcKeys, addPolicy, updatePolicy } = useQuantum();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Details Modal State
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const columns = [
        { 
            header: 'Policy Name', 
            key: 'name',
            render: (row) => (
                <span title={row.name}>{truncateName(row.name)}</span>
            )
        },
        { 
            header: 'Authentication Key', 
            key: 'authKey',
            render: (row) => {
                const keyObj = authKeys.find(k => k.id === row.authKeyId);
                const isInactive = keyObj && keyObj.status !== 'active';
                return (
                    <div className="key-cell">
                        <span title={row.authKey}>{truncateName(row.authKey)}</span>
                        {isInactive && (
                            <span className="inactive-warning" title={`Key is ${keyObj.status}`}>
                                ⚠️ Inactive
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'PQC Key',
            key: 'pqcKey',
            render: (row) => {
                const keyObj = pqcKeys.find(k => k.id === row.pqcKeyId);
                const isInactive = keyObj && keyObj.status !== 'active';
                return (
                    <div className="key-cell">
                        <span title={row.pqcKey}>{row.pqcKey ? truncateName(row.pqcKey) : <span style={{ opacity: 0.5 }}>-</span>}</span>
                        {isInactive && (
                            <span className="inactive-warning" title={`Key is ${keyObj.status}`}>
                                ⚠️ Inactive
                            </span>
                        )}
                    </div>
                );
            }
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
                    updatePolicy({ ...row, status: isActive ? STATUS.DISABLED : STATUS.ACTIVE });
                };

                return (
                    <ActionMenu
                        actions={[
                            {
                                label: 'View Details',
                                icon: <Eye size={14} />,
                                onClick: () => {
                                    setSelectedPolicy(row);
                                    setIsDetailsOpen(true);
                                }
                            },
                            {
                                label: 'Edit Policy',
                                icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
                                onClick: () => {
                                    setSelectedPolicy(row);
                                    setIsModalOpen(true);
                                }
                            },
                            {
                                label: isActive ? 'Disable Policy' : 'Enable Policy',
                                icon: isActive ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg> : <FileText size={14} />,
                                variant: isActive ? 'danger' : 'default',
                                onClick: () => {
                                    if (window.confirm(`Are you sure you want to ${isActive ? 'disable' : 'enable'} this policy?`)) {
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

    const handleSavePolicy = (policy) => {
        if (policy.id) {
            updatePolicy(policy);
        } else {
            addPolicy({
                ...policy,
                created: policy.created || new Date().toISOString()
            });
        }
    };

    return (
        <div className="page">
            <PageHeader
                title="Access Policies"
                subtitle="Control which authentication keys can access your PQC keys"
                action={
                    <Button onClick={() => { setSelectedPolicy(null); setIsModalOpen(true); }}>+ Create Policy</Button>
                }
            />

            <div className="page-content">
                {policies.length === 0 ? (
                    <EmptyState
                        icon={<FileText size={48} />}
                        title="No policies yet"
                        description="Create your first policy to control access to PQC keys"
                        actionLabel="+ Create Policy"
                        onAction={() => { setSelectedPolicy(null); setIsModalOpen(true); }}
                    />
                ) : (
                    <div className="policies-table-container">
                        <div className="table-header-title">All Policies ({policies.length})</div>
                        <Table columns={columns} data={policies} />
                    </div>
                )}
            </div>

            <CreateAccessPolicyModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedPolicy(null); }}
                onSave={handleSavePolicy}
                editData={selectedPolicy}
            />

            <PolicyDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                policyData={selectedPolicy}
                onEdit={(policy) => {
                    setSelectedPolicy(policy);
                    setIsModalOpen(true);
                }}
            />
        </div>
    );
};

export default Policies;
