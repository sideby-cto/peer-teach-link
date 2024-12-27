import { google } from 'https://esm.sh/v126/googleapis@126.0.1'

export const validateCredentials = (credentialsString: string | null) => {
  if (!credentialsString) {
    console.error('Google Calendar credentials not found')
    throw new Error('Calendar configuration missing')
  }

  try {
    const credentials = JSON.parse(credentialsString)
    const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email']
    const missingFields = requiredFields.filter(field => !credentials[field])
    
    if (missingFields.length > 0) {
      console.error('Missing required fields in credentials:', missingFields)
      throw new Error(`Invalid calendar configuration: missing ${missingFields.join(', ')}`)
    }

    return credentials
  } catch (error) {
    console.error('Failed to parse credentials:', error)
    throw new Error('Invalid calendar configuration: failed to parse JSON')
  }
}

export const createCalendarEvent = async (credentials: any, currentTeacher: any, otherTeacher: any, selectedTime: string) => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
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
    return response
  } catch (error) {
    console.error('Failed to create calendar event:', error)
    throw error
  }
}