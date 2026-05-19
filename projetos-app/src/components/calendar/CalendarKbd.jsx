import React, { useEffect, useState } from 'react';
import { DatePickerDialog } from '../ui/DatePickerDialog';

export function CalendarKbd({ onToday, onNext, onPrev, onGoToDate }) {
  const [dialogOpen, setDialogOpen] = useState(false);

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
          setDialogOpen(true);
          break;
        }
        default: break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onToday, onNext, onPrev]);

  return (
    <DatePickerDialog
      open={dialogOpen}
      title="Ir para data (G)"
      onConfirm={(date) => {
        setDialogOpen(false);
        if (date) onGoToDate(date);
      }}
      onCancel={() => setDialogOpen(false)}
    />
  );
}
