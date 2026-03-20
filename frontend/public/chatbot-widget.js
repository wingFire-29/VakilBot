/**
 * VakilBot – Embeddable Legal AI Chatbot Widget
 * Usage: <script src="chatbot-widget.js" data-key="YOUR_EMBED_KEY" data-api="https://your-api.com"></script>
 * 
 * Zero dependencies. Works on any website.
 */
(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────────────────
  const script = document.currentScript || document.querySelector('script[data-key]');
  const EMBED_KEY = script?.getAttribute('data-key') || '';
  const API_BASE = (script?.getAttribute('data-api') || 'https://vakilbot-api.onrender.com').replace(/\/$/, '');
  const FIRM_NAME = script?.getAttribute('data-firm') || 'VakilBot';
  const ACCENT_COLOR = script?.getAttribute('data-color') || '#6366f1';

  let sessionId = null;
  let isOpen = false;
  let isTyping = false;

  // ── Inject CSS ───────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #vb-widget * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, sans-serif; }
    
    #vb-fab {
      position: fixed; bottom: 28px; right: 28px; z-index: 99999;
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, ${ACCENT_COLOR}, #8b5cf6);
      border: none; cursor: pointer;
      box-shadow: 0 8px 32px rgba(99,102,241,0.5);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
    }
    #vb-fab:hover { transform: scale(1.12); box-shadow: 0 12px 40px rgba(99,102,241,0.65); }
    #vb-fab svg { width:28px; height:28px; fill:white; transition: transform 0.3s; }
    #vb-fab.open svg { transform: rotate(45deg); }

    #vb-window {
      position: fixed; bottom: 100px; right: 28px; z-index: 99998;
      width: 380px; max-height: 580px;
      background: #0f0f14; border-radius: 20px;
      border: 1px solid rgba(255,255,255,.08);
      box-shadow: 0 24px 80px rgba(0,0,0,0.6);
      display: flex; flex-direction: column; overflow: hidden;
      transform: scale(0.85) translateY(20px); opacity: 0;
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s;
      pointer-events: none;
    }
    #vb-window.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }

    #vb-header {
      padding: 16px 20px;
      background: linear-gradient(135deg, ${ACCENT_COLOR}22, #8b5cf622);
      border-bottom: 1px solid rgba(255,255,255,.06);
      display: flex; align-items: center; gap: 12px;
    }
    #vb-header .vb-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, ${ACCENT_COLOR}, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0;
    }
    #vb-header .vb-title { color: #fff; font-weight: 700; font-size: 15px; }
    #vb-header .vb-subtitle { color: rgba(255,255,255,.5); font-size: 12px; margin-top: 2px; }
    #vb-header .vb-status { display: flex; align-items: center; gap: 6px; }
    #vb-header .vb-dot { width:8px; height:8px; border-radius:50%; background:#22c55e;
      animation: vb-pulse 2s infinite; }
    @keyframes vb-pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }

    #vb-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
      scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.1) transparent;
    }
    #vb-messages::-webkit-scrollbar { width: 4px; }
    #vb-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 4px; }

    .vb-msg { display: flex; gap: 8px; max-width: 100%; animation: vb-fadeUp 0.3s ease; }
    @keyframes vb-fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }

    .vb-msg.user { flex-direction: row-reverse; }
    .vb-bubble {
      padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5;
      max-width: 85%; word-break: break-word;
    }
    .vb-msg.bot .vb-bubble { background: rgba(255,255,255,.07); color: #e2e8f0; border-radius: 4px 16px 16px 16px; }
    .vb-msg.user .vb-bubble { background: linear-gradient(135deg, ${ACCENT_COLOR}, #8b5cf6); color: #fff; border-radius: 16px 4px 16px 16px; }

    .vb-sources { margin-top: 8px; padding: 8px 10px; background: rgba(99,102,241,.1);
      border-left: 3px solid ${ACCENT_COLOR}; border-radius: 4px; font-size: 12px;
      color: rgba(255,255,255,.5); }
    .vb-sources strong { color: rgba(255,255,255,.7); }

    #vb-typing { display: flex; gap: 5px; align-items: center; padding: 10px 14px;
      background: rgba(255,255,255,.07); border-radius: 16px; width: fit-content; }
    #vb-typing span { width:8px; height:8px; background:rgba(255,255,255,.4); border-radius:50%;
      animation: vb-bounce 1.4s infinite; }
    #vb-typing span:nth-child(2) { animation-delay: 0.2s; }
    #vb-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes vb-bounce { 0%,80%,100%{transform:scale(0.7);} 40%{transform:scale(1);} }

    #vb-input-area {
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,.06);
      background: #0f0f14;
      display: flex; gap: 8px; align-items: flex-end;
    }
    #vb-input {
      flex: 1; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
      border-radius: 12px; padding: 10px 14px; color: #fff; font-size: 14px;
      resize: none; outline: none; max-height: 100px; min-height: 42px; line-height: 1.4;
      transition: border-color 0.2s;
    }
    #vb-input::placeholder { color: rgba(255,255,255,.35); }
    #vb-input:focus { border-color: ${ACCENT_COLOR}; }
    #vb-send {
      width: 42px; height: 42px; border-radius: 12px; border: none;
      background: linear-gradient(135deg, ${ACCENT_COLOR}, #8b5cf6);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: opacity 0.2s, transform 0.2s; flex-shrink: 0;
    }
    #vb-send:hover { opacity: 0.9; transform: scale(1.05); }
    #vb-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    #vb-send svg { width:18px; height:18px; fill:white; }

    #vb-footer { text-align: center; padding: 8px; font-size: 11px; color: rgba(255,255,255,.25); }
    #vb-footer a { color: ${ACCENT_COLOR}; text-decoration: none; }

    @media (max-width: 420px) {
      #vb-window { width: calc(100vw - 24px); right: 12px; bottom: 88px; }
      #vb-fab { right: 16px; bottom: 20px; }
    }
  `;
  document.head.appendChild(style);

  // ── Build HTML ───────────────────────────────────────────────────────────────
  const wrapper = document.createElement('div');
  wrapper.id = 'vb-widget';
  wrapper.innerHTML = `
    <div id="vb-window">
      <div id="vb-header">
        <div class="vb-avatar">⚖️</div>
        <div>
          <div class="vb-title">${FIRM_NAME} Legal Assistant</div>
          <div class="vb-status">
            <div class="vb-dot"></div>
            <span class="vb-subtitle">Online · Indian Law Expert</span>
          </div>
        </div>
      </div>
      <div id="vb-messages">
        <div class="vb-msg bot">
          <div class="vb-bubble">
            👋 Namaste! I'm <strong>VakilBot</strong>, your AI legal assistant specializing in Indian law.<br><br>
            I can help you with questions about your fundamental rights, consumer protection, family law, criminal law, and more.<br><br>
            <em>Note: I provide legal information, not formal legal advice. Always consult a qualified lawyer for your specific situation.</em><br><br>
            How can I assist you today?
          </div>
        </div>
      </div>
      <div id="vb-input-area">
        <textarea id="vb-input" placeholder="Ask a legal question..." rows="1"></textarea>
        <button id="vb-send" title="Send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div id="vb-footer">Powered by <a href="#" target="_blank">VakilBot AI</a></div>
    </div>

    <button id="vb-fab" title="Chat with Legal AI">
      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </button>
  `;
  document.body.appendChild(wrapper);

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const fab = document.getElementById('vb-fab');
  const win = document.getElementById('vb-window');
  const messages = document.getElementById('vb-messages');
  const input = document.getElementById('vb-input');
  const sendBtn = document.getElementById('vb-send');

  // ── Toggle ───────────────────────────────────────────────────────────────────
  fab.addEventListener('click', () => {
    isOpen = !isOpen;
    win.classList.toggle('open', isOpen);
    fab.classList.toggle('open', isOpen);
    if (isOpen) { input.focus(); scrollToBottom(); }
  });

  // ── Send message ─────────────────────────────────────────────────────────────
  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function addMessage(role, text, sources) {
    const msgEl = document.createElement('div');
    msgEl.className = `vb-msg ${role}`;
    let bubble = `<div class="vb-bubble">${text.replace(/\n/g, '<br>')}</div>`;
    if (sources && sources.length > 0) {
      bubble += `<div class="vb-sources"><strong>📚 Sources:</strong><br>${sources.map(s => s.source).filter((v, i, a) => a.indexOf(v) === i).join(', ')}</div>`;
    }
    msgEl.innerHTML = bubble;
    messages.appendChild(msgEl);
    scrollToBottom();
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'vb-msg bot';
    el.id = 'vb-typing-wrapper';
    el.innerHTML = `<div id="vb-typing"><span></span><span></span><span></span></div>`;
    messages.appendChild(el);
    scrollToBottom();
  }

  function hideTyping() {
    const el = document.getElementById('vb-typing-wrapper');
    if (el) el.remove();
  }

  async function sendMessage() {
    const q = input.value.trim();
    if (!q || isTyping) return;

    input.value = '';
    input.style.height = 'auto';
    addMessage('user', q);
    showTyping();
    isTyping = true;
    sendBtn.disabled = true;

    try {
      const body = { question: q, embed_key: EMBED_KEY };
      if (sessionId) body.session_id = sessionId;

      const res = await fetch(`${API_BASE}/api/chat/ask/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      hideTyping();

      if (res.ok) {
        sessionId = data.session_id;
        addMessage('bot', data.answer, data.sources);
      } else {
        addMessage('bot', data.error || 'Sorry, something went wrong. Please try again.');
      }
    } catch (err) {
      hideTyping();
      addMessage('bot', '⚠️ Unable to connect to the server. Please try again later.');
    }

    isTyping = false;
    sendBtn.disabled = false;
    input.focus();
  }

  // ── Events ───────────────────────────────────────────────────────────────────
  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  });

})();
