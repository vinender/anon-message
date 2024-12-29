// utils/crypto.js

// Base conversion utilities
export function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper function to properly pad base64 strings
function padBase64(base64) {
  return base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
}

// Improved base64 conversion functions
export function base64ToArrayBuffer(base64) {
  try {
    // Remove any whitespace and PEM headers
    const cleanBase64 = base64
      .replace(/[\s\-]/g, '')
      .replace(/BEGIN.*?KEY\-+/, '')
      .replace(/END.*?KEY\-+/, '');

    // Add padding if necessary
    const paddedBase64 = cleanBase64.padEnd(
      cleanBase64.length + (4 - (cleanBase64.length % 4)) % 4,
      '='
    );

    // Convert to binary string
    const binaryString = atob(paddedBase64);
    
    // Convert to Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer;
  } catch (error) {
    console.error('Base64 conversion failed:', {
      error,
      inputLength: base64?.length,
      inputSample: base64?.substring(0, 50)
    });
    throw error;
  }
}
// Key material generation
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

// Core cryptographic functions
export async function generateRSAKeyPair() {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );

    const exportedPublicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const exportedPrivateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    return {
      publicKey: arrayBufferToBase64(exportedPublicKey),
      privateKey: arrayBufferToBase64(exportedPrivateKey)
    };
  } catch (error) {
    console.error("Error generating RSA key pair:", error);
    throw error;
  }
}

export async function encryptPrivateKey(privateKeyBase64, passphrase) {
  try {
    const privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    
    const keyMaterial = await getKeyMaterial(passphrase);
    const key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
        tagLength: 128,
      },
      key,
      privateKeyBuffer
    );

    return {
      iv: btoa(String.fromCharCode(...iv)),
      encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
      salt: btoa(String.fromCharCode(...salt))
    };
  } catch (error) {
    console.error("Error encrypting private key:", error);
    throw error;
  }
}

export async function decryptPrivateKey(encryptedData, iv, salt, passphrase) {
  try {
    const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
    const encryptedDataArray = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const saltArray = Uint8Array.from(atob(salt), c => c.charCodeAt(0));

    const keyMaterial = await getKeyMaterial(passphrase);
    const key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltArray,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivArray,
      },
      key,
      encryptedDataArray
    );

    return arrayBufferToBase64(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw error;
  }
}
// Add this helper function to format PEM key
function addPEMFormatting(base64Key) {
  return `-----BEGIN PRIVATE KEY-----\n${base64Key}\n-----END PRIVATE KEY-----`;
}

// Add this function to check if a string is valid base64
function isValidBase64(str) {
  try {
    return btoa(atob(str)) === str;
  } catch (e) {
    return false;
  }
}
async function importPrivateKey(privateKeyBase64) {
  try {
    // Clean the key string
    const cleanKey = privateKeyBase64
      .replace(/-----BEGIN PRIVATE KEY-----/g, '')
      .replace(/-----END PRIVATE KEY-----/g, '')
      .replace(/[\r\n\s]/g, '');

    // Convert to binary
    const binaryString = atob(cleanKey);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Import the key
    return await window.crypto.subtle.importKey(
      "pkcs8",
      bytes.buffer,
      {
        name: "RSA-OAEP",
        hash: { name: "SHA-256" }
      },
      true,
      ["decrypt"]
    );
  } catch (error) {
    console.error('Private key import failed:', error);
    throw error;
  }
}

export async function decryptMessage(encryptedContent, privateKeyBase64) {
  try {
    console.log('Starting decryption:', {
      encryptedLength: encryptedContent?.length,
      privateKeyLength: privateKeyBase64?.length
    });

    // Import private key
    const privateKey = await importPrivateKey(privateKeyBase64);
    console.log('Private key imported successfully');

    // Convert encrypted content from base64 to bytes
    const encryptedBytes = new Uint8Array(
      atob(encryptedContent).split('').map(char => char.charCodeAt(0))
    ).buffer;

    console.log('Encrypted content prepared:', {
      byteLength: encryptedBytes.byteLength
    });

    // Decrypt the content
    const decryptedBytes = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
        hash: { name: "SHA-256" }
      },
      privateKey,
      encryptedBytes
    );

    // Decode the result
    const decryptedText = new TextDecoder().decode(decryptedBytes);
    console.log('Decryption successful');
    
    return decryptedText;
  } catch (error) {
    console.error('Decryption failed:', {
      error,
      errorType: error.constructor.name,
      errorMessage: error.message,
      encryptedContentSample: encryptedContent?.substring(0, 50)
    });
    throw error;
  }
}