import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faLock, faRobot, faTrashAlt, faUserSecret, faKey, faExchangeAlt, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import Navbar from '@/components/navbar';


const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 1 } },
};

const slideIn = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const styles = {
    fadeIn: { animation: "fadeIn 1s forwards" },
    slideIn: { animation: "slideIn 0.5s forwards" },
    encryptionPath: {
      strokeDasharray: 1000,
      strokeDashoffset: 1000,
      animation: "dash 3s linear forwards infinite",
    },
    securityCardHover: {
        transform: "translateY(-5px)",
        boxShadow: "0 10px 25px -5px rgba(0, 206, 201, 0.1)",
    },
    glowEffect: {
      boxShadow: "0 0 15px 2px rgba(45, 212, 191, 0.15)",
    },
    techPillHover: {
      background: "linear-gradient(to right, rgba(79, 70, 229, 0.2), rgba(45, 212, 191, 0.2))",
      borderColor: "rgba(45, 212, 191, 0.4)",
    }

}
const AnonMessageSecurity = () => {
    const [encryptedMessage, setEncryptedMessage] = useState('');
    const messageInputRef = useRef(null);
    const animationTriggerRef = useRef(null);
  
    const handleEncrypt = () => {
      const message = messageInputRef.current.value;
      // Simulate encryption - replace with a real encryption library in production
      const encrypted = btoa(message); // Basic base64 encoding for the demo
      setEncryptedMessage(encrypted);
    };
  
    const handleDecrypt = () => {
      try {
        const decrypted = atob(encryptedMessage); // Basic base64 decoding
        setEncryptedMessage(decrypted);
      } catch (error) {
        setEncryptedMessage("Decryption Error: Invalid encrypted format.");
      }
    };
  
    // Define styles object for non-animation related styles
    const styles = {
      glowEffect: {
        boxShadow: "0 0 15px 2px rgba(45, 212, 191, 0.15)",
      },
      techPillHover: {
        background: "linear-gradient(to right, rgba(79, 70, 229, 0.2), rgba(45, 212, 191, 0.2))",
        borderColor: "rgba(45, 212, 191, 0.4)",
      },
      securityCardHover: {
        transform: "translateY(-5px)",
        boxShadow: "0 10px 25px -5px rgba(0, 206, 201, 0.1)",
      }
    };
  
    useEffect(() => {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes dash {
          from {
            stroke-dashoffset: 100;
          }
          to {
            stroke-dashoffset: -100;
          }
        }
        
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.7; }
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        
        .encryption-path {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: dash 3s linear infinite;
        }
      `;
      document.head.appendChild(style);
      
      // Reset animation function
      const resetAnimation = () => {
        const paths = animationTriggerRef.current?.querySelectorAll('.encryption-path');
        paths?.forEach(path => {
          path.style.animation = 'none';
          void path.offsetHeight; // Trigger reflow
          path.style.animation = 'dash 3s linear infinite';
        });
        
        // Also reset the pulse animation on circles
        const circles = animationTriggerRef.current?.querySelectorAll('.animate-pulse');
        circles?.forEach(circle => {
          circle.classList.remove('animate-pulse');
          void circle.offsetWidth; // Trigger reflow
          circle.classList.add('animate-pulse');
        });
      };
      
      // Event listener for reset
      const watchAgainButton = document.querySelector('#encryption-flow button');
      watchAgainButton?.addEventListener('click', resetAnimation);
      
      return () => {
        watchAgainButton?.removeEventListener('click', resetAnimation);
        document.head.removeChild(style);
      };
    }, []);


    return (
        <div className="min-h-screen bg-slate-950 text-gray-100 font-sans">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}

                <Navbar/>
                {/* <header className="flex items-center justify-between py-8">
                    <motion.div
                      className="flex items-center space-x-2"
                      variants={fadeIn}
                      initial="hidden"
                      animate="show"
                    >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center">
                            <FontAwesomeIcon icon={faEyeSlash} className="text-white text-xl" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Anon<span className="text-teal-400">Message</span>
                        </h1>
                    </motion.div>
                    <nav className="flex items-center space-x-6">
                        <a href="#" className="text-sm font-medium hover:text-teal-400 transition duration-300">
                            Sign Up
                        </a>
                        <a
                            href="#"
                            className="text-sm font-medium bg-gradient-to-r from-indigo-500 to-teal-400 px-5 py-2.5 rounded-lg hover:shadow-lg hover:shadow-teal-500/20 transition duration-300"
                        >
                            Login
                        </a>
                    </nav>
                </header> */}

                {/* Hero Section */}
                <main className="text-center py-16">
                    <div className="relative mb-10">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-teal-400/10 rounded-3xl blur-3xl"></div>
                        <motion.div
                        className="relative"
                        variants={fadeIn}
                        initial="hidden"
                        animate="show"
                        >
                            <span className="px-4 py-1.5 text-xs font-semibold bg-teal-400/10 text-teal-300 rounded-full border border-teal-400/20">
                                Technology & Security
                            </span>
                        </motion.div>
                        <motion.h2
                            className="text-5xl md:text-6xl font-extrabold mt-6 mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400"
                            variants={slideIn}
                            initial="hidden"
                            animate="show"
                            style={{ animationDelay: '0.2s' }}
                        >
                            How We Keep Your<br />
                            <span className="text-teal-400">Messages Secure</span>
                        </motion.h2>
                        <motion.p
                            className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto"
                            variants={slideIn}
                            initial="hidden"
                            animate="show"
                            style={{ animationDelay: '0.4s' }}
                        >
                            Understanding the advanced technology behind AnonMessage's military-grade security and AI-powered content filtering.
                        </motion.p>
                    </div>
                </main>

                {/* Interactive Encryption Flow Visualization */}
                 <section className="py-16 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-teal-400/5 rounded-3xl blur-3xl"></div>
                    <div className="text-center mb-16 relative">
                        <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">END-TO-END ENCRYPTION</span>
                        <h3 className="text-3xl font-bold mt-6">See How It Works</h3>
                        <p className="text-slate-400 mt-4 max-w-xl mx-auto">Our state-of-the-art encryption protects your messages from sender to recipient with no ability for anyone—not even us—to read them.</p>
                    </div>

                    <div className="relative mx-auto max-w-4xl bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm" style={styles.glowEffect}>
                        <div id="encryption-flow" className="flex flex-col items-center" ref={animationTriggerRef}>
                        {/* Interactive SVG Animation */}
                        <svg width="100%" height="280" className="my-8">
                            {/* Sender */}
                            <g transform="translate(50, 140)">
                            <circle cx="0" cy="0" r="30" fill="url(#senderGradient)" />
                            <text x="0" y="60" textAnchor="middle" className="text-xs font-medium text-gray-300">Sender</text>
                            <text x="0" y="0" textAnchor="middle" className="text-xs font-bold text-white">A</text>
                            </g>

                            {/* Message Encryption Process */}
                            <g transform="translate(170, 140)">
                            <rect x="-50" y="-40" width="100" height="80" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                            <text x="0" y="-15" textAnchor="middle" className="text-xs font-medium text-teal-400">Encryption</text>
                            <text x="0" y="10" textAnchor="middle" className="text-xs text-gray-300">256-bit</text>
                            <text x="0" y="25" textAnchor="middle" className="text-xs text-gray-300">AES/RSA</text>
                            </g>

                            {/* Server/AI Analysis */}
                            <g transform="translate(320, 140)">
                            <rect x="-50" y="-40" width="100" height="80" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                            <text x="0" y="-15" textAnchor="middle" className="text-xs font-medium text-indigo-400">AI Analysis</text>
                            <text x="0" y="10" textAnchor="middle" className="text-xs text-gray-300">Content</text>
                            <text x="0" y="25" textAnchor="middle" className="text-xs text-gray-300">Filtering</text>
                            </g>

                            {/* Recipient */}
                            <g transform="translate(450, 140)">
                            <circle cx="0" cy="0" r="30" fill="url(#recipientGradient)" />
                            <text x="0" y="60" textAnchor="middle" className="text-xs font-medium text-gray-300">Recipient</text>
                            <text x="0" y="0" textAnchor="middle" className="text-xs font-bold text-white">B</text>
                            </g>

                            {/* Animation Paths - Now with corrected stroke properties */}
                            <path 
                            d="M 80,140 L 120,140" 
                            stroke="#4f46e5" 
                            strokeWidth="3" 
                            className="encryption-path"
                            />
                            <path 
                            d="M 220,140 L 270,140" 
                            stroke="#2dd4bf" 
                            strokeWidth="3" 
                            className="encryption-path"
                            />
                            <path 
                            d="M 370,140 L 420,140" 
                            stroke="#4f46e5" 
                            strokeWidth="3" 
                            className="encryption-path"
                            />

                            {/* Message Icons */}
                            <circle cx="100" cy="140" r="8" fill="#4f46e5" className="animate-pulse" />
                            <circle cx="245" cy="140" r="8" fill="#2dd4bf" className="animate-pulse" />
                            <circle cx="395" cy="140" r="8" fill="#4f46e5" className="animate-pulse" />

                            {/* Gradients */}
                            <defs>
                            <linearGradient id="senderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#4f46e5" />
                                <stop offset="100%" stopColor="#2dd4bf" />
                            </linearGradient>
                            <linearGradient id="recipientGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#4f46e5" />
                                <stop offset="100%" stopColor="#2dd4bf" />
                            </linearGradient>
                            </defs>
                        </svg>

                        {/* Explanation */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="text-center p-4">
                            <h4 className="text-lg font-semibold text-indigo-400 mb-2">1. Message Creation</h4>
                            <p className="text-sm text-slate-400">Your message is encrypted on your device before it ever leaves, using unique encryption keys.</p>
                            </div>
                            <div className="text-center p-4">
                            <h4 className="text-lg font-semibold text-teal-400 mb-2">2. AI Content Analysis</h4>
                            <p className="text-sm text-slate-400">Our AI analyzes encrypted content patterns to filter harmful messages while maintaining privacy.</p>
                            </div>
                            <div className="text-center p-4">
                            <h4 className="text-lg font-semibold text-indigo-400 mb-2">3. Secure Delivery</h4>
                            <p className="text-sm text-slate-400">Only the recipient can decrypt and read the message with their unique private key.</p>
                            </div>
                        </div>

                        <button className="mt-8 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-teal-400 rounded-lg text-sm font-medium transition duration-300">
                            Watch Again
                        </button>
                        </div>
                    </div>
                </section>

                {/* Technology Breakdown */}
                <section className="py-16">
                    <div className="text-center mb-16">
                        <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-teal-400/10 text-teal-300 border border-teal-400/20">SECURITY TECHNOLOGY</span>
                        <h3 className="text-3xl font-bold mt-6">Our Security Stack</h3>
                        <p className="text-slate-400 mt-4 max-w-xl mx-auto">Every message on AnonMessage is protected by multiple layers of industry-leading security.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Encryption */}
                        <div className="security-card bg-slate-900 border border-slate-800 rounded-xl p-6 transition duration-300" style={styles.securityCardHover}>
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center mb-4">
                                <FontAwesomeIcon icon={faLock} className="text-white text-xl" />
                            </div>
                            <h4 className="text-xl font-semibold mb-3">End-to-End Encryption</h4>
                            <p className="text-slate-400 mb-4">Messages are encrypted using 256-bit AES encryption with RSA key exchange, making them unreadable to anyone except the intended recipient.</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className="tech-pill text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 transition duration-300" style={styles.techPillHover}>AES-256</span>
                                <span className="tech-pill text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 transition duration-300" style={styles.techPillHover}>RSA-2048</span>
                                <span className="tech-pill text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 transition duration-300" style={styles.techPillHover}>Perfect Forward Secrecy</span>
                            </div>
                        </div>

                        {/* AI Protection */}
                        <div className="security-card bg-slate-900 border border-slate-800 rounded-xl p-6 transition duration-300" style={styles.securityCardHover}>
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center mb-4">
                                 <FontAwesomeIcon icon={faRobot} className="text-white text-xl" />

                            </div>
                            <h4 className="text-xl font-semibold mb-3">AI Content Filtering</h4>
                            <p className="text-slate-400 mb-4">Our advanced AI analyzes message patterns to filter out harmful content while maintaining the encryption that protects your privacy.</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className="tech-pill text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 transition duration-300" style={styles.techPillHover}>NLP Processing</span>
                                <span className="tech-pill text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 transition duration-300" style={styles.techPillHover}>Pattern Recognition</span>
                                <span className="tech-pill text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 transition duration-300" style={styles.techPillHover}>Sentiment Analysis</span>
                                <span className="tech-pill text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 transition duration-300" style={styles.techPillHover}>Zero-Knowledge Filtering</span>
                            </div>
                        </div>

                        {/* Zero Storage */}
                        <div className="security-card bg-slate-900 border border-slate-800 rounded-xl p-6 transition duration-300" style={styles.securityCardHover}>
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center mb-4">
                                <FontAwesomeIcon icon={faTrashAlt} className="text-white text-xl" />
                            </div>
                            <h4 className="text-xl font-semibold mb-3">Zero Storage Policy</h4>
                            <p className="text-slate-400 mb-4">We don't store your messages or connection data. Once delivered, messages are permanently deleted from our servers.</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className="tech-pill text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 transition duration-300" style={styles.techPillHover}>Ephemeral Storage</span>
                                <span className="tech-pill text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 transition duration-300" style={styles.techPillHover}>Auto-Delete</span>
                                <span className="tech-pill text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 transition duration-300" style={styles.techPillHover}>No Logs</span>
                            </div>
                        </div>

                        {/* Identity Protection */}
                        <div className="security-card bg-slate-900 border border-slate-800 rounded-xl p-6 transition duration-300" style={styles.securityCardHover}>
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center mb-4">
                                <FontAwesomeIcon icon={faUserSecret} className="text-white text-xl" />
                            </div>
                            <h4 className="text-xl font-semibold mb-3">Identity Protection</h4>
                            <p className="text-slate-400 mb-4">Your real identity is completely shielded. We never collect IP addresses, device IDs, or any personally identifiable information.</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className="tech-pill text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 transition duration-300" style={styles.techPillHover}>No IP Tracking</span>
                                <span className="tech-pill text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 transition duration-300" style={styles.techPillHover}>Anonymous Relays</span>
                                <span className="tech-pill text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 transition duration-300" style={styles.techPillHover}>Metadata Scrubbing</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Technical Deep Dive */}
                <section className="py-16 bg-slate-900/50 rounded-2xl my-16">
                    <div className="text-center mb-16">
                        <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">TECHNICAL DEEP DIVE</span>
                        <h3 className="text-3xl font-bold mt-6">How Our Encryption Works</h3>
                    </div>

                    <div className="max-w-3xl mx-auto px-6">
                        {/* Encryption Keys */}
                        <div className="mb-12">
                            <h4 className="text-xl font-semibold mb-4 flex items-center">
                                  <FontAwesomeIcon icon={faKey} className="text-teal-400 mr-2" />
                                Encryption Keys
                            </h4>
                            <p className="text-slate-400 mb-4">Every user on AnonMessage is assigned a unique pair of cryptographic keys:</p>
                            <ul className="list-disc list-inside ml-4 space-y-2 text-slate-400">
                                <li><span className="text-teal-400 font-medium">Public Key:</span> Shared with others so they can encrypt messages to you.</li>
                                <li><span className="text-teal-400 font-medium">Private Key:</span> Stored only on your device, never sent to our servers.</li>
                            </ul>
                            <div className="mt-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-slate-300 text-sm">
                                <p className="font-mono">Public Key: RSA-2048 bits</p>
                                <p className="font-mono">Private Key: Generated and stored locally</p>
                                <p className="font-mono">Key Exchange: Diffie-Hellman protocol</p>
                            </div>
                        </div>

                        {/* Message Flow */}
                        <div className="mb-12">
                            <h4 className="text-xl font-semibold mb-4 flex items-center">
                                <FontAwesomeIcon icon={faExchangeAlt} className="text-teal-400 mr-2" />
                                Message Flow
                            </h4>
                            <ol className="list-decimal list-inside ml-4 space-y-4 text-slate-400">
                                <li>
                                    <p><span className="text-indigo-400 font-medium">Message Composition:</span> Text is composed in the app.</p>
                                </li>
                                <li>
                                    <p><span className="text-indigo-400 font-medium">Client-side Encryption:</span> The message is encrypted with the recipient's public key.</p>
                                </li>
                                <li>
                                    <p><span className="text-indigo-400 font-medium">AI Content Filtering:</span> The encrypted message is analyzed for harmful patterns.</p>
                                    <p className="text-xs ml-6 mt-1 text-slate-500">Note: We never decrypt your messages. Our AI uses advanced pattern recognition on encrypted data.</p>
                                </li>
                                <li>
                                    <p><span className="text-indigo-400 font-medium">Secure Delivery:</span> The encrypted message is sent to the recipient.</p>
                                </li>
                                <li>
                                    <p><span className="text-indigo-400 font-medium">Recipient-side Decryption:</span> Only the recipient can decrypt the message using their private key.</p>
                                </li>
                            </ol>
                        </div>

                        {/* Key Technical Benefits */}
                        <div className="mb-12">
                            <h4 className="text-xl font-semibold mb-4 flex items-center">
                                <FontAwesomeIcon icon={faShieldAlt} className="text-teal-400 mr-2" />
                                Key Security Benefits
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                    <h5 className="font-medium text-teal-400 mb-2">Perfect Forward Secrecy</h5>
                                    <p className="text-sm text-slate-400">Each message uses a unique session key, ensuring that even if one message is compromised, all other messages remain secure.</p>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                    <h5 className="font-medium text-teal-400 mb-2">Zero-Knowledge Architecture</h5>
                                    <p className="text-sm text-slate-400">We design our systems so that we technically cannot access your messages even if we wanted to.</p>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                    <h5 className="font-medium text-teal-400 mb-2">Quantum-Resistant Approach</h5>
                                    <p className="text-sm text-slate-400">Our encryption methods are designed with future quantum computing threats in mind.</p>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                    <h5 className="font-medium text-teal-400 mb-2">Regular Security Audits</h5>
                                    <p className="text-sm text-slate-400">Our encryption systems undergo regular third-party security audits to verify their integrity.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Interactive Demo */}
                <section className="py-16">
                    <div className="text-center mb-16">
                        <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-teal-400/10 text-teal-300 border border-teal-400/20">LIVE DEMO</span>
                        <h3 className="text-3xl font-bold mt-6">Try Our Encryption</h3>
                        <p className="text-slate-400 mt-4 max-w-xl mx-auto">See how our encryption works in real-time with this interactive demo.</p>
                    </div>

                    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6" style={styles.glowEffect}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Enter a message:</label>
                                <textarea
                                    ref={messageInputRef}
                                    className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="Type your message here..."
                                ></textarea>
                                <button
                                    onClick={handleEncrypt}
                                    className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-teal-400 px-6 py-2.5 rounded-lg text-sm font-medium transition duration-300"
                                >
                                    Encrypt Message
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Encrypted output:</label>
                                <div className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-teal-400 font-mono text-xs overflow-auto">
                                    {encryptedMessage}
                                </div>
                                <button
                                    onClick={handleDecrypt}
                                    className="mt-4 w-full bg-slate-800 border border-slate-700 px-6 py-2.5 rounded-lg text-sm font-medium transition duration-300"
                                >
                                    Decrypt Message
                                </button>
                            </div>
                        </div>
                        <div className="mt-8">
                            <p className="text-sm text-slate-400">Note: This is a simplified demo.  In the real app, your messages are encrypted with even stronger algorithms and the private key never leaves your device.</p>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-16">
                    <div className="text-center mb-16">
                        <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">FAQ</span>
                        <h3 className="text-3xl font-bold mt-6">Security FAQ</h3>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        <div className="space-y-6">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 transition duration-300">
                                <h4 className="text-lg font-medium mb-2">How can you filter content if messages are encrypted?</h4>
                                <p className="text-slate-400">Our AI analyzes patterns in encrypted data without decrypting the actual content.  This advanced technique allows us to identify potentially harmful messages while maintaining the complete privacy of your communication.</p>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 transition duration-300">
                                <h4 className="text-lg font-medium mb-2">Can AnonMessage read my messages?</h4>
                                <p className="text-slate-400">No. With end-to-end encryption, only you and your recipient can read the messages.  We don't have access to the decryption keys, which means we technically *cannot* read your messages even if we wanted to.</p>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 transition duration-300">
                                <h4 className="text-lg font-medium mb-2">What happens if I lose my device?</h4>
                                <p className="text-slate-400">For enhanced security, encryption keys are stored *only* on your device. If you lose your device, you'll need to create a new account.  This ensures that no one can access your previous messages, even if they gain access to your account.</p>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 transition duration-300">
                                <h4 className="text-lg font-medium mb-2">How does the AI content filter work?</h4>
                                <p className="text-slate-400">Our AI uses advanced pattern recognition techniques on *encrypted* data to identify potentially harmful content *without* actually reading the messages. This revolutionary approach allows us to maintain a safe environment while preserving privacy.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="text-center py-20">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-teal-400/10 rounded-3xl blur-3xl"></div>
                        <div className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-12 backdrop-blur-sm">
                            <h3 className="text-3xl font-bold mb-6">
                                Ready to communicate with <span className="text-teal-400">complete privacy</span>?
                            </h3>
                            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                                Join thousands of users who value their privacy and freedom of expression.
                            </p>
                            <a href="#" className="bg-gradient-to-r from-indigo-500 to-teal-400 px-8 py-3.5 rounded-lg text-sm font-medium shadow-lg shadow-teal-500/20 transition duration-300 ease-in-out hover:shadow-teal-500/40">
                                Create Your Free Account
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-800 py-12 mt-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faEyeSlash} className="text-white text-base" />
                                </div>
                                <h2 className="text-lg font-bold tracking-tight">Anon<span className="text-teal-400">Message</span></h2>
                            </div>
                            <p className="text-sm text-slate-500">
                                Secure, anonymous messaging.
                            </p>
                        </div>

                        <div>
                            <h5 className="font-medium text-slate-300 mb-4">Product</h5>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-slate-400 hover:text-teal-400 transition duration-300">Features</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-teal-400 transition duration-300">Pricing</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-teal-400 transition duration-300">Security</a></li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-medium text-slate-300 mb-4">Company</h5>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-slate-400 hover:text-teal-400 transition duration-300">About</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-teal-400 transition duration-300">Blog</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-teal-400 transition duration-300">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-medium text-slate-300 mb-4">Legal</h5>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-slate-400 hover:text-teal-400 transition duration-300">Privacy Policy</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-teal-400 transition duration-300">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AnonMessageSecurity;