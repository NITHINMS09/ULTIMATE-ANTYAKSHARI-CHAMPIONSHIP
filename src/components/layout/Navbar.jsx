/**
 * Navbar
 *
 * Premium sticky navigation bar for the Ultimate Antyakshari Championship.
 * Features:
 * - Brand logo (♫ gradient icon) + "UAC" text
 * - Desktop navigation links with active state via NavLink
 * - Mobile hamburger with animated slide-out glass panel
 * - Responsive — hamburger shows below 768px (CSS hides .navbar-links)
 */

import React, { useState, useCallback, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Menu,
  X,
  Home,
  Play,
  Clock,
  Trophy,
  BarChart3,
  Users,
} from 'lucide-react'

/** Navigation link definitions */
const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/play', label: 'Play', icon: Play },
  { to: '/history', label: 'History', icon: Clock },
  { to: '/trophies', label: 'Trophies', icon: Trophy },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/community', label: 'Community', icon: Users },
]

/**
 * Returns the appropriate className string for a NavLink,
 * combining the base class with the active modifier.
 */
function navLinkClass({ isActive }) {
  return isActive ? 'nav-link nav-link--active' : 'nav-link'
}

/** Inline styles for elements not covered by index.css */
const styles = {
  hamburger: {
    display: 'none',
    padding: 'var(--space-2)',
    color: 'var(--text-primary)',
    borderRadius: 'var(--radius-md)',
    transition: 'background var(--duration-fast)',
  },
  mobileOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    zIndex: 'var(--z-overlay)',
  },
  mobileMenu: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '280px',
    maxWidth: '80vw',
    background: 'var(--bg-secondary)',
    borderLeft: 'var(--glass-border)',
    backdropFilter: 'blur(var(--glass-blur-heavy))',
    WebkitBackdropFilter: 'blur(var(--glass-blur-heavy))',
    zIndex: 'var(--z-modal)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-xl)',
  },
  mobileHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-4) var(--space-6)',
    borderBottom: 'var(--glass-border)',
    height: 'var(--header-height)',
  },
  mobileNav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
    padding: 'var(--space-4) var(--space-3)',
    overflowY: 'auto',
  },
  mobileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    fontSize: 'var(--text-base)',
    fontWeight: 'var(--font-medium)',
    borderRadius: 'var(--radius-lg)',
    transition: 'all var(--duration-normal) var(--ease-out)',
  },
}

/** Framer Motion variants for the mobile menu slide-in */
const menuVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.25, ease: 'easeIn' },
  },
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  /** Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  /** Close menu on Escape key */
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    if (mobileOpen) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const toggleMenu = useCallback(() => {
    setMobileOpen((prev) => !prev)
  }, [])

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        {/* ── Brand ── */}
        <NavLink to="/" className="navbar-brand" aria-label="UAC Home">
          <span className="navbar-brand-icon" aria-hidden="true">
            ♫
          </span>
          <span>UAC</span>
        </NavLink>

        {/* ── Desktop Links ── */}
        <div className="navbar-links">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={navLinkClass}
              end={to === '/'}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          className="navbar-hamburger"
          style={styles.hamburger}
          onClick={toggleMenu}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* ── Mobile Slide-out ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="mobile-overlay"
              style={styles.mobileOverlay}
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Menu Panel */}
            <motion.div
              key="mobile-menu"
              style={styles.mobileMenu}
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-label="Navigation menu"
            >
              {/* Header */}
              <div style={styles.mobileHeader}>
                <NavLink
                  to="/"
                  className="navbar-brand"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="navbar-brand-icon" aria-hidden="true">
                    ♫
                  </span>
                  <span>UAC</span>
                </NavLink>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  style={{
                    color: 'var(--text-secondary)',
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Links */}
              <nav style={styles.mobileNav}>
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                  const isActive = to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(to)
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/'}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        ...styles.mobileLink,
                        color: isActive
                          ? 'var(--primary-400)'
                          : 'var(--text-secondary)',
                        background: isActive
                          ? 'rgba(124, 58, 237, 0.1)'
                          : 'transparent',
                      }}
                    >
                      <Icon size={20} />
                      {label}
                    </NavLink>
                  )
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 
        CSS to show hamburger on mobile.
        This block pairs with the `.navbar-links { display: none }` rule
        already in index.css at @media (max-width: 768px).
      */}
      <style>{`
        @media (max-width: 768px) {
          .navbar-hamburger {
            display: flex !important;
          }
        }
      `}</style>
    </>
  )
}
