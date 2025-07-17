import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FlashcardComponent } from './FlashcardComponent';
import { Brain, Trophy, Clock, RotateCcw } from 'lucide-react';
import { Flashcard, StudySession } from '@/types/flashcard';
import { storage, calculateNextReview } from '@/utils/storage';
import toast from 'react-hot-toast';

interface StudyModeProps {
  flashcards: Flashcard[];
  onSessionComplete: () => void;
}

export function StudyMode({ flashcards, onSessionComplete }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    // Filter cards that need review or are new
    const cardsToStudy = flashcards.filter(card => {
      if (!card.nextReview) return true; // New cards
      return new Date(card.nextReview) <= new Date(); // Cards due for review
    });

    // Shuffle the cards for variety
    const shuffled = [...cardsToStudy].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled.slice(0, 10)); // Limit to 10 cards per session
    setStartTime(new Date());
  }, [flashcards]);

  const handleAnswer = (correct: boolean) => {
    const currentCard = studyCards[currentIndex];
    
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }

    // Update card statistics
    const updatedCard: Partial<Flashcard> = {
      lastReviewed: new Date().toISOString(),
      reviewCount: currentCard.reviewCount + 1,
      correctCount: correct ? currentCard.correctCount + 1 : currentCard.correctCount,
      nextReview: calculateNextReview(currentCard.difficulty, currentCard.reviewCount + 1),
    };

    storage.updateFlashcard(currentCard.id, updatedCard);

    // Move to next card or complete session
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    const session: StudySession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      cardsStudied: studyCards.length,
      correctAnswers,
      duration,
    };

    storage.addStudySession(session);
    setSessionComplete(true);
    
    toast.success(`Session complete! ${correctAnswers}/${studyCards.length} correct`);
  };

  const restartSession = () => {
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setStartTime(new Date());
    setSessionComplete(false);
    
    // Reshuffle cards
    const shuffled = [...studyCards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
  };

  if (studyCards.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto text-center">
        <CardContent className="p-8">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
          <p className="text-muted-foreground mb-4">
            No cards are due for review right now. Great job!
          </p>
          <Button onClick={onSessionComplete}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (sessionComplete) {
    const accuracy = Math.round((correctAnswers / studyCards.length) * 100);
    const duration = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

    return (
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Session Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
              <div className="text-sm text-green-700">Correct</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
              <div className="text-sm text-blue-700">Accuracy</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{Math.floor(duration / 60)}m {duration % 60}s</span>
          </div>

          <div className="flex gap-2">
            <Button onClick={restartSession} variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Study Again
            </Button>
            <Button onClick={onSessionComplete} className="flex-1">
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = ((currentIndex + 1) / studyCards.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              <span className="font-medium">Study Session</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} of {studyCards.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Progress: {Math.round(progress)}%</span>
            <span>Correct: {correctAnswers}/{currentIndex + 1}</span>
          </div>
        </CardContent>
      </Card>

      {/* Current Flashcard */}
      <FlashcardComponent
        flashcard={studyCards[currentIndex]}
        onAnswer={handleAnswer}
      />
    </div>
  );
}