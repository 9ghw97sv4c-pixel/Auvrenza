"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { getGuestId } from "@/lib/guest-id";
import type { Product } from "@/lib/types";

export interface CartLine {
  id: string; // cart_items row id
  product: Product;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  isLoading: boolean;
  ownerId: string | null;
  open: () => void;
  close: () => void;
  init: () => Promise<void>;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clear: () => Promise<void>;
  subtotalUsd: () => number;
  count: () => number;
}

async function resolveOwnerId(): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? getGuestId();
}

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],
  isOpen: false,
  isLoading: false,
  ownerId: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  init: async () => {
    set({ isLoading: true });
    const supabase = createClient();
    const ownerId = await resolveOwnerId();
    const { data, error } = await supabase
      .from("cart_items")
      .select("id, quantity, product:products(*)")
      .eq("owner_id", ownerId);

    if (!error && data) {
      set({
        lines: data.map((row: any) => ({ id: row.id, quantity: row.quantity, product: row.product })),
        ownerId,
        isLoading: false,
      });
    } else {
      set({ isLoading: false, ownerId });
    }
  },

  addItem: async (product, quantity = 1) => {
    const supabase = createClient();
    const ownerId = get().ownerId ?? (await resolveOwnerId());
    const existing = get().lines.find((l) => l.product.id === product.id);

    if (existing) {
      await get().updateQuantity(existing.id, existing.quantity + quantity);
      return;
    }

    const { data, error } = await supabase
      .from("cart_items")
      .upsert({ owner_id: ownerId, product_id: product.id, quantity }, { onConflict: "owner_id,product_id" })
      .select("id")
      .single();

    if (!error && data) {
      set({ lines: [...get().lines, { id: data.id, product, quantity }], ownerId, isOpen: true });
    }
  },

  updateQuantity: async (lineId, quantity) => {
    const supabase = createClient();
    if (quantity <= 0) {
      await get().removeItem(lineId);
      return;
    }
    await supabase.from("cart_items").update({ quantity }).eq("id", lineId);
    set({ lines: get().lines.map((l) => (l.id === lineId ? { ...l, quantity } : l)) });
  },

  removeItem: async (lineId) => {
    const supabase = createClient();
    await supabase.from("cart_items").delete().eq("id", lineId);
    set({ lines: get().lines.filter((l) => l.id !== lineId) });
  },

  clear: async () => {
    const supabase = createClient();
    const ownerId = get().ownerId ?? (await resolveOwnerId());
    await supabase.from("cart_items").delete().eq("owner_id", ownerId);
    set({ lines: [] });
  },

  subtotalUsd: () => get().lines.reduce((sum, l) => sum + l.product.price_usd * l.quantity, 0),
  count: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
}));

/**
 * Call once, right after a successful login, to move any guest-cart rows
 * onto the newly authenticated user's owner_id.
 */
export async function mergeGuestCartIntoUser(userId: string) {
  const supabase = createClient();
  const guestId = getGuestId();
  if (guestId === userId) return;

  const { data: guestRows } = await supabase.from("cart_items").select("*").eq("owner_id", guestId);
  if (!guestRows?.length) return;

  for (const row of guestRows) {
    await supabase
      .from("cart_items")
      .upsert(
        { owner_id: userId, product_id: row.product_id, quantity: row.quantity },
        { onConflict: "owner_id,product_id" }
      );
  }
  await supabase.from("cart_items").delete().eq("owner_id", guestId);
}
