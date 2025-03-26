// pages/_app.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import jwtDecode from 'jwt-decode';
import { SessionProvider, signOut, useSession, getSession } from 'next-auth/react';
import { AuthProvider } from "../components/context/AuthContext";
import { Layout } from "@/components/layout";
import "../styles/globals.css";

// --- Constants ---
const TOKEN_KEY = 'token'; // Your localStorage key for your app's token
const LOGIN_PATH = '/signup'; // Redirect path when logged out
// Public paths accessible without the app token
const PUBLIC_PATHS = [
  '/',          // Allow access to the root landing page
  '/tech',      // Allow access to the /tech route
  LOGIN_PATH,   // Allow access to the signup page
  '/login',     // Allow access to a potential login page
  '/terms',     // Allow access to terms
  '/privacy'    // Allow access to privacy policy
];
// --- AuthGuard Component ---
function AuthGuard({ children }) {
  const router = useRouter();
  const { data: session, status: nextAuthStatus } = useSession();

  useEffect(() => {
    // --- Core Authentication Check Function ---
    const checkAuth = async () => {
      const currentPath = router.pathname; // Get current path from router

      // 1. Don't run the check if we are already on a public page
      if (PUBLIC_PATHS.includes(currentPath)) {
        console.log(`AuthGuard: Path ${currentPath} is public, skipping check.`);
        return;
      }
      console.log(`AuthGuard: Checking auth for protected path: ${currentPath}`);

      // 2. Check for the application token in localStorage
      const token = localStorage.getItem(TOKEN_KEY);
      let isTokenValid = false;

      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000; // ms to seconds

          if (decodedToken.exp > currentTime) {
            isTokenValid = true;
            console.log('AuthGuard: App token is valid.');
          } else {
            console.log('AuthGuard: App token expired.');
          }
        } catch (error) {
          console.error('AuthGuard: Error decoding app token:', error);
          // Treat decoding error as invalid token, remove potentially corrupt token
          localStorage.removeItem(TOKEN_KEY);
        }
      } else {
        console.log('AuthGuard: No app token found.');
      }

      // 3. --- Logout Logic ---
      // If token is invalid/missing AND we are on a protected route
      if (!isTokenValid) {
         console.log(`AuthGuard: Invalid/Expired/Missing token on protected route (${currentPath}), initiating logout...`);

         // Clear the specific token first
         localStorage.removeItem(TOKEN_KEY);

         // Check if a next-auth session exists before trying to sign out
         const currentNextAuthSession = await getSession(); // More reliable check

         if (currentNextAuthSession) {
             console.log('AuthGuard: NextAuth session found, signing out...');
             try {
                 // Sign out without automatic redirect handled by next-auth itself
                 await signOut({ redirect: false });
                 console.log('AuthGuard: NextAuth signOut successful.');
                 // Note: signOut might trigger a state update in useSession, potentially rerunning this effect
             } catch (signOutError) {
                 console.error('AuthGuard: Error during NextAuth signOut:', signOutError);
             }
         } else {
             console.log('AuthGuard: No NextAuth session found.');
         }

         // Manually redirect to the LOGIN_PATH (signup page) if not already there
         // Check router.pathname again *after* potential state changes from signOut
         if (router.pathname !== LOGIN_PATH) {
             console.log(`AuthGuard: Redirecting to ${LOGIN_PATH}...`);
             router.push(LOGIN_PATH);
         } else {
             console.log(`AuthGuard: Already on login path (${LOGIN_PATH}), not redirecting.`);
         }
      }
    }; // --- End of checkAuth function ---

    // Run check when dependencies change, but only if session status is determined and router is ready
    if (nextAuthStatus !== 'loading' && router.isReady) {
        console.log(`AuthGuard: Initial check running. Status: ${nextAuthStatus}, Path: ${router.pathname}`);
        checkAuth();
    } else {
        console.log(`AuthGuard: Skipping initial check. Status: ${nextAuthStatus}, Router Ready: ${router.isReady}`);
    }

    // --- Event Listener for Route Changes ---
    const handleRouteChange = (url) => {
        const nextPath = url.split('?')[0]; // Get path part of the new URL
        console.log(`AuthGuard: Route change detected to: ${url}`);
        // Check status again inside handler and ensure next path isn't public
        if (nextAuthStatus !== 'loading' && !PUBLIC_PATHS.includes(nextPath)) {
             console.log(`AuthGuard: Running checkAuth after route change to protected path: ${nextPath}`);
             checkAuth();
         } else {
             console.log(`AuthGuard: Skipping checkAuth after route change. Status: ${nextAuthStatus}, Next Path (${nextPath}) is public: ${PUBLIC_PATHS.includes(nextPath)}`);
         }
    };
    router.events.on('routeChangeComplete', handleRouteChange);

    // --- Event Listener for Storage Changes (e.g., logout in another tab) ---
    const handleStorageChange = (event) => {
        console.log(`AuthGuard: Storage event detected - Key: ${event.key}`);
        // Check specifically if the TOKEN_KEY was affected or if storage was cleared
        if (event.key === TOKEN_KEY || event.key === null) {
             const currentPath = window.location.pathname; // Use window.location for most current path in storage event
             console.log(`AuthGuard: Relevant storage change detected (Key: ${event.key}). Current window path: ${currentPath}`);
             // Check status and ensure we are NOT on a public path *currently*
             if (nextAuthStatus !== 'loading' && !PUBLIC_PATHS.includes(currentPath)) {
                  console.log(`AuthGuard: Token change detected on protected path (${currentPath}), running checkAuth.`);
                  checkAuth();
             } else {
                  console.log(`AuthGuard: Token change detected, but status is loading or path (${currentPath}) is public.`);
             }
        }
    };
    window.addEventListener('storage', handleStorageChange);

    // Cleanup listeners on component unmount
    return () => {
      console.log("AuthGuard: Cleaning up listeners.");
      router.events.off('routeChangeComplete', handleRouteChange);
      window.removeEventListener('storage', handleStorageChange);
    };

  // Dependencies: Re-run effect if session status changes, router becomes ready, or path changes.
  }, [nextAuthStatus, router.isReady, router.pathname, router]); // router object included for router.push

  // Optional: Loading state while session is being determined (on protected routes)
   if (nextAuthStatus === 'loading' && !PUBLIC_PATHS.includes(router.pathname)) {
      console.log("AuthGuard: Displaying loading state.");
      return <div>Loading session...</div>; // Or your app's loader
  }

  // Render children (the page component)
  console.log(`AuthGuard: Rendering children for path: ${router.pathname}`);
  return <>{children}</>;
}


// --- Main App Component ---
export default function App({
  Component,
  pageProps: { session, ...pageProps }
}) {
  return (
    <SessionProvider session={session} refetchInterval={0}> {/* Disable automatic refetching if it causes issues */}
      <AuthProvider>
        <Layout>
           <AuthGuard>
              <Component {...pageProps} />
           </AuthGuard>
        </Layout>
      </AuthProvider>
    </SessionProvider>
  );
}