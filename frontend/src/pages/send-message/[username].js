import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/navbar';
import API_BASE_URL from '../../utils/config';
import { motion } from 'framer-motion';
import { FaLock, FaPaperPlane, FaTimesCircle } from 'react-icons/fa';

// Utility functions remain the same
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
  if (typeof window === 'undefined') return message;
  
  try {
    console.log('Encryption starting:', {
      message,
      publicKeyLength: publicKey?.length
    });

    // Create encoder and encode message
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(message);
    
    // Convert public key from base64 and import
    const publicKeyBytes = base64ToArrayBuffer(publicKey);
    const importedPublicKey = await window.crypto.subtle.importKey(
      "spki",
      publicKeyBytes,
      {
        name: "RSA-OAEP",
        hash: { name: "SHA-256" }
      },
      true,
      ["encrypt"]
    );
    
    console.log('Public key imported successfully');

    // Encrypt the message
    const encryptedBytes = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
        hash: { name: "SHA-256" }
      },
      importedPublicKey,
      messageBytes
    );
    
    // Convert to base64
    const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBytes)));
    
    console.log('Encryption completed:', {
      originalLength: message.length,
      encryptedLength: encryptedBase64.length
    });
    
    return encryptedBase64;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

export default function SendMessage() {
  const router = useRouter();
  const { username } = router.query;
 
  const [publicKey, setPublicKey] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
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
        body: JSON.stringify({ encryptedMessage,message, recipientUsername: username }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      const data = await res.json();
      setStatus(data.status || 'Message sent successfully');
      setMessage('');
      setSelectedMessage('');
    } catch (error) {
      setStatus('Error sending message: ' + error.message);
      console.error('Send Message Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full space-y-8"
        >
          <div className="text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center mb-6">
              <FaLock className="text-white text-xl" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Send Anonymous Message
            </h2>
            <p className="mt-3 text-slate-400">
              {username ? `To: ${username}` : 'Loading recipient...'}
            </p>
          </div>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-teal-400/10 rounded-xl blur-xl"></div>
              <div className="relative bg-slate-900/80 backdrop-blur-sm p-8 rounded-xl border border-slate-800">
                {status && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 ${
                      status.includes('Error') 
                        ? 'bg-red-500/10 border border-red-500/20 text-red-200' 
                        : 'bg-green-500/10 border border-green-500/20 text-green-200'
                    } p-4 rounded-lg`}
                  >
                    <p className="text-sm font-medium">{status}</p>
                  </motion.div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Select Department
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(messages).map((department) => (
                          <button
                            type="button"
                            key={department}
                            onClick={() => setActiveDepartment(department)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                              activeDepartment === department
                                ? 'bg-gradient-to-r from-indigo-500 to-teal-400 text-white shadow-lg shadow-teal-500/20'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {department}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Select Category
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(messages[activeDepartment]).map((category) => (
                          <button
                            type="button"
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                              activeCategory === category
                                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Sample Messages
                      </label>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
                        {messages[activeDepartment][activeCategory].map((msg, index) => (
                          <button
                            type="button"
                            key={index}
                            onClick={() => handleSampleMessageClick(msg)}
                            className={`text-left text-xs p-3 rounded-lg transition-all duration-200 ${
                              selectedMessage === msg
                                ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-200'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {msg}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                        Your Message
                      </label>
                      <div className="relative">
                        <textarea
                          id="message"
                          name="message"
                          rows="4"
                          className="appearance-none block w-full px-4 py-3 rounded-lg border-slate-700 bg-slate-800/50 border placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-transparent transition duration-200"
                          placeholder="Write your anonymous message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                        />
                        {selectedMessage && (
                          <button 
                            type="button" 
                            onClick={handleRemoveMessage}
                            className="absolute top-2 right-2 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <FaTimesCircle />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading || !message.trim()}
                      className="group relative w-full flex justify-center py-3 px-4 bg-gradient-to-r from-indigo-500 to-teal-400 text-sm font-medium rounded-lg text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-70"
                    >
                      {isLoading ? (
                        <span className="animate-pulse">Sending message...</span>
                      ) : (
                        <span className="flex items-center">
                          <FaPaperPlane className="mr-2" /> 
                          Send Anonymous Message
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-xs text-slate-500">
                By sending this message, you agree that the content follows our{' '}
                <a href="/guidelines" className="text-teal-400 hover:text-teal-300">
                  Community Guidelines
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}