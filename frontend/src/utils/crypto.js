// utils/crypto.js

const base64ToArrayBuffer = (base64) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export const decryptMessage = async (encryptedMessage, privateKey) => {
  try {
    const privateKeyObject = await window.crypto.subtle.importKey(
      'pkcs8',
      base64ToArrayBuffer(privateKey),
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['decrypt']
    );

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      privateKeyObject,
      base64ToArrayBuffer(encryptedMessage)
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return 'Error: Unable to decrypt message';
  }
};