import { create } from 'zustand'

type View = 'home' | 'brew' | 'edit';

interface UiState {
    currentView: View;
    setView: (view: View) => void;
}

export const useUiStore = create<UiState>((set) => ({
    currentView: 'home',
    setView: (view) => set({ currentView: view }),
}))
