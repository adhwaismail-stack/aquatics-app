import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_TOPICS = ['billing', 'technical', 'eventhub', 'content', 'account', 'partner', 'media', 'appeal', 'other']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, topic, message } = body

    // Validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 })
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message is too long (max 5000 characters)' }, { status: 400 })
    }
    if (topic && !VALID_TOPICS.includes(topic)) {
      return NextResponse.json({ error: 'Invalid topic' }, { status: 400 })
    }

    // Rate limit: max 5 messages per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('user_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_email', email.trim().toLowerCase())
      .gt('created_at', oneHourAgo)

    if (count && count >= 5) {
      return NextResponse.json({ error: 'Too many messages. Please wait an hour before sending another.' }, { status: 429 })
    }

    // Insert into user_messages
    const { error } = await supabase
      .from('user_messages')
      .insert({
        user_email: email.trim().toLowerCase(),
        sender_name: name?.trim() || null,
        topic: topic || null,
        message: message.trim(),
        status: 'unread',
      })

    if (error) {
      console.error('Contact form insert error:', error)
      return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}