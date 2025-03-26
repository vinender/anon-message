import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUserSecret, FaLock, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import Navbar from '@/components/navbar';

export default function VedicAstroCharacter() {
    const [loading, setLoading] = useState(false);
    const [personality, setPersonality] = useState(null);
    const [characterImage, setCharacterImage] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        dob: "1996-12-23",
        time: "07:00",
        place: "Nalagarh, Himachal Pradesh, India"
    });

    // Zodiac signs for decoration
    const zodiacSigns = [
        "♈︎", "♉︎", "♊︎", "♋︎", "♌︎", "♍︎",
        "♎︎", "♏︎", "♐︎", "♑︎", "♒︎", "♓︎"
    ];

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setPersonality(null);
        setCharacterImage(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/character/generate-astro-character`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dob: formData.dob,
                    time: formData.time,
                    place: formData.place,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate character.');
            }

            const data = await response.json();
            // Check if the personality is a string (and try to parse it)
            if (typeof data.personality === 'string') {
                try {
                    setPersonality(JSON.parse(data.personality));
                } catch (parseError) {
                    console.error("Error parsing personality JSON:", parseError);
                    setError("Failed to parse personality data.");
                    setPersonality(null);
                    return;
                }
            } else {
                setPersonality(data.personality);
            }

            setCharacterImage(data.imageUrl);

        } catch (err) {
            console.error(err);
            setError(err.message);

        } finally {
            setLoading(false);
        }
    };

    // Function to format personality text with better styling
    const formatPersonalityProfile = (data) => {
        if (!data) return null;

        // Handle the case where data is a string
        if (typeof data === 'string') {
            return <p className="text-slate-300 leading-relaxed">{data}</p>;
        }

        const { personality, life_path_suggestions, personality_comparison } = data;

        return (
            <div className="space-y-6">
                
                {/* Overview Section */}
                <div className="mb-8">
                    <h4 className="text-xl text-teal-400 font-semibold mb-3">Your Cosmic Essence</h4>
                    <p className="text-slate-300 leading-relaxed">{personality.overview}</p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <motion.div 
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-5 border border-slate-800 hover:border-teal-500/20 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 rounded-full bg-gradient-to-br from-indigo-500/10 to-teal-400/10 opacity-50"></div>
                        <h4 className="text-lg text-teal-400 font-semibold mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Celestial Strengths
                        </h4>
                        <ul className="space-y-2">
                            {personality.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-teal-400 mr-2">✦</span>
                                    <span className="text-slate-300">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div 
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-5 border border-slate-800 hover:border-indigo-500/20 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 rounded-full bg-gradient-to-br from-indigo-500/10 to-teal-400/10 opacity-50"></div>
                        <h4 className="text-lg text-indigo-400 font-semibold mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            Growth Opportunities
                        </h4>
                        <ul className="space-y-2">
                            {personality.weaknesses.map((weakness, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-indigo-400 mr-2">✧</span>
                                    <span className="text-slate-300">{weakness}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Life Path Suggestions */}
                <div className="mb-8">
                    <h4 className="text-xl text-teal-400 font-semibold mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-teal-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd"></path>
                        </svg>
                        Cosmic Life Path Suggestions
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div 
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-5 border border-slate-800 hover:border-teal-500/20"
                        >
                            <h5 className="text-lg text-teal-400 font-semibold mb-2">Career Destiny</h5>
                            <p className="text-slate-300 leading-relaxed">{life_path_suggestions.career}</p>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-5 border border-slate-800 hover:border-indigo-500/20"
                        >
                            <h5 className="text-lg text-indigo-400 font-semibold mb-2">Passion Pursuits</h5>
                            <p className="text-slate-300 leading-relaxed">{life_path_suggestions.passion}</p>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-5 border border-slate-800 hover:border-indigo-500/20"
                        >
                            <h5 className="text-lg text-indigo-400 font-semibold mb-2">Love Alignment</h5>
                            <p className="text-slate-300 leading-relaxed">{life_path_suggestions.love}</p>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-5 border border-slate-800 hover:border-teal-500/20"
                        >
                            <h5 className="text-lg text-teal-400 font-semibold mb-2">Life Balance</h5>
                            <p className="text-slate-300 leading-relaxed">{life_path_suggestions.other}</p>
                        </motion.div>
                    </div>
                </div>

                {/* Similar Personalities */}
                {personality_comparison && (
                    <motion.div 
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-800 hover:border-indigo-500/20"
                    >
                        <h4 className="text-xl text-teal-400 font-semibold mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-teal-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                            </svg>
                            Cosmic Soul Connections
                        </h4>
                        <p className="text-slate-300 leading-relaxed">{personality_comparison}</p>
                    </motion.div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 text-gray-100 font-sans">
             <Navbar/>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="flex justify-center mb-4"
                    >
                        <div className="h-1 w-16 bg-gradient-to-r from-indigo-500 to-teal-400 rounded"></div>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2"
                    >
                        Cosmic <span className="text-teal-400">Character</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-slate-300"
                    >
                        Discover your cosmic persona based on ancient Vedic wisdom
                    </motion.p>
                </div>

                {/* Zodiac decoration */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex justify-center mb-8 space-x-4 text-2xl text-slate-500"
                >
                    {zodiacSigns.map((sign, index) => (
                        <span key={index} className="opacity-70 hover:opacity-100 hover:text-teal-400 transition-all duration-300 cursor-default">{sign}</span>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="relative mb-10"
                >
                  <div className="relative bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-800 shadow-xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="dob" className="block text-sm font-medium text-slate-300">Date of Birth</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            id="dob"
                                            value={formData.dob}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="time" className="block text-sm font-medium text-slate-300">Birth Time</label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            id="time"
                                            value={formData.time}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="place" className="block text-sm font-medium text-slate-300">Birth Place</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="place"
                                            value={formData.place}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                                            placeholder="City, State, Country"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-indigo-600 to-teal-500 text-white rounded-lg px-8 py-3 font-medium flex items-center justify-center space-x-2 hover:from-indigo-700 hover:to-teal-600 transition-all duration-300 shadow-lg disabled:opacity-70"
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="animate-spin text-white mr-2" />
                                            <span>Consulting the stars...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaUserSecret className="text-white mr-2" />
                                            <span>Reveal Your Cosmic Character</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* Results section */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-900/30 border border-red-800 p-4 rounded-lg text-red-200 mb-10"
                    >
                        <p className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                            </svg>
                            {error}
                        </p>
                    </motion.div>
                )}

                {personality && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {/* Character image */}
                        <div className="md:col-span-1">
                            <div className="sticky top-10">
                                {characterImage ? (
                                    <div className="relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shadow-xl">
                                        <img 
                                            src={characterImage} 
                                            alt="Your Cosmic Character" 
                                            className="w-full h-auto object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
                                    </div>
                                ) : (
                                    <div className="h-96 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
                                        <FaUserSecret className="text-6xl text-slate-600" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Character description */}
                        <div className="md:col-span-2">
                            <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-800 shadow-xl">
                                {formatPersonalityProfile(personality)}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}