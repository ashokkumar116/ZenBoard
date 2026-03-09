/**
 * Register.jsx — Create Account Page
 *
 * Animations (all GSAP)
 * ─────────────────────
 * Page entrance   → Left panel elements stagger from left.
 *                   Right panel fields stagger upward.
 *                   hasAnimated ref guard — runs once only.
 * Strength meter  → 4 segment bar: GSAP animates backgroundColor + scaleY
 *                   on every score change. Criteria rows bounce in/out
 *                   individually when each rule is met/unmet.
 * Error banner    → Slides down + fades in via GSAP when globalError set.
 * Field errors    → Each inline error animates in from above.
 *
 * Token colors
 * ────────────
 * The token() utility resolves CSS variables at runtime so GSAP can
 * animate to exact hex values while all color definitions stay in
 * index.css @theme. Nothing is hardcoded here.
 *
 * Install deps (if not already):
 *   npm install gsap @gsap/react
 *
 * Wiring
 * ──────
 * Replace the TODO stubs in handleSubmit with your auth API call.
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate }           from 'react-router-dom';
import gsap                            from 'gsap';
import { useGSAP }                     from '@gsap/react';
import Logo                            from '../../components/ui/Logo';

gsap.registerPlugin(useGSAP);

// ─────────────────────────────────────────────────────────────────
// DESIGN TOKEN RESOLVER
// Reads CSS variables at runtime so GSAP always uses the live
// computed value from @theme. Change a color in index.css → updates
// everywhere, including GSAP animations.
// ─────────────────────────────────────────────────────────────────
function token(varName) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

// ─────────────────────────────────────────────────────────────────
// STATIC CONTENT — edit here, never inside JSX
// ─────────────────────────────────────────────────────────────────
const BRAND_COPY = {
  eyebrow:   'Why Zenboard',
  headline:  ['Build your system.', 'Own your time.'],
  subtext:   'Your personal command center for focused, purposeful work.',
  copyright: '© 2026 Zenboard — Built for founders',
};

const FEATURES = [
  'Tasks with time-horizon bucketing',
  'Habits with real-time streak tracking',
  'Notes with folder system & auto-save',
  'Unified dashboard — everything at a glance',
];

const FORM_COPY = {
  heading:   'Create your account',
  subtext:   'Start building your personal productivity OS.',
  submit:    'Create Account',
  divider:   'or',
  footer:    'Already have an account?',
  footerCta: 'Sign in →',
  legal:     [
    'By creating an account, you agree to our ',
    'Terms of Service',
    ' and ',
    'Privacy Policy',
    '.',
  ],
};

// ─────────────────────────────────────────────────────────────────
// FIELD CONFIG — drives the form declaratively. Add a field here,
// never in JSX.
// ─────────────────────────────────────────────────────────────────
const FIELDS = [
  {
    id:          'fullName',
    label:       'Full Name',
    type:        'text',
    placeholder: 'Ashok Kumar',
    autoComplete:'name',
    required:    true,
  },
  {
    id:          'email',
    label:       'Email Address',
    type:        'email',
    placeholder: 'you@example.com',
    autoComplete:'email',
    required:    true,
  },
  {
    id:          'password',
    label:       'Password',
    type:        'password',
    placeholder: 'Min. 8 characters',
    autoComplete:'new-password',
    required:    true,
  },
  {
    id:          'confirmPassword',
    label:       'Confirm Password',
    type:        'password',
    placeholder: 'Repeat your password',
    autoComplete:'new-password',
    required:    true,
  },
];

// ─────────────────────────────────────────────────────────────────
// STRENGTH CONFIG
// colorVar  → CSS variable name GSAP resolves at runtime via token()
// labelCls  → Tailwind text color class for the strength label
// ─────────────────────────────────────────────────────────────────
const STRENGTH_LEVELS = {
  0: { label: '',       colorVar: '--color-border',     labelCls: 'text-fg-3'       },
  1: { label: 'Weak',   colorVar: '--color-danger',     labelCls: 'text-danger'     },
  2: { label: 'Fair',   colorVar: '--color-amber-mid',  labelCls: 'text-amber-mid'  },
  3: { label: 'Good',   colorVar: '--color-amber',      labelCls: 'text-amber'      },
  4: { label: 'Strong', colorVar: '--color-success',    labelCls: 'text-success'    },
};

// ─────────────────────────────────────────────────────────────────
// CRITERIA CONFIG — each rule the password is tested against
// ─────────────────────────────────────────────────────────────────
const CRITERIA_CONFIG = [
  { key: 'length',    text: '8+ characters',         test: p => p.length >= 8          },
  { key: 'uppercase', text: 'Uppercase letter',       test: p => /[A-Z]/.test(p)        },
  { key: 'number',    text: 'One number',             test: p => /[0-9]/.test(p)        },
  { key: 'symbol',    text: 'Special character',      test: p => /[^A-Za-z0-9]/.test(p) },
];

// ─────────────────────────────────────────────────────────────────
// PASSWORD STRENGTH CALCULATOR — pure function, no side effects
// Returns score 0–4 and a per-criterion pass/fail map.
// ─────────────────────────────────────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, criteria: {} };

  const criteria = {};
  CRITERIA_CONFIG.forEach(c => { criteria[c.key] = c.test(password); });

  const metCount = Object.values(criteria).filter(Boolean).length;

  let score;
  if (password.length < 4) score = 1;
  else if (metCount <= 1)  score = 1;
  else if (metCount === 2) score = 2;
  else if (metCount === 3) score = 3;
  else                     score = 4;

  return { score, criteria };
}

// ─────────────────────────────────────────────────────────────────
// VALIDATION — pure function, returns field error map
// ─────────────────────────────────────────────────────────────────
function validate(values) {
  const errors = {};
  if (!values.fullName.trim())
    errors.fullName = 'Name is required.';
  if (!values.email.trim())
    errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = 'Enter a valid email address.';
  if (!values.password)
    errors.password = 'Password is required.';
  else if (values.password.length < 8)
    errors.password = 'Password must be at least 8 characters.';
  if (!values.confirmPassword)
    errors.confirmPassword = 'Please confirm your password.';
  else if (values.password !== values.confirmPassword)
    errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

// ─────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────
function FeatureCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      className="text-success flex-shrink-0" aria-hidden="true">
      <rect width="16" height="16" rx="3" fill="currentColor" fillOpacity="0.15" />
      <path d="M4.5 8L7 10.5L11.5 5.5"
        stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon({ visible }) {
  return visible ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"
        stroke="currentColor" strokeWidth="1.3"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 2l12 12M6.5 6.5A2 2 0 0010 10M4 4.5C2.5 5.8 1 8 1 8s2.5 5 7 5c1.3 0 2.5-.4 3.5-1M7 3.1C7.3 3 7.7 3 8 3c4.5 0 7 5 7 5s-.8 1.5-2 2.8"
        stroke="currentColor" strokeWidth="1.3"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      className="animate-spin" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5"
        stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <path d="M7 1.5A5.5 5.5 0 0112.5 7"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-4 my-6" aria-hidden="true">
      <div className="flex-1 h-px bg-border" />
      <span className="font-mono text-xs text-fg-3">{FORM_COPY.divider}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PASSWORD STRENGTH METER
//
// GSAP animations:
//   Mount        → whole meter slides down + fades in
//   Score change → segments animate backgroundColor + scaleY
//                  with a 60ms cascade delay between each segment
//   Label change → cross-fades with y offset
//   Criteria met → each row bounces in with back.out easing
//   Criteria unmet → each row fades down
// ─────────────────────────────────────────────────────────────────
function StrengthMeter({ password }) {
  const { score, criteria } = getPasswordStrength(password);
  const level = STRENGTH_LEVELS[score];

  // Refs
  const wrapRef         = useRef(null);
  const segmentRefs     = useRef([]);           // array of 4 segment els
  const labelRef        = useRef(null);
  const criteriaRefs    = useRef({});            // { key: DOMElement }
  const prevScoreRef    = useRef(null);
  const prevCriteriaRef = useRef({});

  // ── Mount: slide in the whole meter block ──
  useEffect(() => {
    if (!wrapRef.current) return;
    gsap.fromTo(
      wrapRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' },
    );
  }, []);

  // ── Animate bar segments when score changes ──
  useEffect(() => {
    if (prevScoreRef.current === score) return;
    prevScoreRef.current = score;

    const activeColor   = token(level.colorVar);
    const inactiveColor = token('--color-base-4');

    segmentRefs.current.forEach((seg, i) => {
      if (!seg) return;
      const isActive = i < score;

      gsap.to(seg, {
        backgroundColor: isActive ? activeColor : inactiveColor,
        height:          isActive ? '4px' : '2px',
        opacity:         isActive ? 1     : 0.3,
        duration:        0.38,
        ease:            'power2.out',
        delay:           i * 0.06,
      });
    });

    // Label: cross-fade on score change
    if (labelRef.current && score > 0) {
      gsap.fromTo(
        labelRef.current,
        { opacity: 0, y: -5 },
        { opacity: 1, y: 0, duration: 0.22, ease: 'power1.out' },
      );
    }
  }, [score]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Animate each criterion row individually ──
  useEffect(() => {
    CRITERIA_CONFIG.forEach(({ key }) => {
      const el     = criteriaRefs.current[key];
      const isMet  = criteria[key];
      const wasMet = prevCriteriaRef.current[key];

      if (!el || isMet === wasMet) return;

      if (isMet) {
        // Rule satisfied — bounce in with back easing
        gsap.fromTo(
          el,
          { scale: 0.8, opacity: 0.35 },
          { scale: 1,   opacity: 1,   duration: 0.3, ease: 'back.out(2.2)' },
        );
      } else {
        // Rule removed — fade down
        gsap.to(el, { opacity: 0.35, scale: 0.95, duration: 0.2, ease: 'power1.in' });
      }
    });

    prevCriteriaRef.current = { ...criteria };
  }, [criteria]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={wrapRef} className="mt-3 space-y-3" style={{ opacity: 0 }}>

      {/* ── Segment bar + label ── */}
      <div className="flex items-center gap-2">

        {/* 4 segments */}
        <div className="flex flex-1 gap-1.5">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              ref={el => segmentRefs.current[i] = el}
              className="flex-1 rounded-pill bg-base-4"
              style={{ height: '2px', opacity: 0.3 }}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Strength label */}
        <span
          ref={labelRef}
          className={`
            font-mono text-xs font-medium
            ${level.labelCls}
          `}
          style={{ minWidth: '3rem', textAlign: 'right', opacity: score > 0 ? 1 : 0 }}
          aria-live="polite"
          aria-label={`Password strength: ${level.label}`}
        >
          {level.label}
        </span>
      </div>

      {/* ── Criteria checklist ── */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {CRITERIA_CONFIG.map(({ key, text }) => {
          const met = criteria[key] ?? false;
          return (
            <div
              key={key}
              ref={el => criteriaRefs.current[key] = el}
              className="flex items-center gap-1.5"
              style={{ opacity: 0.35 }}
            >
              {/* Criterion icon — circle → checkmark */}
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                className={`
                  flex-shrink-0
                  transition-colors duration-fast
                  ${met ? 'text-success' : 'text-fg-3'}
                `}
                aria-hidden="true"
              >
                {met ? (
                  <>
                    <circle cx="6" cy="6" r="5.5"
                      fill="currentColor" fillOpacity="0.15" />
                    <path d="M3.5 6L5.5 8L8.5 4"
                      stroke="currentColor" strokeWidth="1.3"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </>
                ) : (
                  <circle cx="6" cy="6" r="5.5"
                    stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" />
                )}
              </svg>

              <span className={`font-mono text-xs ${met ? 'text-fg-2' : 'text-fg-3'}`}>
                {text}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// FORM FIELD
// Renders label + input + optional strength meter (password only)
// + animated inline error.
// ─────────────────────────────────────────────────────────────────
function FormField({ field, value, error, showPassword, onTogglePassword, onChange, onBlur }) {
  const isPassword      = field.type === 'password';
  const isPasswordField = field.id   === 'password';
  const inputType       = isPassword && showPassword ? 'text' : field.type;
  const errorRef        = useRef(null);

  // Animate inline error in when it first appears
  useEffect(() => {
    if (error && errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { opacity: 0, y: -5 },
        { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' },
      );
    }
  }, [error]);

  return (
    <div className="z-field">
      <label htmlFor={field.id} className="z-mono-label-amber">
        {field.label}
      </label>

      <div className="relative">
        <input
          id={field.id}
          name={field.id}
          type={inputType}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete}
          required={field.required}
          value={value}
          onChange={e => onChange(field.id, e.target.value)}
          onBlur={() => onBlur(field.id)}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.id}-error` : undefined}
          className={`
            z-input z-focus-ring
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-danger' : ''}
          `}
        />

        {/* Password visibility toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => onTogglePassword(field.id)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              text-fg-3 hover:text-fg-2
              transition-colors duration-fast
              p-0.5 rounded-sm
            "
          >
            <EyeIcon visible={showPassword} />
          </button>
        )}
      </div>

      {/* Strength meter — only on the main password field, only when typing */}
      {isPasswordField && value && (
        <StrengthMeter password={value} />
      )}

      {/* Inline error */}
      {error && (
        <p
          id={`${field.id}-error`}
          ref={errorRef}
          role="alert"
          className="font-mono text-xs text-danger mt-1"
          style={{ opacity: 0 }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// REGISTER PAGE
// ─────────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();

  // ── Form state ────────────────────────────────────────────────
  const [values, setValues] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
  });
  const [errors,       setErrors]       = useState({});
  const [showPassword, setShowPassword] = useState({
    password: false, confirmPassword: false,
  });
  const [isLoading,   setIsLoading]   = useState(false);
  const [globalError, setGlobalError] = useState('');

  // ── GSAP refs ─────────────────────────────────────────────────
  const pageRef      = useRef(null);
  const globalErrRef = useRef(null);
  const hasAnimated  = useRef(false);   // entrance guard — runs once only

  // ── Page Entrance Animation ───────────────────────────────────
  useGSAP(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const ease = 'power3.out';

    // ── Left panel — stagger from left
    gsap.fromTo('.js-logo',
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.5, ease, delay: 0.05 },
    );
    gsap.fromTo('.js-eyebrow',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.48, ease, delay: 0.16 },
    );
    gsap.fromTo('.js-headline',
      { opacity: 0, x: -24 },
      { opacity: 1, x: 0, duration: 0.52, ease, stagger: 0.09, delay: 0.24 },
    );
    gsap.fromTo('.js-subtext',
      { opacity: 0 },
      { opacity: 1, duration: 0.45, ease, delay: 0.46 },
    );
    gsap.fromTo('.js-feature',
      { opacity: 0, x: -14 },
      { opacity: 1, x: 0, duration: 0.38, ease, stagger: 0.07, delay: 0.54 },
    );
    gsap.fromTo('.js-copyright',
      { opacity: 0 },
      { opacity: 1, duration: 0.38, ease, delay: 0.92 },
    );

    // ── Right panel — stagger upward
    gsap.fromTo('.js-form-heading',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease, delay: 0.1 },
    );
    gsap.fromTo('.js-form-sub',
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.45, ease, delay: 0.2 },
    );
    gsap.fromTo('.js-field',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.42, ease, stagger: 0.1, delay: 0.3 },
    );
    gsap.fromTo('.js-submit',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease, delay: 0.7 },
    );
    gsap.fromTo('.js-form-footer',
      { opacity: 0 },
      { opacity: 1, duration: 0.35, ease, delay: 0.82 },
    );
  }, { scope: pageRef });

  // ── Animate global error banner when it appears ───────────────
  useEffect(() => {
    if (globalError && globalErrRef.current) {
      gsap.fromTo(
        globalErrRef.current,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
      );
    }
  }, [globalError]);

  // ── Handlers ──────────────────────────────────────────────────
  function handleChange(id, val) {
    setValues(prev => ({ ...prev, [id]: val }));
    if (errors[id])   setErrors(prev => ({ ...prev, [id]: '' }));
    if (globalError)  setGlobalError('');
  }

  function handleBlur(id) {
    const fieldErrors = validate(values);
    if (fieldErrors[id]) setErrors(prev => ({ ...prev, [id]: fieldErrors[id] }));
  }

  function handleTogglePassword(id) {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const fieldErrors = validate(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    setGlobalError('');

    try {
      // TODO: replace with your auth API call
      // await authApi.register({ name: values.fullName, email: values.email, password: values.password });
      await new Promise(r => setTimeout(r, 1000)); // placeholder
      navigate('/dashboard');
    } catch (err) {
      setGlobalError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div ref={pageRef} className="min-h-screen flex bg-base-0">

      {/* ══════════════════════════════════════════════════════════
          LEFT — Brand Panel
      ══════════════════════════════════════════════════════════ */}
      <aside className="hidden lg:flex w-1/2 bg-base-1 border-r border-border flex-col p-12">

        <div className="js-logo" style={{ opacity: 0 }}>
          <Logo size="md" />
        </div>

        <div className="flex-1 flex flex-col justify-center">

          <p className="js-eyebrow z-mono-label-amber mb-5" style={{ opacity: 0 }}>
            {BRAND_COPY.eyebrow}
          </p>

          <h1 className="font-display text-display text-fg leading-tight mb-5">
            {BRAND_COPY.headline.map((line, i) => (
              <span key={i} className="js-headline block" style={{ opacity: 0 }}>
                {line}
              </span>
            ))}
          </h1>

          <p className="js-subtext text-fg-2 text-body mb-10 max-w-xs" style={{ opacity: 0 }}>
            {BRAND_COPY.subtext}
          </p>

          <ul className="flex flex-col gap-3">
            {FEATURES.map(feat => (
              <li key={feat} className="js-feature flex items-center gap-3" style={{ opacity: 0 }}>
                <FeatureCheck />
                <span className="text-fg-2 text-sm">{feat}</span>
              </li>
            ))}
          </ul>

        </div>

        <p className="js-copyright font-mono text-micro text-fg-3" style={{ opacity: 0 }}>
          {BRAND_COPY.copyright}
        </p>

      </aside>

      {/* ══════════════════════════════════════════════════════════
          RIGHT — Form Panel
      ══════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile-only logo */}
          <div className="flex justify-center mb-10 lg:hidden">
            <Logo size="md" />
          </div>

          {/* Page heading */}
          <h2 className="js-form-heading font-display text-h1 text-fg mb-2" style={{ opacity: 0 }}>
            {FORM_COPY.heading}
          </h2>
          <p className="js-form-sub text-fg-2 text-body mb-8" style={{ opacity: 0 }}>
            {FORM_COPY.subtext}
          </p>

          {/* Global error banner */}
          {globalError && (
            <div
              ref={globalErrRef}
              role="alert"
              className="z-callout z-callout-danger mb-6 text-sm text-danger"
              style={{ opacity: 0 }}
            >
              {globalError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>

            {FIELDS.map(field => (
              // js-field wrapper — GSAP entrance target
              <div key={field.id} className="js-field" style={{ opacity: 0 }}>
                <FormField
                  field={field}
                  value={values[field.id]}
                  error={errors[field.id]}
                  showPassword={showPassword[field.id]}
                  onTogglePassword={handleTogglePassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
            ))}

            {/* Submit button */}
            <div className="js-submit mt-2" style={{ opacity: 0 }}>
              <button
                type="submit"
                disabled={isLoading}
                className="
                  z-btn z-btn-primary z-focus-ring
                  w-full
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <SpinnerIcon />
                    Creating account…
                  </span>
                ) : FORM_COPY.submit}
              </button>
            </div>

          </form>

          {/* Footer */}
          <div className="js-form-footer" style={{ opacity: 0 }}>

            <OrDivider />

            <p className="text-center text-fg-2 text-sm">
              {FORM_COPY.footer}{' '}
              <Link
                to="/login"
                className="text-amber hover:text-amber-hi font-medium transition-colors duration-fast"
              >
                {FORM_COPY.footerCta}
              </Link>
            </p>

            <p className="text-center font-mono text-xs text-fg-3 mt-6 leading-relaxed">
              {FORM_COPY.legal[0]}
              <Link to="/terms"
                className="text-amber hover:text-amber-hi transition-colors duration-fast">
                {FORM_COPY.legal[1]}
              </Link>
              {FORM_COPY.legal[2]}
              <Link to="/privacy"
                className="text-amber hover:text-amber-hi transition-colors duration-fast">
                {FORM_COPY.legal[3]}
              </Link>
              {FORM_COPY.legal[4]}
            </p>

          </div>

        </div>
      </main>

    </div>
  );
}