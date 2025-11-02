
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface TimetableEntry {
  day: string;
  time: string;
  subject: string;
  topic: string;
}
