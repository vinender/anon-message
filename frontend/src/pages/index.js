import { useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../components/context/AuthContext';
import Dashboard from '@/components/dashboard';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaLock, FaUserSecret, FaUsers, FaShieldAlt, FaEyeSlash } from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';

const testimonials = [
  { quote: "Changed how I communicate. Fun and secure!", name: 'User A', role: 'Student' },
  { quote: "Love the anonymity. Design is futuristic!", name: 'User B', role: 'Designer' },
  { quote: "Freedom to express without fear.", name: 'User C', role: 'Journalist' },
  { quote: "Encryption makes me feel safe.", name: 'User D', role: 'Developer' },
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
        <div className="min-h-screen bg-slate-950 text-gray-100 font-sans">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <header className="flex items-center justify-between py-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center space-x-2"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center">
                  <FaEyeSlash className="text-white text-xl" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Anon<span className="text-teal-400">Message</span>
                </h1>
              </motion.div>
              <nav className="flex items-center space-x-6">
                {/* <Link href="/signup" className="text-sm font-medium hover:text-teal-400 transition duration-300">
                  Lpgin
                </Link> */}
                <Link 
                  href="/signup" 
                  className="text-sm font-medium bg-gradient-to-r from-indigo-500 to-teal-400 px-5 py-2.5 rounded-lg hover:shadow-lg hover:shadow-teal-500/20 transition duration-300"
                >
                  Join
                </Link>
              </nav>
            </header>

            {/* Hero Section */}
            <main className="text-center py-24">
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-teal-400/10 rounded-3xl blur-3xl"></div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="relative"
                >
                  <span className="px-4 py-1.5 text-xs font-semibold bg-teal-400/10 text-teal-300 rounded-full border border-teal-400/20">
                    Private. Secure. Anonymous.
                  </span>
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-5xl md:text-6xl font-extrabold mt-6 mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400"
                >
                  Express Freely.<br />
                  <span className="text-teal-400">Without Identity.</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-lg text-slate-300 mb-10 max-w-xl mx-auto"
                >
                  Send and receive messages with complete anonymity, protected by 
                  state-of-the-art encryption.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <Link
                    href="/signup"
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-teal-400 px-8 py-3.5 rounded-lg text-sm font-medium shadow-lg shadow-teal-500/20 transition duration-300 ease-in-out hover:shadow-teal-500/40"
                  >
                    {`Get Started — It's Free`}
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-sm font-medium border border-slate-700 hover:border-teal-400/30 transition duration-300"
                  >
                    How It Works
                  </Link>
                </motion.div>
              </div>
              
              <div className="mt-20 py-10 px-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800">
                <p className="text-sm font-medium text-slate-400 mb-4">TRUSTED BY THOUSANDS WORLDWIDE</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                  {['20,000+', '99.9%', '256-bit', '100%'].map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-2xl font-bold text-white">{stat}</p>
                      <p className="text-xs text-slate-400">
                        {i === 0 ? 'Active Users' : 
                         i === 1 ? 'Uptime' : 
                         i === 2 ? 'Encryption' : 
                         'Anonymous'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </main>

            {/* How It Works Section */}
            <section className="py-20">
              <div className="text-center mb-16">
                <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">HOW IT WORKS</span>
                <h3 className="text-3xl font-bold mt-6">Simple. Secure. Private.</h3>
                <p className="text-slate-400 mt-4 max-w-xl mx-auto">Our platform is designed with privacy at its core. Express yourself without the fear of judgment or identity exposure.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    step: '01',
                    title: 'Create An Account',
                    description: 'Sign up with minimal information. No personal details required.'
                  },
                  {
                    step: '02',
                    title: 'Share Your Link',
                    description: 'Get your unique anonymous link and share it anywhere.'
                  },
                  {
                    step: '03',
                    title: 'Receive Messages',
                    description: 'Get anonymous messages from anyone with complete privacy.'
                  }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-xl border border-slate-800"
                  >
                    <div className="absolute -top-4 -left-4 h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </div>
                    <h4 className="text-xl font-semibold mt-4 mb-3">{item.title}</h4>
                    <p className="text-slate-400 text-sm">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
              <div className="text-center mb-16">
                <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-teal-400/10 text-teal-300 border border-teal-400/20">FEATURES</span>
                <h3 className="text-3xl font-bold mt-6">Why Choose AnonMessage</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                  icon={<FaUserSecret className="text-3xl text-teal-400" />}
                  title="Complete Anonymity"
                  description="Express yourself freely without revealing your identity."
                />
                <FeatureCard
                  icon={<FaLock className="text-3xl text-teal-400" />}
                  title="End-to-End Encryption"
                  description="Your messages are encrypted and cannot be accessed by anyone else."
                />
                <FeatureCard
                  icon={<FaShieldAlt className="text-3xl text-teal-400" />}
                  title="Zero Data Collection"
                  description="We don't store IP addresses or any identifying information."
                />
                <FeatureCard
                  icon={<FaUsers className="text-3xl text-teal-400" />}
                  title="Global Community"
                  description="Join thousands of users who value privacy and free expression."
                />
                <FeatureCard
                  icon={<HiOutlineSparkles className="text-3xl text-teal-400" />}
                  title="Customizable Experience"
                  description="Personalize your inbox and message settings to your preference."
                />
                <FeatureCard
                  icon={<FaEyeSlash className="text-3xl text-teal-400" />}
                  title="Self-Destructing Messages"
                  description="Set messages to automatically delete after being read."
                />
              </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20">
              <div className="text-center mb-16">
                <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">TESTIMONIALS</span>
                <h3 className="text-3xl font-bold mt-6">What Our Users Say</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {testimonials.map((testimonial, index) => (
                  <TestimonialCard key={index} {...testimonial} />
                ))}
              </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20">
              <div className="text-center mb-16">
                <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-teal-400/10 text-teal-300 border border-teal-400/20">FAQ</span>
                <h3 className="text-3xl font-bold mt-6">Frequently Asked Questions</h3>
              </div>
              
              <div className="space-y-6 max-w-3xl mx-auto">
                {[
                  {
                    question: 'Is AnonMessage really anonymous?',
                    answer: 'Yes, we do not collect any identifying information. Your messages are fully anonymous.'
                  },
                  {
                    question: 'How secure is the encryption?',
                    answer: 'We use 256-bit end-to-end encryption, the industry standard for secure communications.'
                  },
                  {
                    question: 'Can messages be traced back to me?',
                    answer: 'No. We do not store IP addresses or any data that could identify message senders.'
                  },
                  {
                    question: 'Is AnonMessage free to use?',
                    answer: 'Yes! Our basic service is completely free. We offer premium features for enhanced functionality.'
                  }
                ].map((faq, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-6"
                  >
                    <h4 className="text-lg font-medium mb-2">{faq.question}</h4>
                    <p className="text-slate-400 text-sm">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Call to Action Section */}
            <section className="text-center py-20">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-teal-400/10 rounded-3xl blur-3xl"></div>
                <div className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-12 backdrop-blur-sm">
                  <h3 className="text-3xl font-bold mb-6">
                    Ready to communicate <span className="text-teal-400">without boundaries</span>?
                  </h3>
                  <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                    Join thousands of users who have discovered the freedom of anonymous communication
                  </p>
                  <Link
                    href="/signup"
                    className="bg-gradient-to-r from-indigo-500 to-teal-400 px-8 py-3.5 rounded-lg text-sm font-medium shadow-lg shadow-teal-500/20 transition duration-300 ease-in-out hover:shadow-teal-500/40"
                  >
                    Create Your Free Account
                  </Link>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-12 mt-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center">
                      <FaEyeSlash className="text-white text-sm" />
                    </div>
                    <h4 className="text-lg font-bold">
                      Anon<span className="text-teal-400">Message</span>
                    </h4>
                  </div>
                  <p className="text-sm text-slate-400">
                    Secure, anonymous messaging for a freer world.
                  </p>
                </div>
                
                  <div>
                    <h5 className="text-sm font-semibold mb-4">Legal</h5>
                    <ul className="space-y-2">
                      {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item, i) => (
                        <li key={i}>
                          <Link href="#" className="text-sm text-slate-400 hover:text-teal-400 transition">
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                
                <div>
                  <h5 className="text-sm font-semibold mb-4">Company</h5>
                  <ul className="space-y-2">
                    {['About Us', 'Blog', 'Careers', 'Contact'].map((item, i) => (
                      <li key={i}>
                        <Link href="#" className="text-sm text-slate-400 hover:text-teal-400 transition">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-sm font-semibold mb-4">Connect</h5>
                  <ul className="space-y-2">
                    {['Twitter', 'Discord', 'GitHub', 'Support'].map((item, i) => (
                      <li key={i}>
                        <Link href="#" className="text-sm text-slate-400 hover:text-teal-400 transition">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} AnonMessage. All rights reserved.</p>
                <p className="text-sm text-slate-500 mt-4 md:mt-0">Designed with privacy at its core.</p>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    className="flex flex-col items-center bg-slate-900 p-8 rounded-xl border border-slate-800 hover:border-teal-500/20 transition duration-300"
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
  >
    <div className="mb-5 h-14 w-14 rounded-full bg-slate-800 flex items-center justify-center">{icon}</div>
    <h4 className="text-lg font-semibold mb-3">{title}</h4>
    <p className="text-center text-sm text-slate-400">{description}</p>
  </motion.div>
);

const TestimonialCard = ({ quote, name, role }) => (
  <motion.div 
    className="bg-slate-900 p-8 rounded-xl border border-slate-800"
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
  >
    <div className="mb-4 text-teal-400">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="text-lg">★</span>
      ))}
    </div>
    <p className="mb-6 text-slate-300 leading-relaxed">{quote}</p>
    <div className="flex items-center">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center text-sm font-bold">
        {name.charAt(0)}
      </div>
      <div className="ml-4">
        <p className="font-medium">{name}</p>
        <p className="text-xs text-slate-400">{role}</p>
      </div>
    </div>
  </motion.div>
);