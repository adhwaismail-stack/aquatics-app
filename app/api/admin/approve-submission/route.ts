import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/admin/approve-submission
// Body: { type: 'event' | 'announcement', id: string, adminEmail: string }
// Approves a pending submission and sends an inbox notification to the submitter
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, id, adminEmail } = body

    // Basic validation
    if (!type || (type !== 'event' && type !== 'announcement')) {
      return NextResponse.json({ error: 'type must be "event" or "announcement"' }, { status: 400 })
    }
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }
    if (!adminEmail || typeof adminEmail !== 'string') {
      return NextResponse.json({ error: 'adminEmail is required' }, { status: 400 })
    }

    const tableName = type === 'event' ? 'events' : 'announcements'

    // 1. Fetch submission to get title + slug + submitted_by (we need these for the inbox notification)
    const { data: existing, error: fetchErr } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (existing.status !== 'pending') {
      return NextResponse.json({ error: `Submission is already ${existing.status}` }, { status: 400 })
    }

    // 2. Update the submission row
    const { error: updateErr } = await supabase
      .from(tableName)
      .update({
        status: 'approved',
        is_active: true,
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminEmail,
        rejection_reason: null,
      })
      .eq('id', id)

    if (updateErr) {
      console.error('Approve update failed:', updateErr)
      return NextResponse.json({ error: 'Failed to approve submission' }, { status: 500 })
    }

    // 3. Insert inbox notification for the submitter
    const submitterEmail = existing.submitted_by
    const title = type === 'event' ? existing.name : existing.title
    const liveUrl = type === 'event' ? `/events/${existing.slug}` : `/announcements/${existing.slug}`

    if (submitterEmail) {
      const { error: inboxErr } = await supabase.from('user_inbox').insert({
        user_email: submitterEmail,
        type: 'system',
        title: type === 'event' ? 'Event approved' : 'Announcement approved',
        body: `Your ${type} "${title}" has been approved and is now live on AquaRef. Click below to view it.`,
        related_id: id,
        related_type: type === 'event' ? 'event_submission' : 'announcement_submission',
        is_read: false,
        link_url: liveUrl,
        link_text: type === 'event' ? 'View event →' : 'View announcement →',
      })

      if (inboxErr) {
        console.error('Inbox notification failed:', inboxErr)
        // Don't fail the whole request — approval already succeeded
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Approve submission error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}