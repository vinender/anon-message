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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8">
         
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Log in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup">
                {/* <a className="font-medium text-blue-600 hover:text-blue-500"> */}
                  Sign up
                {/* </a> */}
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {errors.apiError && (
              <div className="bg-red-100 text-red-700 p-3 rounded">
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
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
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
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {/* Remember me checkbox (optional) */}
                {/* Uncomment if needed */}
                {/* <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label> */}
              </div>

              <div className="text-sm">
                {/* Forgot password link (optional) */}
                {/* <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a> */}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
