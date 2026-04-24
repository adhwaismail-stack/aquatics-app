'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_QUESTIONS = [
  'What is AquaRef?',
  'What is Event Hub?',
  'Which plan is right for me?',
  'How much does it cost?',
]

export default function FAQWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! 👋 I\'m the AquaRef Assistant. Ask me about features, pricing, or which plan fits you best — I\'ll guide you to the right one.'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const question = text || input.trim()
    if (!question || loading) return

    setInput('')
    setLoading(true)

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: question }
    ]
    setMessages(newMessages)

    try {
      const response = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          history: newMessages.slice(1, -1).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      const data = await response.json()

      setMessages([...newMessages, {
        role: 'assistant',
        content: data.answer || 'Sorry, something went wrong. Please try again!'
      }])
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again!'
      }])
    }

    setLoading(false)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all"
      >
        {isOpen ? (
          <span className="text-lg">✕</span>
        ) : (
          <>
            <span className="text-lg">💬</span>
            <span className="text-sm font-medium">Ask AquaRef</span>
          </>
        )}
      </button>

      {/* Chat widget */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ height: '500px', width: '360px' }}
        >
          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">A</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">AquaRef Assistant</p>
              <p className="text-blue-200 text-xs">Ask me anything</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-3 py-2 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm text-xs leading-relaxed'
                      : 'bg-gray-100 text-gray-700 rounded-bl-sm text-xs leading-relaxed'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/^- /gm, '• ')
                      .replace(/\n/g, '<br/>')
                  }}
                />
              </div>
            ))}

            {/* Quick questions */}
            {messages.length === 1 && (
              <div className="space-y-2 mt-2">
                <p className="text-xs text-gray-400 mb-2">Try asking:</p>
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left text-xs px-3 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Powered by AquaRef AI
            </p>
          </div>
        </div>
      )}
    </>
  )
}