import Link from 'next/link';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo or Brand Name */}
          <div className="flex-shrink-0">
            <Link href="/">
              <span className="cursor-pointer text-white font-bold text-xl">
                AnonMessage
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <span className="cursor-pointer text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                      Dashboard
                    </span>
                  </Link>
                  <Link href="/messages">
                    <span className="cursor-pointer text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                      Messages
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <span className="cursor-pointer text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                      Login
                    </span>
                  </Link>
                  <Link href="/signup">
                    <span className="cursor-pointer text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                      Sign Up
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-blue-700 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isOpen ? 'true' : 'false'}
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                // Menu Icon
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              ) : (
                // Close Icon
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
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
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <Link href="/dashboard">
                  <span className="cursor-pointer block text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium">
                    Dashboard
                  </span>
                </Link>
                <Link href="/messages">
                  <span className="cursor-pointer block text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium">
                    Messages
                  </span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <span className="cursor-pointer block text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium">
                    Login
                  </span>
                </Link>
                <Link href="/signup">
                  <span className="cursor-pointer block text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium">
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
