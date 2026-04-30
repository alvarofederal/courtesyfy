export function normalizeAddress(address: string): string {
    if (!address) return '';
    
    // Remove accents and special chars
    const normalized = address
        .normalize('NFD') // Decomposes accents
        .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim()
        .toUpperCase()
        .replace(/ /g, ''); // Remove spaces

    return normalized;
}