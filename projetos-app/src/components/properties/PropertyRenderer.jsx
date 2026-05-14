import React, { useState, useRef, useEffect, memo } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ProCalendarPicker } from '../ui/calendar/ProCalendarPicker';
import { useTeamStore } from '../../stores/useTeamStore';
import { Check, ChevronDown, User, Hash, Tag, Link2, Type } from 'lucide-react';

// ============================================
// INLINE EDITING PROPERTY RENDERER
// ============================================

// ── Text ──
const TextProperty = memo(({ property, value, onChange, inline }) => {
  const [val, setVal] = useState(value?.text || '');
  const [editing, setEditing] = useState(false);

  useEffect(() => { setVal(value?.text || ''); }, [value?.text]);

  const handleBlur = () => {
    setEditing(false);
    if (val !== value?.text) onChange({ text: val });
  };

  if (!editing && inline) {
    return (
      <div onClick={(e) => { e.stopPropagation(); setEditing(true); }}
        className="text-xs text-muted-foreground hover:text-foreground cursor-text px-1.5 py-0.5 -ml-1.5 rounded hover:bg-secondary/50 min-w-[60px] truncate transition-colors">
        {val || <span className="opacity-40">Vazio</span>}
      </div>
    );
  }

  return (
    <input
      type="text"
      autoFocus={inline}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleBlur(); } }}
      placeholder={property.name}
      onClick={e => e.stopPropagation()}
      className={`bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded px-1.5 py-0.5 -ml-1.5 w-full ${inline ? 'text-foreground' : 'border border-border'}`}
    />
  );
});

// ── Number ──
const NumberProperty = memo(({ property, value, onChange, inline }) => {
  const [val, setVal] = useState(value?.number ?? '');
  const [editing, setEditing] = useState(false);

  useEffect(() => { setVal(value?.number ?? ''); }, [value?.number]);

  const handleBlur = () => {
    setEditing(false);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed !== value?.number) onChange({ number: parsed });
  };

  if (!editing && inline) {
    return (
      <div onClick={(e) => { e.stopPropagation(); setEditing(true); }}
        className="text-xs font-mono text-muted-foreground hover:text-foreground cursor-text px-1.5 py-0.5 -ml-1.5 rounded hover:bg-secondary/50 min-w-[40px] truncate transition-colors">
        {val !== '' ? val : <span className="opacity-40 font-sans">#</span>}
      </div>
    );
  }

  return (
    <input
      type="number"
      autoFocus={inline}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={e => { if (e.key === 'Enter') handleBlur(); }}
      onClick={e => e.stopPropagation()}
      className="bg-transparent text-sm rounded px-1.5 py-0.5 -ml-1.5 w-20 focus:outline-none focus:ring-1 focus:ring-primary font-mono border border-transparent"
    />
  );
});

