// src/utils/storage.js

import { openDB } from 'idb';

// Helper function to convert ArrayBuffer to Base64
export function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return window.btoa(binary);
}

// Helper function to convert Base64 to ArrayBuffer
export function base64ToArrayBuffer(base64) {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Initialize IndexedDB within functions to ensure client-side execution
async function getDB() {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is not available on the server.');
  }
  return await openDB('user-db', 1, {
    upgrade(db) {
      db.createObjectStore('keys');
    },
  });
}

// Store encrypted private key
export async function storePrivateKey(data) {
  const db = await getDB();
  await db.put('keys', data, 'privateKey');
}

// Retrieve encrypted private key
export async function getPrivateKey() {
  const db = await getDB();
  return await db.get('keys', 'privateKey');
}

// Delete private key (optional)
export async function deletePrivateKey() {
  const db = await getDB();
  await db.delete('keys', 'privateKey');
}




// Encrypt private key with passphrase
export async function encryptPrivateKey(privateKey, passphrase) {
    const encoder = new TextEncoder();
    const passphraseKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(passphrase),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
  
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
  
    const key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      passphraseKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
    const encryptedPrivateKey = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoder.encode(privateKey)
    );
  
    return {
      encryptedPrivateKey: arrayBufferToBase64(encryptedPrivateKey),
      iv: arrayBufferToBase64(iv),
      salt: arrayBufferToBase64(salt),
    };
  }
  
  // Decrypt private key with passphrase
  export async function decryptPrivateKey(encryptedData, passphrase) {
    const { encryptedPrivateKey, iv, salt } = encryptedData;
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
  
    const passphraseKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(passphrase),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
  
    const key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: base64ToArrayBuffer(salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      passphraseKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["decrypt"]
    );
  
    try {
      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: base64ToArrayBuffer(iv) },
        key,
        base64ToArrayBuffer(encryptedPrivateKey)
      );
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Invalid passphrase or corrupted private key.');
    }
  }
  
  // Decrypt message content with privateKey
  export async function decryptMessage(encryptedContent, privateKey) {
    const decoder = new TextDecoder();
    const encryptedBytes = base64ToArrayBuffer(encryptedContent);
    const decryptedBytes = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      await importPrivateKey(privateKey),
      encryptedBytes
    );
    return decoder.decode(decryptedBytes);
  }
  
  // Import Private Key for Decryption
  async function importPrivateKey(privateKey) {
    const keyBuffer = base64ToArrayBuffer(privateKey);
    return await window.crypto.subtle.importKey(
      "pkcs8",
      keyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["decrypt"]
    );
  }
  