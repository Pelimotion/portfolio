import { useEffect } from 'react';

/**
 * Global keyboard shortcuts for the calendar.
 * T=today  J/→=next  K/←=prev  G=go-to-date
 * Ignored when focus is inside an input/textarea/select.
 */
export function CalendarKbd({ onToday, onNext, onPrev, onGoToDate }) {
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case 't': case 'T': e.preventDefault(); onToday(); break;
        case 'j': case 'J': case 'ArrowRight': e.preventDefault(); onNext(); break;
        case 'k': case 'K': case 'ArrowLeft':  e.preventDefault(); onPrev(); break;
        case 'g': case 'G': {
          e.preventDefault();
          const input = prompt('Ir para (YYYY-MM-DD):');
          if (input) onGoToDate(input);
          break;
        }
        default: break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onToday, onNext, onPrev, onGoToDate]);

  return null;
}
