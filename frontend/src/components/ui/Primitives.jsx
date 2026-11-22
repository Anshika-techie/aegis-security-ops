import { useId } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { formatDelta } from '../../lib/format';

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon: Icon = null,
  trailingIcon: Trailing = null,
  block = false,
  className = '',
  type = 'button',
  ...props
}) {
  const classes = ['btn', `btn--${variant}`, size !== 'md' ? `btn--${size}` : '', block ? 'btn--block' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...props}>
      {Icon ? <Icon size={14} strokeWidth={1.9} aria-hidden="true" /> : null}
      <span>{children}</span>
      {Trailing ? <Trailing size={14} strokeWidth={1.9} aria-hidden="true" /> : null}
    </button>
  );
}

export function IconButton({ label, children, className = '', ...props }) {
  return (
    <button type="button" className={`icon-btn ${className}`.trim()} aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

export function Spinner({ label = 'Loading' }) {
  return (
    <span className="spinner-wrap" role="status">
      <Loader2 className="spinner" size={18} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Status & severity                                                   */
/* ------------------------------------------------------------------ */

const SEVERITY_TONES = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
};

const STATUS_TONES = {
  Blocked: 'teal',
  Resolved: 'teal',
  Detected: 'high',
  Investigating: 'medium',
  Active: 'teal',
  Invited: 'neutral',
  healthy: 'teal',
  caution: 'high',
  degraded: 'critical',
};

export function Badge({ children, tone = 'neutral', dot = false, className = '' }) {
  return (
    <span className={`badge badge--${tone} ${className}`.trim()}>
      {dot ? <span className="badge__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  return (
    <Badge tone={SEVERITY_TONES[severity] ?? 'neutral'} dot>
      {severity}
    </Badge>
  );
}

export function StatusBadge({ status }) {
  return <Badge tone={STATUS_TONES[status] ?? 'neutral'}>{status}</Badge>;
}

/* ------------------------------------------------------------------ */
/* Structure                                                           */
/* ------------------------------------------------------------------ */

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="page-header">
      <div className="page-header__text">
        {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
        <h1 className="page-title">{title}</h1>
        {description ? <p className="page-sub">{description}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

export function StatCard({ icon: Icon, label, value, suffix, delta, goodWhen = 'up', tone = 'teal', footnote }) {
  const deltaTone =
    delta == null ? 'neutral' : (delta >= 0) === (goodWhen === 'up') ? 'positive' : 'negative';

  return (
    <article className={`kpi kpi--${tone}`}>
      <div className="kpi__top">
        <span className="kpi__label">{label}</span>
        {Icon ? (
          <span className="kpi__icon" aria-hidden="true">
            <Icon size={15} strokeWidth={1.9} />
          </span>
        ) : null}
      </div>
      <p className="kpi__value">
        {value}
        {suffix ? <span className="kpi__suffix">{suffix}</span> : null}
      </p>
      <div className="kpi__bottom">
        {delta != null ? (
          <span className={`kpi__delta kpi__delta--${deltaTone}`}>
            {formatDelta(delta)}
            <span className="kpi__delta-note">vs prior</span>
          </span>
        ) : (
          <span className="kpi__delta-note">{footnote}</span>
        )}
      </div>
    </article>
  );
}

export function ChartCard({ title, subtitle, actions, children, footer, flush = false, className = '' }) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || actions) && (
        <div className="card__head">
          <div>
            {title ? <h2 className="card__title">{title}</h2> : null}
            {subtitle ? <p className="card__sub">{subtitle}</p> : null}
          </div>
          {actions ? <div className="card__actions">{actions}</div> : null}
        </div>
      )}
      <div className={`card__body ${flush ? 'card__body--flush' : ''}`.trim()}>{children}</div>
      {footer ? <div className="card__footer">{footer}</div> : null}
    </section>
  );
}

export function ProgressBar({ value, tone = 'teal', label }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span className={`progress__fill progress__fill--${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Forms                                                               */
/* ------------------------------------------------------------------ */

export function Field({ label, htmlFor, hint, error, children, className = '' }) {
  return (
    <div className={`field ${className}`.trim()}>
      {label ? (
        <label className="field__label" htmlFor={htmlFor}>
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="field__error" role="alert">
          <AlertCircle size={12} aria-hidden="true" /> {error}
        </p>
      ) : hint ? (
        <p className="field__hint">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({ label, error, hint, icon: Icon, id, className = '', ...props }) {
  const generated = useId();
  const inputId = id ?? generated;

  return (
    <Field label={label} htmlFor={inputId} error={error} hint={hint} className={className}>
      <div className={`input-wrap ${Icon ? 'input-wrap--icon' : ''}`.trim()}>
        {Icon ? <Icon className="input-wrap__icon" size={15} strokeWidth={1.9} aria-hidden="true" /> : null}
        <input id={inputId} className={`input ${error ? 'input--invalid' : ''}`.trim()} aria-invalid={Boolean(error)} {...props} />
      </div>
    </Field>
  );
}

export function SelectField({ label, options, id, hint, error, className = '', ...props }) {
  const generated = useId();
  const selectId = id ?? generated;

  return (
    <Field label={label} htmlFor={selectId} hint={hint} error={error} className={className}>
      <div className="select-wrap">
        <select id={selectId} className="select" {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </Field>
  );
}

export function Checkbox({ label, id, className = '', ...props }) {
  const generated = useId();
  const inputId = id ?? generated;

  return (
    <label className={`checkbox ${className}`.trim()} htmlFor={inputId}>
      <input type="checkbox" id={inputId} {...props} />
      <span>{label}</span>
    </label>
  );
}

export function Toggle({ checked, onChange, label, description, id }) {
  const generated = useId();
  const switchId = id ?? generated;

  return (
    <div className="toggle-row">
      <div className="toggle-row__text">
        <label className="toggle-row__label" htmlFor={switchId}>
          {label}
        </label>
        {description ? <p className="toggle-row__desc">{description}</p> : null}
      </div>
      <button
        type="button"
        id={switchId}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`switch ${checked ? 'switch--on' : ''}`.trim()}
        onClick={() => onChange(!checked)}
      >
        <span className="switch__knob" />
      </button>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '', ...props }) {
  return (
    <div className={`search ${className}`.trim()}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.2-3.2" />
      </svg>
      <input
        type="search"
        className="search__input"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-label={placeholder}
        {...props}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* States                                                              */
/* ------------------------------------------------------------------ */

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty">
      {Icon ? (
        <span className="empty__icon" aria-hidden="true">
          <Icon size={20} strokeWidth={1.8} />
        </span>
      ) : null}
      <h3 className="empty__title">{title}</h3>
      {description ? <p className="empty__text">{description}</p> : null}
      {action ? <div className="empty__action">{action}</div> : null}
    </div>
  );
}
