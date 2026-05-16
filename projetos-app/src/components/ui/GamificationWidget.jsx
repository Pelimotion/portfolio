import React, { useState } from 'react';
import { levelProgress, levelTitle, BADGE_DEFS } from '../../lib/gamification';
import { Zap, Flame, CheckSquare, Shield, ChevronDown, ChevronUp } from 'lucide-react';

// ── Animated XP bar ──────────────────────────────────────────────────────────────
function XPBar({ percent, color }) {
  return (
    <div className="h-2 rounded-full bg-[var(--surface-overlay)] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${percent}%`, background: `linear-gradient(to right, ${color}99, ${color})` }}
      />
    </div>
  );
}

// ── Badge display ────────────────────────────────────────────────────────────────
function BadgeIcon({ badgeId, earned, accentColor }) {
  const def = BADGE_DEFS.find(b => b.id === badgeId);
  if (!def) return null;
  return (
    <div
      title={`${def.label}: ${def.desc}`}
      className={`relative w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-all cursor-default
        ${earned
          ? 'bg-[var(--surface-2)] border-2 shadow-md hover:scale-110'
          : 'bg-[var(--surface-3)] border border-border/20 opacity-35 grayscale'
        }`}
      style={earned ? { borderColor: `${accentColor}66` } : {}}
    >
      <span role="img" aria-label={def.label}>{def.icon}</span>
      {!earned && (
        <span className="absolute inset-0 flex items-center justify-center rounded-xl">
          <Shield className="w-3.5 h-3.5 text-muted-foreground/30" />
        </span>
      )}
    </div>
  );
}

// ── Main GamificationWidget ──────────────────────────────────────────────────────
export function GamificationWidget({ profile, compact = false }) {
  const [expanded, setExpanded] = useState(!compact);
  const xp = profile?.xp || 0;
  const lp = levelProgress(xp);
  const accentColor = profile?.accent_color || '#3b82f6';
  const earnedBadges = new Set(profile?.badges || []);
  const daysLogged = profile?.days_logged || 0;
  const cardsCompleted = profile?.cards_completed || 0;
  const title = levelTitle(lp.level);

  if (compact) {
    // Mini version for Sidebar
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-subtle)]">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-[10px] font-black uppercase tracking-widest shrink-0" style={{ color: accentColor }}>
            Lv.{lp.level}
          </span>
          <div className="flex-1 min-w-0">
            <XPBar percent={lp.percent} color={accentColor} />
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/50 shrink-0">
          <Flame className="w-3 h-3 text-orange-400" />
          {daysLogged}d
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="p-5 cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg"
            style={{ background: `linear-gradient(135deg, ${accentColor}44, ${accentColor}99)`, color: accentColor, border: `2px solid ${accentColor}44` }}
          >
            {lp.level}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-foreground">{title}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${accentColor}22`, color: accentColor }}>
                Lv.{lp.level}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground/50">{lp.currentLevelXP} / {lp.neededXP} XP</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground/60">
            <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-400" />{daysLogged}d</span>
            <span className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5 text-green-400" />{cardsCompleted}</span>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground/30" /> : <ChevronDown className="w-4 h-4 text-muted-foreground/30" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-[var(--border-subtle)]">
          {/* XP Bar */}
          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-[10px] font-bold text-muted-foreground/50">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" style={{ color: accentColor }} /> Progresso</span>
              <span>{lp.percent}%</span>
            </div>
            <XPBar percent={lp.percent} color={accentColor} />
            <p className="text-[10px] text-muted-foreground/40">
              +{lp.neededXP - lp.currentLevelXP} XP para <strong className="text-muted-foreground/60">Lv.{lp.level + 1}</strong>
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total XP',     value: xp.toLocaleString(),  icon: <Zap className="w-3.5 h-3.5" style={{ color: accentColor }} /> },
              { label: 'Streak',       value: `${daysLogged}d`,       icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> },
              { label: 'Cards Feitos', value: cardsCompleted,         icon: <CheckSquare className="w-3.5 h-3.5 text-green-400" /> },
            ].map(stat => (
              <div key={stat.label} className="bg-[var(--surface-2)] rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1 text-muted-foreground/50">{stat.icon}</div>
                <p className="text-base font-black text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Badges grid */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
              Emblemas — {earnedBadges.size}/{BADGE_DEFS.length}
            </p>
            <div className="flex flex-wrap gap-2">
              {BADGE_DEFS.map(badge => (
                <BadgeIcon
                  key={badge.id}
                  badgeId={badge.id}
                  earned={earnedBadges.has(badge.id)}
                  accentColor={accentColor}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
