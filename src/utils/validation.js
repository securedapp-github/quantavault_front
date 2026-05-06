/**
 * Validates a key or policy name.
 * Rules:
 * - Max 50 characters
 * - Alphanumeric, underscores (_), and hyphens (-) only
 * 
 * @param {string} name - The name to validate
 * @returns {boolean} - True if valid
 */
export const validateName = (name) => {
    if (!name) return true; // Allow empty during typing, handle required check in component
    if (name.length > 50) return false;
    const regex = /^[a-zA-Z0-9_-]*$/;
    return regex.test(name);
};

/**
 * Truncates a name for display if it exceeds 50 characters.
 * 
 * @param {string} name - The name to truncate
 * @returns {string} - Truncated name with "..." if needed
 */
export const truncateName = (name) => {
    if (!name) return '';
    if (name.length <= 50) return name;
    return name.substring(0, 46) + '...';
};
