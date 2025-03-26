// context/AuthContext.js

import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react'; // Import useSession, signIn, signOut

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession(); // Get session data
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    if (status === 'loading') {
      setIsUserLoaded(false);
    } else if (status === 'authenticated') {
      setUser(session.user); // Update user state with session data
      setIsUserLoaded(true);
    } else {
      setUser(null);
      setIsUserLoaded(true);
    }
  }, [session, status]);

  // Update login function to use NextAuth's signIn
  const login = async (username, password) => {
    try {
      const res = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });
      if (res.ok) {
        router.push('/');
      } else {
        throw new Error('Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Update logout function to use NextAuth's signOut
  const logout = () => {
    signOut({ callbackUrl: '/signup' });
  };

  return (
    <AuthContext.Provider value={{ user, isUserLoaded, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
