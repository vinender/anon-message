// components/Signup.js

import { useEffect, useState } from 'react';
import Navbar from '../navbar';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import { encryptPrivateKey, generateRSAKeyPair } from '@/utils/crypto';
import { storePrivateKey } from '@/utils/storage';
import { motion } from 'framer-motion';
import { FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';



export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [googleRegistrationAttempted, setGoogleRegistrationAttempted] = useState(false); // Corrected variable name


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    const validationErrors = {};

    // Validate email
    if (!email.trim()) {
      validationErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      validationErrors.email = 'Invalid email address.';
    }

    // Validate password
    if (!password) {
      validationErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters.';
    } else if (password !== confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        // Generate RSA key pair
        const { publicKey, privateKey } = await generateRSAKeyPair();

        // Encrypt the private key using the secret
        const encryptedPrivateKeyData = await encryptPrivateKey(
          privateKey,
          process.env.NEXT_PUBLIC_PRIVATE_KEY_SECRET
        );

        // Store the encrypted private key in IndexedDB
        await storePrivateKey(encryptedPrivateKeyData);

        // Send public key and encrypted private key to the server
        const res = await fetch('http://localhost:5000/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            publicKey,
            encryptedPrivateKey: encryptedPrivateKeyData,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          // Redirect to login
          router.push('/login');
        } else {
          setErrors({ apiError: data.message || 'Registration failed.' });
        }
      } catch (err) {
        setErrors({ apiError: err.message || 'An error occurred during registration.' });
      } finally {
        setIsSubmittingForm(false);
      }
    } else {
      setIsSubmittingForm(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    signIn('google', {
      callbackUrl: '/', // Redirect to homepage after successful Google sign-in *and* registration
    });
  };


  useEffect(() => {
    const handleGoogleRegistration = async () => {
        // Only proceed if user is authenticated via Google and registration hasn't been attempted
        if (status === "authenticated" && !googleRegistrationAttempted) {
            setGoogleRegistrationAttempted(true); // Set to true immediately to prevent multiple calls

            try {
                // Generate RSA key pair
                const { publicKey, privateKey } = await generateRSAKeyPair();

                // Encrypt the private key
                const encryptedPrivateKeyData = await encryptPrivateKey(
                    privateKey,
                    process.env.NEXT_PUBLIC_PRIVATE_KEY_SECRET
                );

                // Store the encrypted private key in IndexedDB
                await storePrivateKey(encryptedPrivateKeyData);

                // Send public key and encrypted private key to the server
                const res = await fetch('http://localhost:5000/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        credential: session?.user?.id,  // or some other unique identifier
                        name: session.user.name,
                        email: session.user.email,
                        publicKey,
                        encryptedPrivateKey: encryptedPrivateKeyData,
                    }),
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token); // Consider more secure storage
                    router.push('/'); // Redirect only after successful registration
                } else {
                    setErrors({ apiError: data.message || 'Google registration failed.' });
                     // Sign out the user if registration fails
                    await signOut();

                }
            } catch (err) {
                setErrors({ apiError: err.message || 'An error occurred during Google registration.' });
                // Sign out the user if registration fails
                await signOut();
            } finally {
                setIsGoogleLoading(false);
            }
        }
    };

    handleGoogleRegistration();
}, [session, status, googleRegistrationAttempted, router]); // Include 'status' and 'router' in dependency array


  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh)] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8"
        >
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

                <form className="space-y-5" onSubmit={handleSignup}>
                  {/* Username Field */}
                  {/* <div>
                    <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      className={`appearance-none block w-full px-4 py-3 rounded-lg ${
                        errors.username ? 'border-red-500 bg-red-500/5' : 'border-slate-700 bg-slate-800/50'
                      } border placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-transparent transition duration-200`}
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    {errors.username && (
                      <p className="text-red-400 text-xs mt-1">{errors.username}</p>
                    )}
                  </div> */}

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className={`appearance-none block w-full px-4 py-3 rounded-lg ${
                        errors.email ? 'border-red-500 bg-red-500/5' : 'border-slate-700 bg-slate-800/50'
                      } border placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-transparent transition duration-200`}
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        className={`appearance-none block w-full px-4 py-3 rounded-lg ${
                          errors.password ? 'border-red-500 bg-red-500/5' : 'border-slate-700 bg-slate-800/50'
                        } border placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-transparent transition duration-200`}
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button 
                        type="button" 
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-teal-400 transition"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        className={`appearance-none block w-full px-4 py-3 rounded-lg ${
                          errors.confirmPassword ? 'border-red-500 bg-red-500/5' : 'border-slate-700 bg-slate-800/50'
                        } border placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-transparent transition duration-200`}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button 
                        type="button" 
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-teal-400 transition"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingForm}
                      className="group relative w-full flex justify-center py-3 px-4 bg-gradient-to-r from-indigo-500 to-teal-400 text-sm font-medium rounded-lg text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-70"
                    >
                      {isSubmittingForm ? (
                        <span className="animate-pulse">Creating account...</span>
                      ) : (
                        "Create account"
                      )}
                    </button>
                  </div>
                </form>

                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-slate-700"></div>
                  <div className="px-3 text-sm text-slate-500">OR</div>
                  <div className="flex-1 border-t border-slate-700"></div>
                </div>

                {/* Google Sign-Up Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FcGoogle className="text-xl" />
                  <span>{isGoogleLoading ? 'Signing in...' : 'Sign up with Google'}</span>
                </button>

                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-teal-400 hover:text-teal-300 transition">
                      Log in
                    </Link>
                  </p>
                </div>
              </div>
            </div>

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
    </div>
  );
}