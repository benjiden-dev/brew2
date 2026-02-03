import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type View = 'home' | 'brew' | 'edit';

interface UiState {
    currentView: View;
    setView: (view: View) => void;
    tempUnit: 'C' | 'F';
    toggleTempUnit: () => void;
}

export const useUiStore = create<UiState>()(
    persist(
        (set) => ({
            currentView: 'home',
            setView: (view) => set({ currentView: view }),
            tempUnit: 'C',
            toggleTempUnit: () => set((state) => ({ tempUnit: state.tempUnit === 'C' ? 'F' : 'C' })),
        }),
        {
            name: 'brew-ui-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ tempUnit: state.tempUnit }), // Only persist tempUnit
        }
    )
)
