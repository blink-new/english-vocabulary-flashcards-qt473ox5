import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RotateCcw, Volume2 } from 'lucide-react';
import { Flashcard } from '@/types/flashcard';

interface FlashcardComponentProps {
  flashcard: Flashcard;
  onAnswer: (correct: boolean) => void;
  showAnswer?: boolean;
}

export function FlashcardComponent({ flashcard, onAnswer, showAnswer = false }: FlashcardComponentProps) {
  const [isFlipped, setIsFlipped] = useState(showAnswer);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (correct: boolean) => {
    onAnswer(correct);
    setIsFlipped(false);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(flashcard.word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <motion.div
        className="relative h-80 cursor-pointer"
        onClick={handleFlip}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front of card */}
          <Card className={`absolute inset-0 ${getDifficultyColor(flashcard.difficulty)} bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl`}
                style={{ backfaceVisibility: "hidden" }}>
            <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Badge variant="secondary" className="mb-4 text-xs">
                {flashcard.difficulty.toUpperCase()}
              </Badge>
              <h2 className="text-3xl font-bold mb-4">{flashcard.word}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord();
                }}
                className="text-white hover:bg-white/20"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
              <p className="text-sm opacity-80 mt-4">Click to reveal meaning</p>
            </CardContent>
          </Card>

          {/* Back of card */}
          <Card className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <CardContent className="flex flex-col justify-center h-full p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">Meaning</h3>
              <p className="text-lg mb-6">{flashcard.meaning}</p>
              
              <div className="border-t border-white/20 pt-4">
                <h4 className="text-sm font-medium mb-2 opacity-80">Example</h4>
                <p className="text-sm italic">{flashcard.example}</p>
              </div>

              {!showAnswer && (
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAnswer(false);
                    }}
                    variant="destructive"
                    className="flex-1"
                  >
                    Hard
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAnswer(true);
                    }}
                    variant="default"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Easy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="flex justify-center mt-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleFlip}
          className="rounded-full"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}