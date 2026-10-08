/**
 * Reads a required environment variable, throwing a clear, actionable error
 * if it's missing — instead of relying on a bare `process.env.X!` assertion,
 * which is purely a TypeScript compile-time hint and provides no runtime
 * safety. Without this, a missing key surfaces as a cryptic low-level error
 * deep inside the Stripe/Supabase SDK instead of telling you what's wrong.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in .env.local for local development, ` +
        `or in your Vercel project's Environment Variables for production — see .env.local.example for the full list.`
    );
  }
  return value;
}
