import { create } from "zustand";
export const useCartStore = create((set) => ({
  items: [],
  paymentMode: "",

  setPaymentMode: (mode) =>
    set({ paymentMode: mode }),

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) => i.id === item.id
      );

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id
              ? { ...i, qty: i.qty + 1 }
              : i
          ),
        };
      }

      return {
        items: [...state.items, { ...item, qty: 1 }],
      };
    }),

  increaseQty: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, qty: i.qty + 1 } : i
      ),
    })),

  decreaseQty: (id) =>
    set((state) => ({
      items: state.items
        .map((i) =>
          i.id === id ? { ...i, qty: i.qty - 1 } : i
        )
        .filter((i) => i.qty > 0),
    })),

  clearCart: () => set({ items: [] }),
}));