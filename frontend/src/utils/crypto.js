// utils/crypto.js

// Utility function to convert ArrayBuffer to Base64 string
export function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Utility function to convert Base64 string to ArrayBuffer
export function base64ToArrayBuffer(base64) {
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error('Base64 to ArrayBuffer conversion failed:', error);
    throw new Error('Invalid key format.');
  }
}

// Generate RSA Key Pair and export to Base64 strings without PEM headers
export async function generateRSAKeyPair() {
  try {
    // 1. Generate the RSA-OAEP key pair
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048, // Can be 1024, 2048, or 4096
        publicExponent: new Uint8Array([1, 0, 1]), // 65537
        hash: "SHA-256",
      },
      true, // Whether the key is extractable (i.e., can be used in exportKey)
      ["encrypt", "decrypt"] // Can be any combination of "encrypt", "decrypt", "wrapKey", or "unwrapKey"
    );

    // 2. Export the public key to SPKI format
    const exportedPublicKey = await window.crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey
    );
    const publicKeyBase64 = arrayBufferToBase64(exportedPublicKey);

    // 3. Export the private key to PKCS8 format
    const exportedPrivateKey = await window.crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey
    );
    const privateKeyBase64 = arrayBufferToBase64(exportedPrivateKey);

    return {
      publicKey: publicKeyBase64,
      privateKey: privateKeyBase64,
    };
  } catch (error) {
    console.error("Error generating RSA key pair:", error);
    throw error;
  }
}


// Encrypt private key
export async function encryptPrivateKey(privateKeyBase64, passphrase) {

  try{
    // Convert private key from Base64 string to ArrayBuffer
    const privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64)


    // Generate random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Derive a key from the passphrase using PBKDF2
    const keyMaterial = await getKeyMaterial(passphrase);
      const key = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: new Uint8Array(16), // Use a fixed salt or retrieve it securely
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
      );

    // Encrypt private key using AES-GCM
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
        tagLength: 128,
      },
      key,
      privateKeyBuffer
    );
  
    // Get the encrypted data and the auth tag separately
    const encryptedData = new Uint8Array(encryptedBuffer);
    const tag = encryptedData.slice(encryptedData.length - 16); // tag is 16 bytes long in AES-GCM with a tagLength of 128
    const actualEncryptedData = encryptedData.slice(0, encryptedData.length - 16);

      // Convert to hex strings for storage
      const ivHex = arrayBufferToHex(iv);
      const encryptedDataHex = arrayBufferToHex(actualEncryptedData);
      const tagHex = arrayBufferToHex(tag);


    return {
      iv: ivHex,
      encryptedData: encryptedDataHex,
      tag: tagHex,
    };
  }
  catch (error) {
      console.error("Error encrypting private key:", error);
    throw error;
  }
}

// Decrypt the encryptedPrivateKey using user-provided passphrase
export async function decryptPrivateKey(encrypted, passphrase) {
    const { iv, encryptedData, tag } = encrypted;
    
    // Convert hex strings to ArrayBuffers
    const ivBuffer = hexToArrayBuffer(iv);
    const encryptedDataBuffer = hexToArrayBuffer(encryptedData);
    const tagBuffer = hexToArrayBuffer(tag);

    // Combine encryptedData and tag for AES-GCM decryption
    const combinedEncrypted = new Uint8Array(encryptedDataBuffer.byteLength + tagBuffer.byteLength);
    combinedEncrypted.set(new Uint8Array(encryptedDataBuffer), 0);
    combinedEncrypted.set(new Uint8Array(tagBuffer), encryptedDataBuffer.byteLength);

    // Derive a key from the passphrase using PBKDF2
    const keyMaterial = await getKeyMaterial(passphrase);
    const key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new Uint8Array(16), // Use a fixed salt or retrieve it securely
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    
      try {
          const decryptedBuffer = await window.crypto.subtle.decrypt(
              {
              name: "AES-GCM",
              iv: ivBuffer,
              tagLength: 128,
              },
              key,
              combinedEncrypted
          );

          const decoder = new TextDecoder();
          return decoder.decode(decryptedBuffer);
      } catch (error) {
      console.error('Private key decryption failed:', error);
      throw new Error('Failed to decrypt private key.');
      }
}



// Helper function to derive key material from passphrase
async function getKeyMaterial(passphrase) {
    const encoder = new TextEncoder();
    return await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
}


// Helper function to convert hex string to ArrayBuffer
function hexToArrayBuffer(hex) {
  if (hex.length % 2 !== 0) throw new Error('Invalid hex string');
  const buffer = new ArrayBuffer(hex.length / 2);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < hex.length; i += 2) {
    view[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return buffer;
}

// Helper function to convert ArrayBuffer to hex string
function arrayBufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }