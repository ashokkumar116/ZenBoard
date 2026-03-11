/**
 * toast.jsx — Zenboard Toast System
 * ══════════════════════════════════════════════════════════════════
 *
 *  SETUP (main.jsx)
 *  ─────────────────
 *  import './styles/toast.css'          // after zenboard.css
 *  <ToastProvider> wraps your <App />
 *
 *  USAGE
 *  ─────
 *  const { toast } = useToast()
 *
 *  toast.success('Saved!')
 *  toast.error('Something went wrong', { title: 'Error', duration: 6000 })
 *  toast.warning('Low disk space', { action: { label: 'Free up', onClick: fn } })
 *  toast.info('3 updates available', { description: 'Click to review.' })
 *  toast.loading('Uploading file...')       // persistent — no timer
 *  toast.default('Event logged.')
 *
 *  // Update a toast (e.g. after loading)
 *  const id = toast.loading('Saving...')
 *  toast.update(id, { type: 'success', message: 'Saved!', duration: 3000 })
 *
 *  // Dismiss
 *  toast.dismiss(id)
 *  toast.dismissAll()
 *
 *  // Promise shorthand
 *  toast.promise(fetchData(), {
 *    loading: 'Fetching...',
 *    success: (data) => `Got ${data.length} items`,
 *    error:   (err)  => err.message,
 *  })
 *
 *  PROVIDER PROPS
 *  ──────────────
 *  position     'top-right' | 'top-left' | 'top-center'
 *               'bottom-right' | 'bottom-left' | 'bottom-center'
 *               Default: 'bottom-right'
 *
 *  duration     Default toast duration in ms. Default: 4000
 *               Set 0 for persistent (must be manually dismissed).
 *
 *  maxToasts    Max visible at once. Default: 5
 *
 *  pauseOnHover Pause timer on hover. Default: true
 *               (CSS handles progress bar pause; this handles JS timer)
 *
 *  enterDuration  Enter animation ms. Default: 300
 *  exitDuration   Exit animation ms.  Default: 220
 *
 *  PER-TOAST OPTIONS (second argument to toast.success() etc.)
 *  ────────────────────────────────────────────────────────────
 *  title          string | ReactNode  — bold line above message
 *  description    string | ReactNode  — mono small line below message
 *  duration       number              — override global duration (0 = persistent)
 *  dismissible    boolean             — show × button. Default: true
 *  icon           ReactNode           — replace the default icon
 *  action         { label, onClick }  — inline action button
 *  position       string              — override global position for this toast
 *  onDismiss      () => void          — callback on any dismiss
 *  className      string              — extra class on .z-toast element
 *  id             string              — dedup: if toast with same id exists, update it
 * ══════════════════════════════════════════════════════════════════ */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { ToastContext } from './UseToast'


/* ──────────────────────────────────────────────────────────────────
 *  CONSTANTS
 * ──────────────────────────────────────────────────────────────── */
const POSITIONS = [
  'top-right', 'top-left', 'top-center',
  'bottom-right', 'bottom-left', 'bottom-center',
]

const TOAST_TYPES = ['success', 'error', 'warning', 'info', 'loading', 'default']

const DEFAULT_PROVIDER_CONFIG = {
  position:      'bottom-right',
  duration:      4000,
  maxToasts:     5,
  pauseOnHover:  true,
  enterDuration: 300,
  exitDuration:  220,
}

let _idCounter = 0
function genId() { return `zt-${++_idCounter}` }


/* ──────────────────────────────────────────────────────────────────
 *  REDUCER
 * ──────────────────────────────────────────────────────────────── */
function toastReducer(state, action) {
  switch (action.type) {

    case 'ADD': {
      // Dedup: if id already exists, update instead
      const existing = action.payload.id
        ? state.find(t => t.id === action.payload.id)
        : null

      if (existing) {
        return state.map(t =>
          t.id === action.payload.id
            ? { ...t, ...action.payload, status: 'entering' }
            : t
        )
      }
      return [...state, action.payload]
    }

    case 'UPDATE':
      return state.map(t =>
        t.id === action.id
          ? { ...t, ...action.payload, status: 'entering' }
          : t
      )

    case 'DISMISS':
      return state.map(t =>
        t.id === action.id ? { ...t, status: 'exiting' } : t
      )

    case 'DISMISS_ALL':
      return state.map(t => ({ ...t, status: 'exiting' }))

    case 'REMOVE':
      return state.filter(t => t.id !== action.id)

    default:
      return state
  }
}


/* ──────────────────────────────────────────────────────────────────
 *  PROVIDER
 * ──────────────────────────────────────────────────────────────── */
