import React, { useState, useRef, useEffect } from 'react';
import { connectToLiveSession, generateSpeech, generateInterviewFeedback } from '../../services/geminiService';
import type { LiveSession, InterviewTurn } from '../../services/geminiService';
import { SpinnerIcon, ArrowLeftIcon, XMarkIcon } from '../icons/Icons';

interface MockInterviewProps {
    onBack: () => void;
}

// Helper to safely load history from localStorage on initial render
const getInitialHistory = (): InterviewTurn[] => {
    try {
        const savedHistory = localStorage.getItem('interviewHistory');
        return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
        console.error("Failed to parse interview history from localStorage:", error);
        return [];
    }
};

const MockInterview: React.FC<MockInterviewProps> = ({ onBack }) => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isGreetingLoading, setIsGreetingLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userTranscript, setUserTranscript] = useState('');
    const [modelTranscript, setModelTranscript] = useState('');
    const [history, setHistory] = useState<InterviewTurn[]>(getInitialHistory);
    
    // State for feedback flow
    const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const sessionRef = useRef<LiveSession | null>(null);

    useEffect(() => {
        try {
            localStorage.setItem('interviewHistory', JSON.stringify(history));
        } catch (error) {
            console.error("Failed to save interview history:", error);
        }
    }, [history]);

    const startSession = async () => {
        setIsConnecting(true);
        setError(null);
        setHistory([]);
        setUserTranscript('');
        setModelTranscript('');
        setShowFeedbackPrompt(false);
        setFeedback(null);
        setShowFeedbackModal(false);

        try {
            const session = await connectToLiveSession({
                onOpen: async () => {
                    console.log('Session opened');
                    setIsSessionActive(true);
                    setIsConnecting(false);
                    setIsGreetingLoading(true);
                    try {
                        await generateSpeech("Hello! I'm ready to start the mock interview when you are. Just begin by telling me a little bit about yourself.");
                    } catch (e) {
                        console.error("Could not play greeting audio", e);
                        setError("Could not play greeting audio. Please check your connection.");
                    } finally {
                        setIsGreetingLoading(false);
                    }
                },
                onClose: () => {
                    console.log('Session closed');
                    setIsSessionActive(false);
                },
                onError: (e) => {
                    console.error('Session error:', e);
                    setError('An error occurred during the session. Please try again.');
                    setIsSessionActive(false);
                    setIsConnecting(false);
                },
                onUserTranscript: (text) => {
                    setUserTranscript(text);
                },
                onModelTranscript: (text) => {
                    setModelTranscript(text);
                },
                onTurnComplete: (turn) => {
                    setHistory(prev => [...prev, turn]);
                    setUserTranscript('');
                    setModelTranscript('');
                }
            });
            sessionRef.current = session;
        } catch (err) {
            console.error("Failed to start session:", err);
            setError("Could not access microphone or start session. Please check permissions and try again.");
            setIsConnecting(false);
        }
    };
    
    const stopSession = () => {
        sessionRef.current?.close();
        sessionRef.current = null;
        setIsSessionActive(false);
        setUserTranscript('');
        setModelTranscript('');
        if (history.length > 0) {
            setShowFeedbackPrompt(true);
        }
    };

    const clearHistory = () => {
        localStorage.removeItem('interviewHistory');
        setHistory([]);
        setShowFeedbackPrompt(false);
        setFeedback(null);
    };

    const handleGenerateFeedback = async () => {
        setShowFeedbackPrompt(false);
        setIsFeedbackLoading(true);
        setError(null);
        try {
            const generatedFeedback = await generateInterviewFeedback(history);
            setFeedback(generatedFeedback);
            setShowFeedbackModal(true);
        } catch (e) {
            console.error("Failed to generate feedback:", e);
            setError("Sorry, I couldn't generate feedback at this time. Please try again later.");
        } finally {
            setIsFeedbackLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            sessionRef.current?.close();
        };
    }, []);

    return (
        <div className="flex-1 p-10 overflow-y-auto bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-lg flex flex-col transition-colors">
            <div className="flex items-center mb-4">
                <button 
                  onClick={onBack} 
                  className="p-2 mr-4 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                  aria-label="Back to dashboard"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Mock Interview</h1>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 p-6 rounded-lg shadow-md mb-6">
                {!isSessionActive && (
                    <button 
                        onClick={startSession} 
                        className="w-full bg-green-500 text-white font-bold py-4 px-4 rounded-lg hover:bg-green-600 transition flex items-center justify-center disabled:bg-green-400 dark:disabled:bg-green-600 text-lg"
                        disabled={isConnecting}
                    >
                        {isConnecting ? (
                            <>
                                <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                Connecting...
                            </>
                        ) : 'Start New Interview'}
                    </button>
                )}
                {isSessionActive && (
                    <button onClick={stopSession} className="w-full bg-red-500 text-white font-bold py-4 px-4 rounded-lg hover:bg-red-600 transition text-lg">
                        End Interview
                    </button>
                )}
                {isGreetingLoading && <p className="text-center text-gray-600 dark:text-gray-300 mt-2">Loading introduction audio...</p>}
                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            </div>

            {isFeedbackLoading && (
                <div className="bg-white/70 dark:bg-gray-800/70 p-6 rounded-lg shadow-md mb-6 text-center">
                    <div className="flex items-center justify-center">
                        <SpinnerIcon className="animate-spin h-6 w-6 mr-3" />
                        <p className="text-lg text-gray-700 dark:text-gray-300">Generating feedback, please wait...</p>
                    </div>
                </div>
            )}

            {!isSessionActive && showFeedbackPrompt && !isFeedbackLoading && (
                <div className="bg-white/70 dark:bg-gray-800/70 p-8 rounded-lg shadow-md mb-6 text-center">
                    <p className="text-xl text-gray-800 dark:text-white mb-4">Would you like feedback on your interview performance?</p>
                    <div className="flex justify-center space-x-4">
                        <button 
                            onClick={handleGenerateFeedback}
                            className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition"
                        >
                            Yes, Generate Feedback
                        </button>
                        <button 
                            onClick={() => setShowFeedbackPrompt(false)}
                            className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-8 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                        >
                            No, Thanks
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 bg-white/70 dark:bg-gray-800/70 p-6 rounded-lg shadow-md overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Interview Transcript</h2>
                    {history.length > 0 && !isSessionActive && (
                        <button 
                            onClick={clearHistory} 
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition"
                        >
                            Clear History
                        </button>
                    )}
                </div>
                <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
                    {history.map((turn, index) => (
                        <div key={index}>
                            <p><strong className="text-indigo-600 dark:text-indigo-400">You:</strong> {turn.user}</p>
                            <p><strong className="text-green-600 dark:text-green-400">Interviewer:</strong> {turn.model}</p>
                        </div>
                    ))}
                    {isSessionActive && (
                        <div>
                            {userTranscript && <p className="text-indigo-600 dark:text-indigo-400 italic"><strong>You:</strong> {userTranscript}</p>}
                            {modelTranscript && (
                                <p className="text-green-600 dark:text-green-400 italic">
                                    <strong className={modelTranscript ? 'animate-pulse' : ''}>Interviewer:</strong> {modelTranscript}
                                </p>
                            )}
                        </div>
                    )}
                    {!isSessionActive && history.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400">Your saved transcript will appear here. Start a new interview to begin.</p>
                    )}
                </div>
            </div>

            {showFeedbackModal && feedback && (
                <div 
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowFeedbackModal(false)}
                >
                    <div 
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Interview Feedback</h2>
                            <button
                                onClick={() => setShowFeedbackModal(false)}
                                className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                aria-label="Close feedback modal"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <main className="p-6 overflow-y-auto">
                            <p className="text-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{feedback}</p>
                        </main>
                        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 text-right">
                            <button
                                onClick={() => setShowFeedbackModal(false)}
                                className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition text-base"
                            >
                                Close
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MockInterview;