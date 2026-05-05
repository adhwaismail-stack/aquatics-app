import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_VIOLATION_LEVELS = ['warning', 'suspension_24h', 'suspension_3d', 'suspension_1w', 'permanent_ban']

// POST /api/admin/reject-submission
// Body: {
//   type: 'event' | 'announcement',
//   id: string,
//   adminEmail: string,
//   rejectionReason: string,
//   issueViolation?: boolean,
//   violationLevel?: 'warning' | 'suspension_24h' | 'suspension_3d' | 'suspension_1w' | 'permanent_ban'
// }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, id, adminEmail, rejectionReason, issueViolation, violationLevel } = body

    // Validation
    if (!type || (type !== 'event' && type !== 'announcement')) {
      return NextResponse.json({ error: 'type must be "event" or "announcement"' }, { status: 400 })
    }
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }
    if (!adminEmail || typeof adminEmail !== 'string') {
      return NextResponse.json({ error: 'adminEmail is required' }, { status: 400 })
    }
    if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.trim().length < 5) {
      return NextResponse.json({ error: 'rejectionReason is required (min 5 chars)' }, { status: 400 })
    }
    if (issueViolation) {
      if (!violationLevel || !VALID_VIOLATION_LEVELS.includes(violationLevel)) {
        return NextResponse.json({ error: 'violationLevel is required and must be a valid level' }, { status: 400 })
      }
    }

    const tableName = type === 'event' ? 'events' : 'announcements'

    // 1. Fetch submission to get submitted_by
    const { data: existing, error: fetchErr } = await supabase
      .from(tableName)
      .select('id, status, submitted_by')
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
        status: 'rejected',
        is_active: false,
        rejection_reason: rejectionReason.trim(),
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminEmail,
      })
      .eq('id', id)

    if (updateErr) {
      console.error('Reject update failed:', updateErr)
      return NextResponse.json({ error: 'Failed to reject submission' }, { status: 500 })
    }

    // 3. If violation requested, insert it
    if (issueViolation) {
      let suspensionUntil: string | null = null
      if (violationLevel === 'suspension_24h') suspensionUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      if (violationLevel === 'suspension_3d') suspensionUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      if (violationLevel === 'suspension_1w') suspensionUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      if (violationLevel === 'permanent_ban') suspensionUntil = new Date('2099-12-31').toISOString()

      const { error: violationErr } = await supabase.from('submission_violations').insert({
        user_email: existing.submitted_by,
        level: violationLevel,
        reason: rejectionReason.trim(),
        related_submission_type: type,
        related_submission_id: id,
        suspension_until: suspensionUntil,
        issued_by: adminEmail,
      })

      if (violationErr) {
        console.error('Violation insert failed:', violationErr)
        // Don't fail the whole request — rejection already succeeded
        return NextResponse.json({
          success: true,
          warning: 'Submission rejected, but violation could not be issued: ' + violationErr.message
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reject submission error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}
