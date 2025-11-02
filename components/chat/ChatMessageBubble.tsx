import React from 'react';
import type { ChatMessage } from '../../types';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xl px-5 py-4 rounded-lg shadow ${
          isUser
            ? 'bg-indigo-500 text-white'
            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200'
        }`}
      >
        <p className="text-lg" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
      </div>
    </div>
  );
};

export default ChatMessageBubble;