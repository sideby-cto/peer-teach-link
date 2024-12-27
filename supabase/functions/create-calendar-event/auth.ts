import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from './cors';

export const validateUser = async (req: Request) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  const authHeader = req.headers.get('Authorization')!;
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (userError || !user) {
    console.error('Auth error:', userError);
    throw new Error('Unauthorized');
  }

  return user;
};

export const getTeachers = async (supabaseClient: any, userId: string, teacherId: string) => {
  const { data: teachers, error: teachersError } = await supabaseClient
    .from('teachers')
    .select('*')
    .in('id', [userId, teacherId]);

  if (teachersError || !teachers || teachers.length !== 2) {
    console.error('Teachers fetch error:', teachersError);
    throw new Error('Teachers not found');
  }

  return {
    currentTeacher: teachers.find(t => t.id === userId),
    otherTeacher: teachers.find(t => t.id === teacherId)
  };
};