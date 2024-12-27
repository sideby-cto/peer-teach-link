import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { teacherId, selectedTime } = await req.json()
    console.log('Received request:', { teacherId, selectedTime })
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''  // Using service role key to bypass RLS
    )

    // Validate user
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      console.error('Auth error:', userError)
      throw new Error('Unauthorized')
    }

    console.log('Authenticated user:', user.id)

    // Get teacher profiles - using service role client to bypass RLS
    const { data: currentTeacher, error: currentTeacherError } = await supabaseClient
      .from('teachers')
      .select('*')
      .eq('id', user.id)
      .single()

    if (currentTeacherError || !currentTeacher) {
      console.error('Current teacher fetch error:', currentTeacherError)
      throw new Error('Current teacher not found')
    }

    const { data: otherTeacher, error: otherTeacherError } = await supabaseClient
      .from('teachers')
      .select('*')
      .eq('id', teacherId)
      .single()

    if (otherTeacherError || !otherTeacher) {
      console.error('Other teacher fetch error:', otherTeacherError)
      throw new Error('Other teacher not found')
    }

    console.log('Found teachers:', { currentTeacher: currentTeacher.id, otherTeacher: otherTeacher.id })

    // Create conversation record
    const { error: conversationError } = await supabaseClient
      .from('conversations')
      .insert({
        teacher1_id: user.id,
        teacher2_id: teacherId,
        status: 'scheduled',
        scheduled_at: selectedTime
      })

    if (conversationError) {
      console.error('Conversation creation error:', conversationError)
      throw new Error(`Failed to create conversation: ${conversationError.message}`)
    }

    // For now, return a temporary meeting link until Google Calendar is fixed
    return new Response(
      JSON.stringify({
        success: true,
        meetingLink: `https://meet.google.com/lookup/${crypto.randomUUID().split('-')[0]}`,
        eventId: crypto.randomUUID()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})