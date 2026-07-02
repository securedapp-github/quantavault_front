import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/cert.api';
import toast from 'react-hot-toast';
import { useQuantum } from './QuantumContext';

const CertContext = createContext();

export const useCert = () => {
    const context = useContext(CertContext);
    if (!context) throw new Error('useCert must be used within a CertProvider');
    return context;
};

export const CertProvider = ({ children }) => {
    const { isAuthenticated } = useQuantum();
    const [user] = useState({
        name: 'Test Administrator',
        email: 'test@quantumvault.local',
        avatar: 'https://ui-avatars.com/api/?name=Test+Administrator&background=6366f1&color=fff&size=64',
    });

    const [keys, setKeys] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, expiringSoon: 0, revoked: 0 });
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    /*const loadAllData = async () => {
        try {
            setLoading(true);
            // 1. Ensure token exists (or fetch developer token)
            let token = localStorage.getItem('jwt_token');
            if (!token) {
                const tokenData = await api.getDevToken();
                token = tokenData.token;
                localStorage.setItem('jwt_token', token);
            }

            // 2. Fetch primary datasets in parallel
            let statsData, keysData, certsData;
            let authError = false;

            const handleAuthCatch = (err, defaultVal) => {
                if (err.status === 401 || err.status === 403) {
                    authError = true;
                }
                console.error('API call failed:', err);
                return defaultVal;
            };

            const [sD, kD, cD] = await Promise.all([
                api.getStats().catch(err => handleAuthCatch(err, null)),
                api.getKeys().catch(err => handleAuthCatch(err, null)),
                api.getCertificates().catch(err => handleAuthCatch(err, null))
            ]);

            if (authError) {
                console.warn('Access token invalid or expired, refreshing developer token...');
                localStorage.removeItem('jwt_token');
                const tokenData = await api.getDevToken();
                token = tokenData.token;
                localStorage.setItem('jwt_token', token);

                // Retry once
                const [retrySD, retryKD, retryCD] = await Promise.all([
                    api.getStats(),
                    api.getKeys(),
                    api.getCertificates()
                ]);
                statsData = retrySD;
                keysData = retryKD;
                certsData = retryCD;
            } else {
                statsData = sD || { total: 0, active: 0, expiringSoon: 0, revoked: 0 };
                keysData = kD || [];
                certsData = cD || { certificates: [] };
            }

            setStats(statsData);
            setKeys(keysData);
            const certList = certsData.certificates || [];
            setCertificates(certList);

            // 3. Fetch audit logs for recent certificates in parallel (up to 20 for performance)
            const recentCerts = certList.slice(0, 20);
            if (recentCerts.length > 0) {
                const logPromises = recentCerts.map(c =>
                    api.getCertAuditLogs(c.id).catch(err => {
                        console.error(`Error fetching audit logs for cert ${c.id}:`, err);
                        return [];
                    })
                );
                const allLogs = await Promise.all(logPromises);
                const flattenedLogs = allLogs.flat().sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setAuditLogs(flattenedLogs);
            } else {
                setAuditLogs([]);
            }
        } catch (err) {
            console.error('Failed to load data from backend:', err);
            toast.error('Failed to authenticate or connect with the backend server.');
        } finally {
            setLoading(false);
        }
    };*/

    const loadAllData = async () => {
        try {
            setLoading(true);

            // 1. Token ensure karo PEHLE — parallel calls se pehle
            let token = localStorage.getItem('jwt_token');
            if (!token) {
                const tokenData = await api.getDevToken();
                token = tokenData.token;
                localStorage.setItem('jwt_token', token);
            }

            // 2. Token validity verify karo — ek call se check karo
            //    Agar 401/403 aaya to fresh dev token lo, phir aage bado
            try {
                await api.getStats();
            } catch (err) {
                if (err.status === 401 || err.status === 403) {
                    localStorage.removeItem('jwt_token');
                    try {
                        // getDevToken fail ho sakta hai — outer flow block mat karo
                        const tokenData = await api.getDevToken();
                        localStorage.setItem('jwt_token', tokenData.token);
                    } catch (devTokenErr) {
                        console.warn('Dev token unavailable:', devTokenErr.message);
                        // Aage bado — Promise.all try karega, auth error aayegi to handle hogi
                    }
                }
            }

            // 3. Token confirmed — ab parallel calls karo
            const [statsData, keysData, certsData] = await Promise.all([
                api.getStats().catch(() => ({ total: 0, active: 0, expiringSoon: 0, revoked: 0 })),
                api.getKeys().catch(() => []),
                api.getCertificates().catch(() => ({ certificates: [] }))
            ]);

            setKeys(keysData || []);

            const certList = (certsData?.certificates || []).map(c => {
                let type = c.certType || 'LEAF';
                if (c.keyId) {
                    const key = (keysData || []).find(k => k.id === c.keyId);
                    if (key) {
                        if (key.caType === 'ROOT') type = 'ROOT';
                        else if (key.caType === 'INTERMEDIATE') type = 'INTERMEDIATE';
                    }
                }
                return { ...c, certType: type };
            });
            setCertificates(certList);

            // Recalculate stats for LEAF only to ensure consistency in frontend
            const leafCerts = certList.filter(c => c.certType === 'LEAF');
            const now = new Date();
            const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            const calculatedStats = {
                total: leafCerts.length,
                active: leafCerts.filter(c => c.status === 'ACTIVE' || c.status === 'active').length,
                expiringSoon: leafCerts.filter(c => 
                    (c.status === 'ACTIVE' || c.status === 'active') && c.notAfter &&
                    new Date(c.notAfter) <= in30Days && new Date(c.notAfter) >= now
                ).length,
                revoked: leafCerts.filter(c => c.status === 'REVOKED' || c.status === 'revoked').length,
                pending: leafCerts.filter(c => c.status === 'PENDING' || c.status === 'pending').length
            };
            setStats(calculatedStats);

            // 4. Audit logs — recent certs ke liye
            const recentCerts = certList.slice(0, 20);
            if (recentCerts.length > 0) {
                const allLogs = await Promise.all(
                    recentCerts.map(c =>
                        api.getCertAuditLogs(c.id).catch(err => {
                            console.error(`Error fetching audit logs for cert ${c.id}:`, err);
                            return [];
                        })
                    )
                );
                setAuditLogs(
                    allLogs.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                );
            } else {
                setAuditLogs([]);
            }

        } catch (err) {
            console.error('Failed to load data from backend:', err);
            toast.error('Failed to authenticate or connect with the backend server.');
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount or when authentication status changes to true
    useEffect(() => {
        if (isAuthenticated) {
            loadAllData();
        } else {
            // Clear state on logout
            setKeys([]);
            setCertificates([]);
            setStats({ total: 0, active: 0, expiringSoon: 0, revoked: 0 });
            setAuditLogs([]);
            setLoading(false);
        }
    }, [isAuthenticated]);

    const logout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('jwt_token');
            window.location.href = '/login';
        }
    };

    // --- Key Actions ---
    const createKey = async (name) => {
        try {
            const newKey = await api.createKey(name);
            toast.success(`Key "${name}" created successfully`);
            await loadAllData();
            return newKey;
        } catch (err) {
            toast.error(err.message || 'Failed to create key');
            throw err;
        }
    };

    const setupRootCA = async (payload) => {
        try {
            const result = await api.setupRootCA(payload);
            toast.success('Root CA created successfully');
            await loadAllData();
            return result;
        } catch (err) {
            toast.error(err.message || 'Failed to setup Root CA');
            throw err;
        }
    };

    // Issues an Intermediate CA key+cert under the given Root CA
    const issueIntermediate = async (rootKeyId, payload) => {
        try {
            const result = await api.issueIntermediate(rootKeyId, payload);
            toast.success(`Intermediate CA "${payload.name}" issued successfully`);
            await loadAllData();
            return result;
        } catch (err) {
            toast.error(err.message || 'Failed to issue Intermediate CA');
            throw err;
        }
    };

    // --- Certificate Actions ---
    const generateCSR = async (keyId, csrForm) => {
        try {
            const result = await api.generateCSR(keyId, csrForm);
            toast.success('CSR generated successfully');
            await loadAllData();
            return result;
        } catch (err) {
            toast.error(err.message || 'Failed to generate CSR');
            throw err;
        }
    };

    const importCertificate = async (pem, name, keyId, chain) => {
        try {
            const result = await api.importCertificate(pem, name, keyId, chain);
            toast.success('Certificate imported successfully');
            await loadAllData();
            return result;
        } catch (err) {
            toast.error(err.message || 'Failed to import certificate');
            throw err;
        }
    };

    // Signs a leaf CSR using an Intermediate CA key (NOT Root — Root cannot sign leaf directly)
    const signCsrInternally = async (csrPem, issuingKeyId, name, validityDays) => {
        try {
            const result = await api.signCsrInternally(csrPem, issuingKeyId, name, validityDays);
            toast.success('Leaf certificate issued successfully');
            await loadAllData();
            return result;
        } catch (err) {
            toast.error(err.message || 'Failed to sign CSR internally');
            throw err;
        }
    };

    const downloadCert = async (id) => {
        try {
            const result = await api.downloadCert(id);
            return result;
        } catch (err) {
            toast.error(err.message || 'Failed to download certificate');
            throw err;
        }
    };

    // Downloads the full PEM chain: leaf + ICA cert + Root cert
    const downloadChain = async (id) => {
        try {
            const result = await api.downloadChain(id);
            toast.success('Certificate chain downloaded');
            await loadAllData();
            return result;
        } catch (err) {
            toast.error(err.message || 'Failed to download certificate chain');
            throw err;
        }
    };

    const renewCert = async (id) => {
        try {
            const result = await api.renewCert(id);
            toast.success('New CSR generated for renewal');
            await loadAllData();
            return result;
        } catch (err) {
            toast.error(err.message || 'Failed to renew certificate');
            throw err;
        }
    };

    const revokeCert = async (id, reason) => {
        try {
            const result = await api.revokeCert(id, reason);
            toast.success('Certificate revoked');
            await loadAllData();
            return result;
        } catch (err) {
            toast.error(err.message || 'Failed to revoke certificate');
            throw err;
        }
    };

    const value = {
        user,
        keys,
        certificates,
        stats,
        auditLogs,
        loading,
        refreshData: loadAllData,
        logout,
        createKey,
        setupRootCA,
        issueIntermediate,
        generateCSR,
        importCertificate,
        signCsrInternally,
        downloadCert,
        downloadChain,
        renewCert,
        revokeCert
    };

    return (
        <CertContext.Provider value={value}>
            {children}
        </CertContext.Provider>
    );
};
