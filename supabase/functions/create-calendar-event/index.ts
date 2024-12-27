import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { teacherId, selectedTime } = await req.json()
    console.log('Received request:', { teacherId, selectedTime })
    
    // Validate user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Get teacher profiles
    const { data: teachers, error: teachersError } = await supabaseClient
      .from('teachers')
      .select('*')
      .in('id', [user.id, teacherId])

    if (teachersError || !teachers || teachers.length !== 2) {
      throw new Error('Teachers not found')
    }

    const currentTeacher = teachers.find(t => t.id === user.id)
    const otherTeacher = teachers.find(t => t.id === teacherId)

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