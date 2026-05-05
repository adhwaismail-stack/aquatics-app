import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_STATUSES = ['unread', 'read', 'resolved', 'archived']

// POST /api/admin/update-message
// Body: { messageId: string, status: 'unread' | 'read' | 'resolved' | 'archived', adminEmail: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messageId, status, adminEmail } = body

    if (!messageId || typeof messageId !== 'string') {
      return NextResponse.json({ error: 'messageId is required' }, { status: 400 })
    }
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 })
    }
    if (!adminEmail || typeof adminEmail !== 'string') {
      return NextResponse.json({ error: 'adminEmail is required' }, { status: 400 })
    }

    const { error: updateErr } = await supabase
      .from('user_messages')
      .update({ status })
      .eq('id', messageId)

    if (updateErr) {
      console.error('Message update failed:', updateErr)
      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Update message error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}