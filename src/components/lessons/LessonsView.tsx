import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Clock, CheckCircle, Star, ArrowLeft, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  content: any;
}

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
  score: number;
  attempts: number;
}

interface LessonsViewProps {
  onBack: () => void;
}

export default function LessonsView({ onBack }: LessonsViewProps) {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLessons();
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('is_active', true)
        .order('difficulty', { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Error",
        description: "Failed to load lessons",
        variant: "destructive",
      });
    }
  };

  const fetchProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLesson = async (lesson: Lesson) => {
    if (!user) return;

    try {
      // Record lesson attempt
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          attempts: 1,
          last_attempt_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSelectedLesson(lesson);
      toast({
        title: "Lesson Started",
        description: `Starting: ${lesson.title}`,
      });
    } catch (error) {
      console.error('Error starting lesson:', error);
      toast({
        title: "Error",
        description: "Failed to start lesson",
        variant: "destructive",
      });
    }
  };

  const completeLesson = async (lesson: Lesson, score: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          completed: true,
          score,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;

      await fetchProgress();
      setSelectedLesson(null);
      
      toast({
        title: "Lesson Completed!",
        description: `Score: ${score}% - Great work!`,
      });
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-orange-500';
      case 'master': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getLessonProgress = (lessonId: string) => {
    return progress.find(p => p.lesson_id === lessonId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (selectedLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedLesson(null)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>
          
          <Card className="chess-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                {selectedLesson.title}
              </CardTitle>
              <CardDescription>{selectedLesson.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Interactive Lesson Content</h3>
                <p className="text-muted-foreground mb-4">
                  This is where the interactive chess lesson would be displayed.
                  In a full implementation, this would include:
                </p>
                <ul className="text-left max-w-md mx-auto space-y-2 text-sm">
                  <li>• Interactive chess positions</li>
                  <li>• Step-by-step instructions</li>
                  <li>• Practice exercises</li>
                  <li>• AI-powered feedback</li>
                  <li>• Progress tracking</li>
                </ul>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={() => completeLesson(selectedLesson, 85)}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Lesson
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedLesson(null)}
                >
                  Exit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              Chess Lessons
            </h1>
            <p className="text-muted-foreground">Master chess with AI-personalized lessons</p>
          </div>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{progress.filter(p => p.completed).length}</div>
                <p className="text-sm text-muted-foreground">Lessons Completed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{lessons.length}</div>
                <p className="text-sm text-muted-foreground">Total Lessons</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {progress.length > 0 ? Math.round(progress.reduce((acc, p) => acc + (p.score || 0), 0) / progress.length) : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
            </div>
            <Progress 
              value={(progress.filter(p => p.completed).length / lessons.length) * 100} 
              className="mt-4" 
            />
          </CardContent>
        </Card>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson) => {
            const lessonProgress = getLessonProgress(lesson.id);
            const isCompleted = lessonProgress?.completed || false;
            
            return (
              <Card 
                key={lesson.id} 
                className={`transition-all hover:shadow-lg ${isCompleted ? 'ring-2 ring-green-500' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg leading-tight">
                      {lesson.title}
                    </CardTitle>
                    {isCompleted && (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {lesson.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="secondary" 
                      className={`${getDifficultyColor(lesson.difficulty)} text-white`}
                    >
                      {lesson.difficulty}
                    </Badge>
                    <Badge variant="outline">{lesson.category}</Badge>
                  </div>
                  
                  {lessonProgress && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Attempts: {lessonProgress.attempts}</span>
                        {lessonProgress.score && (
                          <span>Best: {lessonProgress.score}%</span>
                        )}
                      </div>
                      {lessonProgress.score && (
                        <Progress value={lessonProgress.score} className="h-2" />
                      )}
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    variant={isCompleted ? "outline" : "default"}
                    onClick={() => startLesson(lesson)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isCompleted ? 'Review' : 'Start'} Lesson
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {lessons.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No lessons available</h3>
              <p className="text-muted-foreground">
                Lessons are being prepared. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}