import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location])

  // Scroll to a section on the landing page
  const scrollToSection = (e, sectionId) => {
    e.preventDefault()
    setMobileOpen(false)
    if (location.pathname !== '/') {
      // Navigate to home first, then scroll after a short delay
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(sectionId)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else {
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">⚖️</span>
          <span>Vakil<span className="gradient-text">Bot</span></span>
        </Link>

        {/* Desktop links */}
        <div className="navbar__links">
          <a href="#features" className="navbar__link" onClick={(e) => scrollToSection(e, 'features')}>Features</a>
          <a href="#pricing" className="navbar__link" onClick={(e) => scrollToSection(e, 'pricing')}>Pricing</a>
          <Link to="/demo" className="navbar__link">Live Demo</Link>
          <a href="#how" className="navbar__link" onClick={(e) => scrollToSection(e, 'how')}>How It Works</a>
        </div>

        {/* Desktop actions */}
        <div className="navbar__actions">
          {token ? (
            <>
              <span className="navbar__user-hint">👤 {user?.first_name || user?.username}</span>
              <Link to="/dashboard" className="btn btn--ghost btn--sm">Dashboard</Link>
              <button onClick={handleLogout} className="btn btn--outline btn--sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost btn--sm">Login</Link>
              <Link to="/register" className="btn btn--primary btn--sm">Get Started Free</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`navbar__hamburger ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="navbar__mobile">
          <a href="#features" className="navbar__mobile-link" onClick={(e) => scrollToSection(e, 'features')}>Features</a>
          <a href="#pricing" className="navbar__mobile-link" onClick={(e) => scrollToSection(e, 'pricing')}>Pricing</a>
          <Link to="/demo" className="navbar__mobile-link">Live Demo</Link>
          <a href="#how" className="navbar__mobile-link" onClick={(e) => scrollToSection(e, 'how')}>How It Works</a>
          <div className="navbar__mobile-divider" />
          {token ? (
            <>
              <Link to="/dashboard" className="btn btn--primary btn--full">Go to Dashboard</Link>
              <button onClick={handleLogout} className="btn btn--ghost btn--full">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--outline btn--full">Login</Link>
              <Link to="/register" className="btn btn--primary btn--full">Get Started Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
