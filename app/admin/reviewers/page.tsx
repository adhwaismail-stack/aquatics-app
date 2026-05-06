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

interface Reviewer {
  id: string
  display_name: string
  credential_title: string
  bio: string | null
  photo_url: string | null
  linkedin_url: string | null
  disciplines: string[] | null
  is_active: boolean
  created_at: string
}

interface ReviewerForm {
  display_name: string
  credential_title: string
  bio: string
  photo_url: string
  linkedin_url: string
  disciplines: string[]
  is_active: boolean
}

const EMPTY_FORM: ReviewerForm = {
  display_name: '',
  credential_title: '',
  bio: '',
  photo_url: '',
  linkedin_url: '',
  disciplines: [],
  is_active: true,
}

export default function AdminReviewersPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')

  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<ReviewerForm>(EMPTY_FORM)
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
    setLoading(true)
    const { data, error } = await supabase
      .from('reviewers')
      .select('*')
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: true })
    if (error) {
      setActionError('Failed to load: ' + error.message)
    } else if (data) {
      setReviewers(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authenticated) loadReviewers()
  }, [authenticated, loadReviewers])

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

  const handleStartCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowCreate(true)
  }

  const handleStartEdit = (r: Reviewer) => {
    setShowCreate(false)
    setEditing(r.id)
    setForm({
      display_name: r.display_name,
      credential_title: r.credential_title,
      bio: r.bio || '',
      photo_url: r.photo_url || '',
      linkedin_url: r.linkedin_url || '',
      disciplines: r.disciplines || [],
      is_active: r.is_active,
    })
  }

  const handleCancel = () => {
    setEditing(null)
    setShowCreate(false)
    setForm(EMPTY_FORM)
  }

  const toggleDiscipline = (slug: string) => {
    setForm((prev) => {
      const has = prev.disciplines.includes(slug)
      return {
        ...prev,
        disciplines: has
          ? prev.disciplines.filter((d) => d !== slug)
          : [...prev.disciplines, slug],
      }
    })
  }

  const handleSave = async () => {
    if (!form.display_name.trim() || !form.credential_title.trim()) {
      setActionError('Display name and credential title are required.')
      return
    }
    if (form.disciplines.length === 0) {
      setActionError('Select at least one discipline.')
      return
    }
    setSaving(true)
    setActionError(null)

    const payload = {
      display_name: form.display_name.trim(),
      credential_title: form.credential_title.trim(),
      bio: form.bio.trim() || null,
      photo_url: form.photo_url.trim() || null,
      linkedin_url: form.linkedin_url.trim() || null,
      disciplines: form.disciplines,
      is_active: form.is_active,
    }

    if (editing) {
      const { error } = await supabase
        .from('reviewers')
        .update(payload)
        .eq('id', editing)
      if (error) {
        setActionError('Save failed: ' + error.message)
      } else {
        setActionSuccess('Reviewer updated.')
        setEditing(null)
        setForm(EMPTY_FORM)
        await loadReviewers()
      }
    } else {
      const { error } = await supabase.from('reviewers').insert(payload)
      if (error) {
        setActionError('Create failed: ' + error.message)
      } else {
        setActionSuccess('Reviewer added.')
        setShowCreate(false)
        setForm(EMPTY_FORM)
        await loadReviewers()
      }
    }
    setSaving(false)
  }

  const handleToggleActive = async (r: Reviewer) => {
    const { error } = await supabase
      .from('reviewers')
      .update({ is_active: !r.is_active })
      .eq('id', r.id)
    if (error) {
      setActionError('Toggle failed: ' + error.message)
    } else {
      setActionSuccess(r.is_active ? 'Deactivated.' : 'Activated.')
      await loadReviewers()
    }
  }

  const handleDelete = async (r: Reviewer) => {
    if (
      !confirm(
        `Delete "${r.display_name}"? This will REMOVE attribution from any Q&As they reviewed. Consider deactivating instead.`
      )
    )
      return
    const { error } = await supabase.from('reviewers').delete().eq('id', r.id)
    if (error) {
      setActionError(
        'Delete failed (likely they are attributed to existing Q&As): ' +
          error.message
      )
    } else {
      setActionSuccess('Deleted.')
      await loadReviewers()
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-xl text-gray-900">
                AquaRef Admin · Reviewers
              </span>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {authError ? (
              <p className="text-red-500 text-sm mb-4">{authError}</p>
            ) : null}
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Login to Reviewers Admin
            </button>
            <Link
              href="/admin"
              className="block text-center text-xs text-gray-400 hover:text-gray-600 mt-4"
            >
              ← Back to main admin
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const activeCount = reviewers.filter((r) => r.is_active).length
  const inactiveCount = reviewers.length - activeCount

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              Reviewers Admin
            </span>
            <Link
              href="/admin"
              className="text-xs text-gray-400 hover:text-gray-600 ml-4"
            >
              ← Main admin
            </Link>
            <Link
              href="/admin/qa"
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              · Q&amp;A admin
            </Link>
          </div>
          <button
            onClick={() => setAuthenticated(false)}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
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

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reviewers</h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeCount} active · {inactiveCount} inactive · {reviewers.length} total
            </p>
          </div>
          {!showCreate && !editing ? (
            <button
              onClick={handleStartCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              + Add new reviewer
            </button>
          ) : null}
        </div>

        {/* Create/Edit form */}
        {(showCreate || editing) && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              {editing ? 'Edit reviewer' : 'New reviewer'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Display name *
                  </label>
                  <input
                    type="text"
                    value={form.display_name}
                    onChange={(e) =>
                      setForm({ ...form, display_name: e.target.value })
                    }
                    placeholder="e.g. Encik Ahmad Hassan"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Credential title *
                  </label>
                  <input
                    type="text"
                    value={form.credential_title}
                    onChange={(e) =>
                      setForm({ ...form, credential_title: e.target.value })
                    }
                    placeholder="e.g. Certified Water Polo Technical Official"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Bio (optional)
                </label>
                <textarea
                  rows={2}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Brief background about this reviewer"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Photo URL (optional)
                  </label>
                  <input
                    type="text"
                    value={form.photo_url}
                    onChange={(e) =>
                      setForm({ ...form, photo_url: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    LinkedIn URL (optional, recommended for E-E-A-T)
                  </label>
                  <input
                    type="text"
                    value={form.linkedin_url}
                    onChange={(e) =>
                      setForm({ ...form, linkedin_url: e.target.value })
                    }
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Disciplines they cover * (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DISCIPLINES.map((d) => {
                    const checked = form.disciplines.includes(d.slug)
                    return (
                      <button
                        key={d.slug}
                        type="button"
                        onClick={() => toggleDiscipline(d.slug)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-left ${
                          checked
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {checked ? '✓ ' : ''}
                        {d.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Active (will appear in publish dropdown)
                  </span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Save changes' : 'Add reviewer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reviewers list */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : reviewers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
            <p className="text-sm">
              No reviewers yet. Click &ldquo;Add new reviewer&rdquo; above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviewers.map((r) => (
              <div
                key={r.id}
                className={`bg-white rounded-xl border p-5 ${
                  r.is_active ? 'border-gray-100' : 'border-gray-100 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {r.display_name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          r.is_active
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {r.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {r.credential_title}
                    </p>
                    {r.bio ? (
                      <p className="text-xs text-gray-500 mb-2 italic">{r.bio}</p>
                    ) : null}
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      {(r.disciplines || []).map((d) => {
                        const disc = DISCIPLINES.find((x) => x.slug === d)
                        return (
                          <span
                            key={d}
                            className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700"
                          >
                            {disc?.name || d}
                          </span>
                        )
                      })}
                    </div>
                    {r.linkedin_url ? (
                      <a
                        href={r.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block"
                      >
                        LinkedIn ↗
                      </a>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleStartEdit(r)}
                      className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(r)}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-medium ${
                        r.is_active
                          ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {r.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(r)}
                      className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
