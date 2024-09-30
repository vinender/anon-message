// components/PrivateKeyModal.js

import { useState } from 'react';

export default function PrivateKeyModal({ onDecrypt }) {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');

  const handleDecrypt = async (e) => {
    e.preventDefault();
    if (!passphrase) {
      setError('Passphrase is required.');
      return;
    }

    try {
      await onDecrypt(passphrase);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold text-white mb-4">Enter Passphrase</h2>
        <form onSubmit={handleDecrypt}>
          <input
            type="password"
            placeholder="Passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="w-full p-2 mb-4 text-white bg-gray-700 rounded"
          />
          {error && <p className="text-red-400 mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full p-2 bg-cyan-500 rounded hover:bg-cyan-600"
          >
            Decrypt Private Key
          </button>
        </form>
      </div>
    </div>
  );
}
