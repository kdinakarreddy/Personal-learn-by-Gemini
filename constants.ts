
export const CHAT_SESSIONS = {
    codeHelper: {
        title: 'Code Helper',
        systemInstruction: 'You are an expert programmer. Help the user write, debug, and understand code. Provide clear explanations and code examples.',
        suggestions: [
            'Explain recursion in Python',
            'How do I make a POST request in JavaScript?',
            'Debug my C++ code for finding prime numbers',
            'What is the difference between an interface and an abstract class?',
        ],
    },
    essayWriter: {
        title: 'Essay Writing Assistant',
        systemInstruction: 'You are a helpful writing assistant. Help the user brainstorm ideas, structure their essays, and improve their writing. Do not write the essay for them, but guide them through the process.',
        suggestions: [
            'Help me brainstorm ideas for an essay on climate change',
            'What is a good thesis statement structure?',
            'Check my paragraph for grammar and clarity',
            'Suggest some transition words to improve flow',
        ],
    },
    studyBuddy: {
        title: 'General Study Buddy',
        systemInstruction: 'You are a friendly and knowledgeable study buddy. Help the user understand complex topics, prepare for exams, and answer their questions across various subjects.',
        suggestions: [
            'Explain the process of photosynthesis',
            'Who was Julius Caesar?',
            'What are the main causes of World War I?',
            'Summarize the plot of "To Kill a Mockingbird"',
        ],
    },
};
