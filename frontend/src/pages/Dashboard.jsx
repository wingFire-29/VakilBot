import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

const API = `${import.meta.env.VITE_API_URL || ''}/api`

export default function Dashboard() {
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()
  const [firm, setFirm] = useState(null)
  const [stats, setStats] = useState(null)
  const [allSessions, setAllSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [snippetCopied, setSnippetCopied] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionMessages, setSessionMessages] = useState([])
  const [sessionLoading, setSessionLoading] = useState(false)
  const [settingsForm, setSettingsForm] = useState({})
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsMsg, setSettingsMsg] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const fetchData = () => {
    Promise.all([
      fetch(`${API}/firms/`, { headers: authHeaders }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/chat/stats/`, { headers: authHeaders }).then(r => r.ok ? r.json() : null),
    ]).then(([firmData, statsData]) => {
      if (firmData) {
        setFirm(firmData)
        setSettingsForm({
          name: firmData.name || '',
          website: firmData.website || '',
          email: firmData.email || '',
          phone: firmData.phone || '',
          description: firmData.description || '',
          address: firmData.address || '',
        })
      }
      if (statsData) setStats(statsData)
      setLoading(false)
    }).catch(() => setLoading(false))

    fetch(`${API}/chat/history/`, { headers: authHeaders })
      .then(r => r.ok ? r.json() : [])
      .then(data => setAllSessions(Array.isArray(data) ? data : []))
      .catch(() => {})
  }

  useEffect(() => { fetchData() }, [])

  const copyEmbedKey = () => {
    navigator.clipboard.writeText(firm?.embed_key || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copySnippet = () => {
    const snippet = `<script \n  src="https://vakilbot.ai/widget.js"\n  data-key="${firm?.embed_key}"\n  data-firm="${firm?.name}"\n  data-color="#6366f1">\n</script>`
    navigator.clipboard.writeText(snippet)
    setSnippetCopied(true)
    setTimeout(() => setSnippetCopied(false), 2000)
  }

  const regenKey = async () => {
    if (!confirm('Regenerating the key will break existing embeds. Continue?')) return
    setRegenLoading(true)
    const res = await fetch(`${API}/firms/regenerate-key/`, { method: 'POST', headers: authHeaders })
    if (res.ok) {
      const data = await res.json()
      setFirm(prev => ({ ...prev, embed_key: data.embed_key }))
    }
    setRegenLoading(false)
  }

  const saveSettings = async () => {
    setSettingsSaving(true)
    setSettingsMsg(null)
    const res = await fetch(`${API}/firms/`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(settingsForm),
    })
    const data = await res.json()
    if (res.ok) {
      setFirm(data)
      setSettingsMsg({ type: 'success', text: '✓ Firm profile updated successfully!' })
    } else {
      setSettingsMsg({ type: 'error', text: data.error || 'Failed to save. Please try again.' })
    }
    setSettingsSaving(false)
    setTimeout(() => setSettingsMsg(null), 4000)
  }

  const loadSessionMessages = async (sessionId) => {
    setSessionLoading(true)
    setSelectedSession(sessionId)
    try {
      const res = await fetch(`${API}/chat/session/${sessionId}/`, { headers: authHeaders })
      const data = await res.json()
      setSessionMessages(data.messages || [])
    } catch {
      setSessionMessages([])
    }
    setSessionLoading(false)
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatMsg = (content) => content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')

  if (loading) return (
    <div className="dashboard-loading">
      <div className="db-loading-inner">
        <div className="spinner" style={{ width: 44, height: 44, borderWidth: 3 }} />
        <p>Loading your dashboard...</p>
      </div>
    </div>
  )

  const navItems = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'embed', icon: '🔗', label: 'Embed Widget' },
    { id: 'chats', icon: '💬', label: 'Chat History' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'settings', icon: '⚙️', label: 'Firm Settings' },
  ]

  const totalSessions = stats?.total_sessions ?? allSessions.length ?? 0
  const totalMessages = stats?.total_messages ?? 0
  const aiResponses = stats?.ai_responses ?? 0
  const avgMsgsPerSession = totalSessions > 0 ? (totalMessages / totalSessions).toFixed(1) : '0'

  return (
    <div className="dashboard">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__top">
          <Link to="/" className="sidebar__logo">⚖️ Vakil<span className="gradient-text">Bot</span></Link>
          <button className="sidebar__close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        {firm && (
          <div className="sidebar__firm-badge">
            <div className="sidebar__firm-icon">{firm.name?.[0] || '⚖'}</div>
            <div>
              <div className="sidebar__firm-name">{firm.name}</div>
              <div className="sidebar__firm-plan">{(firm.plan || 'free').toUpperCase()} PLAN</div>
            </div>
          </div>
        )}

        <nav className="sidebar__nav">
          {navItems.map(item => (
            <button key={item.id} id={`tab-${item.id}`}
              className={`sidebar__item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}>
              <span className="sidebar__icon">{item.icon}</span>
              {item.label}
              {item.id === 'chats' && totalSessions > 0 && (
                <span className="sidebar__badge">{totalSessions}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar">{user?.first_name?.[0] || user?.username?.[0] || '?'}</div>
            <div>
              <div className="sidebar__username">{user?.first_name} {user?.last_name}</div>
              <div className="sidebar__role">{user?.role || 'Admin'}</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/') }} className="btn btn--ghost btn--sm btn--full" style={{ marginTop: 8 }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="dashboard-main">
        {/* Top bar */}
        <div className="dashboard-topbar">
          <button className="sidebar-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="dashboard-topbar__title">
            <h1 className="dashboard-title">
              {navItems.find(n => n.id === activeTab)?.icon} {navItems.find(n => n.id === activeTab)?.label}
            </h1>
            <p className="dashboard-subtitle">{firm?.name || 'Your Law Firm'}</p>
          </div>
          <Link to="/demo" className="btn btn--outline btn--sm">🤖 Test AI</Link>
        </div>

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === 'overview' && (
          <div className="tab-content animate-fade-up">
            <div className="stats-row">
              {[
                { label: 'Total Sessions', value: totalSessions, icon: '💬', color: '#6366f1', sub: 'Client chat sessions' },
                { label: 'Total Messages', value: totalMessages, icon: '📨', color: '#8b5cf6', sub: 'All messages exchanged' },
                { label: 'AI Responses', value: aiResponses, icon: '🤖', color: '#a78bfa', sub: 'Bot answers generated' },
                { label: 'Avg per Session', value: avgMsgsPerSession, icon: '📊', color: '#22c55e', sub: 'Messages per session' },
              ].map((s, i) => (
                <div key={i} className="stat-card card">
                  <div className="stat-card__top">
                    <div className="stat-card__icon" style={{ background: `${s.color}22`, color: s.color }}>{s.icon}</div>
                    <div className="stat-card__value">{s.value}</div>
                  </div>
                  <div className="stat-card__label">{s.label}</div>
                  <div className="stat-card__sub">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="quick-actions">
              {[
                { icon: '🤖', title: 'Test the AI', desc: 'Try asking Indian law questions in live mode', action: () => navigate('/demo'), cta: 'Open Demo' },
                { icon: '🔗', title: 'Get Embed Code', desc: 'Copy the widget script tag for your website', action: () => setActiveTab('embed'), cta: 'Get Code' },
                { icon: '⚙️', title: 'Update Firm Profile', desc: 'Keep your firm info accurate for clients', action: () => setActiveTab('settings'), cta: 'Edit Profile' },
              ].map((a, i) => (
                <div key={i} className="quick-action-card card">
                  <div className="quick-action-card__icon">{a.icon}</div>
                  <h3>{a.title}</h3>
                  <p>{a.desc}</p>
                  <button className="btn btn--outline btn--sm" onClick={a.action}>{a.cta} →</button>
                </div>
              ))}
            </div>

            {/* Recent sessions */}
            <div className="dashboard-section card">
              <div className="dashboard-section-header">
                <h2 className="dashboard-section-title">📋 Recent Sessions</h2>
                {allSessions.length > 0 && (
                  <button className="btn btn--ghost btn--sm" onClick={() => setActiveTab('chats')}>View all →</button>
                )}
              </div>
              {allSessions.length > 0 ? (
                <div className="sessions-list">
                  {allSessions.slice(0, 5).map(s => (
                    <div key={s.session_id} className="session-row"
                      onClick={() => { setActiveTab('chats'); loadSessionMessages(s.session_id) }}
                      style={{ cursor: 'pointer' }}>
                      <div className="session-row__avatar">💬</div>
                      <div className="session-row__info">
                        <div className="session-row__id">Session #{s.session_id?.slice(0, 8)}...</div>
                        <div className="session-row__meta">{s.message_count} messages · {formatDate(s.last_active)}</div>
                      </div>
                      <div className={`badge ${s.is_active ? 'badge--success' : ''}`}>{s.is_active ? '● Active' : 'Closed'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span style={{ fontSize: '3rem' }}>💬</span>
                  <h3>No sessions yet</h3>
                  <p>Embed the widget on your website to start receiving client queries.</p>
                  <button className="btn btn--primary" onClick={() => setActiveTab('embed')}>Get Embed Code →</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ EMBED TAB ══ */}
        {activeTab === 'embed' && (
          <div className="tab-content animate-fade-up">
            <div className="card dashboard-section">
              <h2 className="dashboard-section-title">🔑 Your Embed Key</h2>
              <p style={{ marginBottom: 20 }}>This key identifies your firm. Keep it private. Use it in the widget script tag.</p>
              <div className="key-display">
                <code className="key-value">{firm?.embed_key || 'No key generated yet'}</code>
                <button id="copy-key-btn" className="btn btn--outline btn--sm" onClick={copyEmbedKey}>
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
                <button id="regen-key-btn" className="btn btn--ghost btn--sm" onClick={regenKey} disabled={regenLoading}>
                  {regenLoading ? <span className="spinner" /> : '🔄 Regen'}
                </button>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 12 }}>
                ⚠️ Regenerating will break existing embeds. Update the script tag on your website afterward.
              </p>
            </div>

            <div className="card dashboard-section">
              <h2 className="dashboard-section-title">📋 Embed Code</h2>
              <p style={{ marginBottom: 20 }}>
                Add this <code style={{ color: 'var(--brand-accent)' }}>&lt;script&gt;</code> tag just before the closing <code style={{ color: 'var(--brand-accent)' }}>&lt;/body&gt;</code> tag on your website.
              </p>
              <div className="snippet-block glass">
                <div className="snippet-block__header">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>HTML</span>
                  <button id="copy-snippet-btn" className="btn btn--ghost btn--sm" onClick={copySnippet}>
                    {snippetCopied ? '✓ Copied!' : '📋 Copy Code'}
                  </button>
                </div>
                <pre className="snippet-code">{`<script 
  src="https://vakilbot.ai/widget.js"
  data-key="${firm?.embed_key}"
  data-firm="${firm?.name}"
  data-color="#6366f1">
</script>`}</pre>
              </div>
            </div>

            <div className="card dashboard-section">
              <h2 className="dashboard-section-title">🎨 Widget Attributes</h2>
              <div className="attributes-grid">
                {[
                  { attr: 'data-key', req: true, desc: 'Your unique embed key (required)', example: firm?.embed_key?.slice(0, 12) + '...' },
                  { attr: 'data-firm', req: false, desc: 'Your firm name (shown in widget header)', example: firm?.name || 'Your Firm' },
                  { attr: 'data-color', req: false, desc: 'Widget accent color (hex/rgb)', example: '#6366f1' },
                  { attr: 'data-api', req: false, desc: 'Custom API URL (for self-hosted)', example: 'https://api.yourfirm.in' },
                  { attr: 'data-greeting', req: false, desc: 'Custom greeting message', example: 'How can I help?' },
                ].map((a, i) => (
                  <div key={i} className="attr-row">
                    <code className="attr-name">{a.attr}</code>
                    {a.req && <span className="badge badge--warning" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>Required</span>}
                    <span className="attr-desc">{a.desc}</span>
                    <code className="attr-example">{a.example}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ CHAT HISTORY TAB ══ */}
        {activeTab === 'chats' && (
          <div className="tab-content animate-fade-up">
            <div className="chats-layout">
              {/* Session list */}
              <div className="card dashboard-section chats-list-panel">
                <h2 className="dashboard-section-title">💬 All Sessions</h2>
                {allSessions.length > 0 ? (
                  <div className="sessions-list">
                    {allSessions.map(s => (
                      <div key={s.session_id}
                        className={`session-row session-row--clickable ${selectedSession === s.session_id ? 'session-row--active' : ''}`}
                        onClick={() => loadSessionMessages(s.session_id)}>
                        <div className="session-row__avatar">💬</div>
                        <div className="session-row__info">
                          <div className="session-row__id">#{s.session_id?.slice(0, 10)}...</div>
                          <div className="session-row__meta">{s.message_count} msgs · {formatDate(s.last_active)}</div>
                        </div>
                        <div className={`badge ${s.is_active ? 'badge--success' : ''}`} style={{ flexShrink: 0 }}>
                          {s.is_active ? '●' : '○'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span style={{ fontSize: '2.5rem' }}>💬</span>
                    <h3>No chats yet</h3>
                    <p>Sessions will appear here once clients use your widget.</p>
                    <button className="btn btn--primary btn--sm" onClick={() => setActiveTab('embed')}>Set Up Widget →</button>
                  </div>
                )}
              </div>

              {/* Message viewer */}
              <div className="card dashboard-section chats-messages-panel">
                {selectedSession ? (
                  <>
                    <h2 className="dashboard-section-title">📩 Session #{selectedSession?.slice(0, 10)}...</h2>
                    {sessionLoading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                        <div className="spinner" style={{ width: 32, height: 32 }} />
                      </div>
                    ) : sessionMessages.length > 0 ? (
                      <div className="session-messages">
                        {sessionMessages.map((msg, i) => (
                          <div key={i} className={`session-msg session-msg--${msg.role}`}>
                            <div className="session-msg__avatar">
                              {msg.role === 'user' ? '👤' : '⚖️'}
                            </div>
                            <div className="session-msg__body">
                              <div className="session-msg__role">{msg.role === 'user' ? 'Client' : 'VakilBot'}</div>
                              <div className="session-msg__content"
                                dangerouslySetInnerHTML={{ __html: formatMsg(msg.content) }} />
                              {msg.sources?.length > 0 && (
                                <div className="session-msg__sources">
                                  📚 Sources: {[...new Set(msg.sources.map(s => s.source))].join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)' }}>No messages found for this session.</p>
                    )}
                  </>
                ) : (
                  <div className="empty-state">
                    <span style={{ fontSize: '2.5rem' }}>👈</span>
                    <h3>Select a session</h3>
                    <p>Click on a session from the left panel to view its messages.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ ANALYTICS TAB ══ */}
        {activeTab === 'analytics' && (
          <div className="tab-content animate-fade-up">
            <div className="analytics-grid">
              {/* Key Metrics */}
              <div className="card analytics-card">
                <h2 className="dashboard-section-title">📊 Platform Metrics</h2>
                <div className="metrics-list">
                  {[
                    { label: 'Total Client Sessions', value: totalSessions, max: Math.max(totalSessions, 10), color: '#6366f1' },
                    { label: 'Total Messages', value: totalMessages, max: Math.max(totalMessages, 20), color: '#8b5cf6' },
                    { label: 'AI Responses', value: aiResponses, max: Math.max(aiResponses, 10), color: '#a78bfa' },
                    { label: 'Avg Messages/Session', value: avgMsgsPerSession, max: 20, color: '#22c55e' },
                  ].map((m, i) => (
                    <div key={i} className="metric-row">
                      <div className="metric-row__top">
                        <span className="metric-label">{m.label}</span>
                        <span className="metric-value">{m.value}</span>
                      </div>
                      <div className="metric-bar-bg">
                        <div className="metric-bar-fill" style={{
                          width: `${Math.min(100, (parseFloat(m.value) / Math.max(parseFloat(m.max), 1)) * 100)}%`,
                          background: m.color
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity heatmap-style chart */}
              <div className="card analytics-card">
                <h2 className="dashboard-section-title">📅 Session Activity</h2>
                {allSessions.length > 0 ? (
                  <div className="activity-chart">
                    {allSessions.slice(0, 14).map((s, i) => {
                      const height = Math.max(20, Math.min(100, (s.message_count / 20) * 100))
                      return (
                        <div key={i} className="activity-bar-wrap" title={`${s.message_count} messages`}>
                          <div className="activity-bar" style={{ height: `${height}%` }} />
                          <div className="activity-bar-label">{s.message_count}</div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '40px 0' }}>
                    <span style={{ fontSize: '2rem' }}>📅</span>
                    <p>Activity data will appear here once clients start chatting.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Firm plan info */}
            <div className="card dashboard-section" style={{ marginTop: 24 }}>
              <h2 className="dashboard-section-title">📦 Your Plan</h2>
              <div className="plan-info">
                <div className={`plan-badge plan-badge--${firm?.plan || 'free'}`}>
                  {(firm?.plan || 'free').toUpperCase()}
                </div>
                <div className="plan-limits">
                  {firm?.plan === 'free' && (
                    <>
                      <div className="plan-limit-row"><span>Chat messages/month</span><strong>100</strong></div>
                      <div className="plan-limit-row"><span>Websites</span><strong>1</strong></div>
                      <div className="plan-limit-row"><span>Legal database</span><strong>Basic</strong></div>
                    </>
                  )}
                  {firm?.plan === 'pro' && (
                    <>
                      <div className="plan-limit-row"><span>Chat messages/month</span><strong>5,000</strong></div>
                      <div className="plan-limit-row"><span>Websites</span><strong>3</strong></div>
                      <div className="plan-limit-row"><span>Legal database</span><strong>Full corpus</strong></div>
                    </>
                  )}
                  {firm?.plan === 'enterprise' && (
                    <>
                      <div className="plan-limit-row"><span>Chat messages/month</span><strong>Unlimited</strong></div>
                      <div className="plan-limit-row"><span>Websites</span><strong>Unlimited</strong></div>
                      <div className="plan-limit-row"><span>Legal database</span><strong>Custom</strong></div>
                    </>
                  )}
                </div>
                {firm?.plan !== 'enterprise' && (
                  <Link to="/#pricing" className="btn btn--primary btn--sm">Upgrade Plan →</Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ SETTINGS TAB ══ */}
        {activeTab === 'settings' && (
          <div className="tab-content animate-fade-up">
            <div className="card dashboard-section">
              <h2 className="dashboard-section-title">🏢 Firm Profile</h2>
              <p style={{ marginBottom: 24 }}>Update your law firm's public information shown to clients.</p>

              {settingsMsg && (
                <div className={`notif notif--${settingsMsg.type}`} style={{ marginBottom: 20 }}>
                  {settingsMsg.text}
                </div>
              )}

              <div className="settings-form">
                <div className="settings-form__row">
                  <div className="form-group">
                    <label htmlFor="firm-name">Firm Name</label>
                    <input id="firm-name" className="form-input"
                      value={settingsForm.name || ''} onChange={e => setSettingsForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Sharma & Associates" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="firm-email">Contact Email</label>
                    <input id="firm-email" className="form-input" type="email"
                      value={settingsForm.email || ''} onChange={e => setSettingsForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="contact@yourfirm.in" />
                  </div>
                </div>
                <div className="settings-form__row">
                  <div className="form-group">
                    <label htmlFor="firm-website">Website URL</label>
                    <input id="firm-website" className="form-input" type="url"
                      value={settingsForm.website || ''} onChange={e => setSettingsForm(p => ({ ...p, website: e.target.value }))}
                      placeholder="https://yourfirm.in" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="firm-phone">Phone Number</label>
                    <input id="firm-phone" className="form-input" type="tel"
                      value={settingsForm.phone || ''} onChange={e => setSettingsForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="firm-address">Office Address</label>
                  <input id="firm-address" className="form-input"
                    value={settingsForm.address || ''} onChange={e => setSettingsForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="123 Law Street, New Delhi 110001" />
                </div>
                <div className="form-group">
                  <label htmlFor="firm-description">About Your Firm</label>
                  <textarea id="firm-description" className="form-input" rows={3}
                    value={settingsForm.description || ''} onChange={e => setSettingsForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Briefly describe your firm's specializations and expertise..." />
                </div>
                <button className="btn btn--primary" onClick={saveSettings} disabled={settingsSaving}>
                  {settingsSaving ? <><span className="spinner" /> Saving...</> : '💾 Save Changes'}
                </button>
              </div>
            </div>

            <div className="card dashboard-section" style={{ marginTop: 24 }}>
              <h2 className="dashboard-section-title">🔐 Danger Zone</h2>
              <p style={{ marginBottom: 16 }}>These actions cannot be undone.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn btn--outline btn--sm" onClick={regenKey} disabled={regenLoading}>
                  {regenLoading ? <span className="spinner" /> : '🔄 Regenerate Embed Key'}
                </button>
                <button className="btn btn--ghost btn--sm" onClick={() => { logout(); navigate('/') }}>
                  🚪 Logout from all devices
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
