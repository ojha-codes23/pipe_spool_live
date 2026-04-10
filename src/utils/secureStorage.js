const SECRET_KEY =
    (typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.VITE_SECRET_KEY) ||
    (typeof process !== "undefined" &&
        process.env &&
        process.env.REACT_APP_SECRET_KEY);
// 🔴 move this to env for real production

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function getKey() {
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(SECRET_KEY),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode("rpr-salt"),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

export async function encryptData(data) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await getKey();

    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(JSON.stringify(data))
    );

    return {
        iv: Array.from(iv),
        value: Array.from(new Uint8Array(encrypted))
    };
}

export async function decryptData(encryptedData) {
    const key = await getKey();
    const iv = new Uint8Array(encryptedData.iv);
    const value = new Uint8Array(encryptedData.value);

    const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        value
    );

    return JSON.parse(decoder.decode(decrypted));
}
