/**
 * LoadingScreen
 *
 * Full-page loading indicator with the app's glassmorphic design.
 * Used as the Suspense fallback while lazy-loaded route components are being fetched.
 */

import React from 'react'

/** Inline styles scoped to this component to avoid extra CSS file */
const styles = {
  wrapper: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    zIndex: 'var(--z-overlay)',
    animation: 'fadeIn var(--duration-slow) var(--ease-out)',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-6)',
    padding: 'var(--space-10) var(--space-12)',
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 'var(--radius-xl)',
    background: 'var(--gradient-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 32,
    boxShadow: 'var(--shadow-glow-primary)',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid var(--surface-3)',
    borderTopColor: 'var(--primary-500)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  text: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-medium)',
    color: 'var(--text-secondary)',
    letterSpacing: 'var(--tracking-wide)',
    textTransform: 'uppercase',
  },
}

export default function LoadingScreen() {
  return (
    <div style={styles.wrapper}>
      <div className="glass-panel" style={styles.panel}>
        {/* App logo */}
        <div style={styles.logoBox} aria-hidden="true">
          ♫
        </div>

        {/* Spinner */}
        <div style={styles.spinner} role="status" aria-label="Loading" />

        {/* Label */}
        <span style={styles.text}>Loading…</span>
      </div>
    </div>
  )
}
