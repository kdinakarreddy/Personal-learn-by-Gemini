import { GoogleGenAI, Type, Modality, Chat, GenerateContentResponse, LiveServerMessage, Blob } from "@google/genai";
import type { TimetableEntry } from "../types";
import { encode, decode, decodeAudioData } from "../utils/audioUtils";

let ai: GoogleGenAI;

const getAi = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

// --- Chat Service ---
export const sendMessage = async (
  message: string,
  chatInstance: Chat | null,
  model: 'gemini-2.5-pro' | 'gemini-2.5-flash',
  systemInstruction: string
): Promise<{ text: string; chat: Chat }> => {
  const ai = getAi();
  const chat = chatInstance || ai.chats.create({
    model,
    config: { systemInstruction },
  });
  const result: GenerateContentResponse = await chat.sendMessage({ message });
  return { text: result.text, chat };
};


// --- Timetable Service ---
const timetableSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        day: { type: Type.STRING, description: "Day of the week (e.g., Monday)" },
        time: { type: Type.STRING, description: "Time slot (e.g., 9:00 AM - 11:00 AM)" },
        subject: { type: Type.STRING, description: "The subject to study" },
        topic: { type: Type.STRING, description: "A specific topic within the subject" },
      },
      required: ["day", "time", "subject", "topic"],
    },
};

export const generateTimetable = async (
    subjects: string, 
    hoursPerDay: number,
    focusSubjects?: string
): Promise<TimetableEntry[]> => {
    const ai = getAi();
    let prompt = `Create a 7-day study timetable. The user wants to study the following subjects: ${subjects}. They can study for ${hoursPerDay} hours per day.`;

    if (focusSubjects && focusSubjects.trim()) {
        prompt += ` Please give special focus and more time to these subjects: ${focusSubjects}.`;
    }

    prompt += ` Create a balanced schedule with specific topics for each subject. Ensure the schedule is practical and includes breaks.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: timetableSchema,
        },
    });

    const parsed = JSON.parse(response.text);
    return parsed as TimetableEntry[];
};

// --- TTS Service ---
export const generateSpeech = async (textToSpeak: string) => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: textToSpeak }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const outputNode = outputAudioContext.createGain();
        outputNode.connect(outputAudioContext.destination);
        
        const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            outputAudioContext,
            24000,
            1,
        );
        const source = outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputNode);
        source.start();
    } else {
        throw new Error("No audio data received from API.");
    }
}


// --- Live API Service ---

export interface LiveSession {
    close: () => void;
}

export type InterviewTurn = { user: string; model: string };

interface LiveCallbacks {
    onOpen: () => void;
    onClose: () => void;
    onError: (e: any) => void;
    onUserTranscript: (text: string) => void;
    onModelTranscript: (text: string) => void;
    onTurnComplete: (turn: InterviewTurn) => void;
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

export const connectToLiveSession = async (callbacks: LiveCallbacks): Promise<LiveSession> => {
    const ai = getAi();
    
    let nextStartTime = 0;
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputNode = outputAudioContext.createGain();
    outputNode.connect(outputAudioContext.destination);
    const sources = new Set<AudioBufferSourceNode>();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    let currentInputTranscription = '';
    let currentOutputTranscription = '';

    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => {
                callbacks.onOpen();
                const source = inputAudioContext.createMediaStreamSource(stream);
                const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);

                scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const pcmBlob: Blob = createBlob(inputData);

                    sessionPromise.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    }).catch(callbacks.onError);
                };
                source.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64EncodedAudioString) {
                    nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                    const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContext, 24000, 1);
                    const source = outputAudioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputNode);
                    source.addEventListener('ended', () => { sources.delete(source); });
                    source.start(nextStartTime);
                    nextStartTime += audioBuffer.duration;
                    sources.add(source);
                }
                
                if (message.serverContent?.inputTranscription) {
                    currentInputTranscription += message.serverContent.inputTranscription.text;
                    callbacks.onUserTranscript(currentInputTranscription);
                }
                if (message.serverContent?.outputTranscription) {
                    currentOutputTranscription += message.serverContent.outputTranscription.text;
                    callbacks.onModelTranscript(currentOutputTranscription);
                }

                if (message.serverContent?.turnComplete) {
                    callbacks.onTurnComplete({user: currentInputTranscription, model: currentOutputTranscription});
                    currentInputTranscription = '';
                    currentOutputTranscription = '';
                }

                if (message.serverContent?.interrupted) {
                    for (const source of sources.values()) {
                        source.stop();
                        sources.delete(source);
                    }
                    nextStartTime = 0;
                }
            },
            onerror: callbacks.onError,
            onclose: callbacks.onClose,
        },
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: 'You are a friendly, professional, and encouraging interviewer conducting a mock interview for a university student. Ask a wide variety of questions covering communication skills, problem-solving, and general knowledge. Don\'t limit yourself to common questions. If the user struggles to answer a question, gently encourage them, perhaps by rephrasing the question or giving them a small hint. Your goal is to create a positive and motivating practice environment. Provide constructive feedback at the end if asked.',
        },
    });
    
    const session = await sessionPromise;

    return {
        close: () => {
            stream.getTracks().forEach(track => track.stop());
            inputAudioContext.close();
            outputAudioContext.close();
            session.close();
        }
    };
};

// --- Feedback Service ---
export const generateInterviewFeedback = async (transcript: InterviewTurn[]): Promise<string> => {
    const ai = getAi();

    const formattedTranscript = transcript
        .map(turn => `Interviewer: ${turn.model}\nCandidate: ${turn.user}`)
        .join('\n\n');

    const prompt = `You are an expert career coach providing feedback on a mock interview. Your goal is to be constructive, supportive, and highly specific.

Analyze the following interview transcript. Structure your feedback into two main sections:
1.  **What Went Well:** Highlight the candidate's strengths. Be specific and point to examples from the transcript.
2.  **Areas for Improvement:** Identify specific weaknesses. For each point, do the following:
    a. Clearly state the issue (e.g., "The answer to 'Tell me about a time you faced a challenge' was a bit vague.").
    b. Explain *why* it's an area for improvement (e.g., "Using the STAR method helps create a more impactful story.").
    c. Provide a concrete, improved **example answer** that the candidate could have used. This is the most important part.

Common areas to look for include:
- Use of the STAR (Situation, Task, Action, Result) method for behavioral questions.
- Clarity and conciseness.
- Providing specific examples and data vs. general statements.
- Confidence and enthusiasm in their tone (as inferred from the text).

Here is the transcript:
---
${formattedTranscript}
---

Please provide the detailed feedback now, including example answers.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro", // Using Pro for more nuanced feedback
        contents: prompt,
    });

    return response.text;
};