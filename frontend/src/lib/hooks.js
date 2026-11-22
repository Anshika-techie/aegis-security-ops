import { useEffect, useRef, useState } from 'react';

/** Run a callback when a click or focus happens outside the referenced element. */
export function useClickOutside(onOutside, active = true) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    function handlePointer(event) {
      if (ref.current && !ref.current.contains(event.target)) onOutside(event);
    }
    function handleKey(event) {
      if (event.key === 'Escape') onOutside(event);
    }

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onOutside, active]);

  return ref;
}

/** Debounce a rapidly changing value (used by the global search). */
export function useDebounced(value, delay = 180) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
