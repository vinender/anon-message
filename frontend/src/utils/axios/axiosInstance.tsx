// utils/axiosInstance.js
import axios from 'axios';
import jwtDecode from 'jwt-decode';
// Import signOut conditionally or ensure this file is only used client-side
// If used server-side, next-auth/react might cause issues.
// For simplicity, assuming client-side usage primarily.
import { signOut } from 'next-auth/react';

const TOKEN_KEY = 'authToken'; // Your localStorage key for your app's token
const LOGIN_PATH = '/signup'; // Your login page path
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// --- Request Interceptor ---
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip token check for specific auth routes if needed (adjust paths)
    if (config.url?.includes('/auth/google') || config.url?.includes('/auth/check-user')) {
         // These routes might not require the 'Bearer' token from localStorage initially
         // Or they handle auth differently (like check-user via query param)
        return config;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    let isTokenValid = false;

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp > currentTime) {
          isTokenValid = true;
          config.headers['Authorization'] = `Bearer ${token}`; // Add token to header
        } else {
           console.log('AxiosInterceptor (Request): Token expired.');
        }
      } catch (error) {
        console.error('AxiosInterceptor (Request): Invalid token format.', error);
         // Clear invalid token
         if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
      }
    } else {
       console.log('AxiosInterceptor (Request): No app token found.');
    }

    // If token is NOT valid for routes requiring auth, handle logout
    if (!isTokenValid && typeof window !== 'undefined') {
        console.log('AxiosInterceptor (Request): Invalid/Expired token, cancelling request and logging out.');
        localStorage.removeItem(TOKEN_KEY);

        // Attempt to sign out from next-auth if session might exist
        // Note: Calling signOut directly here might be tricky regarding context.
        // Relying on AuthGuard in _app.js might be more reliable for UI sync.
        // For immediate block/redirect:
        signOut({ callbackUrl: LOGIN_PATH }).catch(() => {
           // Fallback if signOut fails or isn't applicable
           window.location.href = LOGIN_PATH;
        });


        // Cancel the request
        return Promise.reject(new Error('Invalid or expired token. Logging out.'));
    }

    return config; // Proceed with the request if token is valid or not required
  },
  (error) => {
    // Handle request setup errors
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
axiosInstance.interceptors.response.use(
  (response) => response, // Simply return successful responses
  (error) => {
    // Check if the error is due to unauthorized access (e.g., token invalidated server-side)
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      // Avoid logout loops if the request was to the login page itself
      if (!error.config?.url?.includes(LOGIN_PATH)) {
          console.log('AxiosInterceptor (Response): Received 401 Unauthorized, logging out.');
          localStorage.removeItem(TOKEN_KEY);
            signOut({ callbackUrl: LOGIN_PATH }).catch(() => {
               // Fallback if signOut fails or isn't applicable
               window.location.href = LOGIN_PATH;
            });
      }
    }
    // Add more specific error message extraction if possible
    const message = error.response?.data?.message || error.message || 'An API error occurred';
    // Return a rejected promise with a potentially clearer error message
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;