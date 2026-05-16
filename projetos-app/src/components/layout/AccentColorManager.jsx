import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function AccentColorManager() {
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.accent_color) {
      const root = document.documentElement;
      root.style.setProperty('--brand-color', profile.accent_color);
      
      // Generate transparent versions for shadows/hover
      const hex = profile.accent_color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      root.style.setProperty('--brand-color-rgb', `${r}, ${g}, ${b}`);
    }
  }, [profile?.accent_color]);

  return null;
}
