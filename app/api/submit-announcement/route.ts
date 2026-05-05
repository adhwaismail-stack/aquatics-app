import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      userEmail,
      title,
      description,
      content,
      url,
      country,
      state,
      open_new_tab,
      thumbnail_url,
    } = body

    // 1. Validation
    if (!userEmail || typeof userEmail !== 'string') {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }
    if (!title || title.trim().length < 5 || title.length > 200) {
      return NextResponse.json({ error: 'Title must be 5-200 characters' }, { status: 400 })
    }
    if (!description || description.trim().length < 10) {
      return NextResponse.json({ error: 'Description must be at least 10 characters' }, { status: 400 })
    }
    if (!url || url.trim().length === 0) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }
    if (!country || country.trim().length === 0) {
      return NextResponse.json({ error: 'Country required' }, { status: 400 })
    }

    // Reject external commercial-looking URLs (basic check — admin reviews everything anyway)
    const trimmedUrl = url.trim()
    if (!trimmedUrl.startsWith('/') && !trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return NextResponse.json({ error: 'URL must start with /, http://, or https://' }, { status: 400 })
    }

    // 2. Check user tier
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('plan, status')
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
        .from('announcements')
        .select('id', { count: 'exact', head: true })
        .eq('submitted_by', userEmail)
        .gte('created_at', monthStart.toISOString())

      if (count !== null && count >= 10) {
        return NextResponse.json({
          error: 'Monthly limit reached. PRO allows 10 announcements per calendar month. Upgrade to ELITE for unlimited submissions.',
          limitReached: true,
        }, { status: 429 })
      }
    }

    // 5. Generate slug
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
    const slug = `${baseSlug}-${Date.now().toString(36)}`

    // 6. Insert
    const { data: inserted, error: insertError } = await supabase
      .from('announcements')
      .insert({
        title: title.trim(),
        description: description.trim(),
        content: content?.trim() || null,
        url: trimmedUrl,
        slug,
        country: country.trim(),
        state: state?.trim() || null,
        open_new_tab: !!open_new_tab,
        thumbnail_url: thumbnail_url || null,
        submitted_by: userEmail,
        status: 'pending',
        is_active: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Announcement submission insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save submission. Please try again.' }, { status: 500 })
    }

    // 7. Send confirmation to user inbox
    await supabase.from('user_inbox').insert({
      user_email: userEmail,
      type: 'system',
      title: 'Announcement submission received',
      body: `Your announcement "${title}" has been submitted and is now in review. Approval typically takes 24-48 hours. You'll see it appear on the dashboard once approved.`,
      related_id: inserted.id,
      related_type: 'announcement_submission',
      is_read: false,
    })

return NextResponse.json({ success: true, id: inserted.id, slug: inserted.slug, type: 'announcement' })
  } catch (err) {
    console.error('Submit announcement error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}