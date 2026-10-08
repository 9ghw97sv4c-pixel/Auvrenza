"use client";

import { create } from "zustand";

type AuthTab = "login" | "register" | "forgot";

interface UIState {
  authModalOpen: boolean;
  authTab: AuthTab;
  openAuthModal: (tab?: AuthTab) => void;
  closeAuthModal: () => void;
  setAuthTab: (tab: AuthTab) => void;
}

export const useUIStore = create<UIState>((set) => ({
  authModalOpen: false,
  authTab: "login",
  openAuthModal: (tab = "login") => set({ authModalOpen: true, authTab: tab }),
  closeAuthModal: () => set({ authModalOpen: false }),
  setAuthTab: (tab) => set({ authTab: tab }),
}));
