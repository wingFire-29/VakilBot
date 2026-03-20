import { useState, useRef, useEffect } from 'react'
import Navbar from '../components/Navbar'
import './ChatDemo.css'

const API = `${import.meta.env.VITE_API_URL || ''}/api`

const SUGGESTED = [
  "What is Article 21 of the Indian Constitution?",
  "What are my rights if I'm arrested?",
  "How do I file a consumer complaint?",
  "What is the punishment for domestic violence?",
  "How to file an RTI application?",
  "What is Section 420 IPC?",
]

export default function ChatDemo() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'नमस्ते! 👋 I\'m **VakilBot**, your AI legal assistant specializing in Indian law.\n\nI can help you understand:\n- 🏛️ Constitutional rights (Articles 12-35)\n- ⚖️ Criminal law (IPC sections)\n- 🛒 Consumer protection rights\n- 📋 RTI filing process\n- 🏠 Domestic violence protection\n\nAsk me anything about Indian law!',
      sources: []
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (question) => {
    const q = question || input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: q, sources: [] }])
    setLoading(true)

    try {
      const body = { question: q }
      if (sessionId) body.session_id = sessionId
      // Use demo key for the demo page
      body.embed_key = 'demo'

      const res = await fetch(`${API}/chat/ask/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setSessionId(data.session_id)
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer, sources: data.sources || [] }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '❌ ' + (data.error || 'Something went wrong.'), sources: [] }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Unable to connect. Make sure the backend server is running on localhost:8000.', sources: [] }])
    }
    setLoading(false)
  }

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
  }

  return (
    <div className="chat-demo">
      <Navbar />
      <div className="chat-demo__layout container">
        {/* Left panel */}
        <aside className="chat-demo__sidebar">
          <div className="card chat-demo__info">
            <h3>⚖️ VakilBot AI</h3>
            <p>Powered by RAG + Indian Legal Corpus</p>
            <div className="divider" />
            <div className="chat-demo__coverage">
              <h4>Legal Coverage</h4>
              {['Constitution of India', 'Indian Penal Code (IPC)', 'CrPC (Criminal Procedure)', 'Consumer Protection Act', 'Right to Information Act', 'Domestic Violence Act'].map(l => (
                <div key={l} className="coverage-item">
                  <span className="coverage-dot" />
                  {l}
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="chat-demo__disclaimer glass">
              <strong>⚠️ Disclaimer</strong>
              <p>VakilBot provides legal information, not legal advice. Always consult a qualified advocate for your specific situation.</p>
            </div>
          </div>
        </aside>

        {/* Chat window */}
        <div className="chat-window card">
          <div className="chat-window__header">
            <div className="chat-window__avatar">⚖️</div>
            <div>
              <div className="chat-window__name">VakilBot Legal AI</div>
              <div className="chat-window__status">
                <span className="status-dot" /> Online · Indian Law Expert
              </div>
            </div>
            <div className="badge badge--brand" style={{ marginLeft: 'auto' }}>Demo Mode</div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message message--${msg.role}`}>
                {msg.role === 'assistant' && <div className="message__avatar">⚖️</div>}
                <div className="message__content-wrap">
                  <div
                    className="message__bubble"
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                  />
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="message__sources">
                      <strong>📚 Sources:</strong>{' '}
                      {[...new Set(msg.sources.map(s => s.source))].join(', ')}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && <div className="message__avatar message__avatar--user">👤</div>}
              </div>
            ))}

            {loading && (
              <div className="message message--assistant">
                <div className="message__avatar">⚖️</div>
                <div className="typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          {messages.length === 1 && (
            <div className="suggested-questions">
              <p>💡 Try asking:</p>
              <div className="suggested-grid">
                {SUGGESTED.map((q, i) => (
                  <button key={i} className="suggested-btn" onClick={() => sendMessage(q)}>{q}</button>
                ))}
              </div>
            </div>
          )}

          <div className="chat-input-area">
            <textarea
              id="chat-demo-input"
              className="chat-input form-input"
              placeholder="Ask a legal question about Indian law..."
              value={input}
              onChange={e => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              rows={1}
            />
            <button id="chat-demo-send" className="btn btn--primary chat-send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              {loading ? <span className="spinner" /> : '→'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
