/**
 * API Utility Configuration
 * 
 * Uses VITE_API_URL from .env if available, otherwise defaults to localhost.
 * This file handles all HTTP communication with the backend.
 */
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Retrieve the JWT token from local storage
 */
const getToken = () => localStorage.getItem('jwt_token');

/**
 * Standardized response handler
 * - Parses JSON response
 * - Throws Error on non-200 status codes
 * - Attaches error details to the thrown Error object
 */
const handleResponse = async (response) => {
    let data;
    try {
        data = await response.json();
    } catch (e) {
        // If it's a 204 No Content, an empty object is fine
        if (response.status === 204) return {};

        // If not OK, throw standard error
        if (!response.ok) {
            const error = new Error(`Server error (${response.status})`);
            error.status = response.status;
            throw error;
        }

        // If OK but not JSON (and not 204), the response body is malformed/unexpected
        const error = new Error(`Invalid response format from server (${response.status})`);
        error.status = response.status;
        throw error;
    }
    if (!response.ok) {
        // Robust error extraction: Handle both simplified string format and legacy nested object format
        let message = `Request failed (${response.status})`;

        if (data?.error) {
            if (typeof data.error === 'string') {
                message = data.error;
            } else if (typeof data.error === 'object' && data.error.message) {
                message = data.error.message;
            }
        }

        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        throw error;
    }
    return data;
};

/**
 * Helper to construct request headers
 * @param {boolean} includeAuth - Whether to include the Authorization: Bearer token header
 */
const headers = (includeAuth = true) => {
    const h = { 'Content-Type': 'application/json' };
    if (includeAuth) {
        const token = getToken();
        if (token) h['Authorization'] = `Bearer ${token}`;
    }
    return h;
};

const api = {
    // ---- Auth ----
    googleLogin: (code) =>
        fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: headers(false),
            body: JSON.stringify({ code })
        }).then(handleResponse),

    devBypassLogin: () =>
        fetch(`${API_URL}/auth/dev-bypass`, {
            method: 'POST',
            headers: headers(false)
        }).then(handleResponse),

    verify2FALogin: (tempToken, code) =>
        fetch(`${API_URL}/auth/2fa/verify`, {
            method: 'POST',
            headers: headers(false),
            body: JSON.stringify({ tempToken, code })
        }).then(handleResponse),

    getProfile: () =>
        fetch(`${API_URL}/auth/me`, { headers: headers() }).then(handleResponse),

    setup2FA: () =>
        fetch(`${API_URL}/auth/2fa/setup`, {
            method: 'POST',
            headers: headers()
        }).then(handleResponse),

    verifySetup2FA: (code, secret) =>
        fetch(`${API_URL}/auth/2fa/verify-setup`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ code, secret })
        }).then(handleResponse),

    get2FAStatus: () =>
        fetch(`${API_URL}/auth/2fa/status`, { headers: headers() }).then(handleResponse),

    disable2FA: () =>
        fetch(`${API_URL}/auth/2fa`, {
            method: 'DELETE',
            headers: headers()
        }).then(handleResponse),

    // ---- PQC Keys ----
    getPqcKeys: () =>
        fetch(`${API_URL}/pqc-keys`, { headers: headers() }).then(handleResponse),

    createPqcKey: (keyData) =>
        fetch(`${API_URL}/pqc-keys`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(keyData)
        }).then(handleResponse),

    updatePqcKey: (id, updateData) =>
        fetch(`${API_URL}/pqc-keys/${id}`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify(updateData)
        }).then(handleResponse),

    rotatePqcKey: (id) =>
        fetch(`${API_URL}/pqc-keys/${id}/rotate`, {
            method: 'POST',
            headers: headers()
        }).then(handleResponse),

    // ---- Auth Keys ----
    getAuthKeys: () =>
        fetch(`${API_URL}/auth-keys`, { headers: headers() }).then(handleResponse),

    createAuthKey: (keyData) =>
        fetch(`${API_URL}/auth-keys`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(keyData)
        }).then(handleResponse),

    updateAuthKey: (id, updateData) =>
        fetch(`${API_URL}/auth-keys/${id}`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify(updateData)
        }).then(handleResponse),

    // ---- Policies ----
    getPolicies: () =>
        fetch(`${API_URL}/policies`, { headers: headers() }).then(handleResponse),

    createPolicy: (policyData) =>
        fetch(`${API_URL}/policies`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(policyData)
        }).then(handleResponse),

    updatePolicy: (id, updateData) =>
        fetch(`${API_URL}/policies/${id}`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify(updateData)
        }).then(handleResponse),

    // ---- Audit Logs ----
    getAuditLogs: () =>
        fetch(`${API_URL}/audit-logs`, { headers: headers() }).then(handleResponse),

    // ---- Dashboard ----
    getDashboardStats: () =>
        fetch(`${API_URL}/dashboard/stats`, { headers: headers() }).then(handleResponse),

    // ---- Contact Us ----
    submitContactRequest: (data) => {
        // Transform data to specific format required by backend/external service
        const payload = {
            fullName: `${data.name} - ${data.company}`,
            mobile: "9999999999", // Placeholder mobile number for contact requests
            email: data.email,
            serviceOffering: data.tier,
            message: "cms contact us",
            agreePrivacy: true,
            subscribeUpdates: true
        };

        return fetch(`${API_URL.replace('/api', '')}/requests`, { // Direct call to the separate endpoint
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(handleResponse);
    },

    // ---- IP Whitelist Settings ----
    getIpWhitelist: () =>
        fetch(`${API_URL}/auth/settings/ip-whitelist`, { headers: headers() }).then(handleResponse),

    updateIpWhitelist: ({ mode, whitelist }) =>
        fetch(`${API_URL}/auth/settings/ip-whitelist`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify({ mode, whitelist })
        }).then(handleResponse),

    // ---- MTLS Settings ----
    getMTLSSettings: () =>
        fetch(`${API_URL}/auth/mtls/settings`, { headers: headers() }).then(handleResponse),

    updateMTLSSettings: (mtlsMode) =>
        fetch(`${API_URL}/auth/mtls/settings`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify({ mtlsMode })
        }).then(handleResponse),

    // ---- MTLS Certificate Management ----
    issueMTLSCertificate: (csr, certificateName) =>
        fetch(`${API_URL}/auth/mtls/issue`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ csr, certificateName })
        }).then(handleResponse),

    getActiveMTLSCertificates: () =>
        fetch(`${API_URL}/auth/mtls/certificates`, { headers: headers() }).then(handleResponse),

    getRevokedMTLSCertificates: () =>
        fetch(`${API_URL}/auth/mtls/certificates/revoked`, { headers: headers() }).then(handleResponse),

    revokeMTLSCertificate: (certificateId, reason = 'user_requested', notes = '') =>
        fetch(`${API_URL}/auth/mtls/certificates/${certificateId}?reason=${reason}&notes=${encodeURIComponent(notes)}`, {
            method: 'DELETE',
            headers: headers()
        }).then(handleResponse),

    downloadMTLSCertificates: (certificateId) =>
        fetch(`${API_URL}/auth/mtls/download/${certificateId}`, { headers: headers() }).then(handleResponse),

    verifyMTLSCertificate: (certificate) =>
        fetch(`${API_URL}/auth/mtls/verify`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ certificate })
        }).then(handleResponse),
};

export default api;