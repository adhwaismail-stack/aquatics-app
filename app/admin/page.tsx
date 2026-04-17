'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const ADMIN_PASSWORD = 'aquaref-admin-2026'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('rulebooks')
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [systemPrompt, setSystemPrompt] = useState(`You are an AI assistant for World Aquatics Technical Officials.

STRICT RULES:
1. Only answer using the rulebook documents provided.
2. Never use general training knowledge about swimming.
3. Never search or reference the internet.
4. Never guess or infer a rule not explicitly stated.
5. If answer not found, say: "This is not covered in the current rulebook. Please refer to your Meet Referee."
6. Always cite the rule number (e.g. SW 4.4) in every answer.
7. Always reply in the same language the user writes in.
8. End every answer with: "For official decisions, always defer to your Meet Referee."`)
  const [promptSaved, setPromptSaved] = useState(false)

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setError('')
    } else {
      setError('Incorrect password')
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, discipline: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    const code = discipline.toUpperCase()
    setUploading(code)
    setUploadSuccess(null)
    setUploadProgress('Uploading file to storage...')

    try {
      // Step 1: Upload file directly to Supabase Storage (bypasses Vercel limit)
      const fileName = `${discipline}/${Date.now()}_${file.name}`
      const { error: storageError } = await supabase.storage
        .from('rulebooks')
        .upload(fileName, file, {
          contentType: file.type || 'application/pdf',
          upsert: true
        })

      if (storageError) {
        throw new Error(`Storage upload failed: ${storageError.message}`)
      }

      setUploadProgress('File uploaded! Now processing and generating embeddings...')

      // Step 2: Tell the API to process the file from storage
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          discipline,
          originalName: file.name
        })
      })

      const data = await response.json()

      if (data.success) {
        setUploadSuccess(code)
        setUploadProgress('')
        alert(`✓ Successfully processed ${data.chunks} chunks from ${file.name}`)
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert('Upload failed: ' + message)
      setUploadProgress('')
    }

    setUploading(null)
  }

  const handleSavePrompt = () => {
    setPromptSaved(true)
    setTimeout(() => setPromptSaved(false), 3000)
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
              <span className="font-bold text-xl text-gray-900">AquaRef Admin</span>
            </div>
            <p className="text-gray-500 text-sm">Admin access only</p>
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
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Login to Admin
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">AquaRef Admin</span>
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

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total subscribers', value: '0' },
            { label: 'Active today', value: '0' },
            { label: 'Questions today', value: '0' },
            { label: 'Monthly revenue', value: 'RM 0' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['rulebooks', 'system prompt', 'subscribers', 'chat logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Rulebooks tab */}
        {activeTab === 'rulebooks' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Rulebook Management</h2>
            <p className="text-sm text-gray-400 mb-6">Upload PDF or TXT files for each discipline</p>

            {uploadProgress && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
                ⏳ {uploadProgress}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'Swimming', code: 'SW', discipline: 'swimming' },
                { name: 'Water Polo', code: 'WP', discipline: 'waterpolo' },
                { name: 'Artistic Swimming', code: 'AS', discipline: 'artistic' },
                { name: 'Diving', code: 'DV', discipline: 'diving' },
                { name: 'High Diving', code: 'HD', discipline: 'highdiving' },
                { name: 'Masters Swimming', code: 'MS', discipline: 'masters' },
              ].map((d) => (
                <div key={d.code} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{d.name}</h3>
                      <p className="text-xs text-gray-400">{d.code} Rules</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      uploadSuccess === d.code
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {uploadSuccess === d.code ? 'Uploaded ✓' : 'Not uploaded'}
                    </span>
                  </div>
                  <label className="flex-1 cursor-pointer block">
                    <div className={`w-full text-center border py-2 rounded-lg text-sm transition-colors ${
                      uploading === d.code
                        ? 'border-gray-200 text-gray-400'
                        : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                    }`}>
                      {uploading === d.code ? 'Processing...' : 'Upload PDF or TXT'}
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      className="hidden"
                      disabled={uploading !== null}
                      onChange={(e) => handleUpload(e, d.discipline)}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System prompt tab */}
        {activeTab === 'system prompt' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-2">System Prompt Editor</h2>
            <p className="text-sm text-gray-400 mb-4">
              This is the instruction set the AI follows for every answer. Edit carefully.
            </p>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={14}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-400">
                Changes apply immediately to all new conversations
              </p>
              <button
                onClick={handleSavePrompt}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                {promptSaved ? 'Saved! ✓' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Subscribers tab */}
        {activeTab === 'subscribers' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Subscribers</h2>
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-4">👥</p>
              <p className="font-medium text-gray-500">No subscribers yet</p>
              <p className="text-sm mt-1">Your first subscriber will appear here</p>
            </div>
          </div>
        )}

        {/* Chat logs tab */}
        {activeTab === 'chat logs' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Chat Logs</h2>
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-4">💬</p>
              <p className="font-medium text-gray-500">No conversations yet</p>
              <p className="text-sm mt-1">User conversations will appear here once the AI chat is active</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}