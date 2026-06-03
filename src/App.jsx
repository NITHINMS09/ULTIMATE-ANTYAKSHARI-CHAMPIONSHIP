/**
 * App — Root Component
 *
 * Sets up:
 * - BrowserRouter for client-side routing
 * - React.lazy + Suspense for code-split page loading
 * - Navbar (hidden on BigScreen and Onboarding routes)
 * - ToastProvider / ToastContainer for global notifications
 * - Premium glass-panel loading fallback
 */

import React, { Suspense, lazy, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import LoadingScreen from './components/layout/LoadingScreen'
import { ToastProvider, ToastContainer } from './components/ui/Toast'
import DebugPanel from './components/control/DebugPanel'

/* ── Lazy-loaded Page Components ─────────────────────────── */
const Home = lazy(() => import('./pages/Home'))
const GameSetup = lazy(() => import('./pages/GameSetup'))
const GamePlay = lazy(() => import('./pages/GamePlay'))
const GameResults = lazy(() => import('./pages/GameResults'))
const ControlCenter = lazy(() => import('./pages/ControlCenter'))
const BigScreen = lazy(() => import('./pages/BigScreen'))
const TeamEditor = lazy(() => import('./pages/TeamEditor'))
const Trophies = lazy(() => import('./pages/Trophies'))
const MatchHistory = lazy(() => import('./pages/MatchHistory'))
const MatchReplay = lazy(() => import('./pages/MatchReplay'))
const Insights = lazy(() => import('./pages/Insights'))
const Community = lazy(() => import('./pages/Community'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const DeviceSetup = lazy(() => import('./pages/DeviceSetup'))

/** Routes where the Navbar should be hidden */
const NAVBAR_HIDDEN_ROUTES = ['/bigscreen', '/onboarding']

/**
 * Inner layout component that reads location to conditionally show Navbar.
 * Must be inside <BrowserRouter> to access useLocation.
 */
function AppLayout() {
  const { pathname } = useLocation()
  const showNavbar = !NAVBAR_HIDDEN_ROUTES.includes(pathname.toLowerCase())
  const [debugOpen, setDebugOpen] = useState(false)

  // Listen for Ctrl+Alt+D shortcut key to toggle debug panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        setDebugOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="app">
      {showNavbar && <Navbar />}

      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/setup" element={<GameSetup />} />
          <Route path="/play" element={<GamePlay />} />
          <Route path="/results" element={<GameResults />} />
          <Route path="/control" element={<ControlCenter />} />
          <Route path="/bigscreen" element={<BigScreen />} />
          <Route path="/teams/edit" element={<TeamEditor />} />
          <Route path="/trophies" element={<Trophies />} />
          <Route path="/history" element={<MatchHistory />} />
          <Route path="/replay/:id" element={<MatchReplay />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/device-setup" element={<DeviceSetup />} />
        </Routes>
      </Suspense>

      <ToastContainer />
      <DebugPanel isOpen={debugOpen} onClose={() => setDebugOpen(false)} />
    </div>
  )
}

/**
 * Top-level App component.
 * Wraps everything in BrowserRouter and ToastProvider.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppLayout />
      </ToastProvider>
    </BrowserRouter>
  )
}