export function ToastProvider({
  children,
  position:      globalPosition      = DEFAULT_PROVIDER_CONFIG.position,
  duration:      globalDuration      = DEFAULT_PROVIDER_CONFIG.duration,
  maxToasts                          = DEFAULT_PROVIDER_CONFIG.maxToasts,
  pauseOnHover                       = DEFAULT_PROVIDER_CONFIG.pauseOnHover,
  enterDuration                      = DEFAULT_PROVIDER_CONFIG.enterDuration,
  exitDuration                       = DEFAULT_PROVIDER_CONFIG.exitDuration,
}) {
  const [toasts, dispatch] = useReducer(toastReducer, [])

  // ── Core add ────────────────────────────────────────────────────
  const add = useCallback((type, message, opts = {}) => {
    const id = opts.id || genId()

    // Enforce maxToasts: dismiss oldest non-exiting
    dispatch((currentToasts) => {
      const visible = (currentToasts || []).filter(t => t.status !== 'exiting')
      if (visible.length >= maxToasts) {
        dispatch({ type: 'DISMISS', id: visible[0].id })
      }
    })

    const toast = {
      id,
      type:         TOAST_TYPES.includes(type) ? type : 'default',
      message,
      title:        opts.title       ?? null,
      description:  opts.description ?? null,
      duration:     opts.duration    !== undefined ? opts.duration : globalDuration,
      dismissible:  opts.dismissible !== undefined ? opts.dismissible : true,
      icon:         opts.icon        ?? null,
      action:       opts.action      ?? null,
      position:     POSITIONS.includes(opts.position) ? opts.position : null,
      onDismiss:    opts.onDismiss   ?? null,
      className:    opts.className   ?? '',
      status:       'entering',
      createdAt:    Date.now(),
    }

    dispatch({ type: 'ADD', payload: toast })
    return id
  }, [globalDuration, maxToasts])

  // ── Dismiss ─────────────────────────────────────────────────────
  const dismiss = useCallback((id) => {
    dispatch({ type: 'DISMISS', id })
  }, [])

  const dismissAll = useCallback(() => {
    dispatch({ type: 'DISMISS_ALL' })
  }, [])

  // ── Update (change type / message after creation) ────────────────
  const update = useCallback((id, payload) => {
    dispatch({ type: 'UPDATE', id, payload })
  }, [])

  // ── Remove (called by ToastItem after exit animation ends) ────────
  const remove = useCallback((id) => {
    dispatch({ type: 'REMOVE', id })
  }, [])

  // ── Promise helper ───────────────────────────────────────────────
  const promise = useCallback((promiseFn, {
    loading: loadingMsg = 'Loading...',
    success: successMsg,
    error:   errorMsg,
    ...opts
  }) => {
    const id = add('loading', loadingMsg, { ...opts, duration: 0, id: opts.id })

    Promise.resolve(promiseFn).then(
      (data) => {
        const msg = typeof successMsg === 'function' ? successMsg(data) : successMsg
        update(id, { type: 'success', message: msg, duration: opts.duration ?? globalDuration })
      },
      (err) => {
        const msg = typeof errorMsg === 'function' ? errorMsg(err) : errorMsg
        update(id, { type: 'error', message: msg, duration: opts.duration ?? globalDuration })
      }
    )

    return id
  }, [add, update, globalDuration])

  // ── Public API ───────────────────────────────────────────────────
  const toast = {
    success:    (msg, opts) => add('success',  msg, opts),
    error:      (msg, opts) => add('error',    msg, opts),
    warning:    (msg, opts) => add('warning',  msg, opts),
    info:       (msg, opts) => add('info',     msg, opts),
    loading:    (msg, opts) => add('loading',  msg, { duration: 0, dismissible: false, ...opts }),
    default:    (msg, opts) => add('default',  msg, opts),
    update,
    dismiss,
    dismissAll,
    promise,
  }

  // ── Group toasts by effective position ──────────────────────────
  const grouped = toasts.reduce((acc, t) => {
    const pos = t.position || globalPosition
    if (!acc[pos]) acc[pos] = []
    acc[pos].push(t)
    return acc
  }, {})

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Render one stack per active position, via portal */}
      {typeof document !== 'undefined' && Object.entries(grouped).map(([pos, group]) =>
        createPortal(
          <ToastStack
            key={pos}
            position={pos}
            toasts={group}
            onDismiss={dismiss}
            onRemove={remove}
            pauseOnHover={pauseOnHover}
            enterDuration={enterDuration}
            exitDuration={exitDuration}
          />,
          document.body
        )
      )}
    </ToastContext.Provider>
  )
}


/* ──────────────────────────────────────────────────────────────────
 *  HOOK
 * ──────────────────────────────────────────────────────────────── */



/* ──────────────────────────────────────────────────────────────────
 *  STACK — one container per position
 * ──────────────────────────────────────────────────────────────── */
function ToastStack({ position, toasts, onDismiss, onRemove, pauseOnHover, enterDuration, exitDuration }) {
  return (
    <div
      className={`z-toast-container z-toast-container--${position}`}
      aria-live="polite"
      aria-atomic="false"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map(t => (
        <ToastItem
          key={t.id}
          toast={t}
          position={position}
          onDismiss={onDismiss}
          onRemove={onRemove}
          pauseOnHover={pauseOnHover}
          enterDuration={enterDuration}
          exitDuration={exitDuration}
        />
      ))}
    </div>
  )
}


/* ──────────────────────────────────────────────────────────────────
 *  TOAST ITEM — individual toast
 * ──────────────────────────────────────────────────────────────── */
