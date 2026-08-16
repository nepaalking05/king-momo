import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  loading: true,

  setAuth: (user, role) =>
    set({
      user,
      role,
      loading: false,
    }),

  logout: () =>
    set({
      user: null,
      role: null,
      loading: false,
    }),
}));