import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { hmac } from 'https://deno.land/x/hmac@v2.0.1/mod.ts';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const webhookSignature = req.headers.get('x-razorpay-signature');
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');

    if (!webhookSignature || !webhookSecret) {
      return new Response('Missing signature or server webhook secret', { status: 400 });
    }

    const rawBody = await req.text();

    // Verify HMAC-SHA256 signature
    const expectedSignature = hmac('sha256', webhookSecret, rawBody, 'utf8', 'hex');
    if (expectedSignature !== webhookSignature) {
      console.error('Razorpay signature mismatch!');
      return new Response('Invalid webhook signature', { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    console.log(`Received verified Razorpay event: ${event}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload.payment?.entity;
      const orderEntity = payload.payload.order?.entity;
      const orderId = paymentEntity?.order_id || orderEntity?.id;
      const paymentId = paymentEntity?.id;
      const paymentMethod = (paymentEntity?.method || 'UPI').toUpperCase();

      if (!orderId) {
        return new Response('Missing order ID in webhook payload', { status: 400 });
      }

      // Check if payment was already recorded (idempotency)
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id, status, booking_id')
        .eq('razorpay_order_id', orderId)
        .single();

      if (existingPayment && existingPayment.status === 'CAPTURED') {
        console.log(`Payment for order ${orderId} already processed. Acknowledging.`);
        return new Response(JSON.stringify({ status: 'already_processed' }), { status: 200 });
      }

      if (existingPayment) {
        // Update payment to CAPTURED
        await supabase
          .from('payments')
          .update({
            status: 'CAPTURED',
            razorpay_payment_id: paymentId,
            razorpay_signature: webhookSignature,
            payment_method: paymentMethod,
            webhook_processed_at: new Date().toISOString(),
          })
          .eq('id', existingPayment.id);

        // Transition booking to CONFIRMED
        const { data: updatedBooking, error: bookingErr } = await supabase
          .from('bookings')
          .update({ status: 'CONFIRMED' })
          .eq('id', existingPayment.booking_id)
          .select('id, parent_id, route_id, start_date, end_date, fare_snapshot')
          .single();

        if (!bookingErr && updatedBooking) {
          // Increment reserved seats on the route
          await supabase.rpc('increment_route_reserved_seats', {
            target_route_id: updatedBooking.route_id,
          });

          // Create active subscription
          const fare = updatedBooking.fare_snapshot as { total_amount_inr?: number };
          await supabase.from('subscriptions').upsert(
            {
              parent_id: updatedBooking.parent_id,
              booking_id: updatedBooking.id,
              billing_cycle_start: updatedBooking.start_date,
              billing_cycle_end: updatedBooking.end_date,
              monthly_amount_inr: fare.total_amount_inr || 3500,
              status: 'ACTIVE',
            },
            { onConflict: 'booking_id' }
          );

          // Audit log entry
          await supabase.from('audit_logs').insert({
            actor_role: 'super_admin',
            action: 'PAYMENT_CAPTURED_WEBHOOK',
            entity_type: 'bookings',
            entity_id: updatedBooking.id,
            metadata: {
              order_id: orderId,
              payment_id: paymentId,
              amount: paymentEntity?.amount,
            },
          });
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payload.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (orderId) {
        await supabase
          .from('payments')
          .update({
            status: 'FAILED',
            error_code: paymentEntity?.error_code,
            error_description: paymentEntity?.error_description,
            webhook_processed_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', orderId);

        const { data: paymentRecord } = await supabase
          .from('payments')
          .select('booking_id')
          .eq('razorpay_order_id', orderId)
          .single();

        if (paymentRecord?.booking_id) {
          await supabase
            .from('bookings')
            .update({ status: 'PAYMENT_FAILED' })
            .eq('id', paymentRecord.booking_id);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error handling webhook:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
