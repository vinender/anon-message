import "@/styles/globals.css";
import { AuthProvider } from '../components/context/AuthContext';


export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      {/* Place Navbar and Component inside AuthProvider */}
      <Component {...pageProps} />
    </AuthProvider>
  )
   
  
}
