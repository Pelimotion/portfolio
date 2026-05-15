import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, User, Check, Loader2 } from 'lucide-react';
import { userService } from '../../services/userService';

// ============================================
// TEAM SEARCH INPUT — Autocomplete for members
// ============================================

export function TeamSearchInput({ onSelect, excludeIds = [], placeholder = "Buscar por e-mail..." }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3) {
        setLoading(true);
        try {
          const users = await userService.searchByEmail(query);
          // Filter out already added members
          const filtered = users.filter(u => !excludeIds.includes(u.id));
          setResults(filtered);
          setIsOpen(true);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, excludeIds]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (user) => {
    onSelect(user);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-secondary/30 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {isOpen && (results || []).length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in-0 slide-in-from-top-2">
          <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40">
            Usuários Encontrados
          </div>
          <div className="max-h-60 overflow-y-auto">
            {(results || []).map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-600 text-[10px] text-white flex items-center justify-center font-bold shadow-sm">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {user.full_name || user.email?.split('@')[0] || 'Usuário'}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && query.length >= 3 && (results || []).length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 p-4 text-center">
          <p className="text-xs text-muted-foreground">Nenhum usuário encontrado com este e-mail.</p>
        </div>
      )}
    </div>
  );
}
