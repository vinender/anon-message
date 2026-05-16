// context/AuthContext.js

import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import API_BASE_URL from '../../utils/config';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    if (status === 'loading') {
      setIsUserLoaded(false);
    } else if (status === 'authenticated') {
      setUser(session.user);
      setIsUserLoaded(true);
    } else {
      // Check for email/password JWT in localStorage (non-Google login)
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            id: payload.userId,
            name: payload.username,
            email: payload.email,
            publicKey: payload.publicKey,
          });
          setIsUserLoaded(true);
        } catch {
          setUser(null);
          setIsUserLoaded(true);
        }
      } else {
        setUser(null);
        setIsUserLoaded(true);
      }
    }
  }, [session, status]);

  const login = async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }

    const data = await res.json();
    localStorage.setItem('token', data.token);

    // Set user from JWT payload
    const payload = JSON.parse(atob(data.token.split('.')[1]));
    setUser({
      id: payload.userId,
      name: payload.username,
      email: payload.email,
      publicKey: payload.publicKey,
    });
    setIsUserLoaded(true);

    return data; // { token, encryptedPrivateKey }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    signOut({ callbackUrl: '/signup' });
  };

  return (
    <AuthContext.Provider value={{ user, isUserLoaded, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
