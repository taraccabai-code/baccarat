import { createBrowserClient } from "@supabase/ssr";

type SupabaseProject = "primary" | "secondary";

export function createClient() {
  return createBrowserClientFor("primary");
}

/**
 * Explicit browser client for the second Supabase project.
 * Uses NEXT_PUBLIC_SUPABASE_URL2 / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY2.
 */
export function createClient2() {
  return createBrowserClientFor("secondary");
}

/**
 * Generic factory so you can switch between Supabase projects.
 *
 * Example:
 *   const supabase = createBrowserClientFor("secondary");
 */
export function createBrowserClientFor(project: SupabaseProject) {
  const url =
    project === "primary"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : process.env.NEXT_PUBLIC_SUPABASE_URL2;

  const key =
    project === "primary"
      ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY2;

  if (!url || !key) {
    throw new Error(
      `Missing Supabase env vars for ${project} project (URL / PUBLISHABLE_KEY).`,
    );
  }

  return createBrowserClient(url, key);
}
