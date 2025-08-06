import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Trophy, Target, Zap, Brain, Users, BookOpen, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  username: string;
  display_name: string;
  blitz_elo: number;
  rapid_elo: number;
  bullet_elo: number;
  total_games: number;
  wins: number;
  losses: number;
  draws: number;
  ai_learning_preferences: any;
}

interface DashboardProps {
  onStartGame: (mode: 'ai' | 'online' | 'local', timeControl: number, gameType: string) => void;
  onOpenLessons: () => void;
}

export default function Dashboard({ onStartGame, onOpenLessons }: DashboardProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const winRate = profile ? 
    profile.total_games > 0 ? 
      Math.round((profile.wins / profile.total_games) * 100) : 0 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Crown className="h-8 w-8 text-primary" />
              Welcome back, {profile?.display_name || profile?.username || 'Chess Player'}!
            </h1>
            <p className="text-muted-foreground mt-1">Ready to improve your chess skills?</p>
          </div>
          <Badge variant="outline" className="text-sm">
            Total Games: {profile?.total_games || 0}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="chess-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Blitz Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.blitz_elo || 1500}</div>
              <p className="text-xs text-muted-foreground">3+0 games</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rapid Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.rapid_elo || 1500}</div>
              <p className="text-xs text-muted-foreground">10+0 games</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bullet Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.bullet_elo || 1500}</div>
              <p className="text-xs text-muted-foreground">1+0 games</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{winRate}%</div>
              <Progress value={winRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="play" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="play">Play Chess</TabsTrigger>
            <TabsTrigger value="learn">Learn</TabsTrigger>
            <TabsTrigger value="analyze">Analyze</TabsTrigger>
          </TabsList>

          <TabsContent value="play" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* AI Games */}
              <Card className="chess-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Play vs AI
                  </CardTitle>
                  <CardDescription>
                    Challenge Stockfish or Leela Chess Zero
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={() => onStartGame('ai', 180, 'blitz')}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Blitz (3+0)
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => onStartGame('ai', 600, 'rapid')}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Rapid (10+0)
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => onStartGame('ai', 60, 'bullet')}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Bullet (1+0)
                  </Button>
                </CardContent>
              </Card>

              {/* Online Games */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Play Online
                  </CardTitle>
                  <CardDescription>
                    Find opponents around the world
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full"
                    onClick={() => onStartGame('online', 180, 'blitz')}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Quick Match
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => onStartGame('online', 600, 'rapid')}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Rated Game
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Tournament (Soon)
                  </Button>
                </CardContent>
              </Card>

              {/* Local Game */}
              <Card>
                <CardHeader>
                  <CardTitle>Local Game</CardTitle>
                  <CardDescription>
                    Play with a friend on the same device
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => onStartGame('local', 600, 'casual')}
                  >
                    Start Local Game
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="learn" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="chess-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Interactive Lessons
                  </CardTitle>
                  <CardDescription>
                    AI-personalized chess lessons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={onOpenLessons}>
                    Start Learning
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Practice Puzzles
                  </CardTitle>
                  <CardDescription>
                    Solve tactical puzzles to improve
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analyze" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Analysis</CardTitle>
                <CardDescription>
                  Review your games with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Upload your games for deep AI analysis and personalized improvement suggestions.
                </p>
                <Button variant="outline" disabled>
                  Upload PGN (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground border-t pt-6">
          <p>Built by Goated People - An Open Source Organization</p>
          <p className="mt-1">Follow OpalDispatch on Discord for updates</p>
        </div>
      </div>
    </div>
  );
}