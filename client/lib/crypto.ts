// AES-GCM with PBKDF2 (SHA-256)
// Data model returned by encryptJSON is suitable to store in DB as ciphertext only.

export type EncryptedPayload = {
  cipherText: string; // base64
  iv: string; // base64
  salt: string; // base64
  iterations: number;
  algo: "AES-GCM";
  version: 1;
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function fromBase64(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function deriveKey(
  master: string,
  salt: ArrayBuffer,
  iterations = 210000
) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(master),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptJSON(
  master: string,
  obj: unknown
): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 210000;
  const key = await deriveKey(master, salt.buffer, iterations);
  const plaintext = textEncoder.encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );
  return {
    cipherText: toBase64(ct),
    iv: toBase64(iv.buffer),
    salt: toBase64(salt.buffer),
    iterations,
    algo: "AES-GCM",
    version: 1,
  };
}

export async function decryptJSON<T = any>(
  master: string,
  payload: EncryptedPayload
): Promise<T> {
  const iv = new Uint8Array(fromBase64(payload.iv));
  const salt = fromBase64(payload.salt);
  const key = await deriveKey(master, salt, payload.iterations);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    fromBase64(payload.cipherText)
  );
  return JSON.parse(textDecoder.decode(pt)) as T;
}
