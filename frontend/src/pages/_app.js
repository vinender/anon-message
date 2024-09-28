import "@/styles/globals.css";
import { AuthProvider } from "../components/context/AuthContext";
import { Layout } from "@/components/layout";
import { GoogleOAuthProvider } from '@react-oauth/google';


export default function App({ Component, pageProps }) {
  return (
    <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <Layout>  
            <Component {...pageProps} />
          </Layout>
        </AuthProvider>
    </GoogleOAuthProvider>
  );
}
