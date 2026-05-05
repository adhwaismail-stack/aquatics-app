import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface BroadcastFilter {
  type: 'all' | 'by_plan' | 'by_country' | 'by_email'
  value?: string
}

interface BroadcastRequest {
  action: 'preview' | 'send'
  adminEmail: string
  filter: BroadcastFilter
  messageType?: string
  title?: string
  body?: string
  linkUrl?: string
  linkText?: string
}

const VALID_MESSAGE_TYPES = ['system', 'announcement', 'event', 'promotion', 'warning']
const VALID_FILTER_TYPES = ['all', 'by_plan', 'by_country', 'by_email']
const RATE_LIMIT_PER_HOUR = 5

async function getRecipients(filter: BroadcastFilter): Promise<string[]> {
  let query = supabase.from('user_subscriptions').select('user_email').eq('status', 'active')

  if (filter.type === 'by_plan' && filter.value) {
    query = query.eq('plan', filter.value)
  } else if (filter.type === 'by_country' && filter.value) {
    query = query.eq('country', filter.value)
  } else if (filter.type === 'by_email' && filter.value) {
    query = query.eq('user_email', filter.value)
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch recipients: ${error.message}`)

  const emails = (data || []).map(d => d.user_email).filter(Boolean)
  return [...new Set(emails)]
}

async function checkRateLimit(adminEmail: string): Promise<{ allowed: boolean; recentCount: number }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('broadcast_log')
    .select('id')
    .eq('sent_by_email', adminEmail)
    .gte('sent_at', oneHourAgo)

  if (error) {
    console.error('Rate limit check failed:', error.message)
    return { allowed: true, recentCount: 0 }
  }

  const recentCount = data?.length || 0
  return { allowed: recentCount < RATE_LIMIT_PER_HOUR, recentCount }
}

export async function POST(request: NextRequest) {
  try {
    const body: BroadcastRequest = await request.json()
    const { action, adminEmail, filter } = body

    if (!action || !adminEmail || !filter) {
      return NextResponse.json(
        { error: 'action, adminEmail, and filter are required' },
        { status: 400 }
      )
    }

    if (!VALID_FILTER_TYPES.includes(filter.type)) {
      return NextResponse.json(
        { error: `Invalid filter type. Must be one of: ${VALID_FILTER_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    if (filter.type !== 'all' && !filter.value) {
      return NextResponse.json(
        { error: `filter.value is required for filter type '${filter.type}'` },
        { status: 400 }
      )
    }

    if (action === 'preview') {
      const recipients = await getRecipients(filter)
      const rateLimit = await checkRateLimit(adminEmail)

      return NextResponse.json({
        recipientsCount: recipients.length,
        recipientsSample: recipients.slice(0, 5),
        warningHighCount: recipients.length > 1000,
        rateLimit: {
          allowed: rateLimit.allowed,
          recentCount: rateLimit.recentCount,
          limit: RATE_LIMIT_PER_HOUR,
        },
      })
    }

    if (action === 'send') {
      const { messageType, title, body: msgBody, linkUrl, linkText } = body

      if (!title || !msgBody || !messageType) {
        return NextResponse.json(
          { error: 'title, body, and messageType are required to send' },
          { status: 400 }
        )
      }

      if (!VALID_MESSAGE_TYPES.includes(messageType)) {
        return NextResponse.json(
          { error: `Invalid message type. Must be one of: ${VALID_MESSAGE_TYPES.join(', ')}` },
          { status: 400 }
        )
      }

      if (title.length > 200) {
        return NextResponse.json({ error: 'Title must be 200 characters or less' }, { status: 400 })
      }
      if (msgBody.length > 2000) {
        return NextResponse.json({ error: 'Body must be 2000 characters or less' }, { status: 400 })
      }
      if (linkUrl && linkUrl.length > 500) {
        return NextResponse.json({ error: 'Link URL must be 500 characters or less' }, { status: 400 })
      }
      if (linkText && linkText.length > 100) {
        return NextResponse.json({ error: 'Link text must be 100 characters or less' }, { status: 400 })
      }

      if ((linkUrl && !linkText) || (!linkUrl && linkText)) {
        return NextResponse.json(
          { error: 'Both linkUrl and linkText must be provided together, or neither' },
          { status: 400 }
        )
      }

      const rateLimit = await checkRateLimit(adminEmail)
      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error: `Rate limit exceeded. You have sent ${rateLimit.recentCount} broadcasts in the last hour (limit: ${RATE_LIMIT_PER_HOUR}). Please wait before sending another.`,
          },
          { status: 429 }
        )
      }

      const recipients = await getRecipients(filter)

      if (recipients.length === 0) {
        return NextResponse.json(
          { error: 'No recipients match the selected filter. Nothing was sent.' },
          { status: 400 }
        )
      }

      const inboxRows = recipients.map(email => ({
        user_email: email,
        type: messageType,
        title: title.trim(),
        body: msgBody.trim(),
        link_url: linkUrl?.trim() || null,
        link_text: linkText?.trim() || null,
      }))

      const { error: insertError } = await supabase.from('user_inbox').insert(inboxRows)
      if (insertError) {
        console.error('Inbox insert failed:', insertError.message)
        return NextResponse.json(
          { error: `Failed to send broadcast: ${insertError.message}` },
          { status: 500 }
        )
      }

      const { error: logError } = await supabase.from('broadcast_log').insert({
        sent_by_email: adminEmail,
        message_type: messageType,
        title: title.trim(),
        body: msgBody.trim(),
        link_url: linkUrl?.trim() || null,
        link_text: linkText?.trim() || null,
        filter_type: filter.type,
        filter_value: filter.value || null,
        recipients_count: recipients.length,
      })

      if (logError) {
        console.error('Broadcast log insert failed (broadcast was sent):', logError.message)
      }

      return NextResponse.json({
        success: true,
        recipientsCount: recipients.length,
        message: `Broadcast sent to ${recipients.length} user${recipients.length !== 1 ? 's' : ''}.`,
      })
    }

    return NextResponse.json(
      { error: `Invalid action. Must be 'preview' or 'send'.` },
      { status: 400 }
    )

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Broadcast API error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}