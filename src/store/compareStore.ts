import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompareProperty {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
}

interface CompareState {
  compareList: CompareProperty[];
  addProperty: (property: CompareProperty) => void;
  removeProperty: (id: string) => void;
  clearCompare: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      compareList: [],
      isOpen: false,
      addProperty: (property) =>
        set((state) => {
          if (state.compareList.length >= 4) {
            return state; // Max 4 items
          }
          if (state.compareList.some((p) => p.id === property.id)) {
            return state; // Already exists
          }
          return { compareList: [...state.compareList, property], isOpen: true };
        }),
      removeProperty: (id) =>
        set((state) => ({
          compareList: state.compareList.filter((p) => p.id !== id),
          isOpen: state.compareList.length > 1, // Close if less than 2 items left? Actually keep it open to show what's left
        })),
      clearCompare: () => set({ compareList: [], isOpen: false }),
      setIsOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: 'compare-storage',
    }
  )
);
