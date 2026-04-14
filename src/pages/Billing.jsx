import React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import ContactUsModal from '../components/ContactUsModal';
import './Billing.css';

const Billing = () => {
    const [isContactModalOpen, setIsContactModalOpen] = React.useState(false);
    const [selectedTier, setSelectedTier] = React.useState('Hardware-Anchored PQC');

    const handleContactClick = (tierName) => {
        setSelectedTier(tierName);
        setIsContactModalOpen(true);
    };

    const plans = [
        {
            name: 'Developer Tier',
            tagline: 'Post-quantum cryptography for development and testing',
            featured: true,
            features: [
                'For experimentation, learning, and integration',
                'Post-quantum cryptography APIs (ML-KEM, ML-DSA, Hybrid)',
                'Software-based keys',
                'Rate-limited usage',
                'Fast setup for CI/CD and testing'
            ],
            buttonText: 'Current Plan',
            variant: 'secondary'
        },
        {
            name: 'Hardware-Anchored PQC',
            tagline: 'Production-grade, hardware-anchored post-quantum cryptography with FIPS Level 3 key protection',
            features: [
                'For production SaaS and security-forward teams',
                'FIPS 140-3 Level 3 validated HSMs for root key protection',
                'Hardware-isolated post-quantum cryptographic execution',
                'Non-exportable private keys',
                'Secure key lifecycle management',
                'Signed, immutable audit logs',
                'Low-latency, developer-friendly APIs'
            ],
            buttonText: 'Contact Us',
            variant: 'primary'
        },
        {
            name: 'PQC Cloud HSM',
            tagline: 'Enterprise-grade post-quantum cloud HSM with certified hardware security',
            features: [
                'For enterprises and regulated environments',
                'Certified hardware cryptographic isolation',
                'Native post-quantum key protection',
                'Strong key custody and access controls',
                'High availability and scalability',
                'Compliance-ready audit and reporting'
            ],
            buttonText: 'Contact Us',
            variant: 'primary'
        }
    ];

    const comparisonData = [
        { feature: 'PQC algorithms', dev: true, pro: true, enterprise: true },
        { feature: 'Hardware root of trust', dev: false, pro: true, enterprise: true },
        { feature: 'Non-exportable keys', dev: false, pro: true, enterprise: true },
        { feature: 'Audit logging', dev: false, pro: true, enterprise: true },
        { feature: 'Compliance readiness', dev: false, pro: 'partial', enterprise: true },
        { feature: 'Target users', dev: 'Devs', pro: 'SaaS teams', enterprise: 'Enterprises' },
    ];

    const renderStatus = (status) => {
        if (status === true) return <Check size={20} className="feature-check" />;
        if (status === false) return <X size={20} style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }} />;
        if (status === 'partial') return <AlertTriangle size={20} className="status-warning" />;
        return <span style={{ color: 'var(--color-text-primary)' }}>{status}</span>;
    };

    return (
        <div className="page billing-page">
            <PageHeader
                title="Billing & Plans"
                subtitle="Choose the right security model for your needs"
            />
            <div className="page-content">
                {/* Pricing Cards */}
                <div className="pricing-grid">
                    {plans.map((plan, index) => (
                        <div key={index} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
                            <h3 className="plan-name">{plan.name}</h3>
                            <p className="plan-tagline">{plan.tagline}</p>
                            <ul className="plan-features">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="plan-feature-item">
                                        <Check size={16} className="feature-check" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="plan-button">
                                <Button
                                    variant={plan.variant || 'primary'}
                                    fullWidth
                                    onClick={() => {
                                        if (plan.buttonText === 'Contact Us') {
                                            handleContactClick(plan.name);
                                        }
                                    }}
                                    disabled={plan.buttonText === 'Current Plan'}
                                >
                                    {plan.buttonText}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Comparison Table */}
                <div className="comparison-section">
                    <div className="comparison-header">Quick Comparison</div>
                    <table className="comparison-table">
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th>Developer Tier</th>
                                <th>Hardware-Anchored PQC</th>
                                <th>PQC Cloud HSM</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonData.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.feature}</td>
                                    <td>{renderStatus(row.dev)}</td>
                                    <td>{renderStatus(row.pro)}</td>
                                    <td>{renderStatus(row.enterprise)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ContactUsModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                initialTier={selectedTier}
            />
        </div>
    );
};

export default Billing;
