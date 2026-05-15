import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/navbar';
import API_BASE_URL from '../../utils/config';
import { hybridEncrypt } from '../../utils/crypto';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLock,
  FaPaperPlane,
  FaTimesCircle,
  FaHeart,
  FaUserSecret,
  FaQuestion,
  FaFire,
  FaLightbulb,
  FaStar,
  FaHandshake,
  FaRandom,
} from 'react-icons/fa';

const MAX_MESSAGE_LENGTH = 200;

const CATEGORIES = [
  { key: 'Compliments', icon: FaHeart, accent: 'from-pink-500 to-rose-400' },
  { key: 'Confessions', icon: FaUserSecret, accent: 'from-violet-500 to-purple-400' },
  { key: 'Questions', icon: FaQuestion, accent: 'from-sky-500 to-cyan-400' },
  { key: 'Roasts', icon: FaFire, accent: 'from-orange-500 to-amber-400' },
  { key: 'Suggestions', icon: FaLightbulb, accent: 'from-yellow-400 to-amber-300' },
  { key: 'Appreciation', icon: FaStar, accent: 'from-emerald-500 to-teal-400' },
  { key: 'Apologies', icon: FaHandshake, accent: 'from-blue-500 to-indigo-400' },
  { key: 'Random', icon: FaRandom, accent: 'from-fuchsia-500 to-pink-400' },
];

const SAMPLE_MESSAGES = {
  Compliments: [
    "You're the kind of person who makes Mondays feel less terrible. Don't stop being you.",
    'Your energy lights up the room before you even walk in. People notice. I notice.',
    'You make hard things look easy and easy things look fun. That is a rare superpower.',
    "If kindness was a sport, you'd be in the hall of fame already.",
    "You're proof that genuinely good people still exist in this very chaotic world.",
    'Watching you handle stress is honestly inspiring. You make grace look effortless.',
  ],
  Confessions: [
    "I've had a crush on you for longer than I'd ever admit out loud. There. I said it.",
    "I laugh at your stories even when I've heard them three times. They are still funny.",
    'I copy your music recommendations and pretend I found them myself. Sorry not sorry.',
    "I think about that thing you said months ago more often than you'd probably guess.",
    'Sometimes I take the long way just so I can pass by where you usually are.',
    'I save your voice notes. I do not delete them. That is the whole confession.',
  ],
  Questions: [
    'If you could undo one decision from the past year, what would it be — and why?',
    "What's something you secretly wish more people would ask you about?",
    "What's the smallest thing that recently made you weirdly happy?",
    'If your week had a soundtrack, what song would be playing on repeat right now?',
    "What's a lie you tell yourself that you already know is a lie?",
    'What did you used to believe about adulthood that turned out to be totally wrong?',
  ],
  Roasts: [
    "You're the human equivalent of a tab you forgot you opened. Iconic but slightly chaotic.",
    "Your vibe is 'main character', but the show only got renewed for one season.",
    'You have the confidence of a typo that refuses to be corrected.',
    'Talking to you is like reading the terms and conditions. Long, weird, oddly compelling.',
    "You don't have a personality, you have a playlist. And honestly? It slaps.",
    'You text like every reply is a hostage negotiation. Relax. We are friends.',
  ],
  Suggestions: [
    'Take the break. The work will still be there. You will be more useful after, I promise.',
    'Drink water before more coffee. Future-you will write you a thank-you note.',
    'Try saying no to one thing this week. Just one. See what happens.',
    "Text the friend you've been meaning to text. They are probably waiting too.",
    'Go for a walk without your phone. Even ten minutes. It does something.',
    'Write down three things that went right today. Boring advice. Works anyway.',
  ],
  Appreciation: [
    'Thanks for showing up the way you do. It matters more than you probably realize.',
    "I don't say it enough, but you make my life a little easier just by existing in it.",
    "You're someone I'd call at 3 AM and not even feel weird about it. That is rare.",
    'Your patience with me lately has been everything. Genuinely. Thank you for it.',
    "You listen in a way most people don't. I notice. I appreciate it more than I say.",
    'You make ordinary days feel a little less ordinary. That is a real gift.',
  ],
  Apologies: [
    "I'm sorry for that thing I never apologized for. You were right to be hurt by it.",
    'I should have answered you sooner. I am sorry I did not. I am answering now.',
    "I'm sorry I made it about me when it wasn't. That was not fair to you at all.",
    'I owe you a real apology, not the lazy one I gave the first time. I am sorry.',
    "I'm sorry I went quiet. It was about me, not you. You deserved better than silence.",
  ],
  Random: [
    'If aliens visited Earth and only met you, humanity would have a perfectly fine reputation.',
    'Just so you know, someone, somewhere, was thinking nice things about you today.',
    'This message has no point. I just wanted to send something good into your inbox.',
    "You're doing better than you think. Sign here, anonymous internet stranger.",
    'Plot twist: you are the protagonist, and the universe is quietly rooting for you.',
    'No reason. No agenda. Just dropping by to say I hope your day gets a little softer.',
  ],
};

