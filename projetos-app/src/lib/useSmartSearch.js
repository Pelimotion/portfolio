import { create } from 'zustand';

export const useSmartSearch = create((set) => ({
  smartSearchOpen: false,
  openSmartSearch: () => set({ smartSearchOpen: true }),
  closeSmartSearch: () => set({ smartSearchOpen: false }),
}));
