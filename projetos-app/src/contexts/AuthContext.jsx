import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { computeLevel, computeBadges, XP_SOURCES } from '../lib/gamification';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Load profile from Supabase ──────────────────────────────────────────────
  const loadProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); return; }
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setProfile(data);
        // Track daily login streak
        trackDailyLogin(userId, data);
      }
    } catch (e) {
      console.warn('loadProfile error:', e);
    }
  }, []);

  // ── Track daily login (streak + XP) ─────────────────────────────────────────
  const trackDailyLogin = async (userId, existingProfile) => {
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = existingProfile?.last_login_date;

    if (lastLogin === today) return; // Already logged today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isStreak = lastLogin === yesterday.toISOString().split('T')[0];

    const newDays = (existingProfile?.days_logged || 0) + 1;
    let xpGain = XP_SOURCES.daily_login;
    if (newDays % 7 === 0) xpGain += XP_SOURCES.streak_7;
    if (newDays % 30 === 0) xpGain += XP_SOURCES.streak_30;

    const newXP = (existingProfile?.xp || 0) + xpGain;
    const newLevel = computeLevel(newXP);
    const newBadges = computeBadges({
      ...existingProfile,
      xp: newXP,
      level: newLevel,
      days_logged: newDays,
      cards_completed: existingProfile?.cards_completed || 0,
    });

    const updates = {
      last_login_date: today,
      days_logged: newDays,
      xp: newXP,
      level: newLevel,
      badges: newBadges,
      updated_at: new Date().toISOString(),
    };

    const { data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (data) setProfile(data);
  };

  // ── Update profile (called from ProfilePage, etc) ────────────────────────────
  const updateProfile = useCallback(async (updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const payload = {
      id: user.id,
      email: user.email,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Recompute level/badges if XP changed
    if (updates.xp !== undefined) {
      payload.level = computeLevel(updates.xp);
      payload.badges = computeBadges({ ...profile, ...updates });
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  }, [profile]);

  // ── Award XP (called from gamification triggers) ─────────────────────────────
  const awardXP = useCallback(async (amount, source) => {
    if (!profile) return null;
    const newXP = (profile.xp || 0) + amount;
    const newLevel = computeLevel(newXP);
    const leveledUp = newLevel > (profile.level || 1);

    const updates = { xp: newXP };
    if (source === 'feito_check') {
      updates.cards_completed = (profile.cards_completed || 0) + 1;
    }

    const updated = await updateProfile(updates);
    return { updated, leveledUp, xpGained: amount, newLevel };
  }, [profile, updateProfile]);

  // ── Refresh profile ──────────────────────────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await loadProfile(user.id);
  }, [loadProfile]);

  // ── Auth state management ────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const value = {
    session,
    user: session?.user,
    profile,
    loading,
    updateProfile,
    refreshProfile,
    awardXP,
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
