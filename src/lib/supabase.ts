import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avphywyhlxajyhqudkts.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cGh5d3lobHhhanlocXVka3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4OTM1MDEsImV4cCI6MjA1MDQ2OTUwMX0.wwNFD49QaoTOc36E37MRpBtwptSYi5zrKmUSqPSLt04';

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