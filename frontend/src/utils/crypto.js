// utils/crypto.js
// Hybrid encryption: AES-256-GCM for message body, RSA-2048-OAEP for AES key.
// Private key stays in IndexedDB — never sent to server. No passphrase needed.

// ── Base64 / ArrayBuffer helpers ──────────────────────────────────────────

export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function base64ToArrayBuffer(base64) {
  const clean = base64.replace(/[\s\-]/g, '').replace(/-----BEGIN.*?KEY-----/g, '').replace(/-----END.*?KEY-----/g, '');
  const padded = clean.padEnd(clean.length + ((4 - (clean.length % 4)) % 4), '=');
  const binaryString = atob(padded);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes.buffer;
}

function concatBuffers(...buffers) {
  const total = buffers.reduce((s, b) => s + b.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const b of buffers) { out.set(new Uint8Array(b), offset); offset += b.byteLength; }
  return out.buffer;
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

// ── Import RSA keys ───────────────────────────────────────────────────────

async function importPublicKeySpki(base64) {
  return crypto.subtle.importKey('spki', base64ToArrayBuffer(base64), { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['encrypt']);
}

async function importPrivateKeyPkcs8(base64) {
  return crypto.subtle.importKey('pkcs8', base64ToArrayBuffer(base64), { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['decrypt']);
}

// ── Hybrid encryption (AES-256-GCM body + RSA-OAEP-wrapped AES key) ───────

const RSA_ENC_AES_KEY_BYTES = 256;

export async function hybridEncrypt(plaintext, recipientPublicKeyB64) {
  const aesKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
  const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const aesCiphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, encoded);
  const rsaPublicKey = await importPublicKeySpki(recipientPublicKeyB64);
  const encryptedAesKey = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, rsaPublicKey, rawAesKey);
  const payload = concatBuffers(encryptedAesKey, iv.buffer, aesCiphertext);
  return arrayBufferToBase64(payload);
}

export async function hybridDecrypt(encryptedPayloadB64, privateKeyB64) {
  const payload = base64ToArrayBuffer(encryptedPayloadB64);
  const payloadBytes = new Uint8Array(payload);
  if (payloadBytes.length < RSA_ENC_AES_KEY_BYTES + 12 + 1) throw new Error('Encrypted payload too short');
  const encryptedAesKey = payloadBytes.slice(0, RSA_ENC_AES_KEY_BYTES).buffer;
  const iv = payloadBytes.slice(RSA_ENC_AES_KEY_BYTES, RSA_ENC_AES_KEY_BYTES + 12);
  const aesCiphertext = payloadBytes.slice(RSA_ENC_AES_KEY_BYTES + 12).buffer;
  const rsaPrivateKey = await importPrivateKeyPkcs8(privateKeyB64);
  const rawAesKey = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, rsaPrivateKey, encryptedAesKey);
  const aesKey = await crypto.subtle.importKey('raw', rawAesKey, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, aesCiphertext);
  return new TextDecoder().decode(plain);
}

// ── decryptMessage — handles both hybrid (new) and RSA-only (old) formats ──

export async function decryptMessage(encryptedContent, privateKeyBase64) {
  try {
    return await hybridDecrypt(encryptedContent, privateKeyBase64);
  } catch {
    // Fallback: old RSA-only format (legacy messages)
    const encryptedBytes = new Uint8Array(atob(encryptedContent).split('').map((c) => c.charCodeAt(0))).buffer;
    const rsaPrivateKey = await importPrivateKeyPkcs8(privateKeyBase64);
    const decrypted = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, rsaPrivateKey, encryptedBytes);
    return new TextDecoder().decode(decrypted);
  }
}
