import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/inbox?userEmail=...&limit=50
// Returns user's inbox messages (newest first)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userEmail) {
      return NextResponse.json(
        { error: 'userEmail is required' },
        { status: 400 }
      )
    }

const { data: messages, error } = await supabase
      .from('user_inbox')
      .select('id, type, title, body, related_id, related_type, is_read, created_at, link_url, link_text')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Inbox fetch error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const unreadCount = (messages || []).filter(m => !m.is_read).length

    return NextResponse.json({
      messages: messages || [],
      unreadCount,
      total: (messages || []).length
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Inbox GET error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/inbox
// Body: { userEmail, action: 'mark_read' | 'mark_all_read', messageId?: string }
// Marks one message or all messages as read
export async function POST(request: NextRequest) {
  try {
    const { userEmail, action, messageId } = await request.json()

    if (!userEmail || !action) {
      return NextResponse.json(
        { error: 'userEmail and action are required' },
        { status: 400 }
      )
    }

    if (action === 'mark_read') {
      if (!messageId) {
        return NextResponse.json(
          { error: 'messageId is required for mark_read' },
          { status: 400 }
        )
      }

      const { error } = await supabase
        .from('user_inbox')
        .update({ is_read: true })
        .eq('id', messageId)
        .eq('user_email', userEmail)

      if (error) {
        console.error('Mark read error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, action: 'mark_read', messageId })
    }

    if (action === 'mark_all_read') {
      const { error } = await supabase
        .from('user_inbox')
        .update({ is_read: true })
        .eq('user_email', userEmail)
        .eq('is_read', false)

      if (error) {
        console.error('Mark all read error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, action: 'mark_all_read' })
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}. Use 'mark_read' or 'mark_all_read'` },
      { status: 400 }
    )

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Inbox POST error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}