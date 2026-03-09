/**
 * Logo.jsx — Zenboard Brand Mark + Wordmark
 *
 * Props
 * ─────
 * size         'sm' | 'md' | 'lg'   Visual size variant.    Default: 'md'
 * showWordmark  boolean              Show/hide text name.    Default: true
 * className     string               Extra classes on root.  Default: ''
 *
 * Rules
 * ─────
 * – Zero inline styles. All theming via design-system tokens.
 * – Size variants use only Tailwind spacing + text scale.
 * – Amber/text colors come from @theme tokens (index.css).
 */

// ── Size variant map ──────────────────────────────────────────────
const SIZE = {
  sm: {
    root:     'gap-1.5',
    mark:     'w-8 h-8 rounded-sm text-h3',
    wordmark: 'text-lg',
    tag: 'text-micro'
  },
  md: {
    root:     'gap-2',
    mark:     'w-10 h-10 rounded-sm text-h2',
    wordmark: 'text-lg',
    tag: 'text-micro'
  },
  lg: {
    root:     'gap-2.5',
    mark:     'w-12 h-12 rounded-md text-h1',
    wordmark: 'text-xl',
    tag: 'text-micro'
  },
};

// ── Component ─────────────────────────────────────────────────────
export default function Logo({ size = 'md', showWordmark = true, showTag = true, className = '' }) {
  const s = SIZE[size] ?? SIZE.md;

  return (
    <div className={`flex items-center ${s.root} ${className}`}>

      {/* ── Brand Mark — amber square with Z glyph ── */}
      <div
        aria-hidden="true"
        className={`
          ${s.mark}
          flex-shrink-0 select-none
          flex items-center justify-center
          bg-amber text-base-0
          font-display font-black leading-none
        `}
      >
        Z
      </div>

      <div className="flex flex-col gap-1">
        {/* ── Wordmark ── */}
      {showWordmark && (
        <span
          className={`
            ${s.wordmark}
            font-display font-extrabold tracking-tight
            text-fg leading-none select-none
          `}
        >
          Zen<span className="text-amber">board</span>
        </span>
      )}
      {showTag && (
            <span className={`font-mono uppercase tracking-widest leading-none ${s.tag}`}>
  Your Personal OS
</span>
          )}
      </div>

    </div>
  );
}