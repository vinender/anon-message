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
 
  const [publicKey, setPublicKey] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [activeTab, setActiveTab] = useState('positive');

  const messages = {
    positive: [
      "You're the real MVP of this office! 🏆",
      "If this company was a sitcom, you'd be the star! 🌟",
      "You make meetings bearable. That's a superpower! ⚡",
      "Your Excel skills are legend-spreadsheet-ary! 📊",
      "You're the reason the coffee machine hasn't quit yet! ☕"
    ],
    feedback: [
      "Your 'reply all' game is strong. Maybe too strong? 📧",
      "I've seen faster loading bars than your project progress... 🐌",
      "Your excuses are getting more creative than your work. A+ for effort! 🎭",
      "Did your productivity get lost in the cloud? Try ctrl+alt+showing up! 💻",
      "Your meetings are so long, even the calendar is yawning. ⏰"
    ],
    anonymous: [
      "Heard you're gunning for the 'Most Chairs Collected' award. Congrats? 🪑",
      "Your keyboard clicking sounds like Morse code for 'help me'! 🆘",
      "Is your out-of-office reply set to 'permanent'? Just checking. 🏝️",
      "Your desk plants are sending out SOS signals. Rescue mission needed! 🌱",
      "Rumor has it you're starting a new company: Procrastination Inc. 🦥"
    ]
  };

  const handleSampleMessageClick = (sampleMessage) => {
    setMessage(sampleMessage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendMessage();
  };

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

  const sendMessage = async () => {
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-cyan-50 to-blue-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md transition duration-300 ease-in-out transform hover:scale-105"
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Send an Anonymous Message to {username}
        </h1>
        <textarea
          className="w-full text-gray-700 p-4 border border-gray-300 rounded-md mb-6 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-300 ease-in-out"
          rows="5"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your message..."
          required
        />
        <button
          type="submit"
          className="w-full bg-cyan-500 text-white py-3 px-4 rounded-md font-semibold hover:bg-cyan-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
        >
          Send
        </button>
        
        <div className="mt-6">
          <div className="flex mb-4">
            {['positive', 'feedback', 'anonymous'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-t-lg ${
                  activeTab === tab
                    ? 'bg-cyan-100 text-cyan-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-b-lg p-4 h-64 overflow-y-auto">
            {messages[activeTab].map((msg, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSampleMessageClick(msg)}
                className="w-full text-left text-sm bg-gray-50 text-gray-700 p-2 rounded-md hover:bg-cyan-100 transition duration-200 ease-in-out mb-2"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>
        
        {status && (
          <div 
            className={`mt-6 text-center ${
              status.includes('Error') ? 'text-red-600' : 'text-green-600'
            } font-semibold bg-opacity-20 p-3 rounded-md ${
              status.includes('Error') ? 'bg-red-100' : 'bg-green-100'
            }`}
          >
            {status}
          </div>
        )}
      </form>
    </div>
  );
}