/**
 * Generates a unique device fingerprint based on browser and device attributes.
 * reliable enough for a "same device, same code" requirement in this context.
 */
export const getDeviceFingerprint = async () => {
    try {
        const components = [
            navigator.userAgent,
            navigator.language,
            screen.colorDepth,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            navigator.hardwareConcurrency,
            navigator.deviceMemory,
            // Fallback for some randomness if attributes are too generic, 
            // but we want STABILITY so we avoid random components.
            // We can add canvas fingerprinting here for more uniqueness if needed, 
            // but for now simple attributes should suffice for a basic "device lock" feel.
        ].filter(Boolean).join('|');

        // Use SHA-256 to hash the components
        const msgBuffer = new TextEncoder().encode(components);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Format as a 4-byte fingerprint style (e.g. ab:cd:ef:12)
        // We take the first 8 characters (4 bytes) of the hash
        const machineCode = hashHex.substring(0, 8);
        return machineCode.match(/.{1,2}/g).join(':');

    } catch (error) {
        console.error("Fingerprint generation failed", error);
        // Fallback to a random one if generation fails, though this breaks "same device" rule
        // ideally we shouldn't fail on standard browser apis.
        return '00:00:00:00';
    }
};
