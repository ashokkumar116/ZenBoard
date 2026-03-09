/**
 * Login.jsx — Sign In Page
 *
 * Layout  : Split — left brand panel + right form panel
 * Tokens  : 100% from design system (index.css @theme + zenboard.css)
 * Rules   : No inline styles. No hardcoded colors. Zero arbitrary values.
 *
 * Wiring (replace the TODO stubs to integrate with your auth layer):
 *   handleSubmit → call your POST /api/auth/login endpoint
 *   onSuccess    → navigate('/dashboard')
 *   onError      → set globalError from API response (e.g. "Invalid credentials")
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/ui/Logo';

// ── Static content ────────────────────────────────────────────────
const BRAND_COPY = {
  eyebrow:   'Welcome back',
  headline:  ['Your system.', 'Waiting for you.'],
  subtext:   'Everything you left off. Exactly where you need it.',
  copyright: '© 2026 Zenboard — Built for founders',
};

const STATS = [
  { value: '7',  label: 'Tasks tracked' },
  { value: '12', label: 'Day streak' },
  { value: '24', label: 'Notes saved' },
];

const FORM_COPY = {
  heading:     'Sign in',
  subtext:     'Good to have you back.',
  submit:      'Sign In',
  divider:     'or',
  forgotLabel: 'Forgot password?',
  footer:      "Don't have an account?",
  footerCta:   'Create one →',
};

// ── Field config ──────────────────────────────────────────────────
const FIELDS = [
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
    placeholder: 'Your password',
    autoComplete:'current-password',
    required:    true,
  },
];

// ── Validation ────────────────────────────────────────────────────
function validate(values) {
  const errors = {};
  if (!values.email.trim())
    errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = 'Enter a valid email address.';
  if (!values.password)
    errors.password = 'Password is required.';
  return errors;
}

// ── Sub-components ────────────────────────────────────────────────

/** Eye toggle icon */
function EyeIcon({ visible }) {
  return visible ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2"
        stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 2l12 12M6.5 6.5A2 2 0 0010 10M4 4.5C2.5 5.8 1 8 1 8s2.5 5 7 5c1.3 0 2.5-.4 3.5-1M7 3.1C7.3 3 7.7 3 8 3c4.5 0 7 5 7 5s-.8 1.5-2 2.8"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Single form field */
function FormField({ field, value, error, showPassword, onTogglePassword, onChange, onBlur }) {
  const isPassword = field.type === 'password';
  const inputType  = isPassword && showPassword ? 'text' : field.type;

  return (
    <div className="z-field">
      {/* Label row — label + forgot link (password only) */}
      <div className="flex items-center justify-between">
        <label htmlFor={field.id} className="z-mono-label-amber">
          {field.label}
        </label>
        {isPassword && (
          <Link
            to="/forgot-password"
            className="font-mono text-xs text-fg-3 hover:text-amber transition-colors duration-fast"
          >
            {FORM_COPY.forgotLabel}
          </Link>
        )}
      </div>

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

      {error && (
        <p
          id={`${field.id}-error`}
          role="alert"
          className="font-mono text-xs text-danger mt-0.5"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** "── or ──" divider */
function OrDivider() {
  return (
    <div className="flex items-center gap-4 my-6" aria-hidden="true">
      <div className="flex-1 h-px bg-border" />
      <span className="font-mono text-xs text-fg-3">{FORM_COPY.divider}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

/** Mini stat pill — shown in left brand panel */
function StatPill({ value, label }) {
  return (
    <div className="z-card-stat flex-1 text-center">
      <div className="font-display text-h2 text-amber font-bold leading-none mb-1">
        {value}
      </div>
      <div className="font-mono text-micro text-fg-3 uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}

/** Loading spinner */
function SpinnerIcon() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 14 14" fill="none"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({ password: false });
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // ── Handlers ──────────────────────────────────────────────────

  function handleChange(id, value) {
    setValues(prev => ({ ...prev, [id]: value }));
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
      // const { token } = await authApi.login(values);
      // authStore.setToken(token);
      await new Promise(r => setTimeout(r, 1000)); // placeholder
      navigate('/dashboard');
    } catch (err) {
      // Map specific API errors to field errors if needed
      // e.g. if (err.code === 'INVALID_CREDENTIALS') ...
      setGlobalError(err?.message ?? 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-base-0">

      {/* ── LEFT — Brand panel ─────────────────────────────────── */}
      <aside className="hidden lg:flex w-1/2 bg-base-1 border-r border-border flex-col p-12">

        <Logo size="md" />

        <div className="flex-1 flex flex-col justify-center">
          <p className="z-mono-label-amber mb-5">{BRAND_COPY.eyebrow}</p>

          <h1 className="font-display text-display text-fg leading-tight mb-5">
            {BRAND_COPY.headline.map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h1>

          <p className="text-fg-2 text-body mb-10 max-w-xs">
            {BRAND_COPY.subtext}
          </p>

          {/* Mini stats row */}
          <div className="flex gap-3">
            {STATS.map(stat => (
              <StatPill key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>

        <p className="font-mono text-micro text-fg-3">
          {BRAND_COPY.copyright}
        </p>

      </aside>

      {/* ── RIGHT — Form panel ─────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">

          {/* Mobile-only logo */}
          <div className="flex justify-center mb-10 lg:hidden">
            <Logo size="md" />
          </div>

          {/* Heading */}
          <h2 className="font-display text-h1 text-fg mb-2">
            {FORM_COPY.heading}
          </h2>
          <p className="text-fg-2 text-body mb-8">
            {FORM_COPY.subtext}
          </p>

          {/* Global error */}
          {globalError && (
            <div
              role="alert"
              className="z-callout z-callout-danger mb-6 text-sm text-danger"
            >
              {globalError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>

            {FIELDS.map(field => (
              <FormField
                key={field.id}
                field={field}
                value={values[field.id]}
                error={errors[field.id]}
                showPassword={showPassword[field.id]}
                onTogglePassword={handleTogglePassword}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            ))}

            <button
              type="submit"
              disabled={isLoading}
              className="
                z-btn z-btn-primary z-focus-ring
                w-full mt-2
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <SpinnerIcon />
                  Signing in…
                </span>
              ) : (
                FORM_COPY.submit
              )}
            </button>

          </form>

          {/* Or divider */}
          <OrDivider />

          {/* Register link */}
          <p className="text-center text-fg-2 text-sm">
            {FORM_COPY.footer}{' '}
            <Link
              to="/register"
              className="text-amber hover:text-amber-hi font-medium transition-colors duration-fast"
            >
              {FORM_COPY.footerCta}
            </Link>
          </p>

        </div>
      </main>

    </div>
  );
}