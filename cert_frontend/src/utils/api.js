const API_BASE_URL = 'http://localhost:5001/api/cert';

const getToken = () => localStorage.getItem('jwt_token');

const handleResponse = async (response) => {
    let data;
    try {
        data = await response.json();
    } catch (_e) {
        if (response.status === 204) return {};
        if (!response.ok) {
            const error = new Error(`Server error (${response.status})`);
            error.status = response.status;
            throw error;
        }
        const error = new Error(`Invalid response format from server (${response.status})`);
        error.status = response.status;
        throw error;
    }
    if (!response.ok) {
        let msg = data?.error || data?.message;
        if (!msg && data?.errors && Array.isArray(data.errors)) {
            msg = data.errors.map(err => err.msg || err.message).join(', ');
        }
        const error = new Error(msg || `Request failed (${response.status})`);
        error.status = response.status;
        error.data = data;
        throw error;
    }
    return data;
};

const headers = (includeAuth = true) => {
    const h = { 'Content-Type': 'application/json' };
    if (includeAuth) {
        const token = getToken();
        if (token) h['Authorization'] = `Bearer ${token}`;
    }
    return h;
};

export const api = {
    // ---- Dev Token ----
    getDevToken: () =>
        fetch(`${API_BASE_URL}/dev-token`).then(handleResponse),

    // ---- Keys ----
    getKeys: () =>
        fetch(`${API_BASE_URL}/keys`, { headers: headers() }).then(handleResponse),

    createKey: (name) =>
        fetch(`${API_BASE_URL}/keys`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ name })
        }).then(handleResponse),

    getKeyById: (id) =>
        fetch(`${API_BASE_URL}/keys/${id}`, { headers: headers() }).then(handleResponse),

    // ---- CA Hierarchy ----
    // Issues a new Intermediate CA key + cert under the given Root CA key
    issueIntermediate: (rootKeyId, { name, subjectDN, validityDays }) =>
        fetch(`${API_BASE_URL}/keys/${rootKeyId}/issue-intermediate`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ name, subjectDN, validityDays: parseInt(validityDays) })
        }).then(handleResponse),

    // ---- Certificates ----
    getStats: () =>
        fetch(`${API_BASE_URL}/certificates/stats`, { headers: headers() }).then(handleResponse),

    getCertificates: (status) => {
        const query = status ? `?status=${status}` : '';
        return fetch(`${API_BASE_URL}/certificates${query}`, { headers: headers() }).then(handleResponse);
    },

    generateCSR: (keyId, csrData) =>
        fetch(`${API_BASE_URL}/certificates/keys/${keyId}/csr`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({
                subjectDN: csrData.subjectDN,
                sans: csrData.sans ? csrData.sans.split(',').map(s => s.trim()) : [],
                keyUsage: csrData.keyUsage ? csrData.keyUsage.split(',').map(s => s.trim()) : [],
                extendedKeyUsage: csrData.extendedKeyUsage ? csrData.extendedKeyUsage.split(',').map(s => s.trim()) : []
            })
        }).then(handleResponse),

    importCertificate: (pem, name, keyId, chain) =>
        fetch(`${API_BASE_URL}/certificates/import`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ certificate: pem, name, keyId, chain })
        }).then(handleResponse),

    // Signs a leaf CSR via an Intermediate CA key (not Root — Root cannot sign leaf directly)
    signCsrInternally: (csrPem, issuingKeyId, name, validityDays) =>
        fetch(`${API_BASE_URL}/certificates/sign-csr`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ csrPem, issuingKeyId, name, validityDays: parseInt(validityDays) })
        }).then(handleResponse),

    getCertById: (id) =>
        fetch(`${API_BASE_URL}/certificates/${id}`, { headers: headers() }).then(handleResponse),

    downloadCert: (id) =>
        fetch(`${API_BASE_URL}/certificates/${id}/download`, { headers: headers() }).then(handleResponse),

    // Downloads full PEM trust chain: leaf + ICA cert + Root cert
    downloadChain: (id) =>
        fetch(`${API_BASE_URL}/certificates/${id}/chain`, { headers: headers() }).then(handleResponse),

    getCertAuditLogs: (id) =>
        fetch(`${API_BASE_URL}/certificates/${id}/audit-logs`, { headers: headers() }).then(handleResponse),

    renewCert: (id) =>
        fetch(`${API_BASE_URL}/certificates/${id}/renew`, {
            method: 'POST',
            headers: headers()
        }).then(handleResponse),

    revokeCert: (id, reason = 'user_requested') =>
        fetch(`${API_BASE_URL}/certificates/${id}/revoke`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ reason })
        }).then(handleResponse)
};

export default api;
