import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { StudyMode } from './components/StudyMode';
import { AddWordForm } from './components/AddWordForm';
import { Button } from './components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Flashcard } from './types/flashcard';
import { storage } from './utils/storage';

type AppMode = 'dashboard' | 'study' | 'add-word';

function App() {
  const [mode, setMode] = useState<AppMode>('dashboard');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = () => {
    const cards = storage.getFlashcards();
    setFlashcards(cards);
  };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
  };

  const handleWordAdded = () => {
    loadFlashcards();
    setMode('dashboard');
  };

  const handleSessionComplete = () => {
    loadFlashcards();
    setMode('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mode !== 'dashboard' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMode('dashboard')}
                  className="rounded-full"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    English Vocabulary
                  </h1>
                  <p className="text-sm text-gray-600">
                    {mode === 'dashboard' && 'Dashboard'}
                    {mode === 'study' && 'Study Session'}
                    {mode === 'add-word' && 'Add New Word'}
                  </p>
                </div>
              </div>
            </div>

            {mode === 'dashboard' && (
              <div className="text-sm text-gray-600">
                {flashcards.length} words in your vocabulary
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {mode === 'dashboard' && (
          <Dashboard
            flashcards={flashcards}
            onStartStudy={() => handleModeChange('study')}
            onAddWord={() => handleModeChange('add-word')}
            onRefresh={loadFlashcards}
          />
        )}

        {mode === 'study' && (
          <StudyMode
            flashcards={flashcards}
            onSessionComplete={handleSessionComplete}
          />
        )}

        {mode === 'add-word' && (
          <AddWordForm onWordAdded={handleWordAdded} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-sm text-gray-500">
        <p>Build your vocabulary one word at a time 📚</p>
      </footer>
    </div>
  );
}

export default App;