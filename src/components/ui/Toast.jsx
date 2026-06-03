/**
 * Toast Notification System
 *
 * Provides a context-based toast notification system with animated
 * entry/exit, auto-dismiss, and support for success/error/warning/info types.
 *
 * Usage:
 *   Wrap your app with <ToastProvider>
 *   Place <ToastContainer /> once in your component tree
 *   Call const { addToast } = useToast() to show notifications
 *
 *   addToast({ type: 'success', message: 'Saved!' })
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

/** Icon map for each toast type */
const TOAST_ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

/** Color token for each toast type icon */
const TOAST_ICON_COLORS = {
  success: 'var(--success-400)',
  error: 'var(--error-400)',
  warning: 'var(--warning-400)',
  info: 'var(--info-400)',
}

/** Default auto-dismiss duration in milliseconds */
const AUTO_DISMISS_MS = 5000

/**
 * @typedef {Object} Toast
 * @property {string}  id       - Unique identifier
 * @property {'success'|'error'|'warning'|'info'} type - Toast type
 * @property {string}  message  - Display message
 */

/**
 * @typedef {Object} ToastContextValue
 * @property {(toast: { type: string, message: string, duration?: number }) => void} addToast
 * @property {(id: string) => void} removeToast
 */

const ToastContext = createContext(null)

/**
 * Hook to access the toast notification system.
 * @returns {ToastContextValue}
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

/**
 * Provides toast state and methods to the component tree.
 * @param {{ children: React.ReactNode }} props
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef({})

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id])
      delete timersRef.current[id]
    }
  }, [])

  const addToast = useCallback(
    ({ type = 'info', message, duration = AUTO_DISMISS_MS }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      setToasts((prev) => [...prev, { id, type, message }])

      // Auto-dismiss
      timersRef.current[id] = setTimeout(() => {
        removeToast(id)
      }, duration)

      return id
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
    </ToastContext.Provider>
  )
}

/**
 * Framer Motion animation variants for individual toast items.
 */
const toastVariants = {
  initial: {
    opacity: 0,
    x: 60,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: 60,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
}

/**
 * Renders all active toasts. Place once in your App component tree.
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = TOAST_ICONS[toast.type] || Info
          const iconColor = TOAST_ICON_COLORS[toast.type] || TOAST_ICON_COLORS.info

          return (
            <motion.div
              key={toast.id}
              className={`toast toast-${toast.type}`}
              variants={toastVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              layout
            >
              <Icon size={20} style={{ color: iconColor, flexShrink: 0 }} />
              <span className="toast-message">{toast.message}</span>
              <button
                className="toast-close"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer
