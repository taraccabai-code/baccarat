import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type SupabaseProject = "primary" | "secondary";

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  return createServerClientFor("primary");
}

/**
 * Explicit server client for the second Supabase project.
 * Uses NEXT_PUBLIC_SUPABASE_URL2 / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY2.
 */
export async function createClient2() {
  return createServerClientFor("secondary");
}

/**
 * Generic factory so you can switch between Supabase projects.
 *
 * Example:
 *   const supabase = await createServerClientFor("secondary");
 */
export async function createServerClientFor(project: SupabaseProject) {
  const cookieStore = await cookies();

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

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have proxy refreshing user sessions.
        }
      },
    },
  });
}
