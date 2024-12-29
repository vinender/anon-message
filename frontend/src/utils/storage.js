// utils/storage.js
import getDB from './db';

export async function storePrivateKey(data) {
  try {
    const db = await getDB();
    if (!db) return;

    const tx = db.transaction('keys', 'readwrite');
    const store = tx.objectStore('keys');
    await store.put(data, 'privateKey');

    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error('Error storing private key:', error);
    throw error;
  }
}

export async function getPrivateKey() {
  try {
    const db = await getDB();
    if (!db) return null;

    const tx = db.transaction('keys', 'readonly');
    const store = tx.objectStore('keys');
    return await store.get('privateKey');
  } catch (error) {
    console.error('Error retrieving private key:', error);
    return null;
  }
}

export async function deletePrivateKey() {
  const db = await getDB();
  if (!db) return;
  await db.delete('keys', 'privateKey');
}