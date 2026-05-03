'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const ADMIN_PASSWORD = 'aquaref-admin-2026'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DISCIPLINES = [
  { slug: 'swimming', name: 'Swimming' },
  { slug: 'water-polo', name: 'Water Polo' },
  { slug: 'open-water', name: 'Open Water' },
  { slug: 'artistic-swimming', name: 'Artistic Swimming' },
  { slug: 'diving', name: 'Diving' },
  { slug: 'high-diving', name: 'High Diving' },
  { slug: 'masters-swimming', name: 'Masters Swimming' },
  { slug: 'para-swimming', name: 'Para Swimming' },
]

const DISCIPLINE_NAMES: Record<string, string> = Object.fromEntries(
  DISCIPLINES.map((d) => [d.slug, d.name])
)

type Status = 'draft' | 'pending_review' | 'published' | 'archived'

interface QAPage {
  id: string
  discipline: string
  slug: string | null
  canonical_question: string
  answer_short: string | null
  answer_full: string | null
  rule_citation: string | null
  rule_quote: string | null
  meta_description: string | null
  status: Status
  ai_drafted_at: string | null
  submitted_for_review_at: string | null
  reviewed_at: string | null
  published_at: string | null
  last_updated_at: string | null
  reviewer_id: string | null
  created_at: string
  created_by: string | null
}

interface Reviewer {
  id: string
  display_name: string
  credential_title: string
}

interface EditForm {
  canonical_question: string
  answer_short: string
  answer_full: string
  rule_citation: string
  rule_quote: string
  meta_description: string
  slug: string
}

const EMPTY_FORM: EditForm = {
  canonical_question: '',
  answer_short: '',
  answer_full: '',
  rule_citation: '',
  rule_quote: '',
  meta_description: '',
  slug: '',
}

// ─────────────────────────────────────────────────────────────
// Action Buttons component (separated to keep main component simple)
// ─────────────────────────────────────────────────────────────
interface ActionButtonsProps {
  qa: QAPage
  hasContent: boolean
  drafting: boolean
  onGenerateDraft: () => void
  onEdit: () => void
  onSubmitForReview: () => void
  onApproveAndPublish: () => void
  onSendBackToDraft: () => void
  onUnpublish: () => void
  onArchive: () => void
}

