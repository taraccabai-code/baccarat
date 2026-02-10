"use server";

import { createClient2 } from "@/lib/supabase/server";

type BaccaratRecord = {
  id: number | string;
  level: number | null;
  pattern: string | null;
  target_profit: number | null;
  actions: string | null;
  units?: string | null;
  status?: string | null;
  user_balance?: number | string | null;
  bet_size?: number | string | null;
};

type BotMonitoringRow = {
  id: number | string;
  pc_name: string | null;
  status: string | null;
  balance: number | string | null;
  martingale_level: number | null;
  bet: number | string | null;
};

/**
 * Fetch rows from the secondary Supabase project (e.g. `bot_monitoring` DB)
 * and map `pc_name` -> `units` for the Play Baccarat table.
 */
export async function getBaccaratData(): Promise<BaccaratRecord[]> {
  const supabase = await createClient2();

  const { data, error } = await supabase
    // Assumes a table named `bot_monitoring` with columns:
    // id, pc_name, status, balance, martingale_level, bet
    .from("bot_monitoring")
    .select("id, pc_name, status, balance, martingale_level, bet")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching baccarat / bot_monitoring data:", error);
    return [];
  }

  const rows = (data || []) as BotMonitoringRow[];

  const mapped: BaccaratRecord[] = rows.map((row) => ({
    id: row.id,
    // DB column -> table label mapping:
    // pc_name          -> Units
    // status           -> Status
    // bet              -> Bet Size
    // balance          -> User Balance
    // martingale_level -> Level
    units: row.pc_name ?? null,
    status: row.status ?? null,
    bet_size: row.bet ?? null,
    user_balance: row.balance ?? null,
    level: row.martingale_level ?? null,
    pattern: null,
    target_profit: null,
    actions: null,
  }));

  return mapped;
}

