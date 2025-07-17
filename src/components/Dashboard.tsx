import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Brain, 
  Plus, 
  Search, 
  Calendar,
  Target,
  Clock,
  Flame,
  TrendingUp,
  Filter
} from 'lucide-react';
import { Flashcard, StudyStats } from '@/types/flashcard';
import { storage } from '@/utils/storage';

interface DashboardProps {
  flashcards: Flashcard[];
  onStartStudy: () => void;
  onAddWord: () => void;
  onRefresh: () => void;
}

export function Dashboard({ flashcards, onStartStudy, onAddWord, onRefresh }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [stats, setStats] = useState<StudyStats>({
    totalCards: 0,
    studiedToday: 0,
    streak: 0,
    accuracy: 0,
    totalStudyTime: 0,
  });

  useEffect(() => {
    const calculateStats = () => {
      const sessions = storage.getStudySessions();
      const today = new Date().toDateString();
      
      const todaySessions = sessions.filter(session => 
        new Date(session.date).toDateString() === today
      );

      const studiedToday = todaySessions.reduce((sum, session) => sum + session.cardsStudied, 0);
      const totalCorrect = sessions.reduce((sum, session) => sum + session.correctAnswers, 0);
      const totalStudied = sessions.reduce((sum, session) => sum + session.cardsStudied, 0);
      const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);

      // Calculate streak (simplified)
      let streak = 0;
      const sortedSessions = sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const uniqueDates = [...new Set(sortedSessions.map(s => new Date(s.date).toDateString()))];
      
      for (let i = 0; i < uniqueDates.length; i++) {
        const date = new Date(uniqueDates[i]);
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (date.toDateString() === expectedDate.toDateString()) {
          streak++;
        } else {
          break;
        }
      }

      setStats({
        totalCards: flashcards.length,
        studiedToday,
        streak,
        accuracy: totalStudied > 0 ? Math.round((totalCorrect / totalStudied) * 100) : 0,
        totalStudyTime: Math.floor(totalTime / 60), // Convert to minutes
      });
    };

    calculateStats();
  }, [flashcards]);

  const filteredCards = flashcards.filter(card => {
    const matchesSearch = card.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || card.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const cardsToReview = flashcards.filter(card => {
    if (!card.nextReview) return true;
    return new Date(card.nextReview) <= new Date();
  }).length;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Words</p>
                <p className="text-2xl font-bold">{stats.totalCards}</p>
              </div>
              <BookOpen className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Studied Today</p>
                <p className="text-2xl font-bold">{stats.studiedToday}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Streak</p>
                <p className="text-2xl font-bold">{stats.streak}</p>
              </div>
              <Flame className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">{stats.accuracy}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={onStartStudy} 
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-12"
          disabled={flashcards.length === 0}
        >
          <Brain className="h-5 w-5 mr-2" />
          Start Study Session
          {cardsToReview > 0 && (
            <Badge variant="secondary" className="ml-2">
              {cardsToReview}
            </Badge>
          )}
        </Button>
        
        <Button 
          onClick={onAddWord} 
          variant="outline" 
          className="flex-1 h-12"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Word
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Your Vocabulary ({filteredCards.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search words..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterDifficulty === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterDifficulty('all')}
              >
                All
              </Button>
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <Button
                  key={diff}
                  variant={filterDifficulty === diff ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterDifficulty(diff)}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Word List */}
          {filteredCards.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                {flashcards.length === 0 ? 'No words yet' : 'No words found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {flashcards.length === 0 
                  ? 'Start building your vocabulary by adding your first word!'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {flashcards.length === 0 && (
                <Button onClick={onAddWord}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Word
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{card.word}</h4>
                      <Badge className={getDifficultyColor(card.difficulty)}>
                        {card.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {card.meaning}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(card.dateAdded).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}