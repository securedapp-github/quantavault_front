export const KEY_USAGE_OPTIONS = [
    { value: 'digitalSignature', label: 'Digital Signature', desc: 'Verifying digital signatures (authentication, integrity, non-repudiation).' },
    { value: 'nonRepudiation', label: 'Non-Repudiation', desc: 'Preventing a signing entity from denying its signature.' },
    { value: 'keyEncipherment', label: 'Key Encipherment', desc: 'Encrypting keys (RSA standard for key exchange).' },
    { value: 'dataEncipherment', label: 'Data Encipherment', desc: 'Encrypting raw application data directly.' },
    { value: 'keyAgreement', label: 'Key Agreement', desc: 'ECDH key exchange protocol usage.' },
    { value: 'keyCertSign', label: 'Certificate Signing', desc: 'Signing other certificates (CA only).' },
    { value: 'cRLSign', label: 'CRL Signing', desc: 'Signing Certificate Revocation Lists (CA only).' },
    { value: 'encipherOnly', label: 'Encipher Only', desc: 'Encrypting data only after Key Agreement.' },
    { value: 'decipherOnly', label: 'Decipher Only', desc: 'Decrypting data only after Key Agreement.' }
];

export const EKU_OPTIONS = [
    { value: 'ServerAuth', label: 'Server Authentication (SSL/TLS)' },
    { value: 'ClientAuth', label: 'Client Authentication (mTLS)' },
    { value: 'CodeSigning', label: 'Code Signing' },
    { value: 'EmailProtection', label: 'Email Protection (S/MIME)' },
    { value: 'TimeStamping', label: 'Time Stamping' },
    { value: 'OCSPSigning', label: 'OCSP Signing' }
];

export const CERT_PROFILES = {
    TLS_SERVER: {
        name: 'TLS Server',
        recommendedEkus: ['ServerAuth'],
        recommendedKus: ['digitalSignature', 'keyEncipherment'],
        sanRequired: true,
        maxValidityDays: 397,
        hint: 'Used for securing web servers, APIs, and load balancers.'
    },
    TLS_CLIENT: {
        name: 'mTLS Client',
        recommendedEkus: ['ClientAuth'],
        recommendedKus: ['digitalSignature', 'keyAgreement'],
        sanRequired: false,
        maxValidityDays: 825,
        hint: 'Used for client-side authentication during mutual TLS (mTLS).'
    },
    CODE_SIGNING: {
        name: 'Code Signing',
        recommendedEkus: ['CodeSigning'],
        recommendedKus: ['digitalSignature'],
        sanRequired: false,
        maxValidityDays: 825,
        hint: 'Used for digitally signing executable code, scripts, and software packages.'
    },
    EMAIL_PROTECTION: {
        name: 'Email Protection',
        recommendedEkus: ['EmailProtection'],
        recommendedKus: ['digitalSignature', 'keyEncipherment'],
        sanRequired: true,
        maxValidityDays: 825,
        hint: 'Used for S/MIME email signing and encryption.'
    },
    INTERNAL_SERVICE: {
        name: 'Internal Service',
        recommendedEkus: ['ServerAuth', 'ClientAuth'],
        recommendedKus: ['digitalSignature', 'keyEncipherment', 'keyAgreement'],
        sanRequired: false,
        maxValidityDays: 825,
        hint: 'Combined Server and Client authentication for internal microservices.'
    },
    CUSTOM: {
        name: 'Custom',
        recommendedEkus: [],
        recommendedKus: [],
        sanRequired: false,
        maxValidityDays: 825,
        hint: 'Define key usage and extended key usage constraints manually.'
    }
};

/**
 * Detects the matching certificate profile based on selected EKUs.
 * @param {string[]} selectedEkus 
 * @returns {string|null} Profile key or null
 */
export const detectProfile = (selectedEkus) => {
    if (!selectedEkus || selectedEkus.length === 0) {
        return null;
    }

    const has = (eku) => selectedEkus.includes(eku);

    if (selectedEkus.length === 1) {
        if (has('ServerAuth')) return 'TLS_SERVER';
        if (has('ClientAuth')) return 'TLS_CLIENT';
        if (has('CodeSigning')) return 'CODE_SIGNING';
        if (has('EmailProtection')) return 'EMAIL_PROTECTION';
    }

    if (selectedEkus.length === 2 && has('ServerAuth') && has('ClientAuth')) {
        return 'INTERNAL_SERVICE';
    }

    return 'CUSTOM';
};

/**
 * Checks selected EKUs for incompatible combinations.
 * @param {string[]} selectedEkus 
 * @returns {string|null} Warning message or null
 */
export const checkEkuCompatibility = (selectedEkus) => {
    if (!selectedEkus || selectedEkus.length === 0) {
        return null;
    }

    const has = (eku) => selectedEkus.includes(eku);

    if (has('CodeSigning') && has('ServerAuth')) {
        return 'Warning: Code Signing combined with Server Authentication is rejected by public CAs.';
    }

    if (has('CodeSigning') && has('ClientAuth')) {
        return 'Warning: Code Signing combined with Client Authentication is non-standard and may be rejected by client browsers.';
    }

    if (has('TimeStamping') && selectedEkus.length > 1) {
        return 'Warning: Time Stamping certificates should be standalone and not combined with other usages.';
    }

    if (selectedEkus.length >= 3) {
        return 'Warning: Selecting 3 or more Extended Key Usages is unusual. Please verify your intent.';
    }

    return null;
};
