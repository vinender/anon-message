// context/AuthContext.js

import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import jwt_decode from 'jwt-decode';
import API_BASE_URL from '../../utils/config';

export const AuthContext = createContext();
export default AuthContext;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const router = useRouter();

  // Function to load user from token
  const loadUserFromToken = () => {
    const token = localStorage.getItem('token');
    console.log('token', token);
    if (token) {
      try {
        const decoded = jwt_decode(token);
        console.log('token decoded', decoded);
        // Ensure that the token contains the privateKey
        if (decoded.privateKey) {
          setUser({
            id: decoded.userId,
            username: decoded.username,
            privateKey: decoded.privateKey,
          });
        } else {
          console.error('Private key not found in token.');
          setUser(null);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        setUser(null);
        localStorage.removeItem('token');
      }
    }
    setIsUserLoaded(true);
  };

  // Load user on initial render
  useEffect(() => {
    loadUserFromToken();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        const decoded = jwt_decode(data.token);

        // Ensure that the token contains the privateKey
        if (decoded.privateKey) {
          setUser({
            id: decoded.userId,
            username: decoded.username,
            privateKey: decoded.privateKey,
          });
        } else {
          console.error('Private key not found in token.');
          setUser(null);
          throw new Error('Authentication failed: Private key missing.');
        }

        router.push('/');
      } else {
        throw new Error(data.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Signup function
  const signup = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // After successful signup, log the user in
        await login(username, password);
      } else {
        throw new Error(data.message || 'Signup failed.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login'); // Redirect to login page after logout
  };

  return (
    <AuthContext.Provider value={{ user, isUserLoaded, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
