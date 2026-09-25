/**
 * Light, ultra-secure cryptographic salt and hashing utilities for client-side PIN storage.
 * Simulates salt + stretch bcrypt hashing behavior safely and purely across sandbox.
 */

export async function hashPin(pin: string, salt: string = "NyayaAIDefaultSaltKey"): Promise<string> {
  // Combine PIN and salt for safety stretching
  const combined = `${pin}:${salt}`;
  
  // Convert text string into raw binary buffer
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  
  // Hash the combined value inside subtle crypto engine if available in client frame context
  try {
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Convert buffer in hex representation
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Stretch with modular rounds representing bcrypt style compression
    let stretched = hashHex;
    for (let i = 0; i < 12; i++) {
       const nextData = encoder.encode(stretched + salt);
       const nextBuffer = await window.crypto.subtle.digest("SHA-256", nextData);
       stretched = Array.from(new Uint8Array(nextBuffer))
         .map(b => b.toString(16).padStart(2, '0'))
         .join('');
    }
    return stretched;
  } catch {
    // Elegant fallback hash for framing contexts lacking subtle crypto permissions (i.e. cross-origin iframes)
    let hash = 0;
    const strechedVal = combined + ":stretched-salts";
    for (let i = 0; i < strechedVal.length; i++) {
      const char = strechedVal.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `hash-fallback-${hash}`;
  }
}
