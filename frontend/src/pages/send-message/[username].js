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
    IT: {
      Feedback: [
        "Our legacy systems are held together by duct tape and prayers. Can we finally upgrade?",
        "If you expect 24/7 support, we're going to need more than pizza as compensation.",
        "Your 'quick fixes' create more problems than they solve. Let's plan for the long term.",
      ],
      Praise: [
        "Your troubleshooting skills are so good, you could debug a butterfly effect.",
        "Thanks to you, our network is more stable than my personal life.",
        "You make coding look like poetry. Nerdy, nerdy poetry.",
      ],
      Suggestions: [
        "Can we implement a 'no stupid questions' policy for ticket submissions?",
        "Let's set up a 'turn it off and on again' autoresponder to save time.",
        "We should start a betting pool on how long before the next server crash.",
      ]
    },
    Design: {
      Feedback: [
        "Our brand guidelines are so strict, we can't even use comic sans ironically.",
        "If we pivot our visual identity one more time, we'll be a kaleidoscope.",
        "Our color scheme is so last season, even Internet Explorer thinks it's outdated.",
      ],
      Praise: [
        "Your designs are so clean, they make Marie Kondo look like a hoarder.",
        "You turn wireframes into works of art. It's like digital alchemy!",
        "Your UI is so intuitive, even my grandma could navigate it.",
      ],
      Suggestions: [
        "Can we have a 'Wacky Wednesday' where we break all design rules for fun?",
        "Let's create a mood board of 'design fails' for inspiration on what not to do.",
        "We should start a support group for designers traumatized by client feedback.",
      ]
    },
    HR: {
      Feedback: [
        "Our onboarding process is so outdated, new hires think they've time-traveled to 1995.",
        "The employee handbook is thicker than a George R.R. Martin novel, and just as confusing.",
        "Our benefits package is so bad, employees are considering scurvy as a healthier option.",
      ],
      Praise: [
        "You resolve conflicts so well, the UN should hire you.",
        "Your ability to remember everyone's name is superhuman. Are you secretly an AI?",
        "Thanks to your efforts, our turnover rate is lower than my cholesterol.",
      ],
      Suggestions: [
        "Can we implement a 'Bring Your Pet to Work' day? It might improve morale... or chaos.",
        "Let's replace performance reviews with a company-wide game of musical chairs.",
        "We should start a rumor about free ice cream to see how fast information spreads here.",
      ]
    },
    Management: {
      Feedback: [
        "Your 'open door policy' would be great if your door wasn't always locked.",
        "Our meetings are so long, evolution occurs between agenda items.",
        "Your leadership style is so hands-off, it's practically levitating.",
      ],
      Praise: [
        "You navigate corporate politics so well, Machiavelli would be taking notes.",
        "Your vision for the company is so clear, it's like you have a crystal ball.",
        "Under your leadership, even Monday mornings feel like Friday afternoons.",
      ],
      Suggestions: [
        "Let's replace KPIs with a Magic 8-Ball. It might be more accurate.",
        "Can we implement a 'No Buzzword' day? The synergy would be disruptive.",
        "We should have a 'Role Reversal' week where interns run the company.",
      ]
    }
  };


 
  const [activeDepartment, setActiveDepartment] = useState('IT');
  const [activeCategory, setActiveCategory] = useState('Feedback');
  const [selectedMessage, setSelectedMessage] = useState('');

  const handleSampleMessageClick = (msg) => {
    setSelectedMessage(msg);
    setMessage(msg);
  };

  const handleRemoveMessage = () => {
    setSelectedMessage('');
    setMessage('');
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
    console.log('message sending...')
    
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
      setStatus(`Error sending message ${error}`);
      console.error('Send Message Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-cyan-800 to-red-500 p-8">
      
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
        <div className="p-8">
          <h1 className="text-3xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-cyan-800">
            Send an Anonymous Message to {username}
          </h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Choose a Department</h2>
            <div className="flex flex-wrap gap-2">
              {Object.keys(messages).map((department) => (
                <button
                  key={department}
                  onClick={() => setActiveDepartment(department)}
                  className={`px-4 py-2 rounded-full transition-all duration-300 ${
                    activeDepartment === department
                      ? 'bg-cyan-500 text-white shadow-lg transform -translate-y-1'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {department}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Select a Category</h2>
            <div className="flex flex-wrap gap-2">
              {Object.keys(messages[activeDepartment]).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full transition-all duration-300 ${
                    activeCategory === category
                      ? 'bg-cyan-800 text-white shadow-lg transform -translate-y-1'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Sample Messages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-2">
              {messages[activeDepartment][activeCategory].map((msg, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleMessageClick(msg)}
                  className="text-left text-sm bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-300 hover:shadow-md"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                className="w-full text-gray-700 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-300 ease-in-out"
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message..."
                required
              />
              {selectedMessage && (
                <button
                  type="button"
                  onClick={handleRemoveMessage}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-800 text-white py-3 px-4 rounded-lg font-bold hover:from-cyan-600 hover:to-cyan-800 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
            >
              Send Anonymous Message
            </button>
          </form>
          
          {status && (
            <div 
              className={`mt-4 text-center ${
                status.includes('Error') ? 'text-red-600' : 'text-green-600'
              } font-semibold bg-opacity-20 p-3 rounded-md ${
                status.includes('Error') ? 'bg-red-100' : 'bg-green-100'
              }`}
            >
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}