import { create } from 'zustand';

export type TabTopic = 'physics' | 'biology' | 'chemistry' | 'medicine' | 'history' | 'technology' | 'undefined';

export interface Tab {
  id: string;
  title: string;
  articleTitle?: string;
  topic: TabTopic;
  status: 'loading' | 'idle' | 'error';
}

interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab?: Partial<Tab>) => string;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useTabStore = create<TabState>((set) => ({
  tabs: [],
  activeTabId: null,
  addTab: (tabData) => {
    const id = generateId();
    const newTab: Tab = {
      id,
      title: 'New Tab',
      topic: 'undefined',
      status: 'idle',
      ...tabData,
    };

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: id,
    }));

    return id;
  },
  closeTab: (id) => set((state) => {
    const newTabs = state.tabs.filter((t) => t.id !== id);
    let newActiveId = state.activeTabId;

    if (state.activeTabId === id) {
      if (newTabs.length > 0) {
        const index = state.tabs.findIndex((t) => t.id === id);
        newActiveId = newTabs[Math.min(index, newTabs.length - 1)].id;
      } else {
        newActiveId = null;
      }
    }

    return {
      tabs: newTabs,
      activeTabId: newActiveId,
    };
  }),
  setActiveTab: (id) => set({ activeTabId: id }),
  updateTab: (id, updates) => set((state) => ({
    tabs: state.tabs.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),
}));
