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
 * Truncates a name for display based on screen width.
 * Desktop: 50 characters
 * Mobile (<= 768px): 20 characters
 * 
 * @param {string} name - The name to truncate
 * @returns {string} - Truncated name with "..." if needed
 */
export const truncateName = (name) => {
    if (!name) return '';
    
    // Determine limit based on screen width
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const limit = isMobile ? 20 : 50;

    if (name.length <= limit) return name;
    
    // Truncate and add ellipsis. 
    // We use limit - 3 to ensure the total length (including ...) matches the limit.
    return name.substring(0, limit - 3) + '...';
};
