export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Plan = 'free' | 'pro' | 'triple_crown'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          tier: Plan
          tier_expires_at: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          tier?: Plan
          tier_expires_at?: string | null
          stripe_customer_id?: string | null
        }
        Update: {
          tier?: Plan
          tier_expires_at?: string | null
          stripe_customer_id?: string | null
        }
      }
      certified_users: {
        Row: {
          id: string
          user_id: string
          full_name: string
          hspa_member: string
          cert: 'CRCST' | 'CHL' | 'CER' | 'CIS'
          pass_date: string
          claimed_at: string
          next_cert_started: boolean
        }
        Insert: {
          user_id: string
          full_name: string
          hspa_member: string
          cert: 'CRCST' | 'CHL' | 'CER' | 'CIS'
          pass_date: string
        }
        Update: {
          next_cert_started?: boolean
        }
      }
      crcst_quiz_results: {
        Row: {
          id: string
          user_id: string
          score: number
          total_questions: number
          percentage: number
          difficulty: string
          created_at: string
        }
        Insert: {
          user_id: string
          score: number
          total_questions: number
          percentage: number
          difficulty: string
        }
        Update: Record<string, never>
      }
      chl_quiz_results: {
        Row: {
          id: string
          user_id: string
          score: number
          total_questions: number
          percentage: number
          difficulty: string
          created_at: string
        }
        Insert: {
          user_id: string
          score: number
          total_questions: number
          percentage: number
          difficulty: string
        }
        Update: Record<string, never>
      }
      cer_quiz_results: {
        Row: {
          id: string
          user_id: string
          score: number
          total_questions: number
          percentage: number
          difficulty: string
          created_at: string
        }
        Insert: {
          user_id: string
          score: number
          total_questions: number
          percentage: number
          difficulty: string
        }
        Update: Record<string, never>
      }
      quiz_sessions: {
        Row: {
          id: string
          user_id: string
          quiz_mode: 'practice' | 'mock' | 'flashcard' | 'custom'
          question_ids: Json
          answers: Json
          current_question_index: number
          selected_domains: Json | null
          difficulty: string | null
          elapsed_time_seconds: number
          started_at: string
          paused_at: string | null
          is_paused: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          quiz_mode: 'practice' | 'mock' | 'flashcard' | 'custom'
          question_ids: Json
          answers: Json
          current_question_index?: number
          selected_domains?: Json | null
          difficulty?: string | null
          elapsed_time_seconds?: number
          is_paused?: boolean
        }
        Update: {
          answers?: Json
          current_question_index?: number
          elapsed_time_seconds?: number
          is_paused?: boolean
          paused_at?: string | null
          updated_at?: string
        }
      }
      daily_usage: {
        Row: {
          id: string
          user_id: string
          created_at: string
          questions_attempted: number
          ai_chats_used: number
        }
        Insert: {
          user_id: string
          questions_attempted?: number
          ai_chats_used?: number
        }
        Update: Record<string, never>
      }
      feedback: {
        Row: {
          id: string
          user_id: string | null
          type: string
          message: string
          email: string | null
          page_url: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          user_id?: string | null
          type: string
          message: string
          email?: string | null
          page_url?: string | null
          user_agent?: string | null
        }
        Update: Record<string, never>
      }
    }
    Functions: {
      get_hourly_usage: {
        Args: { p_user_id: string }
        Returns: { questions_count: number; chats_count: number }[]
      }
      get_daily_ai_chat_usage: {
        Args: { p_user_id: string }
        Returns: number
      }
      insert_daily_usage: {
        Args: { p_user_id: string; p_questions: number; p_chats: number }
        Returns: void
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Profile = Tables<'profiles'>
export type CertifiedUser = Tables<'certified_users'>
export type QuizSession = Tables<'quiz_sessions'>
