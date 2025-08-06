export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_analysis: {
        Row: {
          analysis_type: string
          best_move: string | null
          created_at: string
          difficulty_rating: number | null
          evaluation: number | null
          explanation: string | null
          game_id: string | null
          id: string
          learning_points: string[] | null
          move_played: string | null
          position_fen: string | null
          user_id: string
        }
        Insert: {
          analysis_type: string
          best_move?: string | null
          created_at?: string
          difficulty_rating?: number | null
          evaluation?: number | null
          explanation?: string | null
          game_id?: string | null
          id?: string
          learning_points?: string[] | null
          move_played?: string | null
          position_fen?: string | null
          user_id: string
        }
        Update: {
          analysis_type?: string
          best_move?: string | null
          created_at?: string
          difficulty_rating?: number | null
          evaluation?: number | null
          explanation?: string | null
          game_id?: string | null
          id?: string
          learning_points?: string[] | null
          move_played?: string | null
          position_fen?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          ai_difficulty: number | null
          ai_engine: string | null
          analysis: Json | null
          black_elo_after: number | null
          black_elo_before: number | null
          black_player_id: string | null
          cheat_detection_data: Json | null
          created_at: string
          ended_at: string | null
          final_position: string | null
          game_type: string
          id: string
          increment: number | null
          moves: Json
          result: string | null
          time_control: number
          white_elo_after: number | null
          white_elo_before: number | null
          white_player_id: string | null
        }
        Insert: {
          ai_difficulty?: number | null
          ai_engine?: string | null
          analysis?: Json | null
          black_elo_after?: number | null
          black_elo_before?: number | null
          black_player_id?: string | null
          cheat_detection_data?: Json | null
          created_at?: string
          ended_at?: string | null
          final_position?: string | null
          game_type: string
          id?: string
          increment?: number | null
          moves?: Json
          result?: string | null
          time_control: number
          white_elo_after?: number | null
          white_elo_before?: number | null
          white_player_id?: string | null
        }
        Update: {
          ai_difficulty?: number | null
          ai_engine?: string | null
          analysis?: Json | null
          black_elo_after?: number | null
          black_elo_before?: number | null
          black_player_id?: string | null
          cheat_detection_data?: Json | null
          created_at?: string
          ended_at?: string | null
          final_position?: string | null
          game_type?: string
          id?: string
          increment?: number | null
          moves?: Json
          result?: string | null
          time_control?: number
          white_elo_after?: number | null
          white_elo_before?: number | null
          white_player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_black_player_id_fkey"
            columns: ["black_player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "games_white_player_id_fkey"
            columns: ["white_player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lessons: {
        Row: {
          ai_personalization_data: Json | null
          category: string
          content: Json
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_personalization_data?: Json | null
          category: string
          content: Json
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_personalization_data?: Json | null
          category?: string
          content?: Json
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_learning_preferences: Json | null
          anti_cheat_score: number | null
          avatar_url: string | null
          bio: string | null
          blitz_elo: number | null
          bullet_elo: number | null
          created_at: string
          display_name: string | null
          draws: number | null
          id: string
          losses: number | null
          preferred_time_controls: string[] | null
          rapid_elo: number | null
          total_games: number | null
          updated_at: string
          user_id: string
          username: string | null
          wins: number | null
        }
        Insert: {
          ai_learning_preferences?: Json | null
          anti_cheat_score?: number | null
          avatar_url?: string | null
          bio?: string | null
          blitz_elo?: number | null
          bullet_elo?: number | null
          created_at?: string
          display_name?: string | null
          draws?: number | null
          id?: string
          losses?: number | null
          preferred_time_controls?: string[] | null
          rapid_elo?: number | null
          total_games?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
          wins?: number | null
        }
        Update: {
          ai_learning_preferences?: Json | null
          anti_cheat_score?: number | null
          avatar_url?: string | null
          bio?: string | null
          blitz_elo?: number | null
          bullet_elo?: number | null
          created_at?: string
          display_name?: string | null
          draws?: number | null
          id?: string
          losses?: number | null
          preferred_time_controls?: string[] | null
          rapid_elo?: number | null
          total_games?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
          wins?: number | null
        }
        Relationships: []
      }
      user_lesson_progress: {
        Row: {
          ai_recommendations: Json | null
          attempts: number | null
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          last_attempt_at: string | null
          lesson_id: string
          score: number | null
          time_spent: number | null
          user_id: string
        }
        Insert: {
          ai_recommendations?: Json | null
          attempts?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          lesson_id: string
          score?: number | null
          time_spent?: number | null
          user_id: string
        }
        Update: {
          ai_recommendations?: Json | null
          attempts?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          lesson_id?: string
          score?: number | null
          time_spent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
