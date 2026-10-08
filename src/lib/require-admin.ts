import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Defense-in-depth check for admin-only server actions and pages.
 * Middleware already blocks non-admins from /admin routes, but server
 * actions can be invoked directly, so we re-verify here too.
 */
export async function requireAdmin() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userData.user.id).single();
  if (profile?.role !== "admin") redirect("/");

  return userData.user;
}
