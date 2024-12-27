import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { google } from 'https://esm.sh/googleapis@126.0.1'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { teacherId, teacherName, selectedTime } = await req.json()
    console.log('Received request:', { teacherId, teacherName, selectedTime })
    
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
      console.error('Auth error:', userError)
      throw new Error('Unauthorized')
    }

    // Get teacher profiles
    const { data: teachers, error: teachersError } = await supabaseClient
      .from('teachers')
      .select('*')
      .in('id', [user.id, teacherId])

    if (teachersError) {
      console.error('Teachers fetch error:', teachersError)
      throw new Error('Failed to fetch teachers')
    }

    if (!teachers || teachers.length !== 2) {
      console.error('Teachers not found:', teachers)
      throw new Error('Teachers not found')
    }

    const currentTeacher = teachers.find(t => t.id === user.id)
    const otherTeacher = teachers.find(t => t.id === teacherId)

    // Create calendar event
    const credentials = Deno.env.get('GOOGLE_CALENDAR_CREDENTIALS')
    if (!credentials) {
      console.error('Google Calendar credentials not found')
      throw new Error('Calendar configuration missing')
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(credentials),
      scopes: ['https://www.googleapis.com/auth/calendar']
    })

    const calendar = google.calendar({ version: 'v3', auth })

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

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: event,
    })

    console.log('Calendar event created:', response.data)

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

    return new Response(
      JSON.stringify({
        success: true,
        meetingLink: response.data.hangoutLink,
        eventId: response.data.id
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