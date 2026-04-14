/**
 * Formats an ISO date string into a readable localized string.
 * @param {string} isoString - The ISO date string to format.
 * @returns {string} - The formatted date string (e.g., "Feb 10, 2026, 8:30 PM").
 */
export const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
        const date = new Date(isoString);
        // Check if date is valid
        if (isNaN(date.getTime())) return isoString; // Fallback to original if invalid

        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }).format(date);
    } catch (e) {
        console.error("Date formatting error:", e);
        return isoString;
    }
};

/**
 * Formats an ISO date string into a date-only string (no time).
 * @param {string} isoString - The ISO date string to format.
 * @returns {string} - The formatted date string (e.g., "Feb 10, 2026").
 */
export const formatDateOnly = (isoString) => {
    if (!isoString) return '—';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return isoString;

        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    } catch {
        return isoString;
    }
};
