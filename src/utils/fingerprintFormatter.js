/**
 * Formats a colon-separated fingerprint string to show the first 3 parts and the last 3 parts.
 * Example: "AA:BB:CC:DD:EE:FF:GG:HH" -> "AA:BB:CC ... FF:GG:HH"
 * @param {string} fingerprint 
 * @returns {string} formatted fingerprint
 */
export const formatFingerprint = (fingerprint) => {
    if (!fingerprint) return '';
    const parts = fingerprint.split(':');
    if (parts.length <= 6) return fingerprint;

    const firstThree = parts.slice(0, 3).join(':');
    const lastThree = parts.slice(-3).join(':');

    return `${firstThree} ... ${lastThree}`;
};
