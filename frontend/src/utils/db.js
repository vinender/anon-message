import { openDB } from 'idb';

// Initialize IndexedDB within functions to ensure client-side execution
async function getDB() {
  try {
    if (typeof window === 'undefined') {
      console.error('IndexedDB is not available on the server.');
      return null; // Or return a resolved promise if needed
    }
    return await openDB('user-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys');
        }
      },
    });
  } catch (error) {
    console.error('Error opening IndexedDB: ', error);
    throw error;
  }
}
export default getDB;