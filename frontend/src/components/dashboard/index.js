import { useCallback, useContext, useEffect, useState } from 'react';
import Navbar from '../navbar';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../../utils/config';
import { decryptMessage, decryptPrivateKey} from '@/utils/crypto';
import { getPrivateKey} from '@/utils/storage';

import { useRouter } from 'next/router';



export default function Dashboard() {
  const { user, isUserLoaded } = useContext(AuthContext);
  const [incomingMessages, setIncomingMessages] = useState([]);
  const [shareLink, setShareLink] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const router = useRouter();
  const [decryptionError, setDecryptionError] = useState(null);

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
      console.log('Message format check:', messages.map(msg => ({
        id: msg.id,
        contentLength: msg.content?.length,
        contentSample: msg.content?.substring(0, 50),
        isBase64: /^[A-Za-z0-9+/=]+$/.test(msg.content || '')
      })));
      // Get encrypted private key data
      const encryptedKeyData = await getPrivateKey();
      console.log('Retrieved key data format:', {
        hasAllFields: !!(encryptedKeyData?.iv && encryptedKeyData?.encryptedData && encryptedKeyData?.salt),
        ivLength: encryptedKeyData?.iv?.length,
        encryptedDataLength: encryptedKeyData?.encryptedData?.length,
        saltLength: encryptedKeyData?.salt?.length
      });
      if (!encryptedKeyData) {
        throw new Error('Private key not found');
      }
      // When retrieving and decrypting:
    console.log('Retrieved encrypted key data:', {
      hasIv: !!encryptedKeyData.iv,
      hasEncryptedData: !!encryptedKeyData.encryptedData,
      hasSalt: !!encryptedKeyData.salt
    });
  
      // Decrypt private key
      const decryptedPrivateKey = await decryptPrivateKey(
        encryptedKeyData.encryptedData,
        encryptedKeyData.iv,
        encryptedKeyData.salt,
        process.env.NEXT_PUBLIC_PRIVATE_KEY_SECRET
      );

      // Add this check
    if (!decryptedPrivateKey) {
      throw new Error('Failed to decrypt private key');
    }

    console.log('Decrypted private key check:', {
      length: decryptedPrivateKey?.length,
      isPEM: decryptedPrivateKey?.includes('BEGIN PRIVATE KEY'),
      sample: decryptedPrivateKey?.substring(0, 50)
    });
  
      console.log('Decrypted private key successfully:', !!decryptedPrivateKey);
      
      // Decrypt messages
      const decryptedMessages = await Promise.all(
        messages.map(async (msg) => {
          try {
            console.log('messages',messages)
            // Add logging to track each message decryption
            console.log('Attempting to decrypt message:', {
              messageId: msg._id,
              hasContent: !!msg.content
            });
  
            const decryptedContent = await decryptMessage(msg.content, decryptedPrivateKey);
            
            console.log('Message decrypted successfully:', {
              messageId: msg._id,
              hasDecryptedContent: !!decryptedContent
            });
  
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

  // If user is not loaded, show loading
  if (!isUserLoaded || !user) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
              <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-blue-400 h-12 w-12"></div>
                  <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-blue-400 rounded w-3/4"></div>
                      <div className="space-y-2">
                          <div className="h-4 bg-blue-400 rounded"></div>
                          <div className="h-4 bg-blue-400 rounded w-5/6"></div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
          <Navbar />
          <div className="container mx-auto px-4 py-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
                  Welcome, <span className="text-blue-600">{user.name}</span>!
              </h1>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Shareable Link Card */}
                  <div className="lg:col-span-1">
                      <div className="bg-white shadow-lg rounded-xl p-6 transform transition duration-500 hover:scale-105">
                          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                              Your Shareable Link
                          </h2>
                          <p className="text-gray-600 mb-4">
                              Share this link to receive anonymous messages.
                          </p>
                          <div className="flex flex-col sm:flex-row">
                              <input
                                  type="text"
                                  value={shareLink}
                                  readOnly
                                  className="flex-1 p-3 text-black border border-gray-300 rounded-t-md sm:rounded-l-md sm:rounded-t-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 sm:mb-0"
                              />
                              <button
                                  onClick={() => {
                                      navigator.clipboard.writeText(shareLink);
                                      alert('Link copied to clipboard!');
                                  }}
                                  className="bg-blue-600 text-white px-6 py-3 rounded-b-md sm:rounded-r-md sm:rounded-b-none hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                  </svg>
                                  Copy
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Incoming Messages Card */}
                  <div className="lg:col-span-2">
                      <div className="bg-white shadow-lg rounded-xl p-6">
                          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              Incoming Messages
                          </h2>
                          {fetchError && (
                              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                                  <span className="block sm:inline">{fetchError}</span>
                              </div>
                          )}
                          {decryptionError && (
                              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
                                  <span className="block sm:inline">{decryptionError}</span>
                              </div>
                          )}
                          {isFetching ? (
                              <div className="flex justify-center items-center h-48">
                                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                              </div>
                          ) : incomingMessages?.length > 0 ? (
                              <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                                  {incomingMessages.map((msg, index) => {
                                      const isRecent = index === 0; // Assuming the messages are sorted by date, newest first
                                      return (
                                          <div
                                              key={msg._id}
                                              className={`p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow transition duration-300 hover:shadow-md ${isRecent ? 'border-l-4 border-blue-500' : ''}`}
                                          >
                                              <div className="flex items-start">
                                                  {isRecent && (
                                                      <span className="inline-block bg-blue-500 text-white text-xs font-bold mr-2 px-2.5 py-0.5 rounded-full">New</span>
                                                  )}
                                                  <p className={`text-gray-700 mb-2 ${isRecent ? 'font-bold' : ''}`}>{msg.content}</p>
                                              </div>
                                              <p className="text-sm text-gray-500 flex items-center">
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                  </svg>
                                                  {new Date(msg.createdAt).toLocaleString()}
                                              </p>
                                          </div>
                                      );
                                  })}
                              </div>
                          ) : (
                              <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                  </svg>
                                  <p>No messages received yet.</p>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
}