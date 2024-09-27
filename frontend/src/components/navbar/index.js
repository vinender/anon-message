import Link from 'next/link';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-cyan-500 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo or Brand Name */}
          <div className="flex-shrink-0">
            <Link href="/">
              <span className="cursor-pointer text-white font-bold text-xl tracking-tight">
                AnonMessage
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <button
                onClick={logout}
                className="text-white hover:bg-cyan-500 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login">
                  <span className="cursor-pointer text-white hover:bg-cyan-500 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                    Login
                  </span>
                </Link>
                <Link href="/signup">
                  <span className="cursor-pointer text-white hover:bg-cyan-500 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                    Sign Up
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-white hover:bg-cyan-500 inline-flex items-center justify-center p-2 rounded-md transition duration-150 ease-in-out"
              aria-controls="mobile-menu"
              aria-expanded={isOpen ? 'true' : 'false'}
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full text-left text-white hover:bg-cyan-500 px-3 py-2 rounded-md text-base font-medium transition duration-150 ease-in-out"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login">
                  <span className="cursor-pointer block text-white hover:bg-cyan-500 px-3 py-2 rounded-md text-base font-medium transition duration-150 ease-in-out">
                    Login
                  </span>
                </Link>
                <Link href="/signup">
                  <span className="cursor-pointer block text-white hover:bg-cyan-500 px-3 py-2 rounded-md text-base font-medium transition duration-150 ease-in-out">
                    Sign Up
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}