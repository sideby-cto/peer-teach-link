import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './cors.ts'
import { validateUser, getTeachers } from './auth.ts'
import { validateCredentials, createCalendarEvent } from './calendar.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { teacherId, teacherName, selectedTime } = await req.json()
    console.log('Received request:', { teacherId, teacherName, selectedTime })
    
    const user = await validateUser(req)
    const { currentTeacher, otherTeacher } = await getTeachers(user.id, teacherId)
    
    if (!currentTeacher || !otherTeacher) {
      console.error('Missing teacher profiles:', { currentTeacher, otherTeacher })
      throw new Error('Teacher profiles not found')
    }

    const credentials = validateCredentials(Deno.env.get('GOOGLE_CALENDAR_CREDENTIALS'))
    
    const calendarEvent = await createCalendarEvent(
      credentials,
      currentTeacher,
      otherTeacher,
      selectedTime
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: conversationError } = await supabaseAdmin
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

    return new Response(
      JSON.stringify({
        success: true,
        meetingLink: calendarEvent.data.hangoutLink,
        eventId: calendarEvent.data.id
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