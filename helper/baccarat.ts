"use server";

import { createClient2 } from "@/lib/supabase/server";

type BaccaratRecord = {
  id: number | string;
  level: number | null;
  pattern: string | null;
  target_profit: number | null;
  actions: string | null;
};

/**
 * Fetch Baccarat configuration / unit rows from the second Supabase project.
 *
 * Assumes a `baccarat_units` (or similarly named) table exists with:
 * - level (numeric)
 * - pattern (text)
 * - target_profit (numeric)
 * - actions (text)
 */
export async function getBaccaratData(): Promise<BaccaratRecord[]> {
  const supabase = await createClient2();

  const { data, error } = await supabase
    .from("play_baccarat")
    .select("id, level, pattern, target_profit, actions")
    .order("level", { ascending: true });

  if (error) {
    console.error("Error fetching baccarat data:", error);
    return [];
  }

  return (data || []) as BaccaratRecord[];
}

