// components/Signup.js

import { useEffect, useState } from 'react';
import Navbar from '../navbar';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/router';
import { signIn, signOut, useSession } from 'next-auth/react';
import { encryptPrivateKey, generateRSAKeyPair } from '@/utils/crypto';
import { storePrivateKey } from '@/utils/storage';
import { motion } from 'framer-motion';
import { FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import axiosInstance from '@/utils/axios/axiosInstance';


function Loader() {
  return (
    <div className="fixed inset-0 bg-slate-950 bg-opacity-80 flex flex-col items-center justify-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-400 mb-4"></div>
      <p className="text-white text-lg font-semibold">Processing Google Sign-Up...</p>
      <p className="text-slate-400 text-sm">Please wait a moment.</p>
    </div>
  );
}


export default function Signup() {
  const [errors, setErrors] = useState({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isProcessingSignup, setIsProcessingSignup] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [googleRegistrationAttempted, setGoogleRegistrationAttempted] = useState(false);

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    signIn('google', { callbackUrl: '/signup' });
  };

  useEffect(() => {
    const handleGoogleRegistration = async () => {
      if (status === "authenticated" && !googleRegistrationAttempted) {
        setGoogleRegistrationAttempted(true);
        setIsProcessingSignup(true);
        setErrors({}); // Clear previous errors

        try {
          // --- Check if user exists using Axios ---
          console.log(`Checking user: ${session.user.email}`);
          const checkRes = await axiosInstance.get('/auth/check-user', {
            params: { email: session.user.email } // Pass email as query param
          });
          const checkData = checkRes.data; // Axios provides data directly
          console.log("User check response:", checkData);

          if (checkData.exists) {
            // --- Existing User Logic ---
            console.log("Existing user found via Google Auth.");
            if (!checkData.encryptedPrivateKey || !checkData.publicKey) {
                throw new Error("Existing user data missing required keys from backend.");
            }

            let parsedPrivateKey;
             try {
                 parsedPrivateKey = typeof checkData.encryptedPrivateKey === 'string'
                     ? JSON.parse(checkData.encryptedPrivateKey)
                     : checkData.encryptedPrivateKey;
             } catch (e) {
                 console.error("Failed to parse encrypted private key:", e);
                 throw new Error("Invalid format for encrypted private key received from backend.");
             }

            await storePrivateKey(parsedPrivateKey);

            // --- Authenticate existing user using Axios ---
            // * Verify backend endpoint: Is it /auth/google or /auth/google-login? *
            // Using /auth/google as per original code for now.
            console.log("Authenticating existing Google user:", session.user.email);
            const authRes = await axiosInstance.post('/auth/google', {
              email: session.user.email,
              // Send other necessary fields if your backend requires them for login
            });
            const authData = authRes.data;
            console.log("Authentication response:", authData);


            if (!authData.token) {
                throw new Error("Authentication successful but no token received.");
            }

            localStorage.setItem('token', authData.token);
            router.push('/');

          } else {
            // --- New User Logic ---
            console.log("New user registration via Google Auth.");
            const { publicKey, privateKey } = await generateRSAKeyPair();
            const encryptedPrivateKeyData = await encryptPrivateKey(
              privateKey,
              process.env.NEXT_PUBLIC_PRIVATE_KEY_SECRET
            );

            await storePrivateKey(encryptedPrivateKeyData);

            // --- Create new user using Axios ---
            console.log("Creating new Google user:", session.user.email);
            const createRes = await axiosInstance.post('/auth/google', {
                email: session.user.email,
                name: session.user.name,
                publicKey,
                encryptedPrivateKey: encryptedPrivateKeyData
            });
            const createData = createRes.data;
            console.log("Creation response:", createData);


             if (!createData.token) {
                throw new Error("User creation successful but no token received.");
            }

            localStorage.setItem('token', createData.token);
            router.push('/');
          }

        } catch (err) {
          console.error("Google Registration/Login Error:", err);
          // Axios errors often have more info in err.response.data or err.message
          const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred during Google Sign-Up.';
          setErrors({ apiError: `Google Sign-Up failed: ${errorMessage}` });
          await signOut({ redirect: false });
          setGoogleRegistrationAttempted(false);
        } finally {
          setIsProcessingSignup(false);
          setIsGoogleLoading(false);
        }
      } else if (status === 'unauthenticated' && googleRegistrationAttempted) {
          // If we attempted registration but ended up unauthenticated (e.g., signOut was called in catch)
          // Reset the attempt flag so user can try again if they wish
          setGoogleRegistrationAttempted(false);
      }
    };

    handleGoogleRegistration();
  }, [session, status, router, googleRegistrationAttempted]); // Added googleRegistrationAttempted back, carefully manage state updates

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans">
      <Navbar />

      {/* Conditionally render loader based on processing state */}
      {isProcessingSignup && <Loader />}

      {/* Hide main content while processing */}
      {!isProcessingSignup && (
        <div className="flex items-center justify-center min-h-[calc(100vh)] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full space-y-8"
          >
            {/* ... (Header: Icon, Title, Subtitle) ... */}
             <div className="text-center">
                <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center mb-6">
                <FaUserPlus className="text-white text-xl" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                Create Your Account
                </h2>
                <p className="mt-3 text-slate-400">
                Join to start receiving anonymous messages
                </p>
            </div>


            <div className="mt-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-teal-400/10 rounded-xl blur-xl"></div>
                <div className="relative bg-slate-900/80 backdrop-blur-sm p-8 rounded-xl border border-slate-800">
                  {errors.apiError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-lg"
                    >
                      <p className="text-sm font-medium">{errors.apiError}</p>
                    </motion.div>
                  )}

                  {/* Commented out Email/Password Form */}
                  {/* <form> ... </form> */}
                  {/* <div className="flex items-center my-6"> ... OR ... </div> */}

                  {/* Google Sign-Up Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    // Disable button if google sign-in initiated OR if backend processing is happening
                    disabled={isGoogleLoading || isProcessingSignup}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <FcGoogle className="text-xl" />
                    {/* Text changes based on which loading state is active */}
                    <span>
                      {isProcessingSignup
                        ? 'Processing...' // Should ideally not be visible if loader covers screen
                        : isGoogleLoading
                        ? 'Redirecting...' // Text while waiting for redirect
                        : 'Sign up with Google'}
                    </span>
                  </button>

                   {/* Optional: Link to Login */}
                   {/* <div className="mt-6 text-center">
                    <p className="text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-teal-400 hover:text-teal-300 transition">
                        Log in
                        </Link>
                    </p>
                    </div> */}
                </div>
              </div>

               {/* Footer Links */}
               <div className="mt-8 text-center">
                <p className="text-xs text-slate-500">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" className="text-teal-400 hover:text-teal-300">
                    Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-teal-400 hover:text-teal-300">
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