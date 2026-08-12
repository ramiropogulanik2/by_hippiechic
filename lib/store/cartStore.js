import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Ojo: acá no se guardan totales (ni cantidad ni precio). Se derivan en los
// componentes con un reduce sobre items, así no hay estado duplicado que se
// pueda desincronizar.
export const useCartStore = create(
  persist(
    (set) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find(
            (item) => item.variantId === newItem.variantId
          );

          if (!existing) {
            return { items: [...state.items, newItem] };
          }

          return {
            items: state.items.map((item) =>
              item.variantId === newItem.variantId
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            ),
          };
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),

      updateQuantity: (variantId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.variantId !== variantId),
            };
          }

          return {
            items: state.items.map((item) =>
              item.variantId === variantId ? { ...item, quantity } : item
            ),
          };
        }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "hippiechic-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
