import { useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../components/context/AuthContext';
import Dashboard from '@/components/dashboard';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaLock, FaUserSecret, FaUsers, FaShieldAlt, FaEyeSlash, FaKey } from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';



export default function Home() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [dashboard, setDashboard] = useState(false);
  
  useEffect(() => {
    if (user) {
      setDashboard(true);
    }
  }, [user]);

  return (
    <>
      {dashboard ? (
        <Dashboard />
      ) : (
        <div className="min-h-screen bg-zinc-950 text-gray-100 font-sans">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <header className="flex items-center justify-between py-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center space-x-2"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-500 to-emerald-400 flex items-center justify-center">
                  <FaEyeSlash className="text-white text-xl" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Anon<span className="text-emerald-400">Message</span>
                </h1>
              </motion.div>
              <nav className="flex items-center space-x-6">
                {/* <Link href="/signup" className="text-sm font-medium hover:text-emerald-400 transition duration-300">
                  Lpgin
                </Link> */}
                <Link 
                  href="/signup" 
                  className="text-sm font-medium bg-gradient-to-r from-zinc-500 to-emerald-400 px-5 py-2.5 rounded-lg hover:shadow-lg hover:shadow-emerald-500/20 transition duration-300"
                >
                  Join
                </Link>
              </nav>
            </header>

            {/* Modern Hero Section */}
            <main className="relative pt-32 pb-20 overflow-visible">
              {/* Background Glows */}
              <div className="absolute top-1/2 left-1/2 -tranzinc-x-1/2 -tranzinc-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-emerald-500/30 to-zinc-500/30 blur-[120px] rounded-full pointer-events-none opacity-50 z-0"></div>
              
              <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
                {/* Pill Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700/50 backdrop-blur-md mb-8 shadow-xl"
                >
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(45,212,191,0.8)] animate-pulse"></span>
                  <span className="text-xs font-medium text-zinc-300">Powered by Gemini 2.0 AI Moderation</span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[1.05] mb-8"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
                    Truth Spoken.
                  </span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-zinc-400 to-zinc-400 relative inline-block">
                    Identity Hidden.
                    {/* Subtle underline glow */}
                    <div className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent blur-[2px]"></div>
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                  The most secure way to receive honest feedback. End-to-end encrypted, zero logs, and protected by advanced AI to keep the trolls out.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                >
                  <Link
                    href="/signup"
                    className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-300 bg-zinc-900 border border-zinc-700 rounded-xl hover:bg-zinc-800 overflow-hidden shadow-2xl shadow-zinc-500/10 hover:shadow-emerald-500/20 hover:border-emerald-500/50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-zinc-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative flex items-center gap-2">
                      Claim Your Unique Link
                      <HiOutlineSparkles className="text-emerald-400 group-hover:rotate-12 transition-transform" />
                    </span>
                  </Link>
                </motion.div>

                {/* Social Proof Mini */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="flex flex-col items-center justify-center space-y-3"
                >
                  <div className="flex -space-x-3">
                    {[
                      'https://i.pravatar.cc/100?img=33',
                      'https://i.pravatar.cc/100?img=47',
                      'https://i.pravatar.cc/100?img=12',
                      'https://i.pravatar.cc/100?img=28',
                      'https://i.pravatar.cc/100?img=32',
                    ].map((url, i) => (
                      <img key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 object-cover" src={url} alt="User avatar" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
                    <div className="flex text-amber-400 text-xs">
                      ★★★★★
                    </div>
                    <span>Trusted by 10,000+ free thinkers</span>
                  </div>
                </motion.div>
              </div>
            </main>

            {/* Modern Bento Features Section */}
            <section className="py-24 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"></div>
              <div className="text-center mb-16 relative z-10">
                <span className="text-xs font-bold tracking-wider px-4 py-1.5 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 uppercase">Core Architecture</span>
                <h3 className="text-4xl md:text-5xl font-extrabold mt-6 tracking-tight">Engineered for absolute privacy.</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 max-w-6xl mx-auto relative z-10 px-4">
                {/* Large Bento Card 1 */}
                <div className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                    <FaUserSecret className="text-9xl text-emerald-400" />
                  </div>
                  <div className="relative z-10 h-full flex flex-col justify-center">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center mb-6 border border-emerald-400/20">
                      <FaUserSecret className="text-2xl text-emerald-400" />
                    </div>
                    <h4 className="text-2xl font-bold mb-3 text-white">Zero Knowledge Architecture</h4>
                    <p className="text-zinc-400 max-w-md">We literally cannot read your messages. Your private key never leaves your device, ensuring that even if our servers are compromised, your data remains cryptographically secure.</p>
                  </div>
                </div>

                {/* Small Bento Card 1 */}
                <div className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden group hover:border-zinc-500/30 transition-all">
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-20 group-hover:scale-110 transition-all">
                    <FaEyeSlash className="text-8xl text-zinc-400" />
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-zinc-500/10 flex items-center justify-center mb-6 border border-zinc-500/20 relative z-10">
                    <FaEyeSlash className="text-xl text-zinc-400" />
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-white relative z-10">No IP Tracking</h4>
                  <p className="text-sm text-zinc-400 relative z-10">We do not log IP addresses, device identifiers, or any metadata. Period.</p>
                </div>

                {/* Small Bento Card 2 */}
                <div className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden group hover:border-zinc-500/30 transition-all">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-500 to-transparent"></div>
                  <div className="h-10 w-10 rounded-xl bg-zinc-500/10 flex items-center justify-center mb-6 border border-zinc-500/20">
                    <FaUsers className="text-xl text-zinc-400" />
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-white">Global Reach</h4>
                  <p className="text-sm text-zinc-400">Deployed on edge networks ensuring lightning-fast delivery anywhere on Earth.</p>
                </div>

                {/* Large Bento Card 2 */}
                <div className="md:col-span-2 md:row-span-1 bg-zinc-900 border border-zinc-800 rounded-3xl p-0 relative overflow-hidden group hover:border-zinc-600 transition-all flex flex-col md:flex-row items-center">
                  <div className="p-8 md:w-1/2">
                    <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-4 border border-zinc-700">
                      <FaLock className="text-xl text-zinc-300" />
                    </div>
                    <h4 className="text-2xl font-bold mb-3 text-white">AES-256 & RSA-2048</h4>
                    <p className="text-zinc-400">Every message is encrypted with symmetric AES-256, and keys are exchanged using asymmetric RSA-2048 cryptography. Military grade is an understatement.</p>
                  </div>
                  <div className="md:w-1/2 h-full w-full bg-zinc-950 p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-zinc-800/50">
                    <div className="w-full space-y-3 opacity-70 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mb-2"><FaLock /> Encrypting payload...</div>
                      <div className="h-2 w-full rounded bg-zinc-800 overflow-hidden"><div className="h-full w-full bg-emerald-500/50 animate-pulse"></div></div>
                      <div className="h-2 w-3/4 rounded bg-zinc-800"></div>
                      <div className="h-2 w-5/6 rounded bg-zinc-800"></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Interactive Encryption Demo Section */}
            <section className="py-20">
              <div className="text-center mb-16">
                <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-zinc-500/10 text-zinc-300 border border-zinc-500/20">HOW IT WORKS</span>
                <h3 className="text-3xl font-bold mt-6">Military-Grade Encryption, Visualized.</h3>
                <p className="text-zinc-400 mt-4 max-w-xl mx-auto">Your messages are encrypted on your device before they even reach our servers. Only the intended recipient holds the key to unlock them.</p>
              </div>
              <div className="max-w-4xl mx-auto">
                 <EncryptionVisualizer />
              </div>
            </section>

            {/* AI Moderation Section */}
            <section className="py-20">
               <div className="text-center mb-16">
                <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">SAFETY FIRST</span>
                <h3 className="text-3xl font-bold mt-6">AI Content Moderation Radar</h3>
                <p className="text-zinc-400 mt-4 max-w-xl mx-auto">We use advanced AI (Gemini 2.0 Flash) to filter out hate speech, bullying, and harassment in real-time, keeping your inbox a safe space.</p>
              </div>
              <div className="max-w-4xl mx-auto">
                 <ModerationVisualizer />
              </div>
            </section>

            {/* Epic CTA Section */}
            <section className="py-32 relative overflow-hidden mt-20 rounded-[3rem] bg-zinc-950 border border-zinc-800/50 mb-12 mx-4 sm:mx-8 xl:mx-auto max-w-6xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-zinc-950 to-zinc-500/10 z-0 pointer-events-none"></div>
              


              <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
                <h3 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
                  Ready to go dark?
                </h3>
                <p className="text-xl text-zinc-400 mb-12">
                  Claim your link in 10 seconds. No email verification required.
                </p>
                <Link
                  href="/signup"
                  className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-zinc-950 text-lg transition-all duration-300 bg-emerald-400 rounded-2xl hover:bg-emerald-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(45,212,191,0.4)]"
                >
                  <span className="relative flex items-center gap-3">
                    Get Started Free
                    <FaUserSecret className="text-xl" />
                  </span>
                </Link>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-zinc-800 py-12 mt-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-500 to-emerald-400 flex items-center justify-center">
                      <FaEyeSlash className="text-white text-sm" />
                    </div>
                    <h4 className="text-lg font-bold">
                      Anon<span className="text-emerald-400">Message</span>
                    </h4>
                  </div>
                  <p className="text-sm text-zinc-400">
                    Secure, anonymous messaging for a freer world.
                  </p>
                </div>
                
                  <div>
                    <h5 className="text-sm font-semibold mb-4">Legal</h5>
                    <ul className="space-y-2">
                      {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item, i) => (
                        <li key={i}>
                          <Link href="#" className="text-sm text-zinc-400 hover:text-emerald-400 transition">
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                
                <div>
                  <h5 className="text-sm font-semibold mb-4">Company</h5>
                  <ul className="space-y-2">
                    {['About Us', 'Blog', 'Careers', 'Contact'].map((item, i) => (
                      <li key={i}>
                        <Link href="#" className="text-sm text-zinc-400 hover:text-emerald-400 transition">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-sm font-semibold mb-4">Connect</h5>
                  <ul className="space-y-2">
                    {['Twitter', 'Discord', 'GitHub', 'Support'].map((item, i) => (
                      <li key={i}>
                        <Link href="#" className="text-sm text-zinc-400 hover:text-emerald-400 transition">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm text-zinc-500">&copy; {new Date().getFullYear()} AnonMessage. All rights reserved.</p>
                <p className="text-sm text-zinc-500 mt-4 md:mt-0">Designed with privacy at its core.</p>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}



const EncryptionVisualizer = () => {
  const [text, setText] = useState('Hello');
  
  const generateHash = (str) => {
    if (!str) return '...';
    // Simple mock hash visualizer
    return Array.from(str).map(char => char.charCodeAt(0).toString(16)).join('') + 'a7f9d2b4e8c1...';
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-zinc-500/5">
      <div className="w-full md:w-1/3 space-y-4">
        <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-emerald-400/20 flex items-center justify-center">1</span> 
          You Type
        </h4>
        <input 
          type="text" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={15}
          placeholder="Type a message..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-white focus:outline-none focus:border-emerald-400 transition"
        />
      </div>
      
      <div className="flex-shrink-0 flex md:flex-col items-center">
        <FaLock className="text-2xl text-emerald-400 md:mb-2 mr-2 md:mr-0" />
        <div className="h-1 w-8 md:w-1 md:h-16 bg-gradient-to-r md:bg-gradient-to-b from-emerald-400 to-zinc-500 rounded"></div>
      </div>
      
      <div className="w-full md:w-1/3 space-y-4">
        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-zinc-500/20 flex items-center justify-center">2</span> 
          We Store
        </h4>
        <div className="relative">
          <div className="absolute -top-3 right-2 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 z-10">
             NO KEY
          </div>
          <div className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-400/70 overflow-hidden break-all h-[58px] flex items-center">
            {generateHash(text)}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 flex md:flex-col items-center">
        <div className="h-1 w-8 md:w-1 md:h-16 bg-gradient-to-r md:bg-gradient-to-b from-zinc-500 to-emerald-400 rounded md:mb-2 mr-2 md:mr-0"></div>
        <FaKey className="text-2xl text-emerald-400" />
      </div>

      <div className="w-full md:w-1/3 space-y-4">
        <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-emerald-400/20 flex items-center justify-center">3</span> 
          Client Decrypts
        </h4>
        <div className="relative">
          <div className="absolute -top-3 right-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 z-10 backdrop-blur-sm">
            <FaKey /> PRIVATE KEY
          </div>
          <div className="w-full bg-emerald-400/10 border border-emerald-400/30 rounded-lg p-4 text-emerald-100 h-[58px] flex items-center shadow-[0_0_15px_rgba(45,212,191,0.2)]">
            {text || '...'}
          </div>
        </div>
      </div>
    </div>
  );
};

const ModerationVisualizer = () => {
  const [activeTab, setActiveTab] = useState('safe');
  
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-xl shadow-emerald-500/5">
      <div className="w-full md:w-1/3 bg-zinc-800/50 p-6 flex flex-col justify-center border-r border-zinc-800">
        <button 
          onClick={() => setActiveTab('safe')}
          className={`px-4 py-3 rounded-lg text-left text-sm font-medium transition mb-3 border ${activeTab === 'safe' ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300' : 'border-transparent text-zinc-400 hover:bg-zinc-800'}`}
        >
          Normal Message
        </button>
        <button 
          onClick={() => setActiveTab('toxic')}
          className={`px-4 py-3 rounded-lg text-left text-sm font-medium transition border ${activeTab === 'toxic' ? 'bg-red-400/10 border-red-400/30 text-red-300' : 'border-transparent text-zinc-400 hover:bg-zinc-800'}`}
        >
          Toxic Message
        </button>
      </div>
      <div className="w-full md:w-2/3 p-8 flex items-center justify-center min-h-[220px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10">
        {activeTab === 'safe' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-6 w-full max-w-sm"
          >
            <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-tl-none p-5 text-sm text-zinc-200 flex-1 relative shadow-lg">
              "Hey, I really loved your presentation today! Great job."
            </div>
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-400 mb-2 shadow-[0_0_20px_rgba(45,212,191,0.4)]">
                <HiOutlineSparkles className="text-2xl" />
              </div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Approved</span>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-6 w-full max-w-sm"
          >
            <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-tl-none p-5 text-sm text-zinc-500 italic flex-1 relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-[1px] flex items-center justify-center z-10">
                <span className="bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded flex items-center gap-2 font-bold border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                  <FaShieldAlt /> BLOCKED BY AI
                </span>
              </div>
              "You are a terrible person and you should quit."
            </div>
            <div className="flex-shrink-0 flex flex-col items-center opacity-70">
              <div className="h-12 w-12 rounded-full bg-red-400/10 flex items-center justify-center text-red-400 mb-2 border border-red-400/20">
                <FaShieldAlt className="text-xl" />
              </div>
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Filtered</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};