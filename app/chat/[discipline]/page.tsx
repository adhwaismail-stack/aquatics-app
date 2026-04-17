'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { use } from 'react'
import ReactMarkdown from 'react-markdown'

const disciplineNames: { [key: string]: string } = {
  swimming: 'Swimming',
  waterpolo: 'Water Polo',
  artistic: 'Artistic Swimming',
  diving: 'Diving',
  highdiving: 'High Diving',
  masters: 'Masters Swimming'
}

const disciplineCodes: { [key: string]: string } = {
  swimming: 'SW Rules',
  waterpolo: 'WP Rules',
  artistic: 'AS Rules',
  diving: 'DV Rules',
  highdiving: 'HD Rules',
  masters: 'MS Rules'
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage({ params }: { params: Promise<{ discipline: string }> }) {
  const { discipline } = use(params)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [usage, setUsage] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)
    }
    getUser()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const question = input.trim()
    setInput('')
    setLoading(true)

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: question }
    ]
    setMessages(newMessages)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          discipline,
          userEmail: user?.email
        })
      })

      const data = await response.json()

      if (response.status === 429) {
        setMessages([...newMessages, {
          role: 'assistant',
          content: '⚠️ ' + data.error
        }])
      } else if (data.error) {
        setMessages([...newMessages, {
          role: 'assistant',
          content: '❌ ' + data.error
        }])
      } else {
        setMessages([...newMessages, {
          role: 'assistant',
          content: data.answer
        }])
        setUsage(prev => prev + 1)
      }
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: '❌ Something went wrong. Please try again.'
      }])
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
              ← Back
            </a>
            <div className="w-px h-4 bg-gray-200"></div>
            <div>
              <h1 className="font-semibold text-gray-900">
                {disciplineNames[discipline] || discipline}
              </h1>
              <p className="text-xs text-gray-400">{disciplineCodes[discipline]}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-gray-400">Today</div>
              <div className="text-sm font-medium text-gray-700">{usage}/50 questions</div>
            </div>
            <div className="w-16 bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((usage / 50) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">
                {discipline === 'swimming' ? '🏊' :
                 discipline === 'waterpolo' ? '🤽' :
                 discipline === 'artistic' ? '💃' :
                 discipline === 'diving' ? '🤿' :
                 discipline === 'highdiving' ? '🏔️' : '🏅'}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {disciplineNames[discipline]} Rules Assistant
              </h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                Ask any question about {disciplineNames[discipline]} rules.
                Answers are based strictly on the official World Aquatics rulebook.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-2 max-w-md mx-auto">
                {(discipline === 'swimming' ? [
                  'What is the false start rule?',
                  'What are the breaststroke turn rules?',
                  'Can a swimmer false start twice?'
                ] : [
                  'What are the referee duties?',
                  'How long is each period?',
                  'What constitutes a foul?'
                ]).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
              )}
              {msg.role === 'user' ? (
                <div
                  style={{
                    backgroundColor: '#1e40af',
                    borderRadius: '16px 16px 4px 16px',
                    padding: '12px 20px',
                    maxWidth: '75%'
                  }}
                >
                  <p style={{
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    {msg.content}
                  </p>
                </div>
              ) : (
                <div className="max-w-3xl bg-white border border-gray-100 px-6 py-4 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="text-gray-700 text-sm">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-base font-bold text-gray-900 mt-4 mb-2 pb-1 border-b border-gray-100">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-sm font-bold text-gray-900 mt-4 mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-800 mt-3 mb-1">{children}</h3>,
                        p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-3">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-blue-700">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-gray-700">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-700">{children}</ol>,
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-600 my-3">{children}</blockquote>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <div className="bg-white border border-gray-100 px-6 py-4 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  <span className="text-xs text-gray-400 ml-2">Searching rulebook...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={`Ask a ${disciplineNames[discipline] || discipline} rules question...`}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Answers based on official World Aquatics rulebooks only. Always verify with your Meet Referee.
          </p>
        </div>
      </div>
    </div>
  )
}