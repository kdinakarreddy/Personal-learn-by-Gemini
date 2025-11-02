import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, SunIcon, MoonIcon } from '../icons/Icons';

interface ProfileProps {
    onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [name, setName] = useState(() => localStorage.getItem('userName') || '');

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);
    }, []);

    useEffect(() => {
        if (name) {
            localStorage.setItem('userName', name);
        } else {
            // Remove the item if the name is cleared
            localStorage.removeItem('userName');
        }
        // Dispatch a custom event so other components (like Dashboard) can update in real-time
        window.dispatchEvent(new CustomEvent('nameChanged'));
    }, [name]);

    const toggleTheme = () => {
        const newIsDarkMode = !isDarkMode;
        setIsDarkMode(newIsDarkMode);
        if (newIsDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <div className="flex-1 p-10 overflow-y-auto bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-lg flex flex-col transition-colors">
            <div className="flex items-center mb-6">
                <button 
                    onClick={onBack} 
                    className="p-2 mr-4 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                    aria-label="Back to dashboard"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Profile & Settings</h1>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-8 rounded-lg shadow-md max-w-3xl mx-auto w-full">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Personal Information</h2>
                 <div className="mb-6">
                    <label htmlFor="userName" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                    </label>
                    <input
                        type="text"
                        id="userName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors py-3 px-4 text-lg"
                    />
                </div>

                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Appearance</h2>
                <div className="flex items-center justify-between">
                    <span className="text-lg text-gray-700 dark:text-gray-300">Theme</span>
                    <button
                        onClick={toggleTheme}
                        className="relative inline-flex items-center h-8 rounded-full w-16 transition-colors bg-gray-200 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        aria-label="Toggle theme"
                    >
                        <span
                            className={`${
                                isDarkMode ? 'translate-x-9' : 'translate-x-1'
                            } inline-block w-6 h-6 transform bg-white rounded-full transition-transform flex items-center justify-center`}
                        >
                            {isDarkMode ? <MoonIcon className="w-4 h-4 text-gray-800" /> : <SunIcon className="w-4 h-4 text-gray-800" />}
                        </span>
                    </button>
                </div>
                <p className="text-base text-gray-500 dark:text-gray-400 mt-2">
                    Current theme: {isDarkMode ? 'Dark' : 'Light'}. Your preference is saved automatically.
                </p>
            </div>
        </div>
    );
};

export default Profile;