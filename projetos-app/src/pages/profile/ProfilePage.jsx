import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AvatarWidget from '../../components/ui/AvatarWidget';
import { GamificationWidget } from '../../components/ui/GamificationWidget';
import {
  ArrowLeft, Save, Check, User, Briefcase, Hash,
  Sparkles, Moon, Sun, MessageSquare, Settings, 
  Shield, Bell, Palette, Globe, LogOut
} from 'lucide-react';

export default function ProfilePage() {
  const { user, profile: authProfile, updateProfile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('perfil'); // perfil | identidade | preferencias | conta

  const [form, setForm] = useState({
    display_name: '',
    nickname: '',
    role: '',
    status_text: '',
    accent_color: '#3b82f6',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('Save profile error:', e);
      alert(`Erro ao salvar: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const ac = form.accent_color;

  const sections = [
    { id: 'perfil', label: 'Perfil Público', icon: User },
    { id: 'identidade', label: 'Identidade 3D', icon: Sparkles },
    { id: 'preferencias', label: 'Preferências', icon: Palette },
    { id: 'conta', label: 'Conta e Segurança', icon: Shield },
  ];

  return (
    <div className="flex h-full overflow-hidden bg-[var(--surface-0)] font-sans antialiased">
      
      {/* ── INTERNAL SIDEBAR ── */}
      <aside className="w-72 border-r border-[var(--border-subtle)] bg-[var(--surface-1)] flex flex-col shrink-0">
        <div className="h-16 flex items-center px-8 border-b border-[var(--border-subtle)]">
          <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Portal Central</span>
          </button>
        </div>

        <div className="flex-1 p-6 space-y-8">
          <div>
            <label className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] px-3 mb-4 block">Configurações</label>
            <nav className="space-y-1">
              {sections.map(s => {
                const Icon = s.icon;
                const isActive = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'text-muted-foreground hover:bg-[var(--surface-2)] hover:text-foreground border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : 'opacity-50'}`} />
                    {s.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-8 border-t border-[var(--border-subtle)]">
            <button 
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/5 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Encerrar Sessão
            </button>
          </div>
        </div>

        <div className="p-8 bg-[var(--surface-2)]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black uppercase">
              {user?.email?.[0]}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-black text-foreground truncate">{form.display_name || 'Usuário'}</span>
              <span className="text-[9px] font-bold text-muted-foreground/50 truncate uppercase tracking-wider">Membro Gold</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-10 bg-[var(--surface-0)] border-b border-[var(--border-subtle)] z-10">
          <h2 className="text-xl font-black tracking-tight text-foreground">
            {sections.find(s => s.id === activeSection)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] text-muted-foreground hover:text-foreground transition-all">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-black text-white transition-all shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              style={{ background: saved ? '#22c55e' : ac, boxShadow: `0 8px 24px ${ac}44` }}
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Alterações Salvas' : saving ? 'Sincronizando...' : 'Salvar Alterações'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {activeSection === 'perfil' && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Informações Gerais</h3>
                    <div className="space-y-4">
                      <FormField label="Nome de Exibição" icon={User} ph="Seu nome oficial" 
                        value={form.display_name} onChange={v => setForm({...form, display_name: v})} ac={ac} />
                      <FormField label="Apelido / Handle" icon={Hash} ph="como_voce_aparece" 
                        value={form.nickname} onChange={v => setForm({...form, nickname: v})} ac={ac} />
                      <FormField label="Cargo / Função" icon={Briefcase} ph="Ex: Creative Director" 
                        value={form.role} onChange={v => setForm({...form, role: v})} ac={ac} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Status e Bio</h3>
                    <div className="space-y-4">
                      <FormField label="Status Atual" icon={MessageSquare} ph="O que você está fazendo agora?" 
                        value={form.status_text} onChange={v => setForm({...form, status_text: v})} ac={ac} isArea />
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-[var(--border-subtle)]">
                   <GamificationWidget profile={{ ...authProfile, ...form }} />
                </div>
              </div>
            )}

            {activeSection === 'identidade' && (
              <div className="space-y-10">
                <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-3xl p-10 flex flex-col md:flex-row gap-12 items-center md:items-start">
                  <div className="shrink-0">
                    <div className="w-[320px] h-[420px] rounded-3xl overflow-hidden border-4 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] transition-all"
                      style={{ borderColor: `${ac}44`, boxShadow: `0 20px 50px ${ac}22` }}>
                      <AvatarWidget userId={user?.id} className="w-full h-full" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-8 py-4">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                        Pelimotion PS2 Engine <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase">Alpha v2.1</span>
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                        Sua identidade visual é gerada de forma procedural baseada em sementes criptográficas. 
                        Cada modificação é única e persistida no núcleo do sistema.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-[var(--surface-2)] rounded-2xl border border-[var(--border-subtle)]">
                        <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest block mb-1">Polígonos</span>
                        <span className="text-lg font-black text-foreground font-mono">1.2k Low-Poly</span>
                      </div>
                      <div className="p-5 bg-[var(--surface-2)] rounded-2xl border border-[var(--border-subtle)]">
                        <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest block mb-1">Shader</span>
                        <span className="text-lg font-black text-foreground font-mono">Toon-Outline</span>
                      </div>
                    </div>

                    <div className="pt-6">
                       <button onClick={handleSave} className="text-sm font-bold text-primary hover:underline flex items-center gap-2">
                         Saiba mais sobre a tecnologia <Globe className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'preferencias' && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-6">
                     <h3 className="text-xs font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Tema do Sistema</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <ThemeButton active={theme === 'light'} onClick={() => theme !== 'light' && toggleTheme()} label="Claro" icon={Sun} />
                        <ThemeButton active={theme === 'dark'} onClick={() => theme !== 'dark' && toggleTheme()} label="Escuro" icon={Moon} />
                     </div>
                   </div>

                   <div className="space-y-6">
                     <h3 className="text-xs font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Cores da Interface</h3>
                     <div className="flex flex-wrap gap-3">
                        {['#3b82f6','#a855f7','#22c55e','#f59e0b','#ef4444','#ec4899','#6366f1','#14b8a6'].map(c => (
                          <button key={c} onClick={() => setForm({...form, accent_color: c})}
                            className={`w-12 h-12 rounded-2xl border-4 transition-all hover:scale-110 shadow-lg ${form.accent_color === c ? 'border-white' : 'border-transparent'}`}
                            style={{ background: c }}
                          />
                        ))}
                     </div>
                     <div className="mt-4 flex items-center gap-4 p-4 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-2xl">
                        <div className="w-6 h-6 rounded-lg border border-white/20" style={{ background: ac }} />
                        <span className="text-sm font-mono font-bold uppercase" style={{ color: ac }}>HEX: {ac}</span>
                        <input type="color" value={ac} onChange={e => setForm({...form, accent_color: e.target.value})} className="ml-auto w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" />
                     </div>
                   </div>
                </div>
              </div>
            )}

            {activeSection === 'conta' && (
              <div className="space-y-8">
                <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-3xl space-y-4">
                   <div className="flex items-center gap-3 text-red-500">
                     <Shield className="w-5 h-5" />
                     <h3 className="text-sm font-black uppercase tracking-widest">Zona Crítica</h3>
                   </div>
                   <p className="text-sm text-muted-foreground leading-relaxed">
                     As alterações de conta e exclusão de dados são permanentes. 
                     Sua conta está vinculada ao e-mail <strong>{user?.email}</strong>.
                   </p>
                   <div className="pt-4">
                     <button className="px-6 py-3 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20">
                       Excluir Conta Permanentemente
                     </button>
                   </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

function FormField({ label, icon: Icon, ph, value, onChange, ac, isArea }) {
  return (
    <div>
      <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.15em] flex items-center gap-2 mb-2 px-1">
        <Icon className="w-3 h-3" /> {label}
      </label>
      {isArea ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={ph}
          className="w-full bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl px-5 py-4 text-sm text-foreground focus:outline-none transition-all placeholder:text-muted-foreground/20 min-h-[120px]"
          onFocus={e => { e.target.style.borderColor = `${ac}66`; e.target.style.boxShadow = `0 0 20px ${ac}11`; }}
          onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
        />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={ph}
          className="w-full bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl px-5 py-4 text-sm text-foreground focus:outline-none transition-all placeholder:text-muted-foreground/20"
          onFocus={e => { e.target.style.borderColor = `${ac}66`; e.target.style.boxShadow = `0 0 20px ${ac}11`; }}
          onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
        />
      )}
    </div>
  );
}

function ThemeButton({ active, onClick, label, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all ${
        active 
          ? 'bg-primary/5 border-primary shadow-xl shadow-primary/5 text-foreground' 
          : 'bg-[var(--surface-1)] border-[var(--border-subtle)] text-muted-foreground hover:border-muted-foreground/30'
      }`}
    >
      <Icon className={`w-8 h-8 ${active ? 'text-primary' : 'opacity-30'}`} />
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
