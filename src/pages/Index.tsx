import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Dashboard from '@/components/dashboard/Dashboard';
import ChessBoard from '@/components/chess/ChessBoard';
import LessonsView from '@/components/lessons/LessonsView';
import { Button } from '@/components/ui/button';
import { Crown, Brain, Users, BookOpen } from 'lucide-react';

type AppView = 'landing' | 'dashboard' | 'game' | 'lessons';
type GameConfig = {
  mode: 'ai' | 'online' | 'local';
  timeControl: number;
  gameType: string;
};

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);

  useEffect(() => {
    if (!loading) {
      if (user) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('landing');
      }
    }
  }, [user, loading]);

  const handleNavigate = (page: 'dashboard' | 'auth') => {
    if (page === 'auth') {
      navigate('/auth');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleStartGame = (mode: 'ai' | 'online' | 'local', timeControl: number, gameType: string) => {
    setGameConfig({ mode, timeControl, gameType });
    setCurrentView('game');
  };

  const handleGameEnd = (result: string, moves: string[]) => {
    // Save game to database here
    console.log('Game ended:', result, moves);
    setCurrentView('dashboard');
    setGameConfig(null);
  };

  const handleOpenLessons = () => {
    setCurrentView('lessons');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setGameConfig(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Landing page for non-authenticated users
  if (currentView === 'landing' && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
        <Header onNavigate={handleNavigate} />
        
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <Crown className="h-24 w-24 text-primary chess-glow" />
            </div>
            
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ChessNerd
            </h1>
            
            <p className="text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Master chess with AI-powered learning, play against top engines like Stockfish and Leela Chess Zero, 
              and compete with players worldwide.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-6 rounded-lg bg-card border">
                <Brain className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">AI-Powered Learning</h3>
                <p className="text-muted-foreground">
                  Personalized lessons that adapt to your playing style and weaknesses
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-card border">
                <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Play Online</h3>
                <p className="text-muted-foreground">
                  Compete in blitz, rapid, and bullet games with anti-cheat protection
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-card border">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Interactive Lessons</h3>
                <p className="text-muted-foreground">
                  Learn from mistakes with AI analysis and improvement suggestions
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="chess-glow">
                Start Playing Now
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                Learn More
              </Button>
            </div>
            
            <div className="mt-16 text-center text-sm text-muted-foreground">
              <p>Built by Goated People - An Open Source Organization</p>
              <p className="mt-1">Follow OpalDispatch on Discord</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main application views for authenticated users
  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={handleNavigate} />
      
      {currentView === 'dashboard' && (
        <Dashboard 
          onStartGame={handleStartGame}
          onOpenLessons={handleOpenLessons}
        />
      )}
      
      {currentView === 'game' && gameConfig && (
        <div className="pt-4">
          <div className="container mx-auto px-4 mb-4">
            <Button variant="ghost" onClick={handleBackToDashboard}>
              ← Back to Dashboard
            </Button>
          </div>
          <ChessBoard
            gameMode={gameConfig.mode}
            timeControl={gameConfig.timeControl}
            onGameEnd={handleGameEnd}
          />
        </div>
      )}
      
      {currentView === 'lessons' && (
        <LessonsView onBack={handleBackToDashboard} />
      )}
    </div>
  );
};

export default Index;
