/**
 * Validates a key name.
 * Rules:
 * - Required
 * - Max 30 characters
 * - Alphanumeric, underscores (_), and hyphens (-) only
 * 
 * @param {string} name - The name to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateKeyName = (name) => {
    if (!name || !name.trim()) return 'Key name is required';
    if (name.length > 30) return 'Key name must be 30 characters or less';
    const regex = /^[a-zA-Z0-9_-]+$/;
    if (!regex.test(name)) return 'Key name can only contain alphanumeric characters, underscores, and hyphens';
    return null;
};

/**
 * Validates intermediate/other display names.
 * Rules:
 * - Required
 * - Max 100 characters
 * - Alphanumeric, spaces, periods, underscores, and hyphens only
 * 
 * @param {string} name - The name to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateDisplayName = (name) => {
    if (!name || !name.trim()) return 'Name is required';
    if (name.length > 100) return 'Name must be 100 characters or less';
    const regex = /^[a-zA-Z0-9 _.-]+$/;
    if (!regex.test(name)) return 'Name can only contain alphanumeric characters, spaces, periods, underscores, and hyphens';
    return null;
};

/**
 * Validates a Subject DN.
 * Rules:
 * - Required
 * - Must contain CN= (case-insensitive)
 * - Comma-separated key=value pairs
 * 
 * @param {string} dn - The DN string to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateSubjectDN = (dn) => {
    if (!dn || !dn.trim()) return 'Subject DN is required';
    if (!dn.toLowerCase().includes('cn=')) return 'Subject DN must contain a Common Name (CN=...)';
    const regex = /^([a-zA-Z0-9.-]+=[^,=]+)(,\s*[a-zA-Z0-9.-]+=[^,=]+)*$/;
    if (!regex.test(dn)) {
        return 'Invalid Subject DN format (e.g. CN=example.com,O=Org,C=US)';
    }
    return null;
};

/**
 * Validates Validity Days for Intermediate CA.
 * Rules:
 * - Between 30 and 1825
 * 
 * @param {string|number} days - Validity in days
 * @returns {string|null} - Error message or null if valid
 */
export const validateICAValidity = (days) => {
    if (days === '' || days === undefined || days === null) return 'Validity days is required';
    const num = parseInt(days);
    if (isNaN(num)) return 'Validity must be a number';
    if (num < 30 || num > 1825) return 'Validity must be between 30 and 1825 days (max 5 years)';
    return null;
};

/**
 * Validates Validity Days for Leaf Certificate.
 * Rules:
 * - Between 1 and 825
 * 
 * @param {string|number} days - Validity in days
 * @returns {string|null} - Error message or null if valid
 */
export const validateLeafValidity = (days) => {
    if (days === '' || days === undefined || days === null) return 'Validity days is required';
    const num = parseInt(days);
    if (isNaN(num)) return 'Validity must be a number';
    if (num < 1 || num > 825) return 'Validity must be between 1 and 825 days (max ~2 years)';
    return null;
};

/**
 * Validates SANs string.
 * Rules:
 * - Comma-separated list of IPs, Emails, or Domains
 * 
 * @param {string} sansStr - The comma-separated SANs
 * @returns {string|null} - Error message or null if valid
 */
export const validateSANs = (sansStr) => {
    if (!sansStr || !sansStr.trim()) return null; // SANs is optional
    const parts = sansStr.split(',').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
        const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(part) || /^[0-9a-fA-F:]{2,}$/.test(part);
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part);
        const isDNS = /^([a-zA-Z0-9*-]+\.)+[a-zA-Z]{2,}$/.test(part);
        if (!isIP && !isEmail && !isDNS) {
            return `Invalid SAN format: "${part}". Must be a valid IP, Email, or DNS domain`;
        }
    }
    return null;
};

/**
 * Validates Key Usages.
 * 
 * @param {string} usageStr - Comma-separated key usages
 * @returns {string|null} - Error message or null if valid
 */
