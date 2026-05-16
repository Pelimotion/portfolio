import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AvatarWidget from '../../components/ui/AvatarWidget';
import { GamificationWidget } from '../../components/ui/GamificationWidget';
import {
  ArrowLeft, RefreshCw, Save, Check, User, Briefcase, Hash,
  Sparkles, Shuffle, Moon, Sun, MessageSquare
} from 'lucide-react';

// ============================================
// PROFILE PAGE — User Identity + 3D Avatar + Gamification
// ============================================

export default function ProfilePage() {
  const { user, profile: authProfile, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    display_name: '',
    nickname: '',
    role: '',
    status_text: '',
    accent_color: '#3b82f6',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync form from authProfile
  useEffect(() => {
    if (!authProfile && !user) return;
    setForm({
      display_name: authProfile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
      nickname: authProfile?.nickname || '',
      role: authProfile?.role || '',
      status_text: authProfile?.status_text || '',
      accent_color: authProfile?.accent_color || '#3b82f6',
    });
  }, [authProfile, user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile({
        display_name: form.display_name,
        nickname: form.nickname,
        role: form.role,
        status_text: form.status_text,
        accent_color: form.accent_color,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('Save profile error:', e);
      alert(`Erro ao salvar: ${e.message || 'Verifique o Supabase.'}`);
    } finally {
      setSaving(false);
    }
  };

  const ac = form.accent_color;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--surface-0)]">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--surface-1)]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-[var(--surface-3)] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-bold text-sm text-foreground">Perfil & Preferências</h1>
            <span className="text-[10px] text-muted-foreground/50">{user?.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--surface-3)] text-muted-foreground transition-colors" title="Alternar tema">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ background: saved ? '#22c55e' : ac, boxShadow: `0 4px 16px ${ac}44` }}
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto p-6 space-y-6">

          {/* ── Avatar + Identity ── */}
          <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-6">
            <div className="flex items-center gap-2 text-sm font-bold mb-5" style={{ color: ac }}>
              <Sparkles className="w-4 h-4" />
              Identidade Visual
            </div>
            <div className="flex gap-8 items-start">
              {/* Avatar 3D (New PS2 System) */}
              <div className="shrink-0 flex flex-col items-center gap-3">
                <div
                  className="w-[280px] h-[320px] rounded-3xl overflow-hidden border-4 shadow-2xl transition-all"
                  style={{ borderColor: `${ac}66`, boxShadow: `0 0 40px ${ac}33` }}
                >
                  <AvatarWidget userId={user?.id} className="w-full h-full" />
                </div>
                <p className="text-[10px] text-muted-foreground/40 font-mono uppercase tracking-widest">
                  Sistema PS2 Engine v2.0
                </p>
              </div>

              {/* Form fields */}
              <div className="flex-1 grid grid-cols-1 gap-4">
                {[
                  { key: 'display_name', label: 'Nome de Exibição', icon: User,         ph: 'Como você é chamado no sistema' },
                  { key: 'nickname',     label: 'Apelido (@)',      icon: Hash,         ph: 'seu_handle' },
                  { key: 'role',         label: 'Cargo',            icon: Briefcase,    ph: 'Ex: Motion Designer' },
                  { key: 'status_text',  label: 'Status',           icon: MessageSquare, ph: '☕ Disponível para calls...' },
                ].map(({ key, label, icon: Icon, ph }) => (
                  <div key={key}>
                    <label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1 mb-1.5">
                      <Icon className="w-3 h-3" /> {label}
                    </label>
                    <input
                      value={form[key]}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={ph}
                      className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/30"
                      style={{ '--tw-ring-color': ac }}
                      onFocus={e => { e.target.style.borderColor = `${ac}66`; }}
                      onBlur={e => { e.target.style.borderColor = ''; }}
                    />
                  </div>
                ))}

                {/* Color picker */}
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1 mb-1.5">
                    <span className="w-3 h-3 rounded-full shrink-0 border border-border" style={{ background: ac }} />
                    Cor de Destaque
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.accent_color}
                      onChange={e => setForm(prev => ({ ...prev, accent_color: e.target.value }))}
                      className="w-10 h-10 rounded-xl cursor-pointer border-2 border-[var(--border-strong)] bg-transparent p-0.5"
                    />
                    <div className="flex-1 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-sm font-mono" style={{ color: ac }}>
                      {form.accent_color}
                    </div>
                    {/* Quick presets */}
                    <div className="flex gap-1.5">
                      {['#3b82f6','#a855f7','#22c55e','#f59e0b','#ef4444','#ec4899'].map(c => (
                        <button key={c} onClick={() => setForm(prev => ({ ...prev, accent_color: c }))}
                          className="w-5 h-5 rounded-full border-2 transition-all hover:scale-125"
                          style={{ background: c, borderColor: form.accent_color === c ? '#fff' : 'transparent' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Preview section — how others see you ── */}
          <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-6">
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-4">Como você aparece no sistema</p>
            <div className="flex items-center gap-4 p-4 bg-[var(--surface-2)] rounded-xl">
              <div className="rounded-2xl overflow-hidden border-2 shrink-0" style={{ borderColor: `${ac}66` }}>
                <canvas ref={undefined} style={{ display: 'none' }} />
                {/* Static preview using same seed */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black" style={{ background: `${ac}22`, color: ac }}>
                  {(form.display_name || form.nickname || '?')[0]?.toUpperCase()}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black" style={{ color: ac }}>
                  {form.display_name || 'Seu Nome'}
                </span>
                {form.nickname && (
                  <span className="text-[11px] text-muted-foreground/60">@{form.nickname}</span>
                )}
                {form.role && (
                  <span className="text-[11px] text-muted-foreground/50">{form.role}</span>
                )}
                {form.status_text && (
                  <span className="text-[11px] text-muted-foreground/70 italic mt-0.5 border-l-2 pl-2" style={{ borderColor: ac }}>
                    {form.status_text}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Gamification ── */}
          <GamificationWidget profile={{ ...authProfile, ...form }} />

        </div>
      </main>
    </div>
  );
}
