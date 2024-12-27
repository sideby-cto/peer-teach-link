import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'

export const validateUser = async (req: Request) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  const authHeader = req.headers.get('Authorization')!
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
    authHeader.replace('Bearer ', '')
  )

  if (userError || !user) {
    console.error('Auth error:', userError)
    throw new Error('Unauthorized')
  }

  return user
}

export const getTeachers = async (userId: string, teacherId: string) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  console.log('Fetching teachers with ids:', userId, teacherId)

  const { data: teachers, error: teachersError } = await supabaseClient
    .from('teachers')
    .select('*')
    .in('id', [userId, teacherId])

  if (teachersError) {
    console.error('Teachers fetch error:', teachersError)
    throw new Error('Failed to fetch teachers')
  }

  if (!teachers || teachers.length !== 2) {
    console.error('Teachers not found:', teachers)
    throw new Error('Teachers not found')
  }

  return {
    currentTeacher: teachers.find(t => t.id === userId),
    otherTeacher: teachers.find(t => t.id === teacherId)
  }
}