import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './LandingPage.css'

const features = [
  { icon: '🧠', title: 'RAG-Powered Intelligence', desc: 'Built on a fine-tuned retrieval pipeline trained on the Indian Constitution, IPC, CrPC, RTI, Consumer Protection Act, and more.' },
  { icon: '⚡', title: 'Instant Legal Answers', desc: 'Clients get immediate responses to legal questions 24/7 — reducing first-contact time for your firm by over 60%.' },
  { icon: '🔗', title: 'One-Line Integration', desc: 'Paste a single <script> tag into your website. The widget auto-brands to your firm and is live in minutes.' },
  { icon: '📚', title: 'Source Citations', desc: 'Every answer cites specific Articles, Sections, and Acts — building trust and transparency with clients.' },
  { icon: '🔐', title: 'Private & Secure', desc: 'Each firm gets an isolated embed key. Chat sessions are stored securely and accessible only to your team.' },
  { icon: '📊', title: 'Dashboard Analytics', desc: 'Track chat volumes, popular topics, session history, and client engagement from your firm dashboard.' },
]

const steps = [
  { num: '01', title: 'Register Your Firm', desc: 'Create your account and set up your law firm profile in under 2 minutes.' },
  { num: '02', title: 'Get Your Embed Key', desc: 'Copy your unique embed key from the dashboard. Each key is tied to your firm.' },
  { num: '03', title: 'Add the Widget', desc: `Paste one <script> tag before </body> on your website. That's it!` },
  { num: '04', title: 'Serve Clients 24/7', desc: 'Clients get instant AI-powered Indian law guidance. You get the leads.' },
]

const testimonials = [
  { name: 'Adv. Priya Sharma', firm: 'Sharma & Associates, New Delhi', quote: 'VakilBot handles basic client inquiries overnight. Our team comes in the morning to leads that are already pre-qualified. Incredible ROI.' },
  { name: 'Adv. Rajesh Kumar', firm: 'Kumar Legal LLP, Mumbai', quote: 'The accuracy on Indian constitutional law questions is remarkable. My clients are asking the right questions before our first meeting.' },
  { name: 'Adv. Meena Patel', firm: 'Patel & Co., Ahmedabad', quote: `Setup took 5 minutes. The widget perfectly matches our site. Clients love getting instant answers at 2 AM when they're worried.` },
]

const pricing = [
  {
    plan: 'Free', price: '₹0', period: '/month', badge: null,
    features: ['1 law firm website', '100 chat messages/month', 'Basic Indian law database', 'Email support'],
    cta: 'Get Started Free', primary: false,
  },
  {
    plan: 'Pro', price: '₹2,999', period: '/month', badge: 'Most Popular',
    features: ['3 websites', '5,000 messages/month', 'Full legal corpus', 'Chat history & analytics', 'Priority support', 'Custom branding'],
    cta: 'Start Pro Trial', primary: true,
  },
  {
    plan: 'Enterprise', price: 'Custom', period: '', badge: null,
    features: ['Unlimited websites', 'Unlimited messages', 'Custom law corpus', 'Dedicated instance', 'SLA guarantee', 'API access'],
    cta: 'Contact Us', primary: false,
  },
]

