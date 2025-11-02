import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { sendMessage } from '../../services/geminiService';
import { CHAT_SESSIONS } from '../../constants';
import type { ChatMessage } from '../../types';
import ChatMessageBubble from './ChatMessageBubble';
import { ArrowLeftIcon, SpinnerIcon } from '../icons/Icons';

interface ChatWindowProps {
  sectionId: keyof typeof CHAT_SESSIONS;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ sectionId, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatInstanceRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const session = CHAT_SESSIONS[sectionId];
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = (messageText || userInput).trim();
    if (!textToSend || isLoading) return;

    setUserInput('');
    setMessages((prev) => [...prev, { role: 'user', text: textToSend }]);
    setIsLoading(true);
    setError(null);

    try {
      const result = await sendMessage(
        textToSend,
        chatInstanceRef.current,
        'gemini-2.5-flash',
        session.systemInstruction
      );
      chatInstanceRef.current = result.chat;
      setMessages((prev) => [...prev, { role: 'model', text: result.text }]);
    } catch (e) {
      console.error('Failed to send message:', e);
      setError('Failed to get a response. Please check your connection and try again.');
      // remove the user's message if the call fails to allow retry.
      setMessages((prev) => prev.slice(0, prev.length -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm transition-colors">
      <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md sticky top-0 z-20">
        <button
          onClick={onBack}
          className="p-2 mr-4 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{session.title}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.map((msg, index) => (
          <ChatMessageBubble key={index} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="max-w-xl px-4 py-3 rounded-lg shadow bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              <SpinnerIcon className="animate-spin h-6 w-6" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {messages.length === 0 && !isLoading && (
        <div className="px-8 pb-2">
            <p className="text-base text-gray-500 dark:text-gray-400 mb-2">Try a suggestion:</p>
            <div className="flex flex-wrap gap-3">
                {session.suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-4 py-2 bg-gray-200/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 rounded-full text-base hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
      )}

      <footer className="p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
        <form onSubmit={handleFormSubmit} className="flex items-center space-x-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask anything..."
            disabled={isLoading}
            className="flex-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-lg py-3 px-4"
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-500 disabled:cursor-not-allowed transition-colors text-lg"
          >
            Send
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      </footer>
    </div>
  );
};

export default ChatWindow;