// components/Messages.js
import { useState, useEffect } from 'react';
import API_BASE_URL from '../utils/config';
import { decryptMessage, decryptPrivateKey } from '@/utils/crypto';
import { getPrivateKey } from '@/utils/storage';

export default function Messages({ user }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);

  // Decrypt private key on mount
  useEffect(() => {
    const loadPrivateKey = async () => {
      try {
        const encryptedKeyData = await getPrivateKey();
        if (!encryptedKeyData) {
          throw new Error('Private key not found. Please log in again.');
        }

        const passphrase = sessionStorage.getItem('_pp') || localStorage.getItem('_pp');
        if (!passphrase) {
          throw new Error('Encryption passphrase not found. Please log in again.');
        }

        const decrypted = await decryptPrivateKey(
          encryptedKeyData.encryptedData,
          encryptedKeyData.iv,
          encryptedKeyData.salt,
          passphrase
        );

        setPrivateKey(decrypted);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadPrivateKey();
  }, []);

  useEffect(() => {
    const fetchAndDecryptMessages = async () => {
      if (!privateKey) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();

        const decryptedMessages = await Promise.all(
          data.messages.map(async (msg) => ({
            ...msg,
            content: await decryptMessage(msg.content, privateKey),
          }))
        );

        setMessages(decryptedMessages);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (privateKey) {
      fetchAndDecryptMessages();
    }
  }, [privateKey]);

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (messages.length === 0) {
    return <p>No messages received yet.</p>;
  }

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Your Messages</h2>
      {messages?.map((msg) => (
        <div key={msg._id} className="border-b py-4">
          <p>{msg.content}</p>
          <p className="text-gray-500 text-sm">
            {new Date(msg.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
