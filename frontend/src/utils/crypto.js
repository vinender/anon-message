// utils/crypto.js

// Convert ArrayBuffer to Base64 string
export function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert Base64 string to PEM format
function convertToPem(base64String, type) {
  let pem = '';
  if (type === 'PUBLIC') {
    pem += '-----BEGIN PUBLIC KEY-----\n';
  } else if (type === 'PRIVATE') {
    pem += '-----BEGIN PRIVATE KEY-----\n';
  }
  // Split the Base64 string into lines of 64 characters
  for (let i = 0; i < base64String.length; i += 64) {
    pem += base64String.substr(i, 64) + '\n';
  }
  if (type === 'PUBLIC') {
    pem += '-----END PUBLIC KEY-----';
  } else if (type === 'PRIVATE') {
    pem += '-----END PRIVATE KEY-----';
  }
  return pem;
}

// Generate RSA Key Pair and export to PEM format
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

    // 2. Export the public key to PEM format
    const exportedPublicKey = await window.crypto.subtle.exportKey(
      "spki", // Subject Public Key Info
      keyPair.publicKey
    );
    const publicKeyBase64 = arrayBufferToBase64(exportedPublicKey);
    const publicKeyPem = convertToPem(publicKeyBase64, 'PUBLIC');

    // 3. Export the private key to PEM format
    const exportedPrivateKey = await window.crypto.subtle.exportKey(
      "pkcs8", // Private-Key Information Syntax Specification version 8
      keyPair.privateKey
    );
    const privateKeyBase64 = arrayBufferToBase64(exportedPrivateKey);
    const privateKeyPem = convertToPem(privateKeyBase64, 'PRIVATE');

    return {
      publicKey: publicKeyPem,
      privateKey: privateKeyPem,
    };
  } catch (error) {
    console.error("Error generating RSA key pair:", error);
    throw error;
  }
}

// Decrypt message content with privateKey
export async function decryptMessage(encryptedContent, privateKeyPem) {
  const decoder = new TextDecoder();
  const encryptedBytes = base64ToArrayBuffer(encryptedContent);
  const importedPrivateKey = await importPrivateKey(privateKeyPem);
  const decryptedBytes = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    importedPrivateKey,
    encryptedBytes
  );
  return decoder.decode(decryptedBytes);
}

// Import Private Key for Decryption
async function importPrivateKey(privateKeyPem) {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKeyPem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, '');
  const binaryDerString = window.atob(pemContents);
  const binaryDer = str2ab(binaryDerString);

  return await window.crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
}

// Convert Base64 string to ArrayBuffer
export function base64ToArrayBuffer(base64) {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper function to convert string to ArrayBuffer
function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, len = str.length; i < len; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
