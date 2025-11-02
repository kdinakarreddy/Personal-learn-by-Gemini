
import React from 'react';
import { CHAT_SESSIONS } from '../constants';

type Section = 'dashboard' | 'timetable' | 'interview' | 'profile' | keyof typeof CHAT_SESSIONS;

interface SidebarProps {
    currentSection: Section;
    onNavigate: (section: Section) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentSection, onNavigate }) => {
    const navItemClasses = (section: Section) =>
        `w-full text-left px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
            currentSection === section
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700/50'
        }`;

    return (
        <aside className="w-64 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border-r border-gray-200 dark:border-gray-700/60 p-4 flex flex-col">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Student AI</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your Personal Study Partner</p>
            </div>
            <nav className="flex-1 space-y-2">
                <h2 className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tools</h2>
                <button onClick={() => onNavigate('dashboard')} className={navItemClasses('dashboard')}>Dashboard</button>
                <button onClick={() => onNavigate('timetable')} className={navItemClasses('timetable')}>Timetable Generator</button>
                <button onClick={() => onNavigate('interview')} className={navItemClasses('interview')}>Mock Interview</button>

                <div className="pt-4">
                     <h2 className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Chat Sessions</h2>
                    {Object.keys(CHAT_SESSIONS).map((key) => (
                        <button key={key} onClick={() => onNavigate(key as keyof typeof CHAT_SESSIONS)} className={navItemClasses(key as keyof typeof CHAT_SESSIONS)}>
                            {CHAT_SESSIONS[key as keyof typeof CHAT_SESSIONS].title}
                        </button>
                    ))}
                </div>
            </nav>
            <div className="mt-auto">
                 <button onClick={() => onNavigate('profile')} className={navItemClasses('profile')}>
                     Profile & Settings
                 </button>
            </div>
        </aside>
    );
};

export default Sidebar;