export default function LandingPage() {
  return (
    <div className="landing">
      <Navbar />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="orb orb--primary" style={{ width: 600, height: 600, top: -200, left: '30%' }} />
        <div className="orb orb--secondary" style={{ width: 400, height: 400, bottom: -100, right: '20%' }} />
        <div className="container hero__inner animate-fade-up">
          <div className="badge badge--brand" style={{ marginBottom: 24 }}>
            🇮🇳 India's First Legal AI Chatbot Platform
          </div>
          <h1 className="hero__title display">
            AI Legal Assistant<br />
            <span className="gradient-text">Built for Indian Law</span>
          </h1>
          <p className="hero__subtitle">
            Embed an intelligent chatbot on your law firm's website — powered by RAG architecture, 
            trained on the Indian Constitution, IPC, CrPC, and 10+ major acts. Your clients get 
            instant, accurate legal guidance 24/7.
          </p>
          <div className="hero__cta">
            <Link to="/register" className="btn btn--primary btn--lg">
              Start Free — No Credit Card 🚀
            </Link>
            <Link to="/demo" className="btn btn--outline btn--lg">
              See It In Action →
            </Link>
          </div>
          <div className="hero__social-proof">
            <span>🌟 Trusted by 200+ law firms across India</span>
            <span>·</span>
            <span>⚡ Average response time: 1.2 seconds</span>
            <span>·</span>
            <span>📋 50,000+ legal questions answered</span>
          </div>
        </div>
      </section>

      {/* ── Widget Preview ── */}
      <section className="widget-preview section">
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="section__eyebrow">The Widget</p>
          <h2 className="section__title">Looks beautiful on any website</h2>
          <p className="section__subtitle" style={{ margin: '0 auto 48px' }}>
            A floating chat button appears on your firm's site. Clients click to ask their legal questions. 
            The AI responds with cited Indian law references.
          </p>
          <div className="widget-mockup">
            <div className="widget-mockup__browser">
              <div className="widget-mockup__dots">
                <span /><span /><span />
              </div>
              <div className="widget-mockup__url">sharma-associates.in</div>
            </div>
            <div className="widget-mockup__content">
              <div className="site-preview">
                <div className="site-preview__nav" />
                <div className="site-preview__hero" />
                <div className="site-preview__text">
                  <div className="site-preview__line" style={{ width: '60%' }} />
                  <div className="site-preview__line" style={{ width: '80%' }} />
                  <div className="site-preview__line" style={{ width: '45%' }} />
                </div>
              </div>
              <div className="chat-preview">
                <div className="chat-preview__window glass">
                  <div className="chat-preview__header">
                    <div className="chat-preview__avatar">⚖️</div>
                    <div>
                      <div className="chat-preview__name">VakilBot Legal AI</div>
                      <div className="chat-preview__status">
                        <span className="chat-status-dot" /> Online · Indian Law Expert
                      </div>
                    </div>
                  </div>
                  <div className="chat-preview__msgs">
                    <div className="chat-bubble chat-bubble--bot">
                      Namaste! 👋 I can help with Indian constitutional rights, consumer protection, criminal law, and more. What's your legal question?
                    </div>
                    <div className="chat-bubble chat-bubble--user">
                      What are my rights if I'm arrested?
                    </div>
                    <div className="chat-bubble chat-bubble--bot">
                      Under <strong>Article 22</strong> of the Indian Constitution, you have the right to be informed of grounds of arrest, right to a lawyer, and must be produced before a magistrate within <strong>24 hours</strong>...
                    </div>
                  </div>
                  <div className="chat-preview__input">
                    <span>Ask a legal question...</span>
                  </div>
                </div>
                <div className="chat-preview__fab">⚖️</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="section">
        <div className="container">
          <p className="section__eyebrow">Why VakilBot</p>
          <h2 className="section__title">Everything your firm needs</h2>
          <p className="section__subtitle" style={{ marginBottom: 56 }}>
            Not just another chatbot. A purpose-built AI legal assistant trained exclusively on Indian law.
          </p>
          <div className="grid-3">
            {features.map((f, i) => (
              <div key={i} className="card feature-card">
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-section section">
        <div className="container">
          <div className="stats-grid">
            {[['10+', 'Indian Laws Covered'],['50K+', 'Legal Questions Answered'],['200+', 'Law Firms Using VakilBot'],['< 2s', 'Average Response Time']].map(([n, l]) => (
              <div key={l} className="stat-item">
                <div className="stat-number gradient-text">{n}</div>
                <div className="stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="section">
        <div className="container">
          <p className="section__eyebrow">Integration</p>
          <h2 className="section__title">Live in 5 minutes</h2>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-card__num">{s.num}</div>
                <h3 className="step-card__title">{s.title}</h3>
                <p className="step-card__desc">{s.desc}</p>
                {i < steps.length - 1 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
          <div className="embed-snippet glass">
            <div className="embed-snippet__label">📋 Your embed code (copy & paste):</div>
            <code className="embed-snippet__code">
              {`<script src="https://vakilbot.ai/widget.js"\n  data-key="YOUR_API_KEY"\n  data-firm="Your Firm Name">\n</script>`}
            </code>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section">
        <div className="container">
          <p className="section__eyebrow">Testimonials</p>
          <h2 className="section__title">Loved by Indian law firms</h2>
          <div className="grid-3" style={{ marginTop: 48 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="card testimonial-card">
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name[0]}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-firm">{t.firm}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="section">
        <div className="container">
          <p className="section__eyebrow">Pricing</p>
          <h2 className="section__title">Simple, transparent pricing</h2>
          <p className="section__subtitle" style={{ marginBottom: 56 }}>Start free. Scale as your firm grows.</p>
          <div className="pricing-grid">
            {pricing.map((p, i) => (
              <div key={i} className={`card pricing-card ${p.primary ? 'pricing-card--featured' : ''}`}>
                {p.badge && <div className="badge badge--brand pricing-badge">{p.badge}</div>}
                <h3 className="pricing-plan">{p.plan}</h3>
                <div className="pricing-price">
                  <span className="pricing-amount">{p.price}</span>
                  <span className="pricing-period">{p.period}</span>
                </div>
                <ul className="pricing-features">
                  {p.features.map((f, j) => (
                    <li key={j}><span className="check">✓</span>{f}</li>
                  ))}
                </ul>
                <Link to="/register" className={`btn btn--full ${p.primary ? 'btn--primary' : 'btn--outline'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section section">
        <div className="container cta-section__inner">
          <div className="orb orb--primary" style={{ width: 500, height: 500, top: -200, left: '50%', transform: 'translateX(-50%)' }} />
          <h2 className="cta-section__title display">Your clients need legal help right now.</h2>
          <p className="cta-section__subtitle">Every unanswered query is a missed client. Let VakilBot handle them 24/7.</p>
          <Link to="/register" className="btn btn--primary btn--lg">
            Start Free Today — No Credit Card Required
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer__top">
            <div className="footer__brand">
              <div className="navbar__logo">⚖️ Vakil<span className="gradient-text">Bot</span></div>
              <p>India's premier AI legal chatbot platform. Built with ❤️ for Indian law firms.</p>
            </div>
            <div className="footer__links-grid">
              <div><h4>Product</h4><a href="#">Features</a><a href="#">Pricing</a><Link to="/demo">Demo</Link></div>
              <div><h4>Legal</h4><a href="#">Privacy Policy</a><a href="#">Terms of Service</a><a href="#">GDPR</a></div>
              <div><h4>Company</h4><a href="#">About</a><a href="#">Blog</a><a href="#">Contact</a></div>
            </div>
          </div>
          <div className="divider" />
          <div className="footer__bottom">
            <span>© 2025 VakilBot. All rights reserved.</span>
            <span>Made in 🇮🇳 India</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
