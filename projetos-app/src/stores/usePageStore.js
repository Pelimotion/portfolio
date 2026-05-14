import { create } from 'zustand';
import { pageService } from '../services/pageService';
import { propertyService } from '../services/propertyService';

// ============================================
// PAGE STORE — Estado global de páginas
// Optimistic updates + cache + rollback
// ============================================

export const usePageStore = create((set, get) => ({
  // Cache de páginas por ID
  pages: {},
  // Lista de IDs filhos por parent_id
  children: {},
  // Loading states
  loadingPages: {},

  // Gravar uma página no cache
  _cachePage: (page) => {
    set((state) => ({
      pages: { ...state.pages, [page.id]: page },
    }));
  },

  // Gravar múltiplas páginas no cache
  _cachePages: (pages) => {
    set((state) => {
      const next = { ...state.pages };
      for (const p of pages) next[p.id] = p;
      return { pages: next };
    });
  },

  // ---- FETCHES ----

  fetchPage: async (pageId) => {
    if (get().loadingPages[pageId]) return;
    set((state) => ({ loadingPages: { ...state.loadingPages, [pageId]: true } }));
    try {
      const page = await pageService.fetchById(pageId);
      get()._cachePage(page);
    } catch (e) {
      console.error('fetchPage error:', e);
    } finally {
      set((state) => ({ loadingPages: { ...state.loadingPages, [pageId]: false } }));
    }
  },

  fetchRootPages: async () => {
    try {
      const pages = await pageService.fetchRootPages();
      get()._cachePages(pages);
      set({ children: { ...get().children, root: pages.map((p) => p.id) } });
    } catch (e) {
      console.error('fetchRootPages error:', e);
    }
  },

  fetchChildren: async (parentId) => {
    try {
      const pages = await pageService.fetchChildren(parentId);
      get()._cachePages(pages);
      set({ children: { ...get().children, [parentId]: pages.map((p) => p.id) } });
    } catch (e) {
      console.error('fetchChildren error:', e);
    }
  },

  fetchDatabaseItems: async (databaseId) => {
    try {
      const items = await pageService.fetchDatabaseItems(databaseId);
      get()._cachePages(items);
      set({
        children: { ...get().children, [databaseId]: items.map((p) => p.id) },
      });
      return items;
    } catch (e) {
      console.error('fetchDatabaseItems error:', e);
      return [];
    }
  },

  // ---- MUTATIONS (Optimistic) ----

  createPage: async ({ title, parentId, pageType, content, icon, createdBy }) => {
    try {
      const page = await pageService.create({
        title,
        parentId,
        pageType,
        content,
        icon,
        createdBy,
      });
      get()._cachePage(page);
      // Atualizar lista de filhos
      const parentKey = parentId || 'root';
      const currentChildren = get().children[parentKey] || [];
      set({
        children: {
          ...get().children,
          [parentKey]: [...currentChildren, page.id],
        },
      });
      return page;
    } catch (e) {
      console.error('createPage error:', e);
      throw e;
    }
  },

  updatePage: async (pageId, updates) => {
    const prev = get().pages[pageId];
    // Optimistic
    if (prev) {
      get()._cachePage({ ...prev, ...updates });
    }
    try {
      const updated = await pageService.update(pageId, updates);
      get()._cachePage(updated);
      return updated;
    } catch (e) {
      // Rollback
      if (prev) get()._cachePage(prev);
      console.error('updatePage error:', e);
      throw e;
    }
  },

  archivePage: async (pageId) => {
    const prev = get().pages[pageId];
    // Optimistic: remover do cache
    set((state) => {
      const next = { ...state.pages };
      delete next[pageId];
      // Remover de children
      const nextChildren = { ...state.children };
      for (const key of Object.keys(nextChildren)) {
        nextChildren[key] = nextChildren[key].filter((id) => id !== pageId);
      }
      return { pages: next, children: nextChildren };
    });
    try {
      await pageService.archive(pageId);
    } catch (e) {
      // Rollback
      if (prev) get()._cachePage(prev);
      console.error('archivePage error:', e);
      throw e;
    }
  },

  // ---- SELECTORS ----

  getPage: (pageId) => get().pages[pageId],
  getChildren: (parentId) => {
    const ids = get().children[parentId || 'root'] || [];
    return ids.map((id) => get().pages[id]).filter(Boolean);
  },
  getRootPages: () => get().getChildren('root'),
  isLoading: (pageId) => !!get().loadingPages[pageId],
}));
