"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitContactMessage(data: { name: string; email: string; message: string }) {
  if (!data.name || !data.email || !data.message) {
    return { ok: false, message: "Please fill in all fields." };
  }
  const supabase = createClient();
  const { error } = await supabase.from("contact_messages").insert(data);
  if (error) return { ok: false, message: "Something went wrong. Please try again." };
  return { ok: true, message: "Message sent — we'll get back to you soon." };
}
