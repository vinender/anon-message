import { useEffect, useState } from 'react';
import Navbar from '../navbar';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/router';
import { signIn, signOut, useSession } from 'next-auth/react';
import { generateRSAKeyPair } from '@/utils/crypto';
import { storePrivateKey } from '@/utils/storage';
import { motion } from 'framer-motion';
import { FaUserPlus } from 'react-icons/fa';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();
  const [googleRegistrationAttempted, setGoogleRegistrationAttempted] = useState(false);

  const handleGoogleSignup = () => {
    setIsGoogleLoading(true);
    signIn('google', { callbackUrl: '/signup' });
  };

  useEffect(() => {
    const handleGoogleRegistration = async () => {
      if (status === 'authenticated' && !googleRegistrationAttempted) {
        setGoogleRegistrationAttempted(true);
        setProcessingMessage('Setting up your account...');
        setIsProcessing(true);
        setErrors({});

        try {
          // Check if user exists
          const checkRes = await axiosInstance.get('/auth/check-user', {
            params: { email: session.user.email },
          });
          const checkData = checkRes.data;

          if (checkData.exists) {
            // Existing user — authenticate
            setProcessingMessage('Signing in...');
            const authRes = await axiosInstance.post('/auth/google', {
              email: session.user.email,
            });
            localStorage.setItem('token', authRes.data.token);
            router.push('/');
            return;
          }

          // New user — generate keys, store private key ONLY in browser
          setProcessingMessage('Generating encryption keys...');
          const { publicKey, privateKey } = await generateRSAKeyPair();
          await storePrivateKey(privateKey);

          setProcessingMessage('Creating account...');
          const authRes = await axiosInstance.post('/auth/google', {
            email: session.user.email,
            name: session.user.name,
            publicKey,
          });

          localStorage.setItem('token', authRes.data.token);
          router.push('/');
        } catch (err) {
          const errMsg = err.response?.data?.message || err.message || 'Signup failed';
          setErrors({ apiError: errMsg });
          await signOut({ redirect: false });
          setGoogleRegistrationAttempted(false);
          setIsProcessing(false);
          setIsGoogleLoading(false);
        }
      } else if (status === 'unauthenticated' && googleRegistrationAttempted) {
        setGoogleRegistrationAttempted(false);
      }
    };

    handleGoogleRegistration();
  }, [session, status, router, googleRegistrationAttempted]);

  if (isProcessing) {
    return <Loader message={processingMessage} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-gray-100 font-sans">
      <Navbar />
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
                  disabled={isGoogleLoading || isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-white transition disabled:opacity-60"
                >
                  <FcGoogle className="text-xl" />
                  <span>{isGoogleLoading ? 'Redirecting...' : 'Sign up with Google'}</span>
                </button>

                <p className="mt-4 text-center text-xs text-zinc-500">
                  Your encryption key stays in your browser. We never see it.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-zinc-500">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-emerald-400 hover:text-emerald-300">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
