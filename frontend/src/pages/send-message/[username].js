import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/navbar';
import API_BASE_URL from '../../utils/config';

export default function SendMessage() {
  const router = useRouter();
  const { username } = router.query;
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    const res = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, recipientUsername: username }),
    });
    const data = await res.json();
    setStatus(data.status);
    setMessage('');
  };

  return (
    <>
      {/* <Navbar /> */}
      <div className="flex text-black items-center justify-center min-h-screen bg-gray-100">
        <form
          onSubmit={sendMessage}
          className="bg-white p-8 rounded shadow-md w-full max-w-md"
        >
          <h1 className="text-2xl   font-bold mb-6">
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
            <div className="mt-4 text-center text-green-600 font-semibold">
              {status}
            </div>
          )}
        </form>
      </div>
    </>
  );
}
