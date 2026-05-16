// utils/storage.js
// Private key stored ONLY in IndexedDB (never leaves browser, never on server).
// Server can't decrypt messages. DB breach = zero keys exposed.
import getDB from './db';

export async function storePrivateKey(privateKey) {
  const db = await getDB();
  if (!db) return;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('keys', 'readwrite');
    const store = tx.objectStore('keys');
    store.put(privateKey, 'privateKey');
    tx.oncomplete = () => resolve();
    tx.onerror = (event) => reject(event.target.error);
  });
}

export async function getPrivateKey() {
  const db = await getDB();
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('keys', 'readonly');
    const store = tx.objectStore('keys');
    const req = store.get('privateKey');
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = (event) => reject(event.target.error);
  });
}

export async function deletePrivateKey() {
  const db = await getDB();
  if (!db) return;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('keys', 'readwrite');
    const store = tx.objectStore('keys');
    store.delete('privateKey');
    tx.oncomplete = () => resolve();
    tx.onerror = (event) => reject(event.target.error);
  });
}

export async function hasPrivateKey() {
  const key = await getPrivateKey();
  return !!key;
}
