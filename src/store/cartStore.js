import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  items: [],
  paymentMode: "",

  setPaymentMode: (mode) =>
    set({
      paymentMode: mode,
    }),

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) => i.id === item.id
      );

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  qty: i.qty + 1,
                }
              : i
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            ...item,
            qty: 1,
          },
        ],
      };
    }),

  increaseQty: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id
          ? {
              ...i,
              qty: i.qty + 1,
            }
          : i
      ),
    })),

  decreaseQty: (id) =>
    set((state) => ({
      items: state.items
        .map((i) =>
          i.id === id
            ? {
                ...i,
                qty: i.qty - 1,
              }
            : i
        )
        .filter((i) => i.qty > 0),
    })),

  clearCart: () =>
    set({
      items: [],
    }),

  // ----------------------------------------
  // PLACE ORDER
  // ----------------------------------------

  placeOrder: () => {
    const {
      items,
      paymentMode,
    } = get();

    if (!items.length) {
      throw new Error("Cart is empty");
    }

    const total = items.reduce(
      (sum, item) =>
        sum + item.price * item.qty,
      0
    );

    const order = {
      id: `ORD-${Date.now()}`,

      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image || null,
      })),

      total,

      totalItems: items.reduce(
        (sum, item) => sum + item.qty,
        0
      ),

      paymentMode: paymentMode || "Cash",

      status: "Placed",

      createdAt: new Date().toISOString(),
    };

    // Get existing orders
    const existingOrders = JSON.parse(
      localStorage.getItem("orders") || "[]"
    );

    // Add newest order at the top
    const updatedOrders = [
      order,
      ...existingOrders,
    ];

    // Save orders
    localStorage.setItem(
      "orders",
      JSON.stringify(updatedOrders)
    );

    // Clear current cart
    set({
      items: [],
      paymentMode: "",
    });

    return order;
  },
}));