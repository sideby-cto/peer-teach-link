import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, createResponse } from './cors.ts'
import { validateUser, getTeachers } from './auth.ts'
import { validateCredentials, createCalendarEvent } from './calendar.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      }
    });
  }

  try {
    const { teacherId, teacherName, selectedTime } = await req.json();
    console.log('Received request:', { teacherId, teacherName, selectedTime });
    
    // Create Supabase client and validate user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const user = await validateUser(req);
    const { currentTeacher, otherTeacher } = await getTeachers(supabaseClient, user.id, teacherId);
    
    // Get and validate Google Calendar credentials
    const credentials = validateCredentials(Deno.env.get('GOOGLE_CALENDAR_CREDENTIALS'));
    
    // Create calendar event
    const calendarEvent = await createCalendarEvent(
      credentials,
      currentTeacher,
      otherTeacher,
      selectedTime
    );

    // Update the conversation in Supabase
    const { error: conversationError } = await supabaseClient
      .from('conversations')
      .insert({
        teacher1_id: user.id,
        teacher2_id: teacherId,
        status: 'scheduled',
        scheduled_at: selectedTime
      });

    if (conversationError) {
      console.error('Conversation creation error:', conversationError);
      throw new Error(`Failed to create conversation: ${conversationError.message}`);
    }

    return createResponse({ 
      success: true,
      meetingLink: calendarEvent.data.hangoutLink,
      eventId: calendarEvent.data.id
    });
  } catch (error) {
    console.error('Function error:', error);
    return createResponse(
      { error: error.message },
      error.message === 'Unauthorized' ? 401 : 500
    );
  }
});