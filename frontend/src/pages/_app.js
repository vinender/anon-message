import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../components/context/AuthContext";
import { Layout } from "@/components/layout";

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </SessionProvider>
  );
}