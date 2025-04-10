
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body - the API Key will be used for authentication
    const { message, apiKey, userId } = await req.json()
    
    // Validate required parameters
    if (!message || !apiKey || !userId) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: message, apiKey, and userId are required' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log(`Tasker request: Processing emergency SMS for user ${userId}`)

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Verify the API key against user's stored API key
    const { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('tasker_api_key')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user profile:', userError)
      throw new Error('Failed to verify user credentials')
    }

    if (!userData?.tasker_api_key || userData.tasker_api_key !== apiKey) {
      console.error('Invalid API key provided')
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid API key' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Fetch emergency contacts for this user
    const { data: contacts, error: contactsError } = await supabaseAdmin
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: true })

    if (contactsError) {
      console.error('Error fetching contacts:', contactsError)
      throw contactsError
    }

    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No emergency contacts found for this user' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    console.log(`Found ${contacts.length} emergency contacts to notify via Tasker`)

    // Get Twilio credentials from environment variables
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    console.log(`Twilio credentials available: ${!!twilioAccountSid && !!twilioAuthToken && !!twilioPhoneNumber}`)

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Missing Twilio credentials in environment variables')
    }

    // Send SMS to each contact
    const results = []
    let sentCount = 0

    for (const contact of contacts) {
      try {
        // Format phone number (remove spaces, dashes, etc.)
        let formattedPhone = contact.phone_number.replace(/\s+|-|\(|\)|\.|\+/g, '')
        
        console.log(`Original phone number: ${contact.phone_number}, after initial formatting: ${formattedPhone}`)
        
        // Ensure phone number has India country code
        if (!formattedPhone.startsWith('+')) {
          // Add India country code if missing
          if (formattedPhone.startsWith('91')) {
            formattedPhone = `+${formattedPhone}`
          } else {
            formattedPhone = `+91${formattedPhone}`
          }
        } else if (!formattedPhone.startsWith('+91')) {
          // If it has another country code, replace it with India's code
          formattedPhone = `+91${formattedPhone.substring(1)}`
        }
        
        console.log(`Final formatted phone number: ${formattedPhone}`)
        
        // Validate phone number format (must be E.164 format for Twilio)
        const phoneRegex = /^\+[1-9]\d{1,14}$/
        if (!phoneRegex.test(formattedPhone)) {
          throw new Error(`Invalid phone number format: ${formattedPhone}`)
        }

        console.log(`Sending SMS from Tasker to ${contact.name} at ${formattedPhone}`)

        // Call Twilio API to send SMS
        const twilioResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            },
            body: new URLSearchParams({
              To: formattedPhone,
              From: twilioPhoneNumber,
              Body: message,
            }),
          }
        )

        const twilioData = await twilioResponse.json()
        console.log('Twilio API response:', JSON.stringify(twilioData))
        
        if (twilioResponse.ok) {
          results.push({
            contact: contact.name,
            phone: contact.phone_number,
            formattedPhone: formattedPhone,
            success: true,
            messageId: twilioData.sid,
          })
          sentCount++
        } else {
          results.push({
            contact: contact.name,
            phone: contact.phone_number,
            formattedPhone: formattedPhone,
            success: false,
            error: twilioData.message || 'Failed to send SMS',
            twilioResponseCode: twilioResponse.status,
            twilioError: twilioData
          })
        }
      } catch (err) {
        console.error(`Error sending Tasker SMS to ${contact.name}:`, err)
        results.push({
          contact: contact.name,
          phone: contact.phone_number,
          success: false,
          error: err.message || 'Unknown error',
        })
      }
    }

    // Log the SMS event in the database
    await supabaseAdmin
      .from('sms_logs')
      .insert({
        user_id: userId,
        message: message,
        sent_count: sentCount,
        total_contacts: contacts.length,
        status: sentCount > 0 ? (sentCount === contacts.length ? 'success' : 'partial_success') : 'failed',
        results: results,
        source: 'tasker',
      })

    return new Response(
      JSON.stringify({
        success: true,
        sentCount: sentCount,
        totalContacts: contacts.length,
        results: results,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in Tasker emergency SMS function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
