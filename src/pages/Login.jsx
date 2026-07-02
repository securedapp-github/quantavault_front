import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Shield, Lock, Key, LogOut, Sun, Moon } from 'lucide-react';
import Button from '../components/Button';
import TwoFactorVerify from '../components/TwoFactorVerify';
import { useQuantum } from '../context/QuantumContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import './Login.css';

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" width="16" height="16">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-.19-.58z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    login,
    logout,
    pending2FA,
    initiateTwoFactorLogin,
    setLoading
  } = useQuantum();
  const { theme, setTheme, isDark } = useTheme();
  const [error, setError] = useState('');

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // Handle Google Login Success — send code to backend
  const handleGoogleSuccess = async (codeResponse) => {
    setLoading(true);
    try {
      const result = await api.googleLogin(codeResponse.code);

      if (result.requires2FA) {
        // Backend says user has 2FA enabled — go to verification
        setLoading(false);
        initiateTwoFactorLogin(result.user, result.tempToken);
      } else {
        // No 2FA — login directly with JWT
        // Note: loading will be cleared by loadAllData in QuantumContext after isAuthenticated changes
        login(result.user, result.token);
        navigate('/dashboard');
      }

    } catch (err) {
      setLoading(false);
      console.error("Login failed:", err);
      setError(err.message || "Failed to verify Google account");
    }
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google Login Failed'),
    flow: 'auth-code',
  });

  const handleAction = () => {
    if (isAuthenticated) {
      logout();
    } else {
      loginGoogle();
    }
  };



  // If 2FA verification is pending, show the verification screen
  if (pending2FA) {
    return <TwoFactorVerify />;
  }

  return (
    <div className="login-container">
      <button
        className="login-theme-toggle"
        onClick={toggleTheme}
        title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="login-content">
        <div className="logo-container">
          <img
            src={isDark ? "/2.svg" : "/1.svg"}
            alt="QuantumVault Logo"
            style={{ width: '96px', height: '96px', objectFit: 'contain' }}
          />
        </div>

        <div className="app-brand">
          <img
            src={isDark ? "/3.svg" : "/4.svg"}
            alt="QuantumVault"
            className="app-title-img"
            style={{ width: '260px', height: 'auto', objectFit: 'contain', marginBottom: '8px' }}
          />
        </div>
        <p className="app-subtitle">Post-Quantum Cryptography as a Service</p>

        <div className="feature-cards">
          <div className="feature-card">
            <Lock className="feature-icon" size={20} />
            <span className="feature-text">Quantum-Safe</span>
          </div>
          <div className="feature-card">
            <Key className="feature-icon" size={20} />
            <span className="feature-text">HSM-Backed</span>
          </div>
        </div>

        <div className="login-actions">
          <Button
            variant="primary"
            className="google-login-btn"
            onClick={handleAction}
          >
            {isAuthenticated ? (
              <>
                <LogOut size={16} />
                Sign Out
              </>
            ) : (
              <>
                <GoogleIcon />
                Sign in with Google
              </>
            )}
          </Button>

          {error && <p style={{ color: '#FF4757', marginTop: '8px', fontSize: '13px' }}>{error}</p>}




        </div>

        <footer className="login-footer">
          Enterprise-grade security for the quantum era
        </footer>
      </div>
    </div>
  );
};

export default Login;
