import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3"

serve(async (req) => {
  try {
    const { teacherId, teacherName, selectedTime } = await req.json()
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the current user's information
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    // Get both teachers' information
    const { data: teachers, error: teachersError } = await supabaseClient
      .from('teachers')
      .select('*')
      .in('id', [user.id, teacherId])

    if (teachersError || !teachers || teachers.length !== 2) {
      return new Response(
        JSON.stringify({ error: 'Teachers not found' }),
        { status: 404 }
      )
    }

    const currentTeacher = teachers.find(t => t.id === user.id)
    const otherTeacher = teachers.find(t => t.id === teacherId)

    // Create calendar event using Google Calendar API
    const event = {
      summary: `20min Chat: ${currentTeacher?.full_name} & ${otherTeacher?.full_name}`,
      description: `A 20-minute conversation between teachers on sideby.`,
      start: {
        dateTime: selectedTime,
        timeZone: 'UTC'
      },
      end: {
        dateTime: new Date(new Date(selectedTime).getTime() + 20 * 60000).toISOString(),
        timeZone: 'UTC'
      },
      attendees: [
        { email: currentTeacher?.email },
        { email: otherTeacher?.email }
      ],
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" }
        }
      }
    }

    const response = await fetch(`${GOOGLE_CALENDAR_API}/calendars/primary/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GOOGLE_CALENDAR_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event)
    })

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${await response.text()}`)
    }

    const calendarEvent = await response.json()

    // Update the conversation in Supabase with the scheduled time
    const { error: conversationError } = await supabaseClient
      .from('conversations')
      .update({ 
        status: 'scheduled',
        scheduled_at: selectedTime
      })
      .eq('teacher1_id', user.id)
      .eq('teacher2_id', teacherId)

    if (conversationError) {
      throw new Error(`Failed to update conversation: ${conversationError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        meetingLink: calendarEvent.hangoutLink,
        eventId: calendarEvent.id
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
})