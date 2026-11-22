import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { IconButton } from './Primitives';
import { useClickOutside } from '../../lib/hooks';

/* ------------------------------------------------------------------ */
/* Dropdown                                                            */
/* ------------------------------------------------------------------ */

export function Dropdown({ open, onClose, align = 'right', className = '', children, labelledBy }) {
  const ref = useClickOutside(onClose, open);

  if (!open) return null;

  return (
    <div ref={ref} className={`dropdown__panel dropdown__panel--${align} ${className}`.trim()} role="menu" aria-labelledby={labelledBy}>
      {children}
    </div>
  );
}

export function DropdownItem({ icon: Icon, children, danger = false, className = '', ...props }) {
  return (
    <button type="button" role="menuitem" className={`dropdown__item ${danger ? 'dropdown__item--danger' : ''} ${className}`.trim()} {...props}>
      {Icon ? <Icon size={14} strokeWidth={1.9} aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
}

export function DropdownLabel({ children }) {
  return <p className="dropdown__label">{children}</p>;
}

export function DropdownSeparator() {
  return <div className="dropdown__sep" role="separator" />;
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

function useLockBody(active) {
  useEffect(() => {
    if (!active) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md', className = '' }) {
  useLockBody(open);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`modal modal--${size} ${className}`.trim()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal__head">
          <div>
            <h2 className="modal__title">{title}</h2>
            {subtitle ? <p className="modal__sub">{subtitle}</p> : null}
          </div>
          <IconButton label="Close dialog" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>
        <div className="modal__body">{children}</div>
        {footer ? <div className="modal__foot">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/* Drawer                                                              */
/* ------------------------------------------------------------------ */

export function Drawer({ open, onClose, title, subtitle, children, footer, width = 'md' }) {
  useLockBody(open);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="overlay overlay--drawer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className={`drawer drawer--${width}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer__head">
          <div>
            <p className="drawer__eyebrow">{subtitle}</p>
            <h2 className="drawer__title">{title}</h2>
          </div>
          <IconButton label="Close panel" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>
        <div className="drawer__body">{children}</div>
        {footer ? <div className="drawer__foot">{footer}</div> : null}
      </aside>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

export function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return createPortal(
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = TOAST_ICONS[toast.tone] ?? Info;
        return (
          <div key={toast.id} className={`toast toast--${toast.tone}`}>
            <Icon size={15} className="toast__icon" aria-hidden="true" />
            <p className="toast__message">{toast.message}</p>
            <IconButton label="Dismiss" className="toast__close" onClick={() => onDismiss(toast.id)}>
              <X size={13} />
            </IconButton>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