export const validateKeyUsages = (usageStr) => {
    if (!usageStr || !usageStr.trim()) return null;
    const allowed = [
        'digitalSignature', 'nonRepudiation', 'keyEncipherment',
        'dataEncipherment', 'keyAgreement', 'keyCertSign',
        'cRLSign', 'encipherOnly', 'decipherOnly'
    ];
    const parts = usageStr.split(',').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
        if (!allowed.some(a => a.toLowerCase() === part.toLowerCase())) {
            return `Invalid key usage: "${part}"`;
        }
    }
    return null;
};

/**
 * Validates Extended Key Usages (EKUs).
 * 
 * @param {string} ekuStr - Comma-separated EKUs
 * @returns {string|null} - Error message or null if valid
 */
export const validateEKUs = (ekuStr) => {
    if (!ekuStr || !ekuStr.trim()) return null;
    const allowed = ['ServerAuth', 'ClientAuth', 'CodeSigning', 'EmailProtection', 'TimeStamping', 'OCSPSigning'];
    const parts = ekuStr.split(',').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
        if (!allowed.some(a => a.toLowerCase() === part.toLowerCase())) {
            return `Invalid EKU: "${part}"`;
        }
    }
    return null;
};

/**
 * Validates Certificate PEM structure.
 * 
 * @param {string} pem - PEM certificate string
 * @returns {string|null} - Error message or null if valid
 */
export const validateCertPem = (pem) => {
    if (!pem || !pem.trim()) return 'Certificate PEM is required';
    if (!pem.includes('-----BEGIN CERTIFICATE-----') || !pem.includes('-----END CERTIFICATE-----')) {
        return 'Must contain valid PEM headers (-----BEGIN CERTIFICATE----- ... -----END CERTIFICATE-----)';
    }
    return null;
};

/**
 * Validates CSR PEM structure.
 * 
 * @param {string} pem - PEM CSR string
 * @returns {string|null} - Error message or null if valid
 */
export const validateCsrPem = (pem) => {
    if (!pem || !pem.trim()) return 'CSR PEM is required';
    if (!pem.includes('-----BEGIN CERTIFICATE REQUEST-----') || !pem.includes('-----END CERTIFICATE REQUEST-----')) {
        return 'Must contain valid PEM headers (-----BEGIN CERTIFICATE REQUEST----- ... -----END CERTIFICATE REQUEST-----)';
    }
    return null;
};

/**
 * Keep compatibility for other files importing name checks
 */
export const validateName = (name) => {
    if (!name) return true;
    if (name.length > 30) return false;
    const regex = /^[a-zA-Z0-9_-]*$/;
    return regex.test(name);
};

export const truncateName = (name) => {
    if (!name) return '';
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const limit = isMobile ? 20 : 30;
    if (name.length <= limit) return name;
    return name.substring(0, limit) + '...';
};

/**
 * Validates Common Name (CN)
 */
export const validateCN = (cn) => {
    if (!cn || !cn.trim()) return 'Common Name (CN) is required';
    if (cn.length > 64) return 'Common Name must be 64 characters or less';
    if (/[<>;'"&]/.test(cn)) return 'Common Name cannot contain special characters (< > ; \' " &)';
    return null;
};

/**
 * Validates Organization (O)
 */
export const validateO = (o) => {
    if (!o || !o.trim()) return null; // Optional
    if (o.length > 64) return 'Organization must be 64 characters or less';
    if (/[<>;'"&]/.test(o)) return 'Organization cannot contain special characters (< > ; \' " &)';
    return null;
};

/**
 * Validates Country (C)
 */
export const validateC = (c) => {
    if (!c || !c.trim()) return null; // Optional
    if (c.length !== 2) return 'Country must be exactly 2 letters';
    if (!/^[A-Z]{2}$/.test(c.toUpperCase())) return 'Country must be A-Z letters only';
    return null;
};
