export interface Flashcard {
  id: string;
  word: string;
  meaning: string;
  example: string;
  difficulty: 'easy' | 'medium' | 'hard';
  dateAdded: string;
  lastReviewed?: string;
  reviewCount: number;
  correctCount: number;
  nextReview?: string;
}

export interface StudySession {
  id: string;
  date: string;
  cardsStudied: number;
  correctAnswers: number;
  duration: number; // in seconds
}

export interface StudyStats {
  totalCards: number;
  studiedToday: number;
  streak: number;
  accuracy: number;
  totalStudyTime: number;
}