export default function SendMessage() {
  const router = useRouter();
  const { username } = router.query;

  const [publicKey, setPublicKey] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].key);
  const [selectedMessage, setSelectedMessage] = useState('');

  const activeCategoryMeta = useMemo(
    () => CATEGORIES.find((c) => c.key === activeCategory) || CATEGORIES[0],
    [activeCategory]
  );

  const handleSampleMessageClick = (msg) => {
    const truncated = msg.slice(0, MAX_MESSAGE_LENGTH);
    setSelectedMessage(truncated);
    setMessage(truncated);
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
    const fetchPublicKey = async () => {
      if (username) {
        try {
          const res = await fetch(`${API_BASE_URL}/users/${username}/public-key`);
          if (!res.ok) throw new Error('Failed to fetch public key');
          const data = await res.json();
          setPublicKey(data.publicKey);
        } catch (error) {
          setStatus('Error fetching public key');
        }
      }
    };
    fetchPublicKey();
  }, [username]);

  const sendMessage = async () => {
    if (message.length > MAX_MESSAGE_LENGTH) {
      setStatus(`Error: Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
      return;
    }

    setIsLoading(true);
    setStatus('Encrypting...');

    try {
      // Hybrid-encrypt locally — plaintext never leaves this browser
      const encryptedMessage = await hybridEncrypt(message, publicKey);

      setStatus('Sending...');

      const res = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encryptedMessage, recipientUsername: username }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to send message');
      }

      const data = await res.json();
      setStatus(data.status || 'Message sent successfully');
      setMessage('');
      setSelectedMessage('');
    } catch (error) {
      setStatus('Error sending message: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const charCount = message.length;
  const charPct = Math.min(100, (charCount / MAX_MESSAGE_LENGTH) * 100);
  const overLimit = charCount >= MAX_MESSAGE_LENGTH;
  const ActiveIcon = activeCategoryMeta.icon;

  return (
    <div className="min-h-screen bg-zinc-950 text-gray-100 font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <Navbar />

      <div className="relative flex items-start justify-center min-h-[calc(100vh-80px)] px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl w-full space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20">
              <FaLock className="text-white text-xl" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Send an anonymous message
            </h1>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/70 border border-zinc-800 text-sm text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {username ? <>To <span className="font-medium text-white">@{username}</span></> : 'Loading recipient…'}
            </div>
          </div>

          {/* Card */}
          <div className="relative">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-emerald-500/20 via-transparent to-fuchsia-500/20 blur-md" />
            <div className="relative bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl shadow-black/30">
              {/* Status */}
              <AnimatePresence>
                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
                      status.toLowerCase().includes('error')
                        ? 'bg-red-500/10 border-red-500/20 text-red-200'
                        : status === 'Encrypting...' || status === 'Sending...'
                        ? 'bg-zinc-500/10 border-zinc-500/20 text-zinc-200'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                    }`}
                  >
                    {status}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-7">
                {/* Categories */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-zinc-300">Pick a vibe</label>
                    <span className="text-xs text-zinc-500">Optional — for inspiration</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(({ key, icon: Icon, accent }) => {
                      const active = activeCategory === key;
                      return (
                        <button
                          type="button"
                          key={key}
                          onClick={() => setActiveCategory(key)}
                          className={`group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                            active
                              ? `bg-gradient-to-r ${accent} text-white border-transparent shadow-lg shadow-black/30`
                              : 'bg-zinc-800/60 text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white'
                          }`}
                        >
                          <Icon className={`text-[11px] ${active ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`} />
                          {key}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sample messages */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <ActiveIcon className="text-zinc-400 text-xs" />
                      Sample {activeCategory.toLowerCase()}
                    </label>
                    <span className="text-xs text-zinc-500">Tap to use</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCategory}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
                    >
                      {SAMPLE_MESSAGES[activeCategory].map((msg, index) => {
                        const isSelected = selectedMessage === msg;
                        return (
                          <button
                            type="button"
                            key={index}
                            onClick={() => handleSampleMessageClick(msg)}
                            className={`text-left text-xs sm:text-sm leading-relaxed p-3 rounded-xl border transition-all duration-200 ${
                              isSelected
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-100 shadow-inner'
                                : 'bg-zinc-800/60 border-zinc-700/70 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 hover:text-white'
                            }`}
                          >
                            {msg}
                          </button>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Message input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="message" className="text-sm font-medium text-zinc-300">
                      Your message
                    </label>
                    <span
                      className={`text-xs tabular-nums ${
                        overLimit ? 'text-red-400' : charCount > MAX_MESSAGE_LENGTH * 0.8 ? 'text-amber-400' : 'text-zinc-500'
                      }`}
                    >
                      {charCount}/{MAX_MESSAGE_LENGTH}
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      maxLength={MAX_MESSAGE_LENGTH}
                      className="block w-full px-4 py-3 pr-10 rounded-xl bg-zinc-800/60 border border-zinc-700 placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition resize-none"
                      placeholder="Say the thing. They'll never know it was you."
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                      required
                    />
                    {message && (
                      <button
                        type="button"
                        onClick={handleRemoveMessage}
                        className="absolute top-2.5 right-2.5 text-zinc-500 hover:text-red-400 transition-colors"
                        aria-label="Clear message"
                      >
                        <FaTimesCircle />
                      </button>
                    )}
                  </div>
                  {/* Character progress bar */}
                  <div className="mt-2 h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${
                        overLimit
                          ? 'bg-red-500'
                          : charPct > 80
                          ? 'bg-amber-400'
                          : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                      }`}
                      style={{ width: `${charPct}%` }}
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading || !message.trim() || overLimit}
                  className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-emerald-500/20"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Encrypting & sending…</span>
                  ) : (
                    <>
                      <FaPaperPlane className="text-xs transition-transform group-hover:translate-x-0.5" />
                      Send anonymously
                    </>
                  )}
                </button>

                {/* Privacy note */}
                <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                  <FaLock className="text-[10px]" />
                  End-to-end encrypted. No one but the recipient can read this — not even us.
                </div>
              </form>
            </div>
          </div>

          <p className="text-center text-xs text-zinc-500">
            By sending this message, you agree it follows our{' '}
            <a href="/guidelines" className="text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline">
              Community Guidelines
            </a>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
