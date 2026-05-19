import { create } from 'zustand';

export const useDocSearch = create((set) => ({
  docSearchOpen: false,
  openDocSearch: () => set({ docSearchOpen: true }),
  closeDocSearch: () => set({ docSearchOpen: false }),
}));
