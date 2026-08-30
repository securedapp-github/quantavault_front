const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem('jwt_token');

const handleResponse = async (response) => {
    let data;
    try {
        data = await response.json();
    } catch (e) {
        if (response.status === 204) return {};
        if (!response.ok) {
            throw new Error(`Server error (${response.status})`);
        }
        throw new Error(`Invalid response format from server (${response.status})`);
    }
    if (!response.ok) {
        const message = data?.error || data?.message || `Request failed (${response.status})`;
        throw new Error(message);
    }
    return data;
};

const headers = () => {
    const h = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
};

export const cbomApi = {
    // Execute CBOM scan
    executeScan: (scanPayload) =>
        fetch(`${API_URL}/cbom/scan`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(scanPayload)
        }).then(handleResponse),

    // Get user scan history audit logs from DB
    getScanHistory: () =>
        fetch(`${API_URL}/cbom/history`, {
            headers: headers()
        }).then(handleResponse),

    // Get scan detail
    getScanDetail: (id) =>
        fetch(`${API_URL}/cbom/scans/${id}`, {
            headers: headers()
        }).then(handleResponse),

    // Get CycloneDX CBOM JSON/XML URL or blob
    getCycloneDXUrl: (id, format = 'json') =>
        `${API_URL}/cbom/scans/${id}/cyclonedx?format=${format}`,

    // Get PQC Migration Plan
    getMigrationPlan: (id) =>
        fetch(`${API_URL}/cbom/scans/${id}/migration`, {
            headers: headers()
        }).then(handleResponse),
};

export default cbomApi;
