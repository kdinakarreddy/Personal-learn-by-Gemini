import React, { useState } from 'react';
import { generateTimetable } from '../../services/geminiService';
import type { TimetableEntry } from '../../types';
import { ArrowLeftIcon } from '../icons/Icons';

interface TimeTableProps {
    onBack: () => void;
}

const TimetableSkeleton: React.FC = () => (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-6 rounded-lg shadow-md animate-pulse">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </h2>
        <div className="overflow-x-auto">
            <div className="min-w-full">
                <div className="flex bg-gray-50/70 dark:bg-gray-700/70 p-3 rounded-t-md">
                    <div className="w-1/4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="w-1/4 h-4 bg-gray-300 dark:bg-gray-600 rounded ml-6"></div>
                    <div className="w-1/4 h-4 bg-gray-300 dark:bg-gray-600 rounded ml-6"></div>
                    <div className="w-1/4 h-4 bg-gray-300 dark:bg-gray-600 rounded ml-6"></div>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex p-4">
                            <div className="w-1/4 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="w-1/4 h-5 bg-gray-200 dark:bg-gray-700 rounded ml-6"></div>
                            <div className="w-1/4 h-5 bg-gray-200 dark:bg-gray-700 rounded ml-6"></div>
                            <div className="w-1/4 h-5 bg-gray-200 dark:bg-gray-700 rounded ml-6"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);


const TimeTable: React.FC<TimeTableProps> = ({ onBack }) => {
    const [subjects, setSubjects] = useState('');
    const [hours, setHours] = useState(4);
    const [focus, setFocus] = useState('');
    const [timetable, setTimetable] = useState<TimetableEntry[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!subjects.trim()) {
            setError("Please enter at least one subject.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setTimetable(null);
        try {
            const result = await generateTimetable(subjects, hours, focus);
            setTimetable(result);
        } catch (e) {
            console.error(e);
            setError("Failed to generate timetable. The model might have returned an unexpected format. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex-1 p-10 overflow-y-auto bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-lg transition-colors">
            <div className="flex items-center mb-6">
                <button 
                    onClick={onBack} 
                    className="p-2 mr-4 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                    aria-label="Back to dashboard"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Generate Your Study Timetable</h1>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-6 rounded-lg shadow-md mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="subjects" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Subjects (comma-separated)
                        </label>
                        <input
                            type="text"
                            id="subjects"
                            value={subjects}
                            onChange={(e) => setSubjects(e.target.value)}
                            placeholder="e.g., Operating Systems, DSA, Networking"
                            className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors py-3 px-4 text-base"
                        />
                    </div>
                    <div>
                        <label htmlFor="hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Study Hours per Day
                        </label>
                        <input
                            type="number"
                            id="hours"
                            value={hours}
                            min={1}
                            max={12}
                            onChange={(e) => setHours(parseInt(e.target.value, 10))}
                            className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors py-3 px-4 text-base"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="focus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Focus Subjects (optional, comma-separated)
                        </label>
                        <input
                            type="text"
                            id="focus"
                            value={focus}
                            onChange={(e) => setFocus(e.target.value)}
                            placeholder="e.g., DSA"
                            className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors py-3 px-4 text-base"
                        />
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-500 dark:disabled:text-gray-300 transition-colors text-lg"
                    >
                        {isLoading ? 'Generating...' : 'Generate Timetable'}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>

            {isLoading && <TimetableSkeleton />}

            {timetable && !isLoading && (
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-6 rounded-lg shadow-md">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Your 7-Day Study Plan</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50/70 dark:bg-gray-700/70">
                                <tr>
                                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Day</th>
                                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject</th>
                                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Topic</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/70 dark:bg-gray-800/70 divide-y divide-gray-200 dark:divide-gray-700">
                                {timetable.map((entry, index) => (
                                    <tr key={index}>
                                        <td className="px-8 py-4 whitespace-nowrap text-base font-medium text-gray-900 dark:text-white">{entry.day}</td>
                                        <td className="px-8 py-4 whitespace-nowrap text-base text-gray-500 dark:text-gray-300">{entry.time}</td>
                                        <td className="px-8 py-4 whitespace-nowrap text-base text-gray-500 dark:text-gray-300">{entry.subject}</td>
                                        <td className="px-8 py-4 text-base text-gray-500 dark:text-gray-300">{entry.topic}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeTable;