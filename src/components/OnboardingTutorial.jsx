import React, { useState } from 'react';
import { Key, Shield, FileText, CheckCircle, ChevronRight, ChevronLeft, X } from 'lucide-react';
import Button from './Button';
import './OnboardingTutorial.css';

const OnboardingTutorial = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const steps = [
        {
            title: "Welcome to QuantumVault",
            description: "Secure your infrastructure with post-quantum cryptography. This quick guide will help you get started with your new quantum-safe vault.",
            icon: <Shield size={48} className="tutorial-icon-welcome" />,
            color: "var(--primary-color)"
        },
        {
            title: "Post-Quantum Keys",
            description: "Create PQC keys (like ML-DSA or ML-KEM) to protect your data against future quantum computer attacks. These are the core of your secure infrastructure.",
            icon: <Key size={48} className="tutorial-icon-pqc" />,
            color: "#6366f1"
        },
        {
            title: "Authentication Keys",
            description: "Identity keys are used to authenticate requests to the KMS. You can use ECDSA, RSA, ML-DSA or even Hybrid (PQC+Classical) signatures for maximum security.",
            icon: <Shield size={48} className="tutorial-icon-auth" />,
            color: "#8b5cf6"
        },
        {
            title: "Access Policies",
            description: "Define which Auth Keys can use which PQC Keys. You can also restrict access by IP address or require multi-factor authentication like mTLS in the Settings section for sensitive operations.",
            icon: <FileText size={48} className="tutorial-icon-policy" />,
            color: "#ec4899"
        },
        {
            title: "You're All Set!",
            description: "You're ready to start using QuantumVault. Check out the Audit Logs to monitor all activities in real-time.",
            icon: <CheckCircle size={48} className="tutorial-icon-success" />,
            color: "#10b981"
        }
    ];

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleFinish();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFinish = () => {
        onClose();
    };

    const currentData = steps[currentStep];

    return (
        <div className="tutorial-overlay" onClick={onClose}>
            <div className="tutorial-card" onClick={(e) => e.stopPropagation()}>
                <button className="tutorial-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="tutorial-progress">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                        />
                    ))}
                </div>

                <div className="tutorial-content">
                    <div className="tutorial-icon-container" style={{ backgroundColor: `${currentData.color}20`, color: currentData.color }}>
                        {currentData.icon}
                    </div>

                    <h2 className="tutorial-title">{currentData.title}</h2>
                    <p className="tutorial-description">{currentData.description}</p>
                </div>

                <div className="tutorial-footer">
                    <Button
                        variant="secondary"
                        onClick={prevStep}
                        className={currentStep === 0 ? 'invisible' : ''}
                    >
                        <ChevronLeft size={16} /> Back
                    </Button>

                    <Button variant="primary" onClick={nextStep}>
                        {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                        {currentStep !== steps.length - 1 && <ChevronRight size={16} />}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTutorial;
