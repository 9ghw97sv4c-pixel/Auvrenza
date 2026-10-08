"use server";

import { createClient } from "@/lib/supabase/server";

export async function subscribeToNewsletter(email: string): Promise<{ ok: boolean; message: string }> {
  if (!email || !email.includes("@")) {
    return { ok: false, message: "Enter a valid email address." };
  }
  const supabase = createClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({ email });

  if (error) {
    if (error.code === "23505") {
      return { ok: true, message: "You're already subscribed." };
    }
    return { ok: false, message: "Something went wrong. Please try again." };
  }
  return { ok: true, message: "Subscribed ✓" };
}
