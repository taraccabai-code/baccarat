"use server";

import { createClient2 } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  level: number | null;
  pattern: string | null;
  target_profit: number | null;
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
    // id, pc_name, status, balance, level, pattern, target_profit, bet
    .from("bot_monitoring")
    .select("id, pc_name, status, balance, level, pattern, target_profit, bet")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching baccarat / bot_monitoring data:", error);
    return [];
  }

  // Debug log to trace total rows being fetched


  const rows = (data || []) as BotMonitoringRow[];

  const mapped: BaccaratRecord[] = rows.map((row) => ({
    id: row.id,
    // DB column -> table label mapping:
    // pc_name          -> Units
    // status           -> Status
    // bet              -> Bet Size
    // balance          -> User Balance
    // level            -> Level
    // pattern          -> Pattern
    // target_profit    -> Target Profit
    units: row.pc_name ?? null,
    status: row.status ?? null,
    bet_size: row.bet ?? null,
    user_balance: row.balance ?? null,
    level: row.level ?? null,
    pattern: row.pattern ?? null,
    target_profit: row.target_profit ?? null,
    actions: null,
  }));

  return mapped;
}

type UpdateBaccaratPayload = {
  id: number | string;
  level: number | null;
  pattern: string | null;
  target_profit: number | null;
  bet_size?: number | null;
  status?: string | null;
  command?: boolean;
};

export async function updateBaccaratRow({
  id,
  level,
  pattern,
  target_profit,
  bet_size,
  status,
  command,
}: UpdateBaccaratPayload): Promise<void> {
  const supabase = await createClient2();

  const updateData: any = {
    level,
    pattern,
    target_profit,
  };

  if (status !== undefined) {
    updateData.status = status;
  }

  if (command !== undefined) {
    updateData.command = command;
  }

  if (bet_size !== undefined) {
    updateData.bet = bet_size;
  }

  const { error } = await supabase
    .from("bot_monitoring")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating baccarat row:", error);
    throw error;
  }

  revalidatePath("/dashboard/trade/play-baccarat");
}

