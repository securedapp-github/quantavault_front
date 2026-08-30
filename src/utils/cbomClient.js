const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Returns a stable per-browser-session UUID.
 * Persists across page refreshes via localStorage.
 */
function getOrCreateSessionId() {
  let id = localStorage.getItem('cbom_session_id');
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('cbom_session_id', id);
  }
  return id;
}

function getAuthToken() {
  return localStorage.getItem('jwt_token') || '';
}

function extractErrorMessage(errorData, status) {
  if (!errorData) return `HTTP error! status: ${status}`;
  if (typeof errorData === 'string') return errorData;
  if (typeof errorData.error === 'string') return errorData.error;
  if (errorData.error && typeof errorData.error.message === 'string') return errorData.error.message;
  if (typeof errorData.message === 'string') return errorData.message;
  return `HTTP error! status: ${status}`;
}

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/cbom') || endpoint.startsWith('/auth') ? '' : '/cbom'}${endpoint}`;
  const token = getAuthToken();
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Session-ID': getOrCreateSessionId(),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(extractErrorMessage(errorData, response.status));
    }
    return await response.json();
  } catch (error) {
    console.error(`[API Client Error] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  getHealth: () => fetchApi('/health'),
  
  // Scans
  getScans: () => fetchApi('/scans'),
  getScanDetail: (id) => fetchApi(`/scans/${id}`),
  triggerScan: (targetDirectory) => fetchApi('/scan', {
    method: 'POST',
    body: JSON.stringify({ targetLocation: targetDirectory, target_directory: targetDirectory }),
  }),
  triggerScanByTarget: (targetId, tlsTargets = []) => fetchApi(`/targets/${targetId}/scan`, {
    method: 'POST',
    body: JSON.stringify(tlsTargets.length > 0 ? { tls_targets: tlsTargets } : {}),
  }),

  // Scan History from MySQL Database
  getScanHistory: () => fetchApi('/history'),

  // Targets
  getTargets: () => fetchApi('/targets'),
  createTarget: (targetData) => fetchApi('/targets', {
    method: 'POST',
    body: JSON.stringify(targetData),
  }),
  getTargetScans: (targetId) => fetchApi(`/targets/${targetId}/scans`),

  // Upload Folder Ingestion & Scan
  uploadFolderScan: async (formData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/cbom/scan`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'X-Session-ID': getOrCreateSessionId(),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(extractErrorMessage(errorData, response.status));
    }
    return await response.json();
  },

  // Migration Plan & Exporters
  getMigrationPlan: (scanId) => fetchApi(`/scans/${scanId}/migration`),
  exportCycloneDXJson: (scanId) => fetchApi(`/scans/${scanId}/export?format=json`),
  exportCycloneDXXml: (scanId) => fetchApi(`/scans/${scanId}/export?format=xml`),
};

export default api;
