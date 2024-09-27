// pages/login.js
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../navbar';
import Link from 'next/link';

export default function Login() {
    
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = {};

    // Validate username
    if (!username.trim()) {
      validationErrors.username = 'Username is required.';
    }

    // Validate password
    if (!password) {
      validationErrors.password = 'Password is required.';
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        await login(username, password);
      } catch (err) {
        setErrors({ apiError: err.message });
      }
    }
  };

 

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-black text-gray-100 px-4">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-cyan-400">
              Log in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              {`Don't have an account?`}{' '}
              <Link href="/signup" className="font-medium text-cyan-400 hover:text-cyan-300">
                Sign up
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {errors.apiError && (
              <div className="bg-red-900 text-red-200 p-3 rounded">
                {errors.apiError}
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
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
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  } bg-gray-800 placeholder-gray-400 text-white rounded-b-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              >
                Log In
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}