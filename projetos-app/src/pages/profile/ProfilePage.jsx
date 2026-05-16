import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { renderAvatar, hashString, seedToColors } from '../../lib/avatarEngine';
import { ArrowLeft, RefreshCw, Palette, Save, Check, User, Mail, Briefcase, Hash, Sparkles } from 'lucide-react';

// ============================================
// PROFILE PAGE — User Settings + 3D Avatar
// ============================================

const COLOR_PRESETS = [
  { hue: 0, label: 'Vermelho' },
  { hue: 30, label: 'Laranja' },
  { hue: 50, label: 'Âmbar' },
  { hue: 120, label: 'Verde' },
  { hue: 180, label: 'Ciano' },
  { hue: 210, label: 'Azul' },
  { hue: 260, label: 'Violeta' },
  { hue: 300, label: 'Rosa' },
  { hue: 330, label: 'Magenta' },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  const [profile, setProfile] = useState({
    display_name: '',
    nickname: '',
    role: '',
    accent_hue: 210,
    avatar_seed: 0,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Load profile on mount
  useEffect(() => {
    if (!user) return;
    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile({
          display_name: data.display_name || user.email?.split('@')[0] || '',
          nickname: data.nickname || '',
          role: data.role || '',
          accent_hue: data.accent_hue ?? 210,
          avatar_seed: data.avatar_seed ?? hashString(user.id),
        });
      } else {
        // Initialize defaults from auth data
        setProfile(prev => ({
          ...prev,
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          avatar_seed: hashString(user.id),
        }));
      }
    }
    loadProfile();
  }, [user]);

  // Render avatar on canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    renderAvatar(canvasRef.current, profile.avatar_seed, {
      width: 280,
      height: 280,
      accentHue: profile.accent_hue,
      mouseX: mousePos.x,
      mouseY: mousePos.y,
    });
  }, [profile.avatar_seed, profile.accent_hue, mousePos]);

  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  const randomizeSeed = () => {
    setProfile(prev => ({ ...prev, avatar_seed: Math.floor(Math.random() * 999999999) }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          display_name: profile.display_name,
          nickname: profile.nickname,
          role: profile.role,
          accent_hue: profile.accent_hue,
          avatar_seed: profile.avatar_seed,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Save profile error:', e);
      alert('Erro ao salvar perfil. Verifique se a tabela profiles existe no Supabase.');
    } finally {
      setSaving(false);
    }
  };

  const colors = seedToColors(profile.avatar_seed, profile.accent_hue);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--surface-0)]">
      {/* Header */}
      <header className="h-14 flex items-center gap-4 px-6 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--surface-1)]">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-[var(--surface-3)] text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex flex-col">
          <h1 className="font-bold text-sm text-foreground">Perfil & Preferências</h1>
          <span className="text-[10px] text-muted-foreground/50">{user?.email}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Avatar Section */}
          <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Sparkles className="w-4 h-4 text-primary/60" />
              Avatar Generativo
            </div>
            
            <div className="flex items-start gap-8">
              {/* Avatar Canvas */}
              <div 
                className="relative shrink-0"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
              >
                <canvas
                  ref={canvasRef}
                  className="w-[180px] h-[180px] rounded-2xl border-2 border-[var(--border-strong)] shadow-xl cursor-crosshair"
                  style={{ imageRendering: 'auto' }}
                />
                <button
                  onClick={randomizeSeed}
                  className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[var(--surface-3)] border border-[var(--border-strong)] text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all shadow-lg"
                  title="Gerar novo avatar"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Seed + Color Controls */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-1.5 block">Seed</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={profile.avatar_seed}
                      onChange={e => setProfile(prev => ({ ...prev, avatar_seed: parseInt(e.target.value) || 0 }))}
                      className="flex-1 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <button onClick={randomizeSeed} className="px-3 py-2 rounded-lg bg-[var(--surface-3)] text-xs font-medium text-muted-foreground hover:text-foreground border border-[var(--border-subtle)] transition-colors">
                      Random
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                    <Palette className="w-3 h-3" /> Cor de Preferência
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_PRESETS.map(c => (
                      <button
                        key={c.hue}
                        onClick={() => setProfile(prev => ({ ...prev, accent_hue: c.hue }))}
                        className={`w-8 h-8 rounded-lg transition-all border-2 ${profile.accent_hue === c.hue ? 'border-foreground scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: `hsl(${c.hue}, 60%, 50%)` }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground/40 italic">
                  Mova o mouse sobre o avatar para vê-lo seguir seu cursor ✨
                </p>
              </div>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <User className="w-4 h-4 text-primary/60" />
              Informações
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Nome"
                icon={<User className="w-3.5 h-3.5" />}
                value={profile.display_name}
                onChange={v => setProfile(prev => ({ ...prev, display_name: v }))}
                placeholder="Seu nome completo"
              />
              <Field
                label="Apelido"
                icon={<Hash className="w-3.5 h-3.5" />}
                value={profile.nickname}
                onChange={v => setProfile(prev => ({ ...prev, nickname: v }))}
                placeholder="Como quer ser chamado"
              />
              <Field
                label="Cargo"
                icon={<Briefcase className="w-3.5 h-3.5" />}
                value={profile.role}
                onChange={v => setProfile(prev => ({ ...prev, role: v }))}
                placeholder="Ex: Motion Designer"
              />
              <Field
                label="E-mail"
                icon={<Mail className="w-3.5 h-3.5" />}
                value={user?.email || ''}
                disabled
                placeholder=""
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                saved
                  ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                  : 'bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/10'
              } disabled:opacity-50`}
            >
              {saved ? <><Check className="w-4 h-4" /> Salvo!</> : saving ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Perfil</>}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

function Field({ label, icon, value, onChange, placeholder, disabled }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        {icon} {label}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
}
