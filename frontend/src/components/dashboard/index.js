import { useCallback, useContext, useEffect, useState } from 'react';
import Navbar from '../navbar';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../../utils/config';
import { decryptMessage, decryptPrivateKey } from '@/utils/crypto';
import { getPrivateKey } from '@/utils/storage';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiShare2, FiCopy, FiMail, FiRefreshCw, FiClock } from 'react-icons/fi';
import ShareButtons from '../ui/share-buttons';

export default function Dashboard() {
  const { user, isUserLoaded } = useContext(AuthContext);
  const [incomingMessages, setIncomingMessages] = useState([]);
  const [shareLink, setShareLink] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [decryptionError, setDecryptionError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const router = useRouter();

  const fetchAndDecryptMessages = useCallback(async () => {
    if (!user || !localStorage.getItem('token')) {
      setFetchError("Authentication required. Please login.");
      return;
    }
  
    setIsFetching(true);
    setFetchError(null);
    setDecryptionError(null);
  
    try {
      // Fetch messages
      const response = await fetch(`${API_BASE_URL}/messages/anonymous`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
  
      const { messages } = await response.json();
      
      // Get encrypted private key data
      const encryptedKeyData = await getPrivateKey();
      
      if (!encryptedKeyData) {
        throw new Error('Private key not found');
      }
  
      // Decrypt private key
      const decryptedPrivateKey = await decryptPrivateKey(
        encryptedKeyData.encryptedData,
        encryptedKeyData.iv,
        encryptedKeyData.salt,
        process.env.NEXT_PUBLIC_PRIVATE_KEY_SECRET
      );

      if (!decryptedPrivateKey) {
        throw new Error('Failed to decrypt private key');
      }
      
      // Decrypt messages
      const decryptedMessages = await Promise.all(
        messages.map(async (msg) => {
          try {
            const decryptedContent = await decryptMessage(msg.content, decryptedPrivateKey);
            return { ...msg, content: decryptedContent };
          } catch (error) {
            console.error('Message decryption failed:', {
              messageId: msg._id,
              error: error.message
            });
            return { ...msg, content: 'Error decrypting message' };
          }
        })
      );
  
      setIncomingMessages(decryptedMessages);
    } catch (error) {
      console.error('Fetch and decrypt process failed:', error);
      setFetchError(error.message);
      setDecryptionError("Failed to decrypt messages");
    } finally {
      setIsFetching(false);
    }
  }, [user]);

  // Fetch messages once user is loaded
  useEffect(() => {
    if (isUserLoaded && user) {
      fetchAndDecryptMessages();
    }
  }, [isUserLoaded, user, fetchAndDecryptMessages]);

  // Generate shareable link
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const origin = window.location.origin;
      const link = `${origin}/send-message/${user.name}`;
      setShareLink(link);
    }
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isUserLoaded && !user && typeof window !== 'undefined') {
      router.push('/login');
    }
  }, [isUserLoaded, user, router]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // If user is not loaded, show loading
  if (!isUserLoaded || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-teal-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome, <span className="bg-gradient-to-r from-indigo-500 to-teal-400 bg-clip-text text-transparent">{user.name}</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Share your unique link and start receiving anonymous messages from anyone. All messages are end-to-end encrypted.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shareable Link Card */}
             {/* Shareable Link Card */}
             <div className="lg:col-span-1">
              <div className="relative">
                {/* ... background blur ... */}
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-teal-400/10 rounded-xl blur-xl"></div>
                <div className="relative bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800 overflow-hidden">
                  {/* Card Content */}
                  <div className="p-6">
                     {/* ... Header ... */}
                    <div className="flex items-center text-teal-400 mb-4">
                      <FiShare2 className="h-6 w-6 mr-2" />
                      <h2 className="text-xl font-semibold">Your Shareable Link</h2>
                    </div>
                     <p className="text-slate-400 mb-5">
                      Share this link to receive anonymous messages. Only you can decrypt them.
                    </p>
                    {/* Link Input & Copy */}
                    <div className="bg-slate-800/70 p-1 rounded-lg mb-6"> {/* Added mb-6 */}
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={shareLink || 'Generating link...'}
                          readOnly
                          className="flex-grow px-3 py-2 bg-transparent text-sm text-slate-300 focus:outline-none"
                        />
                        <button
                          onClick={handleCopyLink}
                          disabled={!shareLink}
                          className={`p-2 rounded-md transition ${
                            copySuccess
                              ? 'bg-teal-500 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        >
                          {copySuccess ? 'Copied!' : <FiCopy className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* --- USE THE ShareButtons COMPONENT --- */}
                    <ShareButtons shareUrl={shareLink} userName={user?.name} />

                  </div>
                  {/* Removed the old footer with SVG icons */}
                </div>
              </div>
            </div>

            {/* Incoming Messages Card */}
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-teal-400/10 rounded-xl blur-xl"></div>
                <div className="relative bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center text-teal-400">
                      <FiMail className="h-6 w-6 mr-2" />
                      <h2 className="text-xl font-semibold">Incoming Messages</h2>
                    </div>
                    
                    <button 
                      onClick={fetchAndDecryptMessages}
                      disabled={isFetching}
                      className="flex items-center space-x-1 text-sm px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                    >
                      <FiRefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {/* Error Messages */}
                  {fetchError && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-lg">
                      <p className="text-sm font-medium">{fetchError}</p>
                    </div>
                  )}
                  
                  {decryptionError && (
                    <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 p-4 rounded-lg">
                      <p className="text-sm font-medium">{decryptionError}</p>
                    </div>
                  )}

                  {/* Messages Container */}
                  <div className="h-[calc(100vh-400px)] min-h-[300px]">
                    {isFetching ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 border-t-2 border-b-2 border-teal-500 rounded-full animate-spin mb-3"></div>
                          <p className="text-slate-400 text-sm">Decrypting messages...</p>
                        </div>
                      </div>
                    ) : incomingMessages?.length > 0 ? (
                      <div className="space-y-4 h-full overflow-y-auto pr-2 custom-scrollbar">
                        {incomingMessages.map((msg, index) => {
                          const isRecent = index === 0; // Assuming messages are sorted newest first
                          const messageDate = new Date(msg.createdAt);
                          const today = new Date();
                          const isToday = messageDate.toDateString() === today.toDateString();
                          
                          const formattedDate = isToday
                            ? `Today at ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : messageDate.toLocaleDateString([], { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                          
                          return (
                            <motion.div
                              key={msg._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className={`bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 transition border ${
                                isRecent ? 'border-l-4 border-teal-400 border-t border-r border-b border-slate-700' : 'border-slate-700'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                {isRecent && (
                                  <span className="inline-flex items-center bg-teal-500/20 text-teal-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    New
                                  </span>
                                )}
                                <div className="flex items-center text-xs text-slate-400">
                                  <FiClock className="h-3 w-3 mr-1" />
                                  {formattedDate}
                                </div>
                              </div>
                              
                              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                          <FiMail className="h-10 w-10 text-slate-500" />
                        </div>
                        <p className="text-lg font-medium mb-2">No messages yet</p>
                        <p className="text-sm text-center max-w-md">
                          Share your link with friends to start receiving anonymous messages. They will be be encrypted and only visible to you.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(94, 234, 212, 0.2);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(94, 234, 212, 0.4);
        }
      `}</style>
    </div>
  );
}