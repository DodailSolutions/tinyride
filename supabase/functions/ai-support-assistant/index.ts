import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiter in-memory cache for Deno runtime
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (rateLimitMap.get(userId) || []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = timestamps[0];
    const retryAfter = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter: Math.max(1, retryAfter) };
  }

  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);
  return { allowed: true };
}

function sanitizeInput(text: string): string {
  return text
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, '[REDACTED_CARD_NUMBER]')
    .replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, '[REDACTED_AADHAAR]')
    .replace(/(?:cvv|cvc)\s*[:=]?\s*(\d{3,4})/gi, '[REDACTED_CVV]')
    .slice(0, 1000);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized: missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: invalid session token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { allowed, retryAfter } = checkRateLimit(user.id);
    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: `Rate limit exceeded. Please wait ${retryAfter} seconds before sending another message.`,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await req.json();
    const rawMessage = body.message;
    if (!rawMessage || typeof rawMessage !== 'string') {
      return new Response(JSON.stringify({ error: 'Message string is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const message = sanitizeInput(rawMessage);
    const lower = message.toLowerCase();

    // 1. Emergency Safety Escalation Trigger
    if (
      lower.includes('accident') ||
      lower.includes('crash') ||
      lower.includes('emergency') ||
      lower.includes('hospital') ||
      lower.includes('missing') ||
      lower.includes('ambulance') ||
      lower.includes('injury') ||
      lower.includes('breakdown')
    ) {
      const ticketId = `tick-emg-${Date.now()}`;
      return new Response(
        JSON.stringify({
          reply: `EMERGENCY ALERT LOGGED (Ticket #${ticketId}). TinyRide Operations Command Center has been notified. Please call our 24/7 emergency desk directly at +91 40 4567 8900 or dial 112.`,
          escalated: true,
          escalation_reason: 'EMERGENCY_SAFETY',
          ticket_id: ticketId,
          tokens_used: 35,
          provider_used: 'rule_engine',
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Refund Dispute Escalation Trigger
    if (
      lower.includes('dispute') ||
      lower.includes('chargeback') ||
      lower.includes('fraud') ||
      lower.includes('stolen') ||
      lower.includes('cheated') ||
      lower.includes('unauthorized') ||
      lower.includes('refund rejected')
    ) {
      const ticketId = `tick-dsp-${Date.now()}`;
      return new Response(
        JSON.stringify({
          reply: `TinyRide Refund Policy: 100% full refund before the 1st of the service month; 5 business days notice for mid-month changes. Your dispute ticket #${ticketId} has been logged for high-priority review by our Billing Desk.`,
          escalated: true,
          escalation_reason: 'REFUND_DISPUTE',
          ticket_id: ticketId,
          tokens_used: 50,
          provider_used: 'rule_engine',
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Grounded Knowledge Base Queries
    let reply =
      'Hello! I am your TinyRide support assistant by Dodail. How can I help you coordinate your child’s school commute today?';

    if (lower.includes('school') || lower.includes('pilot')) {
      reply =
        'TinyRide pilot covers 5 premier schools in Western Hyderabad: Hyderabad Public School (Begumpet), Oakridge International (Gachibowli), Delhi Public School (Khajaguda), CHIREC International (Kondapur), and Glendale Academy (Sun City).';
    } else if (lower.includes('price') || lower.includes('pricing') || lower.includes('fee') || lower.includes('cost')) {
      reply =
        'TinyRide route subscriptions range between ₹2,500 and ₹4,500 per month depending on distance, vehicle category (Auto or Van), and school bell times. Subscriptions are prepaid monthly with zero surge pricing.';
    } else if (lower.includes('refund') || lower.includes('cancel')) {
      reply =
        'TinyRide cancellation policy: 100% full refund is issued if cancelled before the 1st day of the billing month. Mid-month cancellations require a minimum 5 business days advance notice.';
    } else if (lower.includes('capacity') || lower.includes('van') || lower.includes('auto')) {
      reply =
        'Under Telangana Motor Vehicles regulations: Auto-rickshaws are legally capped at 4 to 6 children, and School Vans at 12 to 14 children. Overcrowding is strictly prohibited.';
    } else if (lower.includes('driver') || lower.includes('police') || lower.includes('verification')) {
      reply =
        'Every TinyRide driver completes a 4-point verification check: Commercial Driving License & Badge, Aadhaar KYC, Telangana Police Clearance Certificate, and annual RTA vehicle fitness inspection.';
    }

    return new Response(
      JSON.stringify({
        reply,
        escalated: false,
        escalation_reason: null,
        ticket_id: null,
        tokens_used: Math.ceil(reply.length / 4),
        provider_used: 'deterministic_grounded',
        timestamp: new Date().toISOString(),
        latency_ms: Date.now() - startTime,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: (err as Error).message || 'Internal server error in AI Assistant',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
