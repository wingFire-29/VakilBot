import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      background: 'var(--bg-base)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="orb orb--primary" style={{ width: 500, height: 500, top: -200, left: '20%' }} />
      <div className="orb orb--secondary" style={{ width: 350, height: 350, bottom: -100, right: '20%' }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '6rem', marginBottom: 16 }}>⚖️</div>
        <div style={{
          fontSize: 'clamp(5rem, 15vw, 9rem)',
          fontWeight: 900,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 16,
        }}>404</div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12 }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 400 }}>
          The page you're looking for doesn't exist. It may have been moved or deleted.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn--primary">← Back to Home</Link>
          <Link to="/demo" className="btn btn--outline">Try the Demo</Link>
        </div>
      </div>
    </div>
  )
}
