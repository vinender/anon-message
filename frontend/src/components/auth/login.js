// pages/login.js
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../navbar';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FaLock, FaEyeSlash, FaEye } from 'react-icons/fa';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = {};

    if (!username.trim()) validationErrors.username = 'Username is required.';
    if (!password) validationErrors.password = 'Password is required.';

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    try {
      await login(username, password);
      router.push('/');
    } catch (err) {
      setErrors({ apiError: err.message || 'Login failed.' });
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen bg-zinc-950 text-gray-100 font-sans">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-zinc-500 to-emerald-400 flex items-center justify-center mb-6">
              <FaLock className="text-white text-xl" />
            </div>
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="mt-3 text-zinc-400">Log in to access your anonymous messages</p>
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

                <form className="space-y-6" onSubmit={handleLogin}>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-2">Username</label>
                    <input
                      id="username" name="username" type="text" autoComplete="username" required
                      className={`block w-full px-4 py-3 rounded-lg border ${errors.username ? 'border-red-500 bg-red-500/5' : 'border-zinc-700 bg-zinc-800/50'} placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-transparent transition`}
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
                    <div className="relative">
                      <input
                        id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required
                        className={`block w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500 bg-red-500/5' : 'border-zinc-700 bg-zinc-800/50'} placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-transparent transition`}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 hover:text-emerald-400 transition">
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                    <div className="flex justify-end mt-2">
                      <Link href="/forgot-password" className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition">Forgot password?</Link>
                    </div>
                  </div>

                  <button
                    type="submit" disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 bg-gradient-to-r from-zinc-500 to-emerald-400 text-sm font-medium rounded-lg text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition disabled:opacity-70"
                  >
                    {isLoading ? <span className="animate-pulse">Logging in...</span> : 'Sign in to your account'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-zinc-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-medium text-emerald-400 hover:text-emerald-300 transition">Create an account</Link>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-zinc-500">
                By logging in, you agree to our{' '}
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
