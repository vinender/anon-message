import { useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../components/context/AuthContext';
import Dashboard from '@/components/dashboard';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaLock, FaUserSecret, FaUsers } from 'react-icons/fa';

  const testimonials = [
    { quote: "Changed how I communicate. Fun and secure!", name: 'User A' },
    { quote: "Love the anonymity. Design is futuristic!", name: 'User B' },
    { quote: "Freedom to express without fear.", name: 'User C' },
    { quote: "Encryption makes me feel safe.", name: 'User D' },
  ];

  export default function Home() {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [dashboard, setDashboard] = useState(false);

    useEffect(() => {
      if (user) {
        setDashboard(true);
      }
    }, [user]);

    return (
      <>
        {dashboard ? (
          <Dashboard />
        ) : (
          <div className="min-h-screen bg-black text-gray-100 font-sans">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <header className="flex items-center justify-between py-8">
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl font-bold tracking-tighter"
                >
                  Anon<span className="text-cyan-400">Message</span>
                </motion.h1>
                <nav className="space-x-6">
                  <Link href="/signup" className="text-sm hover:text-cyan-400 transition duration-300">
                    Sign Up
                  </Link>
                  <Link href="/login" className="text-sm bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-full transition duration-300">
                    Login
                  </Link>
                </nav>
              </header>

              {/* Hero Section */}
              <main className="text-center py-20">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-5xl font-extrabold mb-6 leading-tight"
                >
                  Connect <span className="text-cyan-400">Anonymously</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-lg mb-10 max-w-2xl mx-auto"
                >
                  Send and receive anonymous messages securely.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Link
                    href="/signup"
                    className="bg-cyan-600 hover:bg-cyan-700 px-8 py-3 rounded-full text-sm font-semibold transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </main>

              {/* Features Section */}
              <section className="py-20">
                <h3 className="text-2xl font-bold text-center mb-12">Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FeatureCard
                    icon={<FaUserSecret className="text-4xl text-cyan-400" />}
                    title="Anonymity"
                    description="Stay anonymous while connecting."
                  />
                  <FeatureCard
                    icon={<FaLock className="text-4xl text-cyan-400" />}
                    title="Security"
                    description="End-to-end encrypted messages."
                  />
                  <FeatureCard
                    icon={<FaUsers className="text-4xl text-cyan-400" />}
                    title="Community"
                    description="Join a growing anonymous network."
                  />
                </div>
              </section>

              {/* Testimonials Section */}
              <section className="py-20">
                <h3 className="text-2xl font-bold text-center mb-12">User Testimonials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {testimonials.map((testimonial, index) => (
                    <TestimonialCard key={index} {...testimonial} />
                  ))}
                </div>
              </section>

              {/* Call to Action Section */}
              <section className="text-center py-20">
                <h3 className="text-3xl font-bold mb-6">
                  Ready for <span className="text-cyan-400">AnonMessage</span>?
                </h3>
                <Link
                  href="/signup"
                  className="bg-cyan-600 hover:bg-cyan-700 px-8 py-3 rounded-full text-sm font-semibold transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Create Free Account
                </Link>
              </section>

              {/* Footer */}
              <footer className="text-center py-8 text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} AnonMessage. All rights reserved.</p>
              </footer>
            </div>
          </div>
        )}
      </>
    );
  }

  const FeatureCard = ({ icon, title, description }) => (
    <motion.div 
      className="flex flex-col items-center bg-gray-900 p-6 rounded-lg"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4">{icon}</div>
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="text-center text-sm text-gray-400">{description}</p>
    </motion.div>
  );

  const TestimonialCard = ({ quote, name }) => (
    <motion.div 
      className="bg-gray-900 p-6 rounded-lg"
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
    >
      <p className="mb-4 text-sm italic leading-relaxed text-gray-300">{quote}</p>
      <p className="text-right text-xs text-cyan-400">- {name}</p>
    </motion.div>
  );