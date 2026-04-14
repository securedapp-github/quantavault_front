import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import api from '../utils/api';
import './ContactUsModal.css';

const ContactUsModal = ({ isOpen, onClose, initialTier = 'Hardware-Anchored PQC' }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        tier: initialTier
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({ ...prev, tier: initialTier }));
        }
    }, [isOpen, initialTier]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = {
            name: formData.name,
            email: formData.email,
            company: formData.company,
            tier: formData.tier
        };

        try {
            await api.submitContactRequest(payload);
            toast.success('Message sent successfully! We will contact you shortly.');
            onClose();
            // Reset form
            setFormData({ name: '', email: '', company: '', tier: initialTier });
        } catch (error) {
            console.error('Failed to submit request:', error);
            toast.error(error.message || 'Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const tierOptions = [
        'Hardware-Anchored PQC',
        'PQC Cloud HSM'
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Contact Us"
            size="medium"
        >
            <div className="contact-us-modal">
                <form onSubmit={handleSubmit} className="contact-us-form">
                    <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="John Doe"
                        required
                    />

                    <Input
                        label="Work Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="john@company.com"
                        required
                    />

                    <Input
                        label="Company Name"
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        placeholder="Acme Inc."
                        required
                    />

                    <div className="form-group">
                        <label className="form-label">Interested Plan</label>
                        <select
                            className="form-select"
                            value={formData.tier}
                            onChange={(e) => handleChange('tier', e.target.value)}
                        >
                            {tierOptions.map(option => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-footer">
                        <Button variant="secondary" onClick={onClose} type="button">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Submit Request'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default ContactUsModal;
