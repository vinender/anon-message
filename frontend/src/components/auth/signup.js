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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // For the button click itself
  const [isProcessingSignup, setIsProcessingSignup] = useState(false); // For backend processing post-redirect
  const router = useRouter();
  const { data: session, status } = useSession();
  const [googleRegistrationAttempted, setGoogleRegistrationAttempted] = useState(false);


  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true); // Indicate button interaction started
    // No need to set isProcessingSignup here, as the page will reload
    signIn('google', {
      callbackUrl: '/signup', // Redirect back here after Google auth
      // We could add a query param here if needed, but let's rely on status + state for now
    });
    // Note: Execution stops here due to redirect
  };

    
  // --- Effect to Handle Post-Google Authentication & Backend Processing ---
  useEffect(() => {
    const handleGoogleRegistration = async () => {
      // Only run if authenticated via callback AND registration hasn't been attempted yet in this session
      if (status === "authenticated" && !googleRegistrationAttempted) {
        setGoogleRegistrationAttempted(true); // Mark attempt
        setIsProcessingSignup(true); // START showing the full loader

        try {
          // Check if user exists in your backend
          const checkRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/check-user?email=${encodeURIComponent(session.user.email)}`
          );

          if (!checkRes.ok) {
            // Handle non-JSON or server error during check
             const errorText = await checkRes.text();
             throw new Error(`User check failed: ${checkRes.status} ${errorText || checkRes.statusText}`);
          }

          const checkData = await checkRes.json();

          if (checkData.exists) {
            // --- Existing User Logic ---
            console.log("Existing user found via Google Auth.");
            // We need the encrypted key and public key from the check endpoint
            if (!checkData.encryptedPrivateKey || !checkData.publicKey) {
                throw new Error("Existing user data missing required keys from backend.");
            }

            // Parse the stored private key *if it's stored as a stringified JSON*
            // Adjust this based on how your backend sends the key
             let parsedPrivateKey;
             try {
                 // Assuming backend sends it as a stringified JSON object like { iv: '...', key: '...' }
                 parsedPrivateKey = typeof checkData.encryptedPrivateKey === 'string'
                     ? JSON.parse(checkData.encryptedPrivateKey)
                     : checkData.encryptedPrivateKey; // Or use directly if it's already an object
             } catch (e) {
                 console.error("Failed to parse encrypted private key:", e);
                 throw new Error("Invalid format for encrypted private key received from backend.");
             }

            await storePrivateKey(parsedPrivateKey); // Store in IndexedDB

            // Backend wants email, and potentially a way to verify the Google login just happened.
            // Let's assume the backend uses the email from the authenticated session.
            // Your original code sent the *parsed* key back, which seems wrong.
            // Let's send the email and expect the backend to generate a session token.
            // *Revised Backend Call for existing user:* Adapt this based on your actual API endpoint needs.
            // It might just need the email or might use the Google ID token implicitly via next-auth.
            const authRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`, { // Assuming a dedicated login endpoint
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: session.user.email,
                // Potentially send google ID token if backend verifies it: session.accessToken
              }),
            });

             if (!authRes.ok) {
                const errorData = await authRes.json().catch(() => ({ message: `Authentication failed: ${authRes.statusText}` }));
                throw new Error(errorData.message || `Authentication failed: ${authRes.status}`);
            }
            const authData = await authRes.json();

            localStorage.setItem('token', authData.token); // Store your app's token
            router.push('/'); // Redirect to dashboard

          } else {
            // --- New User Logic ---
            console.log("New user registration via Google Auth.");
            const { publicKey, privateKey } = await generateRSAKeyPair();
            const encryptedPrivateKeyData = await encryptPrivateKey(
              privateKey,
              process.env.NEXT_PUBLIC_PRIVATE_KEY_SECRET
            );

            // Store the *encrypted* key data in IndexedDB immediately
            await storePrivateKey(encryptedPrivateKeyData);

            // Create new user in your backend
            const createRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: session.user.email,
                name: session.user.name,
                publicKey, // Send the generated public key
                encryptedPrivateKey: encryptedPrivateKeyData // Send the encrypted private key data
              }),
            });

             if (!createRes.ok) {
                const errorData = await createRes.json().catch(() => ({ message: `User creation failed: ${createRes.statusText}` }));
                throw new Error(errorData.message || `User creation failed: ${createRes.status}`);
            }
            const createData = await createRes.json();

            localStorage.setItem('token', createData.token); // Store your app's token
            router.push('/'); // Redirect to dashboard
          }

        } catch (err) {
          console.error("Google Registration/Login Error:", err);
          setErrors({ apiError: `Google Sign-Up failed: ${err.message}` });
          // Sign out from next-auth session if backend process fails
          await signOut({ redirect: false }); // Sign out without redirecting
          setGoogleRegistrationAttempted(false); // Allow retry if needed after fixing the issue
        } finally {
          setIsProcessingSignup(false); // STOP showing the full loader
          // Reset button state in case user stays on page (though usually they redirect or see error)
          setIsGoogleLoading(false);
        }
      } else if (status === 'loading') {
          // Optional: You could potentially set isProcessingSignup(true) here too
          // if you want the loader even during the initial next-auth session check.
          // console.log("NextAuth session status: loading");
      } else {
          // Handle cases where user is unauthenticated or already processed
          // console.log("NextAuth status:", status, "Google Registration Attempted:", googleRegistrationAttempted);
      }
    };

    handleGoogleRegistration();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router]); // Removed googleRegistrationAttempted from deps to avoid loops if signOut fails

  // --- Render Logic ---
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