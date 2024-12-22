import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type Teacher = {
  id: string;
  created_at: string;
  email: string;
  full_name: string;
  title: string;
  school: string;
  experience_years: number;
  subjects: string[];
  bio: string;
  avatar_url?: string;
};

export type Post = {
  id: string;
  created_at: string;
  teacher_id: string;
  content: string;
  is_ai_generated: boolean;
  is_approved: boolean;
  original_transcript_id?: string;
  likes_count: number;
};

export type Conversation = {
  id: string;
  created_at: string;
  teacher1_id: string;
  teacher2_id: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduled_at: string;
};

export type Transcript = {
  id: string;
  created_at: string;
  conversation_id: string;
  content: string;
  ai_summary?: string;
};