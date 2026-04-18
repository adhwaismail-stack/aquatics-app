import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia'
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.CheckoutSession
        const email = session.customer_email || ''
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id

        // Determine plan name
        const plan = priceId === process.env.STRIPE_STARTER_PRICE_ID
          ? 'starter'
          : 'all_disciplines'

        // Save or update subscriber
        await supabase
          .from('subscribers')
          .upsert({
            email,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan,
            status: 'active',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'email' })

        console.log(`✅ New subscriber: ${email} on ${plan} plan`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find subscriber by customer ID
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('email')
          .eq('stripe_customer_id', customerId)
          .single()

        if (subscriber) {
          const priceId = subscription.items.data[0].price.id
          const plan = priceId === process.env.STRIPE_STARTER_PRICE_ID
            ? 'starter'
            : 'all_disciplines'

          await supabase
            .from('subscribers')
            .update({
              plan,
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customerId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await supabase
          .from('subscribers')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId)

        console.log(`❌ Subscription cancelled for customer: ${customerId}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await supabase
          .from('subscribers')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId)

        console.log(`⚠️ Payment failed for customer: ${customerId}`)
        break
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}