import React from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';

const PlaceholderPage = ({ title, subtitle, icon }) => {
    return (
        <div className="page">
            <PageHeader title={title} subtitle={subtitle} />
            <div className="page-content">
                <Card style={{ textAlign: 'center', padding: '60px 24px' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>{icon || '🔧'}</div>
                    <h2 style={{ marginBottom: 8, color: 'var(--color-text-primary)' }}>{title}</h2>
                    <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                        This page is from the original QuantumVault platform and will be integrated here.
                    </p>
                </Card>
            </div>
        </div>
    );
};

export const Dashboard = () => <PlaceholderPage title="Dashboard" subtitle="Overview of your quantum-safe cryptographic operations" icon="📊" />;
export const PQCKeys = () => <PlaceholderPage title="PQC Keys" subtitle="Post-quantum cryptographic keys management" icon="🔑" />;
export const AuthenticationKeys = () => <PlaceholderPage title="Authentication Keys" subtitle="Identity keys for access control" icon="🛡️" />;
export const Policies = () => <PlaceholderPage title="Policies" subtitle="Access control policies management" icon="📄" />;
export const AuditLogs = () => <PlaceholderPage title="Audit Logs" subtitle="System-wide audit trail" icon="📋" />;
export const Billing = () => <PlaceholderPage title="Billing" subtitle="Subscription and billing management" icon="💳" />;
export const Settings = () => <PlaceholderPage title="Settings" subtitle="Account and system configuration" icon="⚙️" />;