function ActionButtons(props: ActionButtonsProps) {
  const { qa, hasContent, drafting } = props

  if (qa.status === 'draft') {
    return (
      <div className="flex gap-2 flex-wrap pt-3 border-t border-gray-100">
        <button
          onClick={props.onGenerateDraft}
          disabled={drafting}
          className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 disabled:opacity-50"
        >
          {drafting ? 'Generating...' : qa.ai_drafted_at ? 'Regenerate AI' : 'Generate AI draft'}
        </button>
        <button
          onClick={props.onEdit}
          className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50"
        >
          Edit
        </button>
        {hasContent && (
          <button
            onClick={props.onSubmitForReview}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
          >
            Submit for review →
          </button>
        )}
        <button
          onClick={props.onArchive}
          className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 ml-auto"
        >
          Archive
        </button>
      </div>
    )
  }

  if (qa.status === 'pending_review') {
    return (
      <div className="flex gap-2 flex-wrap pt-3 border-t border-gray-100">
        <button
          onClick={props.onApproveAndPublish}
          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700"
        >
          ✓ Approve & Publish
        </button>
        <button
          onClick={props.onEdit}
          className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50"
        >
          Edit
        </button>
        <button
          onClick={props.onSendBackToDraft}
          className="px-3 py-1.5 border border-orange-200 text-orange-600 rounded-lg text-xs font-medium hover:bg-orange-50"
        >
          ← Back to draft
        </button>
        <button
          onClick={props.onArchive}
          className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 ml-auto"
        >
          Archive
        </button>
      </div>
    )
  }

  if (qa.status === 'published') {
    return (
      <div className="flex gap-2 flex-wrap pt-3 border-t border-gray-100">
        <a
          href={`https://aquaref.co/${qa.discipline}/q/${qa.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
        >
          View live ↗
        </a>
        <button
          onClick={props.onEdit}
          className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50"
        >
          Edit
        </button>
        <button
          onClick={props.onUnpublish}
          className="px-3 py-1.5 border border-orange-200 text-orange-600 rounded-lg text-xs font-medium hover:bg-orange-50"
        >
          Unpublish
        </button>
        <button
          onClick={props.onArchive}
          className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 ml-auto"
        >
          Archive
        </button>
      </div>
    )
  }

  // archived
  return (
    <div className="flex gap-2 flex-wrap pt-3 border-t border-gray-100">
      <button
        onClick={props.onSendBackToDraft}
        className="px-3 py-1.5 border border-blue-200 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50"
      >
        Restore to draft
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main page component
// ─────────────────────────────────────────────────────────────
export default function AdminQAPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')

  const [activeTab, setActiveTab] = useState<Status>('draft')
  const [qaPages, setQaPages] = useState<QAPage[]>([])
  const [loading, setLoading] = useState(false)
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [counts, setCounts] = useState<Record<Status, number>>({
    draft: 0,
    pending_review: 0,
    published: 0,
    archived: 0,
  })

  const [disciplineFilter, setDisciplineFilter] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')

  const [drafting, setDrafting] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setAuthError('')
    } else {
      setAuthError('Incorrect password')
    }
  }

  const loadReviewers = useCallback(async () => {
    const { data } = await supabase
      .from('reviewers')
      .select('id, display_name, credential_title')
      .eq('is_active', true)
    if (data) setReviewers(data)
  }, [])

  const loadQAPages = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('qa_pages')
      .select('*')
      .eq('status', activeTab)
  .order('ai_drafted_at', { ascending: false, nullsFirst: false })
      .order('last_updated_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
    if (error) {
      setActionError('Failed to load: ' + error.message)
    } else if (data) {
      setQaPages(data)
    }
    setLoading(false)
  }, [activeTab])

  const loadCounts = useCallback(async () => {
    const statuses: Status[] = ['draft', 'pending_review', 'published', 'archived']
    const newCounts: Record<Status, number> = {
      draft: 0,
      pending_review: 0,
      published: 0,
      archived: 0,
    }
    for (const s of statuses) {
      const { count } = await supabase
        .from('qa_pages')
        .select('*', { count: 'exact', head: true })
        .eq('status', s)
      newCounts[s] = count || 0
    }
    setCounts(newCounts)
  }, [])

  useEffect(() => {
    if (authenticated) {
      loadReviewers()
      loadQAPages()
      loadCounts()
    }
  }, [authenticated, activeTab, loadReviewers, loadQAPages, loadCounts])

  useEffect(() => {
    if (actionSuccess) {
      const t = setTimeout(() => setActionSuccess(null), 4000)
      return () => clearTimeout(t)
    }
  }, [actionSuccess])

  useEffect(() => {
    if (actionError) {
      const t = setTimeout(() => setActionError(null), 6000)
      return () => clearTimeout(t)
    }
  }, [actionError])

  const handleGenerateDraft = async (qa: QAPage) => {
    setDrafting(qa.id)
    setActionError(null)
    try {
      const res = await fetch('/api/qa-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qa_page_id: qa.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error || 'Failed to generate draft')
      } else {
        setActionSuccess(`AI draft generated for: ${qa.canonical_question.slice(0, 60)}...`)
        await loadQAPages()
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Network error')
    }
    setDrafting(null)
  }

  const handleStartEdit = (qa: QAPage) => {
    setEditing(qa.id)
    setEditForm({
      canonical_question: qa.canonical_question,
      answer_short: qa.answer_short || '',
      answer_full: qa.answer_full || '',
      rule_citation: qa.rule_citation || '',
      rule_quote: qa.rule_quote || '',
      meta_description: qa.meta_description || '',
      slug: qa.slug || '',
    })
  }

  const handleCancelEdit = () => {
    setEditing(null)
    setEditForm(EMPTY_FORM)
  }

  const handleSaveEdit = async (qaId: string) => {
    setSaving(true)
    setActionError(null)
    const { error } = await supabase
      .from('qa_pages')
      .update({
        ...editForm,
        last_updated_at: new Date().toISOString(),
      })
      .eq('id', qaId)
    if (error) {
      setActionError('Save failed: ' + error.message)
    } else {
      setActionSuccess('Saved.')
      setEditing(null)
      setEditForm(EMPTY_FORM)
      await loadQAPages()
    }
    setSaving(false)
  }

  const handleSubmitForReview = async (qa: QAPage) => {
    if (!qa.answer_short || !qa.answer_full || !qa.rule_citation || !qa.slug) {
      setActionError('Cannot submit: requires answer_short, answer_full, rule_citation, and slug.')
      return
    }
    const { error } = await supabase
      .from('qa_pages')
      .update({
        status: 'pending_review',
        submitted_for_review_at: new Date().toISOString(),
      })
      .eq('id', qa.id)
    if (error) {
      setActionError('Failed: ' + error.message)
    } else {
      setActionSuccess('Submitted for review.')
      await loadQAPages()
    }
  }

  const handleApproveAndPublish = async (qa: QAPage) => {
    if (reviewers.length === 0) {
      setActionError('No active reviewer found. Cannot publish.')
      return
    }
    if (!qa.answer_short || !qa.answer_full || !qa.rule_citation || !qa.slug) {
      setActionError('Cannot publish: missing required fields.')
      return
    }
    if (!confirm(`Publish "${qa.canonical_question}" to aquaref.co/${qa.discipline}/q/${qa.slug}?`)) return

    const reviewerId = reviewers[0].id
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('qa_pages')
      .update({
        status: 'published',
        reviewer_id: reviewerId,
        reviewed_at: now,
        published_at: now,
        last_updated_at: now,
      })
      .eq('id', qa.id)
    if (error) {
      setActionError('Publish failed: ' + error.message)
    } else {
      setActionSuccess(`Published! Live at aquaref.co/${qa.discipline}/q/${qa.slug}`)
      await loadQAPages()
    }
  }

  const handleArchive = async (qa: QAPage) => {
    if (!confirm(`Archive "${qa.canonical_question}"? It will return 404 if previously published.`)) return
    const { error } = await supabase
      .from('qa_pages')
      .update({ status: 'archived', last_updated_at: new Date().toISOString() })
      .eq('id', qa.id)
    if (error) {
      setActionError('Archive failed: ' + error.message)
    } else {
      setActionSuccess('Archived.')
      await loadQAPages()
    }
  }

  const handleSendBackToDraft = async (qa: QAPage) => {
    const { error } = await supabase
      .from('qa_pages')
      .update({ status: 'draft', last_updated_at: new Date().toISOString() })
      .eq('id', qa.id)
    if (error) {
      setActionError('Failed: ' + error.message)
    } else {
      setActionSuccess('Sent back to drafts.')
      await loadQAPages()
    }
  }

  const handleUnpublish = async (qa: QAPage) => {
    if (!confirm('Unpublish? Page will return 404 immediately. You can republish later.')) return
    const { error } = await supabase
      .from('qa_pages')
      .update({ status: 'pending_review', last_updated_at: new Date().toISOString() })
      .eq('id', qa.id)
    if (error) {
      setActionError('Failed: ' + error.message)
    } else {
      setActionSuccess('Unpublished. Now in pending_review.')
      await loadQAPages()
    }
  }

  const filteredPages = qaPages
    .filter((p) => disciplineFilter === 'all' || p.discipline === disciplineFilter)
    .filter((p) => {
      if (!searchKeyword) return true
      const kw = searchKeyword.toLowerCase()
      return (
        p.canonical_question.toLowerCase().includes(kw) ||
        (p.answer_short || '').toLowerCase().includes(kw) ||
        (p.rule_citation || '').toLowerCase().includes(kw)
      )
    })

  // ── Login screen ──
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-xl text-gray-900">AquaRef Admin · Q&amp;A</span>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {authError ? <p className="text-red-500 text-sm mb-4">{authError}</p> : null}
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Login to Q&amp;A Admin
            </button>
            <Link href="/admin" className="block text-center text-xs text-gray-400 hover:text-gray-600 mt-4">
              ← Back to main admin
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Main UI ──
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Q&amp;A Admin</span>
            <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600 ml-4">
              ← Main admin
            </Link>
          </div>
          <button onClick={() => setAuthenticated(false)} className="text-sm text-gray-400 hover:text-gray-600">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {actionSuccess ? (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            ✓ {actionSuccess}
          </div>
        ) : null}
        {actionError ? (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            ✗ {actionError}
          </div>
        ) : null}

        <div className="flex gap-2 mb-6 flex-wrap">
          {(['draft', 'pending_review', 'published', 'archived'] as Status[]).map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                activeTab === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status.replace('_', ' ')} ({counts[status]})
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search questions, answers, citations..."
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
            <select
              value={disciplineFilter}
              onChange={(e) => setDisciplineFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700"
            >
              <option value="all">All disciplines</option>
              {DISCIPLINES.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : filteredPages.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
            <p className="text-sm">No Q&amp;As in this status with the current filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPages.map((qa) => {
              const isEditing = editing === qa.id
              const hasContent = Boolean(qa.answer_short && qa.answer_full && qa.rule_citation && qa.slug)
              return (
                <div key={qa.id} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                          {DISCIPLINE_NAMES[qa.discipline] || qa.discipline}
                        </span>
                        {hasContent ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                            ✓ Content ready
                          </span>
                        ) : qa.status === 'draft' && !qa.ai_drafted_at ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
                            Needs AI draft
                          </span>
                        ) : null}
                        {qa.slug ? (
                          <span className="text-xs text-gray-400 font-mono truncate">
                            /{qa.discipline}/q/{qa.slug}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">{qa.canonical_question}</h3>
                    </div>
                  </div>

                  {!isEditing ? (
                    <>
                      {qa.answer_short ? (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Short answer:</p>
                          <p className="text-sm text-gray-700">{qa.answer_short}</p>
                        </div>
                      ) : null}
                      {qa.rule_citation ? (
                        <div className="mb-3">
                          <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded">
                            {qa.rule_citation}
                          </span>
                        </div>
                      ) : null}
                      <ActionButtons
                        qa={qa}
                        hasContent={hasContent}
                        drafting={drafting === qa.id}
                        onGenerateDraft={() => handleGenerateDraft(qa)}
                        onEdit={() => handleStartEdit(qa)}
                        onSubmitForReview={() => handleSubmitForReview(qa)}
                        onApproveAndPublish={() => handleApproveAndPublish(qa)}
                        onSendBackToDraft={() => handleSendBackToDraft(qa)}
                        onUnpublish={() => handleUnpublish(qa)}
                        onArchive={() => handleArchive(qa)}
                      />
                    </>
                  ) : (
                    <div className="space-y-3 pt-3 border-t border-gray-100">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Question</label>
                        <input
                          type="text"
                          value={editForm.canonical_question}
                          onChange={(e) => setEditForm({ ...editForm, canonical_question: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          URL slug — <span className="text-blue-600 font-mono">/{qa.discipline}/q/{editForm.slug || '(empty)'}</span>
                        </label>
                        <input
                          type="text"
                          value={editForm.slug}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Short answer (1-2 sentences)</label>
                        <textarea
                          rows={2}
                          value={editForm.answer_short}
                          onChange={(e) => setEditForm({ ...editForm, answer_short: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 resize-y"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Full answer (200-400 words)</label>
                        <textarea
                          rows={8}
                          value={editForm.answer_full}
                          onChange={(e) => setEditForm({ ...editForm, answer_full: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 resize-y"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Rule citation (e.g. World Aquatics SW 7.1)</label>
                        <input
                          type="text"
                          value={editForm.rule_citation}
                          onChange={(e) => setEditForm({ ...editForm, rule_citation: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Rule quote (exact text from rulebook)</label>
                        <textarea
                          rows={2}
                          value={editForm.rule_quote}
                          onChange={(e) => setEditForm({ ...editForm, rule_quote: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 italic resize-y"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Meta description (60-155 chars)</label>
                        <textarea
                          rows={2}
                          value={editForm.meta_description}
                          onChange={(e) => setEditForm({ ...editForm, meta_description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 resize-y"
                        />
                        <p className="text-xs text-gray-400 mt-1">{editForm.meta_description.length} / 155 characters</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(qa.id)}
                          disabled={saving}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save changes'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
