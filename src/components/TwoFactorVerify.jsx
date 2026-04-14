import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import { useQuantum } from '../context/QuantumContext';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';
import './TwoFactorVerify.css';

const TwoFactorVerify = () => {
    const navigate = useNavigate();
    const {
        completeTwoFactorLogin,
        cancelTwoFactorLogin
    } = useQuantum();
    const { isDark } = useTheme();

    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return;

        const newDigits = [...digits];
        newDigits[index] = value;
        setDigits(newDigits);
        setError('');

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits are entered
        if (value && index === 5 && newDigits.every(d => d !== '')) {
            handleVerify(newDigits);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            const newDigits = pasted.split('');
            setDigits(newDigits);
            inputRefs.current[5]?.focus();
            handleVerify(newDigits);
        }
    };

    const handleVerify = async (codeDigits = digits) => {
        const code = codeDigits.join('');
        if (code.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setVerifying(true);

        try {
            // Send code to backend for verification
            const result = await completeTwoFactorLogin(code);

            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error || 'Invalid code. Please try again.');
                setShake(true);
                setTimeout(() => {
                    setShake(false);
                    setDigits(['', '', '', '', '', '']);
                    inputRefs.current[0]?.focus();
                }, 600);
            }
        } catch (err) {
            console.error('TOTP verification error:', err);
            setError('Verification failed. Please try again.');
        }

        setVerifying(false);
    };

    const handleCancel = () => {
        cancelTwoFactorLogin();
    };

    return (
        <div className="tfa-verify-container">
            <div className={`tfa-verify-card ${shake ? 'shake' : ''}`}>
                <div className="tfa-icon-container">
                    <img
                        src={isDark ? "/2.svg" : "/1.svg"}
                        alt="QuantumVault Logo"
                        style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                    />
                </div>

                <h2 className="tfa-title">Two-Factor Authentication</h2>
                <p className="tfa-subtitle">
                    Enter the 6-digit code from your authenticator app
                </p>

                <div className="tfa-digit-inputs" onPaste={handlePaste}>
                    {digits.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className={`tfa-digit-input ${error ? 'error' : ''} ${digit ? 'filled' : ''}`}
                            autoComplete="one-time-code"
                        />
                    ))}
                </div>

                {error && (
                    <div className="tfa-error">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="tfa-actions">
                    <Button
                        variant="primary"
                        className="tfa-verify-btn"
                        onClick={() => handleVerify()}
                        disabled={verifying || digits.some(d => d === '')}
                    >
                        {verifying ? 'Verifying...' : 'Verify Code'}
                    </Button>

                    <button className="tfa-cancel-btn" onClick={handleCancel}>
                        <ArrowLeft size={14} />
                        Back to Login
                    </button>
                </div>

                <p className="tfa-hint">
                    Code refreshes every 30 seconds
                </p>
            </div>
        </div>
    );
};

export default TwoFactorVerify;
