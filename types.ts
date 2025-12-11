
export interface VocabularyItem {
  kanji: string;
  furigana: string;
  romaji: string;
  meaning: string;
  exampleSentence: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isSystemMessage?: boolean; // New: for system notifications like "Language Switched"
}

export enum AppView {
  HOME = 'HOME',
  COURSE = 'COURSE', // New structured learning view
  UNIT_STUDY = 'UNIT_STUDY', // New unit overview with dialogue
  VOCABULARY = 'VOCABULARY',
  CHAT = 'CHAT',
  KANA = 'KANA',
  GRAMMAR = 'GRAMMAR',
}

export interface AudioState {
  isPlaying: boolean;
  currentText: string | null;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface GrammarExplanation {
  title: string;
  explanation: string; // Markdown supported
  examples: {
    japanese: string;
    reading: string;
    meaning: string;
  }[];
}

export interface Unit {
  id: number;
  title: string;
  description: string;
  vocabTopic: string;
  grammarTopic: string;
}

export interface DialogueLine {
  speaker: 'A' | 'B';
  japanese: string;
  reading: string;
  meaning: string;
}

export interface UnitContent {
  title: string;
  intro: string;
  grammarNote: string; // New: Adds depth to the lesson with a specific explanation
  dialogue: DialogueLine[];
  keySentences: {
    japanese: string;
    reading: string;
    meaning: string;
  }[];
}
