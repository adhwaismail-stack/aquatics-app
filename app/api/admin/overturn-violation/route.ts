import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/admin/overturn-violation
// Body: { violationId: string, adminEmail: string, notes?: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { violationId, adminEmail, notes } = body

    if (!violationId || typeof violationId !== 'string') {
      return NextResponse.json({ error: 'violationId is required' }, { status: 400 })
    }
    if (!adminEmail || typeof adminEmail !== 'string') {
      return NextResponse.json({ error: 'adminEmail is required' }, { status: 400 })
    }

    // Verify violation exists
    const { data: existing, error: fetchErr } = await supabase
      .from('submission_violations')
      .select('id, appeal_status')
      .eq('id', violationId)
      .single()

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Violation not found' }, { status: 404 })
    }

    if (existing.appeal_status === 'overturned') {
      return NextResponse.json({ error: 'Violation is already overturned' }, { status: 400 })
    }

    const { error: updateErr } = await supabase
      .from('submission_violations')
      .update({
        appeal_status: 'overturned',
        suspension_until: null,
        appeal_notes: notes?.trim() || `Manually overturned by ${adminEmail}.`,
      })
      .eq('id', violationId)

    if (updateErr) {
      console.error('Overturn update failed:', updateErr)
      return NextResponse.json({ error: 'Failed to overturn violation' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Overturn violation error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}