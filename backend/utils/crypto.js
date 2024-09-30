// utils/crypto.js

const crypto = require('crypto');

const PRIVATE_KEY_SECRET = process.env.PRIVATE_KEY_SECRET;

// Encrypt the private key
function encryptPrivateKey(privateKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(PRIVATE_KEY_SECRET, 'hex'), iv);

  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    tag: tag,
  };
}

// Decrypt the private key
function decryptPrivateKey(encrypted) {
  const iv = Buffer.from(encrypted.iv, 'hex');
  const tag = Buffer.from(encrypted.tag, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(PRIVATE_KEY_SECRET, 'hex'), iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
  encryptPrivateKey,
  decryptPrivateKey,
};
