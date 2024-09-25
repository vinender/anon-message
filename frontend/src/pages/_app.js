import "@/styles/globals.css";
import { AuthProvider } from "../components/context/AuthContext";
import { Layout } from "@/components/layout";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
