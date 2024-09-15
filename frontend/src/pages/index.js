import { useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../components/context/AuthContext';
import Dashboard from '@/components/dashboard';


export default function Home() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [dashboard, setDashboard] = useState(false)

  useEffect(() => {
    // If user is logged in, redirect to dashboard
    if (user) {
      setDashboard(true)
      // router.replace('/dashboard');
    }else{
      router.replace('/login');
    }
  }, [user,dashboard]);

  console.log('user',user)

   


  

  return (
    <>
      { 
      dashboard ? 
      <Dashboard/> 
      : 
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <h1 className="text-5xl font-bold mb-4">Welcome to AnonMessage</h1>
        <p className="text-xl mb-8">
          Send and receive anonymous messages from your friends!
        </p>
        <div>
          <a
            href="/signup"
            className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold mr-4"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="bg-transparent border border-white px-6 py-3 rounded-full font-semibold"
          >
            Login
          </a>
        </div>
      </div>
    }
    </>
  );
}
