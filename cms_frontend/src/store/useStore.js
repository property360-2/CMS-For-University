import { create } from "zustand";

export const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  theme: "light",
  setTheme: (theme) => set({ theme }),
}));