// ── Select / Status (DropdownMenu) ──
const SelectProperty = memo(({ property, value, onChange, inline, isStatus = false }) => {
  const options = property.config?.options || [];
  const selectedOpt = options.find((o) => o.id === value?.selected);

  const colorMap = {
    gray:   'bg-secondary/60 text-muted-foreground',
    blue:   'bg-blue-500/10 text-blue-500',
    green:  'bg-emerald-500/10 text-emerald-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    red:    'bg-red-500/10 text-red-500',
    purple: 'bg-purple-500/10 text-purple-500',
    orange: 'bg-orange-500/10 text-orange-500',
  };

  const getColors = (colorStr) => colorMap[colorStr] || colorMap.gray;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button onClick={e => e.stopPropagation()}
          className={`flex items-center justify-between gap-2 text-xs font-medium rounded-md px-2 py-1 transition-colors hover:brightness-110 focus:outline-none focus:ring-1 focus:ring-primary ${isStatus || selectedOpt ? getColors(selectedOpt?.color) : 'bg-transparent text-muted-foreground hover:bg-secondary/50 -ml-2'}`}>
          {isStatus && selectedOpt && (
            <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-70`} />
          )}
          <span className="truncate max-w-[100px]">{selectedOpt ? selectedOpt.label : '—'}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start"
          onClick={e => e.stopPropagation()}
          className="z-50 min-w-[160px] bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 p-1">
          <DropdownMenu.Item
            onSelect={() => onChange({ selected: '' })}
            className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg cursor-pointer outline-none">
            <span className="flex-1">— Limpar</span>
          </DropdownMenu.Item>
          {options.map((opt) => (
            <DropdownMenu.Item
              key={opt.id}
              onSelect={() => onChange({ selected: opt.id })}
              className={`flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-secondary rounded-lg cursor-pointer outline-none ${value?.selected === opt.id ? 'bg-secondary/50' : ''}`}>
              {isStatus && <span className={`w-2 h-2 rounded-full ${colorMap[opt.color]?.split(' ')[0] || 'bg-muted-foreground'}`} />}
              <span className="flex-1 text-foreground font-medium">{opt.label}</span>
              {value?.selected === opt.id && <Check className="w-3.5 h-3.5 text-primary" />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
});

// ── People (DropdownMenu + Search) ──
const PeopleProperty = memo(({ property, value, onChange, inline }) => {
  const { members, fetchMembers } = useTeamStore();
  
  useEffect(() => {
    // Busca os membros. No app real deve passar o projectId
    fetchMembers('current_project');
  }, [fetchMembers]);

  const selectedName = value?.people || '';
  const selectedMember = members.find(m => m.name === selectedName);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button onClick={e => e.stopPropagation()}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-1.5 py-1 -ml-1.5 rounded-md hover:bg-secondary/50 transition-colors focus:outline-none focus:ring-1 focus:ring-primary max-w-[140px]">
          {selectedMember ? (
            <>
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-[8px] text-white flex items-center justify-center font-bold">
                {selectedMember.avatar}
              </div>
              <span className="truncate">{selectedMember.name.split(' ')[0]}</span>
            </>
          ) : selectedName ? (
            <span className="truncate">{selectedName}</span>
          ) : (
            <>
              <User className="w-3.5 h-3.5 opacity-50" />
              <span>Unassigned</span>
            </>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start"
          onClick={e => e.stopPropagation()}
          className="z-50 min-w-[200px] bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 p-1">
          
          <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Assignee
          </div>
          
          <DropdownMenu.Item
            onSelect={() => onChange({ people: '' })}
            className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg cursor-pointer outline-none">
            <User className="w-4 h-4" />
            <span className="flex-1">Unassigned</span>
          </DropdownMenu.Item>
          
          {members.map((m) => (
            <DropdownMenu.Item
              key={m.id}
              onSelect={() => onChange({ people: m.name })}
              className={`flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-secondary rounded-lg cursor-pointer outline-none ${selectedName === m.name ? 'bg-secondary/50' : ''}`}>
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-[9px] text-white flex items-center justify-center font-bold">
                {m.avatar}
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-foreground font-medium">{m.name}</span>
                <span className="text-[10px] text-muted-foreground">{m.role}</span>
              </div>
              {selectedName === m.name && <Check className="w-3.5 h-3.5 text-primary" />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
});

// ── Checkbox ──
const CheckboxProperty = memo(({ property, value, onChange }) => {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange({ checked: !value?.checked }); }}
      className={`w-4 h-4 rounded border transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/50 ${
        value?.checked
          ? 'bg-primary border-primary text-primary-foreground'
          : 'border-border hover:border-muted-foreground bg-secondary/20'
      }`}
    >
      {value?.checked && <Check className="w-3 h-3" />}
    </button>
  );
});

// ── Url ──
const UrlProperty = memo(({ property, value, onChange, inline }) => {
  const [val, setVal] = useState(value?.url || '');
  const [editing, setEditing] = useState(false);

  useEffect(() => { setVal(value?.url || ''); }, [value?.url]);

  const handleBlur = () => {
    setEditing(false);
    if (val !== value?.url) onChange({ url: val });
  };

  if (!editing && inline) {
    if (!val) {
      return (
        <div onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          className="text-xs text-muted-foreground hover:text-foreground cursor-text px-1.5 py-0.5 -ml-1.5 rounded hover:bg-secondary/50 min-w-[60px] truncate transition-colors flex items-center gap-1">
          <Link2 className="w-3 h-3 opacity-50" /> Vazio
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <a href={val} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
          className="text-xs text-blue-400 hover:text-blue-300 underline truncate max-w-[150px]">
          {val}
        </a>
        <button onClick={(e) => { e.stopPropagation(); setEditing(true); }} className="text-xs text-muted-foreground hover:text-foreground px-1 py-0.5 rounded hover:bg-secondary">
          Editar
        </button>
      </div>
    );
  }

  return (
    <input
      type="url"
      autoFocus={inline}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={e => { if (e.key === 'Enter') handleBlur(); }}
      onClick={e => e.stopPropagation()}
      placeholder="https://..."
      className={`bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded px-1.5 py-0.5 -ml-1.5 w-full text-blue-400 ${inline ? '' : 'border border-border'}`}
    />
  );
});

// ── REGISTRY ──
const RENDERERS = {
  text: TextProperty,
  number: NumberProperty,
  select: (p) => <SelectProperty {...p} />,
  multi_select: (p) => <SelectProperty {...p} />, // temp fallback
  status: (p) => <SelectProperty {...p} isStatus />,
  people: PeopleProperty,
  checkbox: CheckboxProperty,
  url: UrlProperty,
};

export function PropertyRenderer({ property, value, onChange, inline = false }) {
  const type = property.property_type;
  
  // Date renderer com ProCalendarPicker + Popover (via absolute relative)
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

    return (
      <div className="relative" ref={containerRef}>
        <button 
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }} 
          className="text-xs text-muted-foreground hover:text-foreground px-1.5 py-1 -ml-1.5 rounded-md hover:bg-secondary/50 transition-colors focus:outline-none focus:ring-1 focus:ring-primary w-full text-left truncate flex items-center gap-1.5"
        >
          {dateVal}
        </button>
        {open && (
          <div className="absolute top-full mt-1 left-0 z-50 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
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
