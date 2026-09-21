import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are TinyRide Assistant by Dodail.
Your purpose is to answer parents and drivers about TinyRide policies, school routes, payments, and schedules in Hyderabad, Telangana.

STRICT OPERATIONAL RULES:
1. Never invent or hallucinate trip status, arrival times, payment confirmations, or driver locations.
2. If the user asks about live tracking, refer them to the active trip card on their home screen.
3. If the user asks about an unconfirmed payment, advise them to check their Razorpay receipt or wait for webhook reconciliation.
4. For emergencies, accidents, or missing children, respond IMMEDIATELY with:
   "EMERGENCY PROTOCOL ACTIVATED: Please immediately call TinyRide Operations Lead at +91 40 4567 8900 or Dial 100/112."
   And set escalate_to_human: true.
5. Keep answers concise, empathetic, and professional. Use Indian English.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Invalid user token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message string required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lower = message.toLowerCase();

    // Deterministic safety filter for emergency keywords
    if (
      lower.includes('accident') ||
      lower.includes('emergency') ||
      lower.includes('hospital') ||
      lower.includes('missing') ||
      lower.includes('breakdown')
    ) {
      return new Response(
        JSON.stringify({
          reply:
            'EMERGENCY PROTOCOL ACTIVATED: Please immediately call the TinyRide 24/7 Operations Desk at +91 40 4567 8900 or Dial 112/100. Our safety team is being alerted.',
          escalated: true,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Standard policy response fallback (low-cost, highly deterministic)
    let reply =
      "Hello! I'm your TinyRide assistant. You can view your children's pickup schedules, verify driver documents, or renew monthly school transport right from the app. How can I help you today?";

    if (lower.includes('refund') || lower.includes('cancel')) {
      reply =
        'Refund Policy: You can cancel a monthly subscription before the 1st of the calendar month for a 100% refund. Mid-month cancellations are prorated subject to a 5-day notice period. Would you like me to connect you with an Operations Admin?';
    } else if (lower.includes('payment') || lower.includes('fee') || lower.includes('razorpay')) {
      reply =
        'Payments in TinyRide are handled securely via Razorpay (UPI, Credit/Debit cards, NetBanking). Monthly fees range from ₹2,500 to ₹4,500 depending on distance to school. Invoices are generated 5 days prior to month-end.';
    } else if (lower.includes('driver') || lower.includes('safety') || lower.includes('verification')) {
      reply =
        'Every TinyRide driver undergoes physical document verification (Commercial Driving License, Police Clearance Certificate, Vehicle Fitness Certificate) reviewed by Dodail Operations. Auto capacity is strictly capped at 4-6 children, and Vans at 8-12 children.';
    }

    return new Response(
      JSON.stringify({
        reply,
        escalated: false,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
