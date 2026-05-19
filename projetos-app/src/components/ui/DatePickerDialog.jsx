import React, { useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

export function DatePickerDialog({ open, onConfirm, onCancel, defaultValue = '', title = 'Ir para data' }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); onConfirm(inputRef.current?.value); }
    if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] animate-in fade-in-0" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-xs bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-5 animate-in zoom-in-95"
          onKeyDown={handleKeyDown}
          aria-describedby="date-picker-desc"
        >
          <Dialog.Title className="text-sm font-semibold text-foreground mb-3">{title}</Dialog.Title>
          <Dialog.Description id="date-picker-desc" className="sr-only">Selecione uma data para navegar</Dialog.Description>

          <input
            ref={inputRef}
            type="date"
            defaultValue={defaultValue}
            className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-[var(--surface-2)] rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(inputRef.current?.value)}
              className="px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors font-medium"
            >
              Ir
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
