import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_DISCIPLINES = ['swimming', 'waterpolo', 'artistic', 'diving', 'highdiving', 'masters', 'openwater', 'paraswimming']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      userEmail,
      name,
      description,
      discipline,
      secondary_disciplines,
      country,
      state,
      location,
      start_date,
      end_date,
      poster_url,
      proof_url,
    } = body

    // 1. Validation
    if (!userEmail || typeof userEmail !== 'string') {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }
    if (!name || name.trim().length < 5 || name.length > 200) {
      return NextResponse.json({ error: 'Event name must be 5-200 characters' }, { status: 400 })
    }
    if (!discipline || !VALID_DISCIPLINES.includes(discipline)) {
      return NextResponse.json({ error: 'Valid discipline required' }, { status: 400 })
    }
    if (!country || country.trim().length === 0) {
      return NextResponse.json({ error: 'Country required' }, { status: 400 })
    }
    if (!location || location.trim().length === 0) {
      return NextResponse.json({ error: 'Location required' }, { status: 400 })
    }
    if (!poster_url) {
      return NextResponse.json({ error: 'Event poster required' }, { status: 400 })
    }
    if (!proof_url) {
      return NextResponse.json({ error: 'Sanctioning letter or proof document required' }, { status: 400 })
    }

    // 2. Check user tier
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('plan, status, current_period_end')
      .eq('user_email', userEmail)
      .single()

    if (!sub) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (sub.status !== 'active') return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })

    const isElite = sub.plan === 'elite' || sub.plan === 'all_disciplines'
    const isPro = sub.plan === 'pro' || sub.plan === 'starter'

    if (sub.plan === 'lite') {
      return NextResponse.json({ error: 'LITE users cannot submit. Upgrade to PRO or ELITE.' }, { status: 403 })
    }
    if (!isPro && !isElite) {
      return NextResponse.json({ error: 'PRO or ELITE subscription required' }, { status: 403 })
    }

    // 3. Check suspension
    const now = new Date().toISOString()
    const { data: violations } = await supabase
      .from('submission_violations')
      .select('level, suspension_until, reason, appeal_status')
      .eq('user_email', userEmail)
      .neq('appeal_status', 'overturned')
      .or(`suspension_until.gte.${now},level.eq.permanent_ban`)

    if (violations && violations.length > 0) {
      const active = violations[0]
      return NextResponse.json({
        error: active.level === 'permanent_ban'
          ? `You are permanently banned from submitting. Reason: ${active.reason}`
          : `You are suspended from submitting until ${new Date(active.suspension_until!).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}. Reason: ${active.reason}`,
        suspended: true,
      }, { status: 403 })
    }

    // 4. Check monthly limit (PRO only — ELITE is unlimited)
    if (isPro) {
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const { count } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('submitted_by', userEmail)
        .gte('created_at', monthStart.toISOString())

      if (count !== null && count >= 5) {
        return NextResponse.json({
          error: 'Monthly limit reached. PRO allows 5 events per calendar month. Upgrade to ELITE for unlimited submissions.',
          limitReached: true,
        }, { status: 429 })
      }
    }

    // 5. Generate slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
    const slug = `${baseSlug}-${Date.now().toString(36)}`

    // 6. Insert
    const { data: inserted, error: insertError } = await supabase
      .from('events')
      .insert({
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        discipline,
        secondary_disciplines: Array.isArray(secondary_disciplines) ? secondary_disciplines : [],
        country: country.trim(),
        state: state?.trim() || null,
        location: location.trim(),
        start_date: start_date || null,
        end_date: end_date || null,
        poster_url,
        proof_url,
        submitted_by: userEmail,
        status: 'pending',
        is_active: false,
        chat_enabled: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Event submission insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save submission. Please try again.' }, { status: 500 })
    }

    // 7. Send confirmation to user inbox
    await supabase.from('user_inbox').insert({
      user_email: userEmail,
      type: 'system',
      title: 'Event submission received',
      body: `Your event "${name}" has been submitted and is now in review. Approval typically takes 24-48 hours. You'll see it appear on the dashboard once approved.`,
      related_id: inserted.id,
      related_type: 'event_submission',
      is_read: false,
    })

return NextResponse.json({ success: true, id: inserted.id, slug: inserted.slug, type: 'event' })
  } catch (err) {
    console.error('Submit event error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}