import { useEffect, useState } from 'react';
import Navbar from '../navbar';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/router';
import { signIn, signOut, useSession } from 'next-auth/react';
import { encryptPrivateKey, generateRSAKeyPair, generateEncryptionPassphrase } from '@/utils/crypto';
import { storePrivateKey } from '@/utils/storage';
import { motion } from 'framer-motion';
import { FaUserPlus, FaKey, FaCopy, FaCheck, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa';
import axiosInstance from '@/utils/axios/axiosInstance';

function Loader({ message }) {
  return (
    <div className="fixed inset-0 bg-zinc-950 bg-opacity-90 flex flex-col items-center justify-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-400 mb-4"></div>
      <p className="text-white text-lg font-semibold">{message}</p>
    </div>
  );
}

export default function Signup() {
  const [errors, setErrors] = useState({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isProcessingSignup, setIsProcessingSignup] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();
  const [googleRegistrationAttempted, setGoogleRegistrationAttempted] = useState(false);

  // Passphrase flow state
  const [flowState, setFlowState] = useState('idle'); // idle | returning-user | show-passphrase
  const [passphraseInput, setPassphraseInput] = useState('');
  const [generatedPassphrase, setGeneratedPassphrase] = useState('');
  const [passphraseError, setPassphraseError] = useState('');
  const [existingEncryptedKey, setExistingEncryptedKey] = useState(null);
  const [existingPublicKey, setExistingPublicKey] = useState('');
  const [newKeyData, setNewKeyData] = useState(null); // {publicKey, encryptedPrivateKey}
  const [passphraseConfirmed, setPassphraseConfirmed] = useState(false);
  const [passphraseCopied, setPassphraseCopied] = useState(false);

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    signIn('google', { callbackUrl: '/signup' });
  };

  // Handle returning user passphrase submission
  const handlePassphraseSubmit = async (e) => {
    e.preventDefault();
    setPassphraseError('');
    setProcessingMessage('Decrypting your keys...');
    setIsProcessingSignup(true);

    try {
      const { decryptPrivateKey } = await import('@/utils/crypto');
      const decryptedPrivateKey = await decryptPrivateKey(
        existingEncryptedKey.encryptedData || existingEncryptedKey,
        existingEncryptedKey.iv,
        existingEncryptedKey.salt,
        passphraseInput
      );

      // Store decrypted key in IndexedDB
      await storePrivateKey(existingEncryptedKey);

      // Authenticate to get JWT
      const authRes = await axiosInstance.post('/auth/google', {
        email: session.user.email,
      });
      localStorage.setItem('token', authRes.data.token);
      localStorage.setItem('_pp', passphraseInput);
      sessionStorage.setItem('_pp', passphraseInput);

      setFlowState('done');
      setIsProcessingSignup(false);
      router.push('/');
    } catch (err) {
      setPassphraseError('Incorrect passphrase. Please try again.');
      setIsProcessingSignup(false);
    }
  };

  // Handle copy passphrase
  const handleCopyPassphrase = () => {
    navigator.clipboard.writeText(generatedPassphrase);
    setPassphraseCopied(true);
    setTimeout(() => setPassphraseCopied(false), 3000);
  };

  // Handle passphrase saved confirmation
  const handlePassphraseSaved = () => {
    setPassphraseConfirmed(true);
  };

  // Complete signup after passphrase saved
  const handleFinishSignup = async () => {
    if (!passphraseConfirmed) return;
    setProcessingMessage('Creating your account...');
    setIsProcessingSignup(true);

    const payload = {
      email: session.user.email,
      name: session.user.name,
      publicKey: newKeyData.publicKey,
      encryptedPrivateKey: newKeyData.encryptedPrivateKey,
      credential: session.user.id,
    };

    // Retry on timeout (free-tier Supabase cold starts can take >10s).
    // The INSERT often succeeds server-side even when Vercel times out.
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) {
          setProcessingMessage(`Retrying (attempt ${attempt + 1}/3)...`);
          await new Promise((r) => setTimeout(r, 2000));
        }

        const authRes = await axiosInstance.post('/auth/google', payload, { timeout: 15000 });

        localStorage.setItem('token', authRes.data.token);
        localStorage.setItem('_pp', generatedPassphrase);
        sessionStorage.setItem('_pp', generatedPassphrase);
        router.push('/');
        return;
      } catch (err) {
        lastError = err;
        const status = err.response?.status;
        // Only retry on timeout/gateway errors, not on client errors
        if (status === 504 || !status) continue;
        break; // 4xx/5xx (non-timeout) — don't retry
      }
    }

    const errMsg = lastError?.response?.data?.message || lastError?.message || 'Signup failed';
    setErrors({ apiError: `Signup failed: ${errMsg}` });
    setIsProcessingSignup(false);
  };

  useEffect(() => {
    const handleGoogleRegistration = async () => {
      if (status === 'authenticated' && !googleRegistrationAttempted) {
        setGoogleRegistrationAttempted(true);
        setProcessingMessage('Checking account...');
        setIsProcessingSignup(true);
        setErrors({});

        try {
          // Check if user exists
          const checkRes = await axiosInstance.get('/auth/check-user', {
            params: { email: session.user.email },
          });
          const checkData = checkRes.data;

          if (checkData.exists) {
            // Returning user — need passphrase
            let parsedKey;
            try {
              parsedKey = typeof checkData.encryptedPrivateKey === 'string'
                ? JSON.parse(checkData.encryptedPrivateKey)
                : checkData.encryptedPrivateKey;
            } catch {
              parsedKey = checkData.encryptedPrivateKey;
            }

            setExistingEncryptedKey(parsedKey);
            setExistingPublicKey(checkData.publicKey);
            setFlowState('returning-user');
            setIsProcessingSignup(false);
          } else {
            // New user — generate keys and passphrase
            setProcessingMessage('Generating encryption keys...');

            const { publicKey, privateKey } = await generateRSAKeyPair();
            const passphrase = generateEncryptionPassphrase();
            const encryptedPrivateKeyData = await encryptPrivateKey(privateKey, passphrase);

            await storePrivateKey(encryptedPrivateKeyData);

            setGeneratedPassphrase(passphrase);
            setNewKeyData({ publicKey, encryptedPrivateKey: encryptedPrivateKeyData });
            setFlowState('show-passphrase');
            setIsProcessingSignup(false);
          }
        } catch (err) {
          const errMsg = err.response?.data?.message || err.message;
          setErrors({ apiError: `Google Sign-Up failed: ${errMsg}` });
          await signOut({ redirect: false });
          setGoogleRegistrationAttempted(false);
          setIsProcessingSignup(false);
          setIsGoogleLoading(false);
        }
      } else if (status === 'unauthenticated' && googleRegistrationAttempted) {
        setGoogleRegistrationAttempted(false);
      }
    };

    handleGoogleRegistration();
  }, [session, status, router, googleRegistrationAttempted]);

  if (isProcessingSignup && flowState === 'idle') {
    return <Loader message={processingMessage} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-gray-100 font-sans">
      <Navbar />

      {/* Show passphrase screen — new user */}
      {flowState === 'show-passphrase' && (
        <div className="flex items-center justify-center min-h-[calc(100vh)] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full space-y-6"
          >
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4">
                <FaExclamationTriangle className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-white">Save Your Encryption Passphrase</h2>
              <p className="mt-3 text-zinc-400 text-sm leading-relaxed">
                This passphrase encrypts your private key. Without it, <strong className="text-amber-300">you cannot read any messages</strong> — not even we can recover it. Save it now.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-400/10 rounded-xl blur-xl" />
              <div className="relative bg-zinc-900/80 backdrop-blur-sm p-6 rounded-xl border border-amber-500/30">
                <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                  <p className="text-sm font-mono text-emerald-300 break-all select-all text-center leading-relaxed">
                    {generatedPassphrase}
                  </p>
                </div>
                <button
                  onClick={handleCopyPassphrase}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-zinc-300 transition"
                >
                  {passphraseCopied ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
                  {passphraseCopied ? 'Copied!' : 'Copy to clipboard'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer" onClick={handlePassphraseSaved}>
                <input
                  type="checkbox"
                  checked={passphraseConfirmed}
                  onChange={(e) => setPassphraseConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/30"
                />
                <span className="text-sm text-zinc-300">
                  I have saved this passphrase in a safe place. I understand that if I lose it, my messages will be permanently unreadable.
                </span>
              </label>
            </div>

            {isProcessingSignup && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-400" />
              </div>
            )}

            <button
              onClick={handleFinishSignup}
              disabled={!passphraseConfirmed || isProcessingSignup}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              I&apos;ve saved my passphrase <FaArrowRight className="text-xs" />
            </button>
          </motion.div>
        </div>
      )}

      {/* Returning user — passphrase prompt */}
      {flowState === 'returning-user' && (
        <div className="flex items-center justify-center min-h-[calc(100vh)] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full space-y-6"
          >
            <div className="text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-zinc-500 to-emerald-400 flex items-center justify-center mb-4">
                <FaKey className="text-white text-lg" />
              </div>
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="mt-2 text-zinc-400 text-sm">
                Enter your encryption passphrase to unlock your messages.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/10 to-emerald-400/10 rounded-xl blur-xl" />
              <div className="relative bg-zinc-900/80 backdrop-blur-sm p-6 rounded-xl border border-zinc-800">
                <form onSubmit={handlePassphraseSubmit} className="space-y-4">
                  {passphraseError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg"
                    >
                      <p className="text-sm font-medium">{passphraseError}</p>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Encryption Passphrase
                    </label>
                    <input
                      type="password"
                      value={passphraseInput}
                      onChange={(e) => setPassphraseInput(e.target.value)}
                      className="block w-full px-4 py-3 rounded-lg border-zinc-700 bg-zinc-800/50 border placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-transparent transition font-mono text-sm"
                      placeholder="Paste your encryption passphrase..."
                      required
                      autoFocus
                    />
                    <p className="mt-2 text-xs text-zinc-500">
                      This is the passphrase you saved when you created your account.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={!passphraseInput.trim() || isProcessingSignup}
                    className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessingSignup ? 'Decrypting...' : 'Unlock Messages'}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Default signup screen (Google button) */}
      {flowState === 'idle' && (
        <div className="flex items-center justify-center min-h-[calc(100vh)] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full space-y-8"
          >
            <div className="text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-zinc-500 to-emerald-400 flex items-center justify-center mb-6">
                <FaUserPlus className="text-white text-xl" />
              </div>
              <h2 className="text-3xl font-bold text-white">Create Your Account</h2>
              <p className="mt-3 text-zinc-400">Join to start receiving anonymous messages</p>
            </div>

            <div className="mt-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/10 to-emerald-400/10 rounded-xl blur-xl"></div>
                <div className="relative bg-zinc-900/80 backdrop-blur-sm p-8 rounded-xl border border-zinc-800">
                  {errors.apiError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-lg"
                    >
                      <p className="text-sm font-medium">{errors.apiError}</p>
                    </motion.div>
                  )}

                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={isGoogleLoading || isProcessingSignup}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <FcGoogle className="text-xl" />
                    <span>
                      {isProcessingSignup ? 'Processing...' : isGoogleLoading ? 'Redirecting...' : 'Sign up with Google'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs text-zinc-500">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="text-emerald-400 hover:text-emerald-300">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
