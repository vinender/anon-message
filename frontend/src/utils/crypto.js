// utils/crypto.js
// Hybrid encryption: AES-256-GCM for message body, RSA-2048-OAEP for AES key.
// Private key: encrypted with AES-256-GCM using PBKDF2-derived key from user passphrase.
// Server never sees plaintext — no shared secret, no env-var passphrase.

// ── Base64 / ArrayBuffer helpers ──────────────────────────────────────────

export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64) {
  try {
    const clean = base64.replace(/[\s\-]/g, '').replace(/-----BEGIN.*?KEY-----/g, '').replace(/-----END.*?KEY-----/g, '');
    const padded = clean.padEnd(clean.length + ((4 - (clean.length % 4)) % 4), '=');
    const binaryString = atob(padded);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (err) {
    throw new Error('Invalid base64 input');
  }
}

function concatBuffers(...buffers) {
  const total = buffers.reduce((s, b) => s + b.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const b of buffers) {
    out.set(new Uint8Array(b), offset);
    offset += b.byteLength;
  }
  return out.buffer;
}

// ── Passphrase generation ─────────────────────────────────────────────────

export function generateEncryptionPassphrase() {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// ── RSA key generation ────────────────────────────────────────────────────

export async function generateRSAKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['encrypt', 'decrypt']
  );
  const [spki, pkcs8] = await Promise.all([
    crypto.subtle.exportKey('spki', keyPair.publicKey),
    crypto.subtle.exportKey('pkcs8', keyPair.privateKey),
  ]);
  return { publicKey: arrayBufferToBase64(spki), privateKey: arrayBufferToBase64(pkcs8) };
}

// ── Private-key wrapping (passphrase → PBKDF2 → AES-256-GCM) ─────────────

async function deriveKeyFromPassphrase(passphrase, salt, usage) {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 600000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage]
  );
}

export async function encryptPrivateKey(privateKeyBase64, passphrase) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKeyFromPassphrase(passphrase, salt, 'encrypt');
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, base64ToArrayBuffer(privateKeyBase64));

  return {
    iv: arrayBufferToBase64(iv.buffer),
    encryptedData: arrayBufferToBase64(ciphertext),
    salt: arrayBufferToBase64(salt.buffer),
  };
}

export async function decryptPrivateKey(encryptedDataB64, ivB64, saltB64, passphrase) {
  const iv = new Uint8Array(base64ToArrayBuffer(ivB64));
  const salt = new Uint8Array(base64ToArrayBuffer(saltB64));
  const ciphertext = base64ToArrayBuffer(encryptedDataB64);
  const key = await deriveKeyFromPassphrase(passphrase, salt, 'decrypt');
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return arrayBufferToBase64(plain);
}

// ── Import RSA keys ───────────────────────────────────────────────────────

async function importPublicKeySpki(base64) {
  return crypto.subtle.importKey('spki', base64ToArrayBuffer(base64), { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['encrypt']);
}

async function importPrivateKeyPkcs8(base64) {
  return crypto.subtle.importKey('pkcs8', base64ToArrayBuffer(base64), { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['decrypt']);
}

// ── Hybrid encryption (AES-256-GCM body + RSA-OAEP-wrapped AES key) ───────

const AES_KEY_BYTES = 32;          // AES-256
const RSA_ENC_AES_KEY_BYTES = 256; // 2048-bit RSA-OAEP output

export async function hybridEncrypt(plaintext, recipientPublicKeyB64) {
  // 1. Generate random AES-256 key
  const aesKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);

  // 2. Export raw AES key
  const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);

  // 3. Encrypt message with AES-256-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const aesCiphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, encoded);

  // 4. Wrap AES key with recipient's RSA public key
  const rsaPublicKey = await importPublicKeySpki(recipientPublicKeyB64);
  const encryptedAesKey = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, rsaPublicKey, rawAesKey);

  // 5. Pack: encryptedAesKey (256) || iv (12) || aesCiphertext (variable)
  const payload = concatBuffers(encryptedAesKey, iv.buffer, aesCiphertext);
  return arrayBufferToBase64(payload);
}

export async function hybridDecrypt(encryptedPayloadB64, privateKeyB64) {
  const payload = base64ToArrayBuffer(encryptedPayloadB64);
  const payloadBytes = new Uint8Array(payload);

  // Parse: first 256 bytes = encrypted AES key, next 12 = IV, rest = AES-GCM ciphertext
  if (payloadBytes.length < RSA_ENC_AES_KEY_BYTES + 12 + 1) {
    throw new Error('Encrypted payload too short');
  }

  const encryptedAesKey = payloadBytes.slice(0, RSA_ENC_AES_KEY_BYTES).buffer;
  const iv = payloadBytes.slice(RSA_ENC_AES_KEY_BYTES, RSA_ENC_AES_KEY_BYTES + 12);
  const aesCiphertext = payloadBytes.slice(RSA_ENC_AES_KEY_BYTES + 12).buffer;

  // 1. Unwrap AES key with recipient's RSA private key
  const rsaPrivateKey = await importPrivateKeyPkcs8(privateKeyB64);
  const rawAesKey = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, rsaPrivateKey, encryptedAesKey);

  // 2. Import unwrapped AES key
  const aesKey = await crypto.subtle.importKey('raw', rawAesKey, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);

  // 3. Decrypt message
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, aesCiphertext);
  return new TextDecoder().decode(plain);
}

// ── Legacy decryptMessage — supports both old RSA-only format and new hybrid ──
// Old format: base64(RSA-OAEP ciphertext) — ~190 byte limit, used before hybrid refactor
// New format: base64(encryptedAesKey(256) || iv(12) || AES-GCM ciphertext)

export async function decryptMessage(encryptedContent, privateKeyBase64) {
  try {
    // Try hybrid decrypt first (new format)
    return await hybridDecrypt(encryptedContent, privateKeyBase64);
  } catch {
    // Fallback: old format — RSA-OAEP only
    const encryptedBytes = new Uint8Array(
      atob(encryptedContent)
        .split('')
        .map((c) => c.charCodeAt(0))
    ).buffer;
    const rsaPrivateKey = await importPrivateKeyPkcs8(privateKeyBase64);
    const decrypted = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, rsaPrivateKey, encryptedBytes);
    return new TextDecoder().decode(decrypted);
  }
}
