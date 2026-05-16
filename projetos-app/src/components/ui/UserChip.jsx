import React, { useState, useRef, useEffect, useCallback } from 'react';
import { renderAvatar, hashString } from '../../lib/avatarEngine';
import { levelProgress, levelTitle, BADGE_DEFS } from '../../lib/gamification';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';

// ── Tiny avatar canvas (doesn't track mouse) ─────────────────────────────────────
function TinyAvatar({ seed, accentColor, size = 28, accessories }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      renderAvatar(ref.current, seed || 1, { width: size * 2, height: size * 2, accentColor, accessories });
    }
  }, [seed, accentColor, size, accessories]);
  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size, borderRadius: '50%', display: 'block' }}
    />
  );
}

// ── Tooltip floating card ────────────────────────────────────────────────────────
function UserTooltip({ profile, accentColor }) {
  if (!profile) return null;
  const lp = levelProgress(profile.xp || 0);
  const earnedBadges = (profile.badges || []).slice(-3); // Last 3 badges

  return (
    <div
      className="absolute z-[999] bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
      style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))' }}
    >
      <div className="bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-2xl p-4 space-y-3">
        {/* Avatar + Name */}
        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-xl overflow-hidden border-2" style={{ borderColor: accentColor }}>
            <TinyAvatar seed={profile.avatar_seed || hashString(profile.id || '0')} accentColor={accentColor} size={44} accessories={profile.avatar_accessories} />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-foreground truncate" style={{ color: accentColor }}>
              {profile.display_name || profile.email?.split('@')[0] || 'User'}
            </p>
            {profile.nickname && (
              <p className="text-[10px] text-muted-foreground/60 truncate">@{profile.nickname}</p>
            )}
            {profile.role && (
              <p className="text-[10px] text-muted-foreground/50 truncate">{profile.role}</p>
            )}
          </div>
        </div>

        {/* Status text */}
        {profile.status_text && (
          <p className="text-[11px] text-muted-foreground/70 italic leading-relaxed border-l-2 pl-2" style={{ borderColor: accentColor }}>
            {profile.status_text}
          </p>
        )}

        {/* Level + XP */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span style={{ color: accentColor }}>Lv.{lp.level} {levelTitle(lp.level)}</span>
            <span className="text-muted-foreground/50">{lp.currentLevelXP}/{lp.neededXP} XP</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--surface-overlay)]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${lp.percent}%`, backgroundColor: accentColor }}
            />
          </div>
        </div>

        {/* Recent badges */}
        {earnedBadges.length > 0 && (
          <div className="flex items-center gap-2">
            {earnedBadges.map(badgeId => {
              const def = BADGE_DEFS.find(b => b.id === badgeId);
              return def ? (
                <span key={badgeId} title={def.desc} className="text-lg cursor-default" role="img" aria-label={def.label}>
                  {def.icon}
                </span>
              ) : null;
            })}
            <span className="text-[10px] text-muted-foreground/40 ml-auto">{(profile.days_logged || 0)}d streak</span>
          </div>
        )}
      </div>
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
        style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `6px solid var(--border-strong)` }}
      />
    </div>
  );
}

// ── Main UserChip component ──────────────────────────────────────────────────────
export function UserChip({ userId, email, size = 'md', showTooltip = true, showName = true }) {
  const { user, profile: myProfile } = useAuth();
  const [extProfile, setExtProfile] = useState(null);
  const [hovering, setHovering] = useState(false);
  const timerRef = useRef(null);

  // Determine which profile to use
  const isMe = userId === user?.id || (!userId && email === user?.email);
  const profile = isMe ? myProfile : extProfile;

  // Load external profile
  useEffect(() => {
    if (isMe || !userId) return;
    userService.fetchById(userId)
      .then(setExtProfile)
      .catch(() => {});
  }, [userId, isMe]);

  const displayName = profile?.nickname || profile?.display_name || profile?.email?.split('@')[0] || email?.split('@')[0] || '?';
  const accentColor = profile?.accent_color || '#3b82f6';
  const seed = profile?.avatar_seed ?? hashString(profile?.id || userId || email || '0');
  const avatarSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24;

  const handleEnter = useCallback(() => {
    timerRef.current = setTimeout(() => setHovering(true), 300);
  }, []);
  const handleLeave = useCallback(() => {
    clearTimeout(timerRef.current);
    setHovering(false);
  }, []);

  return (
    <span
      className="relative inline-flex items-center gap-1.5 cursor-default group/chip"
      onMouseEnter={showTooltip ? handleEnter : undefined}
      onMouseLeave={showTooltip ? handleLeave : undefined}
    >
      <span className="rounded-full overflow-hidden shrink-0 border" style={{ borderColor: `${accentColor}66` }}>
        <TinyAvatar seed={seed} accentColor={accentColor} size={avatarSize} accessories={profile?.avatar_accessories} />
      </span>
      {showName && (
        <span
          className="text-xs font-bold truncate transition-colors"
          style={{ color: accentColor, maxWidth: '80px' }}
        >
          {displayName}
        </span>
      )}
      {showTooltip && hovering && <UserTooltip profile={profile} accentColor={accentColor} />}
    </span>
  );
}
