import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const razorpayKeyId = Deno.env.get('EXPO_PUBLIC_RAZORPAY_KEY_ID') ?? Deno.env.get('RAZORPAY_KEY_ID') ?? '';
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';

    // Verify requesting user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized user' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { booking_id } = await req.json();
    if (!booking_id) {
      return new Response(JSON.stringify({ error: 'booking_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service client to fetch booking details
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: booking, error: bookingError } = await serviceClient
      .from('bookings')
      .select('*, routes(*)')
      .eq('id', booking_id)
      .eq('parent_id', user.id)
      .single();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: 'Booking not found or not owned by user' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (booking.status !== 'PENDING_PAYMENT' && booking.status !== 'PAYMENT_FAILED') {
      return new Response(
        JSON.stringify({ error: `Cannot pay for booking with status: ${booking.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fareSnapshot = booking.fare_snapshot;
    const amountINR = fareSnapshot.total_amount_inr || booking.routes.monthly_base_fee_inr;
    const amountSubunits = Math.round(amountINR * 100); // Razorpay expects amount in paise

    // Call Razorpay Orders API
    const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountSubunits,
        currency: 'INR',
        receipt: `bkg_${booking.id.substring(0, 14)}`,
        notes: {
          booking_id: booking.id,
          parent_id: user.id,
          child_id: booking.child_id,
        },
      }),
    });

    if (!rzpResponse.ok) {
      const errBody = await rzpResponse.text();
      console.error('Razorpay order creation failed:', errBody);
      return new Response(JSON.stringify({ error: 'Failed to create payment order', details: errBody }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rzpOrder = await rzpResponse.json();

    // Insert pending payment record
    const { error: paymentInsertError } = await serviceClient.from('payments').insert({
      booking_id: booking.id,
      parent_id: user.id,
      razorpay_order_id: rzpOrder.id,
      amount_inr: amountINR,
      amount_subunits: amountSubunits,
      currency: 'INR',
      status: 'CREATED',
      idempotency_key: crypto.randomUUID(),
    });

    if (paymentInsertError) {
      console.error('Failed to log payment record:', paymentInsertError);
    }

    return new Response(
      JSON.stringify({
        order_id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key_id: razorpayKeyId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in create-razorpay-order:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
