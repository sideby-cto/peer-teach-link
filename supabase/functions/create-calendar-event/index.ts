import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { google } from 'npm:googleapis@126';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      }
    })
  }

  try {
    const { teacherId, teacherName, selectedTime } = await req.json()
    console.log('Received request:', { teacherId, teacherName, selectedTime })
    
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
      console.error('Auth error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get both teachers' information
    const { data: teachers, error: teachersError } = await supabaseClient
      .from('teachers')
      .select('*')
      .in('id', [user.id, teacherId])

    if (teachersError || !teachers || teachers.length !== 2) {
      console.error('Teachers fetch error:', teachersError)
      return new Response(
        JSON.stringify({ error: 'Teachers not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const currentTeacher = teachers.find(t => t.id === user.id)
    const otherTeacher = teachers.find(t => t.id === teacherId)

    // Get and parse Google Calendar credentials
    const credentialsString = Deno.env.get('GOOGLE_CALENDAR_CREDENTIALS')
    if (!credentialsString) {
      console.error('Google Calendar credentials not found')
      return new Response(
        JSON.stringify({ error: 'Calendar configuration missing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Raw credentials string:', credentialsString.substring(0, 50) + '...')

    let credentials;
    try {
      credentials = JSON.parse(credentialsString)
      
      // Validate required fields in credentials
      const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email']
      const missingFields = requiredFields.filter(field => !credentials[field])
      
      if (missingFields.length > 0) {
        console.error('Missing required fields in credentials:', missingFields)
        return new Response(
          JSON.stringify({ error: `Invalid calendar configuration: missing ${missingFields.join(', ')}` }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Successfully parsed credentials with fields:', Object.keys(credentials))
    } catch (error) {
      console.error('Failed to parse credentials:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid calendar configuration: failed to parse JSON' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Set up Google Calendar API
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar']
    })

    const calendar = google.calendar({ version: 'v3', auth })

    // Create calendar event
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

    console.log('Creating calendar event:', event)

    try {
      const calendarEvent = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: event,
      })

      console.log('Calendar event created:', calendarEvent.data)

      // Update the conversation in Supabase
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
          meetingLink: calendarEvent.data.hangoutLink,
          eventId: calendarEvent.data.id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } catch (error) {
      console.error('Calendar API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create calendar event: ' + error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})