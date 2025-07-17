import { Flashcard, StudySession, StudyStats } from '@/types/flashcard';

const STORAGE_KEYS = {
  FLASHCARDS: 'flashcards',
  STUDY_SESSIONS: 'studySessions',
  STUDY_STATS: 'studyStats',
};

export const storage = {
  // Flashcards
  getFlashcards: (): Flashcard[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
    return stored ? JSON.parse(stored) : [];
  },

  saveFlashcards: (flashcards: Flashcard[]): void => {
    localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(flashcards));
  },

  addFlashcard: (flashcard: Flashcard): void => {
    const flashcards = storage.getFlashcards();
    flashcards.push(flashcard);
    storage.saveFlashcards(flashcards);
  },

  updateFlashcard: (id: string, updates: Partial<Flashcard>): void => {
    const flashcards = storage.getFlashcards();
    const index = flashcards.findIndex(card => card.id === id);
    if (index !== -1) {
      flashcards[index] = { ...flashcards[index], ...updates };
      storage.saveFlashcards(flashcards);
    }
  },

  deleteFlashcard: (id: string): void => {
    const flashcards = storage.getFlashcards();
    const filtered = flashcards.filter(card => card.id !== id);
    storage.saveFlashcards(filtered);
  },

  // Study Sessions
  getStudySessions: (): StudySession[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS);
    return stored ? JSON.parse(stored) : [];
  },

  addStudySession: (session: StudySession): void => {
    const sessions = storage.getStudySessions();
    sessions.push(session);
    localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(sessions));
  },

  // Study Stats
  getStudyStats: (): StudyStats => {
    const stored = localStorage.getItem(STORAGE_KEYS.STUDY_STATS);
    return stored ? JSON.parse(stored) : {
      totalCards: 0,
      studiedToday: 0,
      streak: 0,
      accuracy: 0,
      totalStudyTime: 0,
    };
  },

  updateStudyStats: (stats: StudyStats): void => {
    localStorage.setItem(STORAGE_KEYS.STUDY_STATS, JSON.stringify(stats));
  },
};

// Spaced repetition algorithm
export const calculateNextReview = (difficulty: 'easy' | 'medium' | 'hard', reviewCount: number): string => {
  const now = new Date();
  let daysToAdd = 1;

  switch (difficulty) {
    case 'easy':
      daysToAdd = Math.min(30, Math.pow(2, reviewCount));
      break;
    case 'medium':
      daysToAdd = Math.min(14, Math.pow(1.5, reviewCount));
      break;
    case 'hard':
      daysToAdd = Math.min(7, reviewCount + 1);
      break;
  }

  now.setDate(now.getDate() + daysToAdd);
  return now.toISOString();
};