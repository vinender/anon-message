import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/navbar';
import API_BASE_URL from '../../utils/config';
 
// Utility functions
const base64ToArrayBuffer = (base64) => {
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error('Base64 to ArrayBuffer conversion failed:', error);
    throw new Error('Invalid public key format.');
  }
};

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return btoa(binary);
};
const encryptMessage = async (message, publicKey) => {
  console.log(' message:', message);
  console.log('Public key:', publicKey);
  
  if (typeof window !== 'undefined') {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(message);

      const importedPublicKey = await window.crypto.subtle.importKey(
        "spki",
        base64ToArrayBuffer(publicKey),
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        true,
        ["encrypt"]
      );
      console.log('Imported key:', importedPublicKey);

      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: "RSA-OAEP"
        },
        importedPublicKey,
        data
      );

      return arrayBufferToBase64(encryptedData);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  console.log('Message returned without encryption (server-side)');
  return message; // Return unencrypted message if on server-side
};

export default function SendMessage() {
  const router = useRouter();
  const { username } = router.query;
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [publicKey, setPublicKey] = useState('');

  useEffect(() => {
    // Fetch the recipient's public key
    const fetchPublicKey = async () => {
      if (username) {
        try {
          const res = await fetch(`${API_BASE_URL}/users/${username}/public-key`);
          if (!res.ok) {
            throw new Error('Failed to fetch public key');
          }
          const data = await res.json();
          setPublicKey(data.publicKey);
        } catch (error) {
          console.error('Error fetching public key:', error);
          setStatus('Error fetching public key');
        }
      }
    };
    fetchPublicKey();
  }, [username]);

  const sendMessage = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    
    try {
      let encryptedMessage = message;
      if (typeof window !== 'undefined') {
        encryptedMessage = await encryptMessage(message, publicKey);
      }
      
      const res = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encryptedMessage, recipientUsername: username }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      const data = await res.json();
      setStatus(data.status || 'Message sent successfully');
      setMessage('');
    } catch (error) {
      setStatus('Error sending message');
      console.error('Send Message Error:', error);
    }
  };

  return (
    <div className="flex text-black items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={sendMessage}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6">
          Send an Anonymous Message to {username}
        </h1>
        <textarea
          className="w-full text-gray-700 p-3 border rounded mb-4"
          rows="5"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your message..."
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded font-semibold"
        >
          Send
        </button>
        {status && (
          <div className={`mt-4 text-center ${status.includes('Error') ? 'text-red-600' : 'text-green-600'} font-semibold`}>
            {status}
          </div>
        )}
      </form>
    </div>
  );
}