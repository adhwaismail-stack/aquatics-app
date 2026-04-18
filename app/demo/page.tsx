'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isUpgrade?: boolean
}

const UPGRADE_MESSAGE = `🏊 **Thank you for trying AquaRef!**

You've experienced the power of instant World Aquatics rules answers — accurate, cited and in your language.

Ready for unlimited access? Choose your plan:

**📌 Starter Plan — RM11.99/month**
- 1 discipline of your choice
- 50 questions per day
- 7-day free trial — no charge

**📌 All Disciplines — RM27.99/month**
- All 6 disciplines (Swimming, Water Polo & more)
- 200 questions per day
- 7-day free trial — no charge

No charge for 7 days. Cancel anytime.`

export default function DemoPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [questionsUsed, setQuestionsUsed] = useState(0)
  const [limitReached, setLimitReached] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading || limitReached) return

    const question = input.trim()
    setInput('')
    setLoading(true)

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: question }
    ]
    setMessages(newMessages)

    try {
      const response = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      })

      const data = await response.json()

      if (data.limitReached && !data.answer) {
        // Already at limit before this question
        setLimitReached(true)
        setMessages([...newMessages, {
          role: 'assistant',
          content: UPGRADE_MESSAGE,
          isUpgrade: true
        }])
      } else if (data.answer) {
        setQuestionsUsed(data.questionsUsed)
        setMessages([...newMessages, {
          role: 'assistant',
          content: data.answer
        }])

        if (data.limitReached) {
          setLimitReached(true)
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: UPGRADE_MESSAGE,
              isUpgrade: true
            }])
          }, 1000)
        }
      } else {
        setMessages([...newMessages, {
          role: 'assistant',
          content: '❌ Something went wrong. Please try again.'
        }])
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
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-xl text-gray-900">AquaRef</span>
            </a>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              Demo
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {questionsUsed}/2 free questions used
            </span>
            
              href="/pricing"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Subscribe
            </a>
          </div>
        </div>
      </div>

      {/* Demo banner */}
      <div className="bg-blue-600 px-6 py-3">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white text-sm">
            🎯 <strong>Demo Mode</strong> — Swimming rules only, 2 free questions.
            <a href="/pricing" className="underline ml-2 hover:text-blue-200">
              Subscribe for full access →
            </a>
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🏊</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Try AquaRef — Swimming Rules Assistant
              </h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                Ask any swimming rules question. Answers are based on official
                World Aquatics Regulations with exact rule citations.
              </p>
              <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                {[
                  'What is the false start rule?',
                  'What are the breaststroke turn rules?',
                  'What is the butterfly touch requirement?',
                  'What happens if a swimmer misses the wall?'
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
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
                <div style={{
                  backgroundColor: '#1e40af',
                  borderRadius: '16px 16px 4px 16px',
                  padding: '12px 20px',
                  maxWidth: '75%'
                }}>
                  <p style={{ color: '#ffffff', fontSize: '14px', margin: 0 }}>
                    {msg.content}
                  </p>
                </div>
              ) : (
                <div className={`max-w-2xl rounded-2xl rounded-bl-sm shadow-sm px-6 py-4 ${
                  msg.isUpgrade
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-100'
                }`}>
                  {msg.isUpgrade ? (
                    <div className="text-sm text-white">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                          ul: ({ children }) => <ul className="list-none space-y-1 mb-3">{children}</ul>,
                          li: ({ children }) => <li className="text-blue-100">{children}</li>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                      <div className="flex flex-col gap-2 mt-4">
                        
                          href="/pricing"
                          className="block w-full text-center bg-white text-blue-600 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors"
                        >
                          Start 7-Day Free Trial →
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-700 text-sm">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="leading-relaxed mb-3">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-blue-700">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
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
                  <span className="text-xs text-gray-400 ml-2">Searching regulations...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          {limitReached ? (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">
                You've used your 2 free questions
              </p>
              
                href="/pricing"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-blue-700"
              >
                Start 7-Day Free Trial →
              </a>
            </div>
          ) : (
            <>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask a swimming rules question..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                {2 - questionsUsed} free question{2 - questionsUsed !== 1 ? 's' : ''} remaining •
                Answers based on official World Aquatics Regulations
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}