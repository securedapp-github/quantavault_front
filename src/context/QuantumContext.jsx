import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const QuantumContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useQuantum = () => {
    const context = useContext(QuantumContext);
    if (!context) {
        throw new Error('useQuantum must be used within a QuantumProvider');
    }
    return context;
};

/**
 * QuantumProvider
 * The centralized state management engine for the application.
 * Handles:
 * 1. Global Authentication state (JWT + User Profile)
 * 2. 2FA Lifecycle (Setup, Verification, Gating)
 * 3. Data Synchronization (Fetching keys/policies/logs on login)
 * 4. CRUD operations for cryptographic entities
 * 5. Session Timeout logic
 */
export const QuantumProvider = ({ children }) => {
    // 2FA Pending State (for login gating)
    const [pending2FA, setPending2FA] = useState(false);
    const [pendingUser, setPendingUser] = useState(null);
    const [tempToken, setTempToken] = useState(null);

    // Auth State
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user_profile');
        return savedUser ? JSON.parse(savedUser) : {
            name: 'Guest User',
            email: 'guest@quantumvault.io',
            avatar: 'G'
        };
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem('jwt_token');
    });

    // Data State
    const [pqcKeys, setPqcKeys] = useState([]);
    const [authKeys, setAuthKeys] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(false);

    /**
     * Resets all application state and clears local storage.
     * Used for manual logout and session timeouts.
     */
    const performLogout = useCallback(() => {
        setIsAuthenticated(false);
        setPending2FA(false);
        setPendingUser(null);
        setTempToken(null);
        setPqcKeys([]);
        setAuthKeys([]);
        setPolicies([]);
        setAuditLogs([]);
        setDashboardStats(null);
        const guestUser = { name: 'Guest User', email: 'guest@quantumvault.io', avatar: 'G' };
        setUser(guestUser);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_profile');
        localStorage.removeItem('lastActive');
    }, []);

    // Load all data from backend when authenticated
    const loadAllData = useCallback(async () => {
        if (!localStorage.getItem('jwt_token')) return;
        setLoading(true);
        try {
            const [keys, aKeys, pols, logs, stats] = await Promise.all([
                api.getPqcKeys(),
                api.getAuthKeys(),
                api.getPolicies(),
                api.getAuditLogs(),
                api.getDashboardStats()
            ]);
            setPqcKeys(keys);
            setAuthKeys(aKeys);
            setPolicies(pols);
            setAuditLogs(logs);
            setDashboardStats(stats);
        } catch (err) {
            console.error('Failed to load data:', err.message);
            // If token is expired/invalid, logout
            if (err.status === 401) {
                performLogout();
            }
        } finally {
            setLoading(false);
        }
    }, [performLogout]);

    // Load data on authentication
    useEffect(() => {
        if (isAuthenticated) {
            loadAllData();
        }
    }, [isAuthenticated, loadAllData]);

    // Session Timeout (30 mins)
    useEffect(() => {
        if (!isAuthenticated) return;

        const updateActivity = () => {
            localStorage.setItem('lastActive', Date.now().toString());
        };

        const checkTimeout = () => {
            const lastActive = localStorage.getItem('lastActive');
            if (lastActive) {
                const inactiveTime = Date.now() - parseInt(lastActive);
                if (inactiveTime > 30 * 60 * 1000) {
                    performLogout();
                    console.warn("Session timed out due to inactivity");
                }
            }
        };

        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('click', updateActivity);
        const interval = setInterval(checkTimeout, 60 * 1000);
        updateActivity();

        return () => {
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keydown', updateActivity);
            window.removeEventListener('click', updateActivity);
            clearInterval(interval);
        };
    }, [isAuthenticated, performLogout]);

    // --- Auth ---
    /**
     * Finalizes the authentication process.
     * Saves JWT and user profile to localStorage for persistence.
     * 
     * @param {Object} userData - User profile from API
     * @param {string} token - Valid JWT from API
     */
    const login = (userData, token) => {
        if (token) {
            localStorage.setItem('jwt_token', token);
        }
        if (userData) {
            setUser(userData);
            localStorage.setItem('user_profile', JSON.stringify(userData));
        }
        setIsAuthenticated(true);
        localStorage.setItem('lastActive', Date.now().toString());
    };

    const logout = () => {
        performLogout();
    };

    // --- 2FA Login Flow ---
    const initiateTwoFactorLogin = (userData, tToken) => {
        setPendingUser(userData);
        setTempToken(tToken);
        setPending2FA(true);
    };

    /**
     * 2FA Logic: Verify code during login using a temporary token.
     * If successful, triggers the main login() function.
     * 
     * @param {string} code - 6-digit TOTP code
     */
    const completeTwoFactorLogin = async (code) => {
        setLoading(true);
        try {
            const result = await api.verify2FALogin(tempToken, code);
            login(result.user, result.token);
            setPending2FA(false);
            setPendingUser(null);
            setTempToken(null);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const cancelTwoFactorLogin = () => {
        setPending2FA(false);
        setPendingUser(null);
        setTempToken(null);
    };

    // --- PQC Key Actions ---
    const addPQCKey = async (keyData) => {
        try {
            const newKey = await api.createPqcKey(keyData);
            setPqcKeys(prev => [newKey, ...prev]);
            await refreshAuditLogs();
            toast.success('PQC key created successfully');
            return newKey;
        } catch (err) {
            toast.error(err.message || 'Failed to create PQC key');
            throw err;
        }
    };

    const updatePQCKey = async (updatedKey) => {
        try {
            const updated = await api.updatePqcKey(updatedKey.id, updatedKey);
            setPqcKeys(prev => prev.map(k => k.id === updated.id ? updated : k));
            // Refresh policies in case of cascade rename
            const freshPolicies = await api.getPolicies();
            setPolicies(freshPolicies);
            await refreshAuditLogs();
            toast.success('PQC key updated');
            return updated;
        } catch (err) {
            toast.error(err.message || 'Failed to update PQC key');
            throw err;
        }
    };

    const rotatePQCKey = async (keyId) => {
        try {
            const newKey = await api.rotatePqcKey(keyId);
            // Reload all keys (old one is now 'rotated', new one is 'active')
            const freshKeys = await api.getPqcKeys();
            setPqcKeys(freshKeys);
            // Policies are migrated to the new key by the backend
            const freshPolicies = await api.getPolicies();
            setPolicies(freshPolicies);
            await refreshAuditLogs();
            toast.success('PQC key rotated successfully');
            return newKey;
        } catch (err) {
            toast.error(err.message || 'Failed to rotate PQC key');
            throw err;
        }
    };

    // --- Auth Key Actions ---
    const addAuthKey = async (keyData) => {
        try {
            const newKey = await api.createAuthKey(keyData);
            setAuthKeys(prev => [newKey, ...prev]);
            await refreshAuditLogs();
            toast.success('Authentication key created');
            return newKey;
        } catch (err) {
            toast.error(err.message || 'Failed to create authentication key');
            throw err;
        }
    };

    const updateAuthKey = async (updatedKey) => {
        try {
            const updated = await api.updateAuthKey(updatedKey.id, updatedKey);
            setAuthKeys(prev => prev.map(k => k.id === updated.id ? updated : k));
            // Refresh policies in case of cascade rename
            const freshPolicies = await api.getPolicies();
            setPolicies(freshPolicies);
            await refreshAuditLogs();
            toast.success('Authentication key updated');
            return updated;
        } catch (err) {
            toast.error(err.message || 'Failed to update authentication key');
            throw err;
        }
    };

    // --- Policy Actions ---
    const addPolicy = async (policyData) => {
        try {
            const newPolicy = await api.createPolicy(policyData);
            setPolicies(prev => [newPolicy, ...prev]);
            await refreshAuditLogs();
            toast.success('Policy created successfully');
            return newPolicy;
        } catch (err) {
            toast.error(err.message || 'Failed to create policy');
            throw err;
        }
    };

    const updatePolicy = async (updatedPolicy) => {
        try {
            const updated = await api.updatePolicy(updatedPolicy.id, updatedPolicy);
            setPolicies(prev => prev.map(p => p.id === updated.id ? updated : p));
            await refreshAuditLogs();
            toast.success('Policy updated');
            return updated;
        } catch (err) {
            toast.error(err.message || 'Failed to update policy');
            throw err;
        }
    };

    // --- Helpers ---
    const refreshAuditLogs = async () => {
        try {
            const logs = await api.getAuditLogs();
            setAuditLogs(logs);
        } catch (err) {
            console.error('Failed to refresh audit logs:', err.message);
        }
    };

    const value = {
        user,
        pqcKeys,
        addPQCKey,
        updatePQCKey,
        rotatePQCKey,

        authKeys,
        addAuthKey,
        updateAuthKey,
        policies,
        addPolicy,
        updatePolicy,
        auditLogs,
        dashboardStats,
        isAuthenticated,
        loading,
        setLoading,
        login,
        logout,
        // 2FA
        pending2FA,
        pendingUser,
        tempToken,
        initiateTwoFactorLogin,
        completeTwoFactorLogin,
        cancelTwoFactorLogin
    };

    return (
        <QuantumContext.Provider value={value}>
            {children}
        </QuantumContext.Provider>
    );
};
