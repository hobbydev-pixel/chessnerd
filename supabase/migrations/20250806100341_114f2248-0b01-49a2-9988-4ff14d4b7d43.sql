-- Create user profiles table with chess-specific data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  blitz_elo INTEGER DEFAULT 1500,
  rapid_elo INTEGER DEFAULT 1500,
  bullet_elo INTEGER DEFAULT 1500,
  total_games INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  ai_learning_preferences JSONB DEFAULT '{"difficulty": "medium", "preferred_openings": [], "weakness_areas": []}',
  preferred_time_controls TEXT[] DEFAULT ARRAY['blitz', 'rapid'],
  anti_cheat_score DECIMAL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create games table for match history
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  white_player_id UUID REFERENCES public.profiles(user_id),
  black_player_id UUID REFERENCES public.profiles(user_id),
  game_type TEXT NOT NULL CHECK (game_type IN ('blitz', 'rapid', 'bullet', 'ai')),
  time_control INTEGER NOT NULL, -- in seconds
  increment INTEGER DEFAULT 0, -- increment in seconds
  result TEXT CHECK (result IN ('white_wins', 'black_wins', 'draw', 'abandoned')),
  moves JSONB NOT NULL DEFAULT '[]',
  final_position TEXT, -- FEN notation
  white_elo_before INTEGER,
  black_elo_before INTEGER,
  white_elo_after INTEGER,
  black_elo_after INTEGER,
  ai_engine TEXT, -- stockfish, leela, etc
  ai_difficulty INTEGER,
  analysis JSONB, -- post-game AI analysis
  cheat_detection_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'master')),
  category TEXT NOT NULL, -- opening, middlegame, endgame, tactics, etc
  content JSONB NOT NULL, -- lesson structure and positions
  ai_personalization_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user lesson progress table
CREATE TABLE public.user_lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  score INTEGER, -- percentage or points
  attempts INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  ai_recommendations JSONB DEFAULT '{}',
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create AI analysis table for personalized learning
CREATE TABLE public.ai_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('move_analysis', 'game_review', 'weakness_detection', 'improvement_suggestion')),
  position_fen TEXT,
  move_played TEXT,
  best_move TEXT,
  evaluation DECIMAL,
  explanation TEXT,
  learning_points TEXT[],
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Games policies
CREATE POLICY "Users can view their own games" ON public.games FOR SELECT USING (
  auth.uid() = white_player_id OR auth.uid() = black_player_id
);
CREATE POLICY "Users can insert their own games" ON public.games FOR INSERT WITH CHECK (
  auth.uid() = white_player_id OR auth.uid() = black_player_id
);
CREATE POLICY "Users can update their own games" ON public.games FOR UPDATE USING (
  auth.uid() = white_player_id OR auth.uid() = black_player_id
);

-- Lessons policies (public read, admin write)
CREATE POLICY "Anyone can view active lessons" ON public.lessons FOR SELECT USING (is_active = true);

-- User lesson progress policies
CREATE POLICY "Users can view their own progress" ON public.user_lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_lesson_progress FOR UPDATE USING (auth.uid() = user_id);

-- AI analysis policies
CREATE POLICY "Users can view their own analysis" ON public.ai_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own analysis" ON public.ai_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions for automatic profile creation and updates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'display_name'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some starter lessons
INSERT INTO public.lessons (title, description, difficulty, category, content) VALUES
('Basic Chess Rules', 'Learn how pieces move and basic game rules', 'beginner', 'basics', '{"positions": [], "instructions": [], "quizzes": []}'),
('Pawn Endgames', 'Master the fundamentals of pawn endgames', 'intermediate', 'endgame', '{"positions": [], "instructions": [], "quizzes": []}'),
('King and Queen vs King', 'Learn the basic checkmate pattern', 'beginner', 'endgame', '{"positions": [], "instructions": [], "quizzes": []}'),
('Pin Tactics', 'Understand and execute pin tactics', 'intermediate', 'tactics', '{"positions": [], "instructions": [], "quizzes": []}'),
('Italian Game Opening', 'Learn the classical Italian Game opening', 'intermediate', 'opening', '{"positions": [], "instructions": [], "quizzes": []}');