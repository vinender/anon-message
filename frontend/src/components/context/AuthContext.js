import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import  jwt_decode from 'jwt-decode';
import API_BASE_URL from '../../utils/config';

export  const AuthContext = createContext();
export default AuthContext;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('token',token)
    if (token) {
      const decoded = jwt_decode(token);
      console.log('token decoded',decoded)
      setUser({ id: decoded.userId, username: decoded.username, privateKey:decoded.privateKey });
    }
  }, []);

  const login = async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      const decoded = jwt_decode(data.token);
      setUser({ id: decoded.userId, username: decoded.username });
      router.push('/');
    } else {
      throw new Error(data.message);
    }
  };

  const signup = async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      await login(username, password);
    } else {
      const data = await res.json();
      throw new Error(data.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
