// components/Messages.js
import { useState, useEffect } from 'react';
import API_BASE_URL from '../utils/config';
import { decryptMessage } from '@/utils/crypto';


export default function Messages({ user }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchAndDecryptMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await res.json();
        
        // Decrypt messages
        const decryptedMessages = await Promise.all(
          data.messages.map(async (msg) => ({
            ...msg,
            content: await decryptMessage(msg.content, user.privateKey)
          }))
        );

        console.log('decrypted message',decryptedMessages)
        
        setMessages(decryptedMessages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching or decrypting messages:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (user && user.privateKey) {
      fetchAndDecryptMessages();
    }
  }, [user]);

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