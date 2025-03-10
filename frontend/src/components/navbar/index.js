import Link from 'next/link';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaEyeSlash, FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-slate-900/80 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center">
                <FaEyeSlash className="text-white text-sm" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                Anon<span className="text-teal-400">Message</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/about" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition duration-300">
              About
            </Link>
            <Link href="/features" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition duration-300">
              Features
            </Link>
            <Link href="/faq" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition duration-300">
              FAQ
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition duration-300">
                  Dashboard
                </Link>
                <div className="h-6 border-r border-slate-700"></div>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-teal-400 transition duration-300">
                    <FaUserCircle className="text-lg" />
                    <span>Account</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right">
                    <div className="py-1">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-teal-400">
                        Profile
                      </Link>
                      <Link href="/settings" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-teal-400">
                        Settings
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-slate-800"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition duration-300">
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="text-sm font-medium bg-gradient-to-r from-indigo-500 to-teal-400 px-5 py-2 rounded-lg hover:shadow-lg hover:shadow-teal-500/20 transition duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-slate-300 hover:text-teal-400 inline-flex items-center justify-center p-2 rounded-md transition duration-300"
              aria-controls="mobile-menu"
              aria-expanded={isOpen ? 'true' : 'false'}
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <FaBars className="block h-6 w-6" />
              ) : (
                <FaTimes className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-slate-900/95 backdrop-blur-md" 
          id="mobile-menu"
        >
          <div className="px-4 pt-2 pb-4 space-y-2 border-t border-slate-800">
            <Link 
              href="/about" 
              onClick={() => setIsOpen(false)}
              className="block text-slate-300 hover:text-teal-400 px-3 py-2 rounded-md text-base font-medium transition"
            >
              About
            </Link>
            <Link 
              href="/features" 
              onClick={() => setIsOpen(false)}
              className="block text-slate-300 hover:text-teal-400 px-3 py-2 rounded-md text-base font-medium transition"
            >
              Features
            </Link>
            <Link 
              href="/faq" 
              onClick={() => setIsOpen(false)}
              className="block text-slate-300 hover:text-teal-400 px-3 py-2 rounded-md text-base font-medium transition"
            >
              FAQ
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsOpen(false)}
                  className="block text-slate-300 hover:text-teal-400 px-3 py-2 rounded-md text-base font-medium transition"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  onClick={() => setIsOpen(false)}
                  className="block text-slate-300 hover:text-teal-400 px-3 py-2 rounded-md text-base font-medium transition"
                >
                  Profile
                </Link>
                <Link 
                  href="/settings" 
                  onClick={() => setIsOpen(false)}
                  className="block text-slate-300 hover:text-teal-400 px-3 py-2 rounded-md text-base font-medium transition"
                >
                  Settings
                </Link>
                <div className="border-t border-slate-800 my-2"></div>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left text-red-400 hover:bg-slate-800 px-3 py-2 rounded-md text-base font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-2 space-y-3">
                <Link 
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center text-slate-300 border border-slate-700 hover:border-teal-400 px-3 py-2.5 rounded-lg text-base font-medium transition"
                >
                  Login
                </Link>
                <Link 
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-gradient-to-r from-indigo-500 to-teal-400 px-3 py-2.5 rounded-lg text-base font-medium transition shadow-lg shadow-teal-500/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}