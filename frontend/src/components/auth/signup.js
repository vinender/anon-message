// components/Signup.js

import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../navbar';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/router';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { encryptPrivateKey, generateRSAKeyPair } from '@/utils/crypto';
import { storePrivateKey } from '@/utils/storage';
 


export default function Signup() {
  const { signup } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Removed passphrase states
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    const validationErrors = {};

    // Validate username
    if (!username.trim()) {
      validationErrors.username = 'Username is required.';
    } else if (username.length < 3) {
      validationErrors.username = 'Username must be at least 3 characters.';
    }

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

    console.log('validation error', validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        // Generate RSA key pair
        const { publicKey: generatedPublicKey, privateKey: generatedPrivateKey } = await generateRSAKeyPair();

        // Proceed with signup by sending username, email, password, publicKey, and privateKey
        await signup({ username, email, password, publicKey: generatedPublicKey, privateKey: generatedPrivateKey });

        // Redirect to dashboard or desired page
        router.push('/');
      } catch (err) {
        setErrors({ apiError: err.message });
      }
    }
  };

  // Handle Google Sign-Up Success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const decoded = jwt_decode(credential);

      // Extract necessary information from the decoded token
      const { sub, email, name, picture } = decoded;

      // Send the credential to the backend for verification and user creation/login
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store JWT token received from backend
        localStorage.setItem('token', data.token);
        // Redirect to dashboard or desired page
        router.push('/');
      } else {
        setErrors({ apiError: data.message || 'Google Sign-Up failed.' });
      }
    } catch (error) {
      console.error('Google Sign-Up Error:', error);
      setErrors({ apiError: 'Google Sign-Up failed. Please try again.' });
    }
  };

  // Handle Google Sign-Up Failure
  const handleGoogleFailure = (error) => {
    console.error('Google Sign-Up Failure:', error);
    setErrors({ apiError: 'Google Sign-Up failed. Please try again.' });
  };

  
  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-black text-gray-100 px-4">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-cyan-400">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-cyan-400 hover:text-cyan-300">
                Log in
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
            {errors.apiError && (
              <div className="bg-red-900 text-red-200 p-3 rounded">
                {errors.apiError}
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                    errors.username ? 'border-red-500' : 'border-gray-600'
                  } bg-gray-800 placeholder-gray-400 text-white rounded-t-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm`}
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {errors.username && (
                  <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                )}
              </div>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="sr-only">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  } bg-gray-800 placeholder-gray-400 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm`}
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  } bg-gray-800 placeholder-gray-400 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                  } bg-gray-800 placeholder-gray-400 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm`}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              >
                Sign Up
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center justify-center">
            <span className="border-b border-gray-600 w-full"></span>
            <span className="mx-2 text-gray-400">OR</span>
            <span className="border-b border-gray-600 w-full"></span>
          </div>

          {/* Google Sign-Up Button */}
          <div className="flex items-center justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              useOneTap
            />
          </div>
        </div>
      </div>
    </>
  );
}