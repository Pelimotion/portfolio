import React, { useState, useRef, useEffect } from 'react';
import { ProCalendarPicker } from '../ui/calendar/ProCalendarPicker';

// ============================================
// PROPERTY RENDERER — Registry pattern
// Renderiza qualquer tipo de propriedade
// ============================================

function TextProperty({ property, value, onChange, inline }) {
  const textVal = value?.text || '';
  return (
    <input
      type="text"
      value={textVal}
      onChange={(e) => onChange({ text: e.target.value })}
      placeholder={property.name}
      className={`bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring rounded px-2 py-1 w-full ${inline ? 'text-foreground' : 'border border-border'}`}
    />
  );
}

function NumberProperty({ property, value, onChange }) {
  return (
    <input
      type="number"
      value={value?.number ?? ''}
      onChange={(e) => onChange({ number: parseFloat(e.target.value) || 0 })}
      className="bg-transparent text-sm border border-border rounded px-2 py-1 w-20 focus:outline-none focus:ring-1 focus:ring-ring font-mono"
    />
  );
}

function SelectProperty({ property, value, onChange }) {
  const options = property.config?.options || [];
  const selected = value?.selected || '';

  return (
    <div className="relative">
      <select
        value={selected}
        onChange={(e) => onChange({ selected: e.target.value })}
        className="bg-secondary/50 text-sm border border-border rounded-md px-2 py-1 pr-6 focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer text-foreground"
      >
        <option value="">—</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function StatusProperty({ property, value, onChange }) {
  const options = property.config?.options || [];
  const selected = value?.selected || '';
  const currentOpt = options.find((o) => o.id === selected);

  const colorMap = {
    gray: 'bg-secondary text-muted-foreground',
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    red: 'bg-red-500/10 text-red-500',
    purple: 'bg-purple-500/10 text-purple-500',
    orange: 'bg-orange-500/10 text-orange-500',
  };

  return (
    <select
      value={selected}
      onChange={(e) => onChange({ selected: e.target.value })}
      className={`text-xs font-medium rounded-md px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer ${colorMap[currentOpt?.color] || colorMap.gray}`}
    >
      <option value="">—</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>{opt.label}</option>
      ))}
    </select>
  );
}

function PeopleProperty({ property, value, onChange }) {
  const people = value?.people || '';
  return (
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 shrink-0" />
      <input
        type="text"
        value={people}
        onChange={(e) => onChange({ people: e.target.value })}
        placeholder="Assign..."
        className="bg-transparent text-sm focus:outline-none w-full"
      />
    </div>
  );
}

function DateProperty({ property, value, onChange }) {
  return (
    <input
      type="date"
      value={value?.date || ''}
      onChange={(e) => onChange({ date: e.target.value })}
      className="bg-transparent text-sm border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
    />
  );
}

function CheckboxProperty({ property, value, onChange }) {
  return (
    <button
      onClick={() => onChange({ checked: !value?.checked })}
      className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${
        value?.checked
          ? 'bg-primary border-primary text-primary-foreground'
          : 'border-border hover:border-muted-foreground'
      }`}
    >
      {value?.checked && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}

function UrlProperty({ property, value, onChange }) {
  const url = value?.url || '';
  return (
    <div className="flex items-center gap-1">
      <input
        type="url"
        value={url}
        onChange={(e) => onChange({ url: e.target.value })}
        placeholder="https://..."
        className="bg-transparent text-sm focus:outline-none w-full text-blue-500 underline truncate"
      />
    </div>
  );
}

// ---- REGISTRY ----
const RENDERERS = {
  text: TextProperty,
  number: NumberProperty,
  select: SelectProperty,
  multi_select: SelectProperty, // simplificado por agora
  status: StatusProperty,
  people: PeopleProperty,
  checkbox: CheckboxProperty,
  url: UrlProperty,
};

export function PropertyRenderer({ property, value, onChange, inline = false }) {
  const type = property.property_type;
  
  // Date renderer com ProCalendarPicker
  if (type === 'date') {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    
    useEffect(() => {
      function handleClickOutside(e) {
        if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
      }
      if (open) document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const dateVal = value?.date ? new Date(value.date).toLocaleDateString('pt-BR') : 'Sem data';

    if (!inline) {
      return (
        <div className="relative" ref={containerRef}>
          <button onClick={() => setOpen(!open)} className="w-full text-left px-3 py-1.5 border border-border rounded-md text-sm bg-background hover:bg-secondary/20 transition-colors flex items-center justify-between">
            <span className={value?.date ? 'text-foreground' : 'text-muted-foreground'}>{dateVal}</span>
          </button>
          {open && (
            <div className="absolute top-full mt-1 left-0 z-50">
              <ProCalendarPicker value={value?.date} onChange={d => { onChange({ date: d }); setOpen(false); }} onClose={() => setOpen(false)} />
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="relative" ref={containerRef}>
        <span onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className="text-xs text-muted-foreground cursor-pointer hover:text-foreground hover:bg-secondary px-1.5 py-0.5 rounded transition-colors inline-block w-full truncate">
          {dateVal}
        </span>
        {open && (
          <div className="absolute top-full mt-1 left-0 z-50" onClick={e => e.stopPropagation()}>
            <ProCalendarPicker value={value?.date} onChange={d => { onChange({ date: d }); setOpen(false); }} onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
    );
  }

  const Component = RENDERERS[type];
  if (!Component) {
    return <span className="text-xs text-muted-foreground italic">Unsupported: {type}</span>;
  }
  return <Component property={property} value={value} onChange={onChange} inline={inline} />;
}

export { RENDERERS as PROPERTY_RENDERERS };