function ToastItem({
  toast,
  position,
  onDismiss,
  onRemove,
  pauseOnHover,
  enterDuration,
  exitDuration,
}) {
  const { id, type, message, title, description, duration, dismissible,
          icon, action, onDismiss: dismissCb, className, status } = toast

  // Track remaining time for hover-pause
  const timerRef      = useRef(null)
  const startTimeRef  = useRef(null)
  const remainingRef  = useRef(duration)

  // Animation class
  const { enterClass, exitClass } = getAnimClasses(position)

  // ── Auto-dismiss timer ─────────────────────────────────────────
  const startTimer = useCallback(() => {
    if (remainingRef.current <= 0) return
    startTimeRef.current = Date.now()
    timerRef.current = setTimeout(() => {
      onDismiss(id)
    }, remainingRef.current)
  }, [id, onDismiss])

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current
        remainingRef.current = Math.max(0, remainingRef.current - elapsed)
      }
    }
  }, [])

  // Start timer on mount (if not persistent)
  useEffect(() => {
    if (duration > 0) startTimer()
    return () => clearTimer()
  }, [duration, startTimer, clearTimer])

  // ── After exit animation, remove from DOM ──────────────────────
  useEffect(() => {
    if (status === 'exiting') {
      clearTimer()
      const t = setTimeout(() => onRemove(id), exitDuration + 20)
      return () => clearTimeout(t)
    }
  }, [status, id, onRemove, exitDuration, clearTimer])

  // ── Hover handlers (JS timer pause) ───────────────────────────
  const handleMouseEnter = () => {
    if (pauseOnHover && duration > 0) clearTimer()
  }
  const handleMouseLeave = () => {
    if (pauseOnHover && duration > 0 && status !== 'exiting') startTimer()
  }

  // ── Dismiss handler ────────────────────────────────────────────
  const handleDismiss = () => {
    dismissCb?.()
    onDismiss(id)
  }

  // ── CSS custom properties for dynamic timing ──────────────────
  // This is NOT a hardcoded inline style — these are runtime JS values
  // passed to CSS as custom properties so CSS animations can use them.
  const cssVars = {
    '--toast-duration':    `${duration}ms`,
    '--z-toast-enter-dur': `${enterDuration}ms`,
    '--z-toast-exit-dur':  `${exitDuration}ms`,
  }

  const animClass = status === 'exiting' ? exitClass : enterClass

  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={[
        'z-toast',
        `z-toast--${type}`,
        animClass,
        className,
      ].filter(Boolean).join(' ')}
      style={cssVars}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Accent Bar */}
      <div className="z-toast-bar" aria-hidden="true" />

      {/* Body */}
      <div className="z-toast-body">
        {/* Icon */}
        <span className="z-toast-icon">
          {icon ?? <DefaultIcon type={type} />}
        </span>

        <div className="z-toast-text">
          {title    && <p className="z-toast-title">{title}</p>}
          <p className="z-toast-message">{message}</p>
          {description && <p className="z-toast-desc">{description}</p>}

          {/* Action */}
          {action && (
            <button
              className="z-toast-action"
              onClick={() => {
                action.onClick?.()
                handleDismiss()
              }}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Dismiss button */}
        {dismissible && (
          <button
            className="z-toast-close"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
          >
            <IconClose />
          </button>
        )}
      </div>

      {/* Progress bar — only when timer is active */}
      {duration > 0 && status !== 'exiting' && (
        <div className="z-toast-progress" aria-hidden="true">
          <div className={`z-toast-progress-fill z-toast-progress-fill--${type}`} />
        </div>
      )}
    </div>
  )
}


/* ──────────────────────────────────────────────────────────────────
 *  HELPERS
 * ──────────────────────────────────────────────────────────────── */

/** Map position string → enter/exit CSS class names */
function getAnimClasses(pos) {
  const dir = pos.includes('right') ? 'right' : pos.includes('left') ? 'left' : pos.startsWith('top') ? 'top' : 'bottom';
  return { 
    enterClass: `z-toast--from-${dir} z-toast--entering`,
    exitClass: `z-toast--from-${dir} z-toast--exiting`
  };
}


/* ──────────────────────────────────────────────────────────────────
 *  ICONS — 16 × 16, stroke-only, currentColor
 * ──────────────────────────────────────────────────────────────── */
function DefaultIcon({ type }) {
  switch (type) {
    case 'success': return <IconSuccess />
    case 'error':   return <IconError   />
    case 'warning': return <IconWarning />
    case 'info':    return <IconInfo    />
    case 'loading': return <IconLoading />
    default:        return <IconDefault />
  }
}

function IconSuccess() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 8.2l1.8 1.8 3.2-3.8"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconError() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v3.5M8 10.5v.5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconWarning() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2.5L1.5 13h13L8 2.5z"
        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8 6.5v3M8 11v.5"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconInfo() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 7.5v3.5M8 5v.5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconLoading() {
  return (
    <svg className="z-toast-spin" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <path d="M8 2a6 6 0 016 6"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconDefault() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v6M5 8h6"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <path d="M1.5 1.5l8 8M9.5 1.5l-8 8"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}