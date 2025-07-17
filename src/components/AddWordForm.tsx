import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen } from 'lucide-react';
import { Flashcard } from '@/types/flashcard';
import { storage } from '@/utils/storage';
import toast from 'react-hot-toast';

interface AddWordFormProps {
  onWordAdded: () => void;
}

export function AddWordForm({ onWordAdded }: AddWordFormProps) {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!word.trim() || !meaning.trim() || !example.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const newFlashcard: Flashcard = {
        id: Date.now().toString(),
        word: word.trim(),
        meaning: meaning.trim(),
        example: example.trim(),
        difficulty,
        dateAdded: new Date().toISOString(),
        reviewCount: 0,
        correctCount: 0,
      };

      storage.addFlashcard(newFlashcard);
      
      // Reset form
      setWord('');
      setMeaning('');
      setExample('');
      setDifficulty('medium');
      
      toast.success(`"${newFlashcard.word}" added successfully!`);
      onWordAdded();
    } catch (error) {
      toast.error('Failed to add word. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-500 hover:bg-green-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'hard': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <BookOpen className="h-6 w-6 text-indigo-600" />
          Add New Word
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="word" className="block text-sm font-medium mb-2">
              Word
            </label>
            <Input
              id="word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Enter the word..."
              className="text-lg"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="meaning" className="block text-sm font-medium mb-2">
              Meaning
            </label>
            <Textarea
              id="meaning"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="Enter the meaning..."
              className="min-h-[80px]"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="example" className="block text-sm font-medium mb-2">
              Example Sentence
            </label>
            <Textarea
              id="example"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="Enter an example sentence..."
              className="min-h-[80px]"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Difficulty Level
            </label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <Badge
                  key={diff}
                  className={`cursor-pointer px-4 py-2 text-white transition-colors ${
                    difficulty === diff 
                      ? getDifficultyColor(diff)
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => setDifficulty(diff)}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Badge>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Adding Word...' : 'Add Word'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}