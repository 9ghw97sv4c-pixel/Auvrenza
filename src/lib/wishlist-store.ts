"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";

interface WishlistLine {
  id: string;
  product: Product;
}

interface WishlistState {
  lines: WishlistLine[];
  isLoading: boolean;
  init: () => Promise<void>;
  has: (productId: string) => boolean;
  toggle: (product: Product) => Promise<"added" | "removed" | "needs-auth">;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  lines: [],
  isLoading: false,

  init: async () => {
    set({ isLoading: true });
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      set({ lines: [], isLoading: false });
      return;
    }
    const { data } = await supabase
      .from("wishlists")
      .select("id, product:products(*)")
      .eq("user_id", userData.user.id);
    set({ lines: (data ?? []).map((row: any) => ({ id: row.id, product: row.product })), isLoading: false });
  },

  has: (productId) => get().lines.some((l) => l.product.id === productId),

  toggle: async (product) => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return "needs-auth";

    const existing = get().lines.find((l) => l.product.id === product.id);
    if (existing) {
      await supabase.from("wishlists").delete().eq("id", existing.id);
      set({ lines: get().lines.filter((l) => l.id !== existing.id) });
      return "removed";
    }

    const { data } = await supabase
      .from("wishlists")
      .insert({ user_id: userData.user.id, product_id: product.id })
      .select("id")
      .single();

    if (data) {
      set({ lines: [...get().lines, { id: data.id, product }] });
    }
    return "added";
  },
}));
