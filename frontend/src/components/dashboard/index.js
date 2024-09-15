import { useContext, useEffect, useState } from 'react';
import Navbar from '../navbar';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../../utils/config';



export default function Dashboard() {

  const { user } = useContext(AuthContext);
  const [incomingMessages, setIncomingMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    if (!user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return;
    }

    console.log('username',user)

    const fetchMessages = async () => {
      const token = localStorage.getItem('token');

      // Fetch incoming messages
      const resIncoming = await fetch(`${API_BASE_URL}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (resIncoming.ok) {
        const data = await resIncoming.json();
        setIncomingMessages(data.messages);
      }

      // Fetch sent messages
      const resSent = await fetch(`${API_BASE_URL}/messages/sent`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (resSent.ok) {
        const data = await resSent.json();
        setSentMessages(data.messages);
      }
    };

    fetchMessages();

    // Set shareLink on the client side
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const link = `${origin}/send-message/${user.username}`;
      setShareLink(link);
    }
  }, [user]);

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            Welcome, {user.username}!
          </h1>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Shareable Link Card */}
            <div className="md:col-span-1">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Your Shareable Link
                </h2>
                <p className="text-gray-600 mb-4">
                  Share this link with your friends to receive anonymous messages.
                </p>
                <div className="flex">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 p-2 text-black border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      alert('Link copied to clipboard!');
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Incoming Messages Card */}
            <div className="md:col-span-2">
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Incoming Messages
                </h2>
                {incomingMessages?.length > 0 ? (
                  <div className="space-y-4">
                    {incomingMessages.map((msg) => (
                      <div key={msg._id} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{msg.content}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No messages received yet.</p>
                )}
              </div>

              {/* Sent Messages Card */}
              {/* <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Messages You've Sent
                </h2>
                {sentMessages?.length > 0 ? (
                  <div className="space-y-4">
                    {sentMessages?.map((msg) => (
                      <div key={msg._id} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">
                          To: <span className="font-medium">{msg.recipientUsername}</span>
                        </p>
                        <p className="text-gray-700 mt-1">{msg.content}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">You haven't sent any messages yet.</p>
                )}
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}