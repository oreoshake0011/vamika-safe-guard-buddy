
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
    const { message, userId } = await req.json()
    
    if (!message || !userId) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: message and userId are required' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Fetch emergency contacts for this user
    const { data: contacts, error: contactsError } = await supabaseAdmin
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: true })

    if (contactsError) {
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

    // Get Twilio credentials from environment variables
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Missing Twilio credentials in environment variables')
    }

    // Send SMS to each contact
    const results = []
    let sentCount = 0

    for (const contact of contacts) {
      try {
        // Format phone number (remove spaces, dashes, etc.)
        const formattedPhone = contact.phone_number.replace(/\s+|-|\(|\)|\.|\+/g, '')
        const phoneNumber = formattedPhone.startsWith('+') ? formattedPhone : `+${formattedPhone}`

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
              To: phoneNumber,
              From: twilioPhoneNumber,
              Body: message,
            }),
          }
        )

        const twilioData = await twilioResponse.json()
        
        if (twilioResponse.ok) {
          results.push({
            contact: contact.name,
            phone: contact.phone_number,
            success: true,
            messageId: twilioData.sid,
          })
          sentCount++
        } else {
          results.push({
            contact: contact.name,
            phone: contact.phone_number,
            success: false,
            error: twilioData.message || 'Failed to send SMS',
          })
        }
      } catch (err) {
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
        status: sentCount > 0 ? 'partial_success' : 'failed',
        results: results,
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
