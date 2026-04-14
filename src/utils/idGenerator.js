/**
 * Generates a random lowercase alphanumeric, 32-character ID.
 * Format: "jh77r4bx8h8ensced4fa8zwv9580fgnr"
 */
export const generateId = (length = 32) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % chars.length];
    }

    return result;
};
