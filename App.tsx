
import React, { useState } from 'react';
import Dashboard from './components/dashboard/Dashboard';
import ChatWindow from './components/chat/ChatWindow';
import TimeTable from './components/timetable/TimeTable';
import MockInterview from './components/interview/MockInterview';
import Profile from './components/profile/Profile';
import { CHAT_SESSIONS } from './constants';
import DateTimeDisplay from './components/common/DateTimeDisplay';

type Section = 'dashboard' | 'timetable' | 'interview' | 'profile' | keyof typeof CHAT_SESSIONS;

const App: React.FC = () => {
    const [currentSection, setCurrentSection] = useState<Section>('dashboard');

    const renderSection = () => {
        const handleBack = () => setCurrentSection('dashboard');

        if (currentSection === 'dashboard') {
            return <Dashboard onNavigate={setCurrentSection} />;
        }
        if (currentSection === 'timetable') {
            return <TimeTable onBack={handleBack} />;
        }
        if (currentSection === 'interview') {
            return <MockInterview onBack={handleBack} />;
        }
        if (currentSection === 'profile') {
            return <Profile onBack={handleBack} />;
        }
        if (currentSection in CHAT_SESSIONS) {
            return <ChatWindow sectionId={currentSection as keyof typeof CHAT_SESSIONS} onBack={handleBack} />;
        }
        return <Dashboard onNavigate={setCurrentSection} />;
    };

    return (
        <div className="h-screen bg-gray-100 dark:bg-gray-900 font-sans relative">
            <div className="absolute top-4 right-6 z-30 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg shadow">
                <DateTimeDisplay />
            </div>
            {renderSection()}
        </div>
    );
};

export default App;