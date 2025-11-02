import React, { useState, useEffect } from 'react';
import { CalendarIcon, MicIcon, CodeBracketIcon, DocumentTextIcon, BrainIcon } from '../icons/Icons';
import { CHAT_SESSIONS } from '../../constants';
import { CHAT_SESSIONS as ChatSessionsType } from '../../constants';

type Section = 'dashboard' | 'timetable' | 'interview' | 'profile' | keyof typeof ChatSessionsType;

interface DashboardProps {
    onNavigate: (section: Section) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const updateName = () => {
            setUserName(localStorage.getItem('userName') || '');
        };

        updateName(); // Initial load

        // Listen for changes from the Profile component
        window.addEventListener('nameChanged', updateName);

        return () => {
            window.removeEventListener('nameChanged', updateName);
        };
    }, []);

    const greeting = userName ? `Welcome back, ${userName}!` : 'Welcome, Dinakar Reddy!';

    return (
        <div className="flex-1 p-10 overflow-y-auto bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-lg transition-colors">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white">{greeting}</h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 mt-2">How can I help you study today?</p>
            </header>

            <main>
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Your Tools</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Timetable Card */}
                        <DashboardCard
                            icon={<CalendarIcon className="w-10 h-10 text-indigo-500" />}
                            title="Timetable Generator"
                            description="Create a personalized study schedule to stay organized and focused."
                            onClick={() => onNavigate('timetable')}
                        />
                        {/* Mock Interview Card */}
                        <DashboardCard
                            icon={<MicIcon className="w-10 h-10 text-green-500" />}
                            title="Mock Interview"
                            description="Practice your interview skills with an AI-powered mock interviewer."
                            onClick={() => onNavigate('interview')}
                        />
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">AI Assistants</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <DashboardCard
                            icon={<CodeBracketIcon className="w-10 h-10 text-sky-500" />}
                            title={CHAT_SESSIONS.codeHelper.title}
                            description="Get help with coding problems, debugging, and understanding concepts."
                            onClick={() => onNavigate('codeHelper')}
                        />
                        <DashboardCard
                            icon={<DocumentTextIcon className="w-10 h-10 text-amber-500" />}
                            title={CHAT_SESSIONS.essayWriter.title}
                            description="Brainstorm ideas and get guidance on structuring your essays."
                            onClick={() => onNavigate('essayWriter')}
                        />
                        <DashboardCard
                            icon={<BrainIcon className="w-10 h-10 text-rose-500" />}
                            title={CHAT_SESSIONS.studyBuddy.title}
                            description="Your general study partner for any subject, from history to science."
                            onClick={() => onNavigate('studyBuddy')}
                        />
                    </div>
                </section>
            </main>
        </div>
    );
};

interface DashboardCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, description, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all text-left flex flex-col items-start"
        >
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-base text-gray-600 dark:text-gray-300 flex-grow">{description}</p>
        </button>
    );
};

export default Dashboard;