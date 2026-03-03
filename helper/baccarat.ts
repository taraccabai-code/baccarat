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
  strategy?: string | null;
  duration?: number | string | null;
  franchise_code?: string | null;
  platform_code?: string | null;
  assigned_user?: {
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
  } | null;
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
  strategy: string | null;
  duration: number | string | null;
  franchise: string | null;
  assigned_user?: {
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
  } | {
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
  }[] | null;
  platform_code: string | null;
};

/**
 * Fetch rows from the secondary Supabase project (e.g. `bot_monitoring` DB)
 * and map `pc_name` -> `units` for the Play Baccarat table.
 */
export async function getBaccaratData(): Promise<BaccaratRecord[]> {
  const supabase = await createClient2();

  const { data, error } = await supabase
    .from("bot_monitoring")
    .select("id, pc_name, status, balance, level, pattern, target_profit, bet, strategy, duration, franchise, platform_code, assigned_user:user_id(first_name, middle_name, last_name)")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching baccarat / bot_monitoring data:", error);
    return [];
  }

  // Fetch all franchises to look up franchise_code
  const { data: allFranchises } = await supabase
    .from("franchise")
    .select("id, franchise_name, franchise_code");

  const safeFranchises = allFranchises || [];
  const rows = (data || []) as BotMonitoringRow[];

  const mapped: BaccaratRecord[] = rows.map((row) => {
    // Match franchise_code from franchise table
    let franchiseCode: string | null = null;
    if (row.franchise) {
      const found = safeFranchises.find(
        f => f.franchise_name === String(row.franchise)
          || f.franchise_code === String(row.franchise)
          || String(f.id) === String(row.franchise)
      );
      franchiseCode = found?.franchise_code || null;
    }

    return {
      id: row.id,
      units: row.pc_name ?? null,
      status: row.status ?? null,
      bet_size: row.bet ?? null,
      user_balance: row.balance ?? null,
      level: row.level ?? null,
      pattern: row.pattern ?? null,
      target_profit: row.target_profit ?? null,
      strategy: row.strategy ?? null,
      duration: row.duration ?? null,
      franchise_code: franchiseCode,
      platform_code: row.platform_code ?? null,
      assigned_user: Array.isArray(row.assigned_user) ? row.assigned_user[0] : row.assigned_user ?? null,
      actions: null,
    };
  });

  return mapped;
}

type UpdateBaccaratPayload = {
  id: number | string;
  level: number | null;
  pattern: string | null;
  target_profit: number | null;
  bet_size?: number | null;
  strategy?: string | null;
  status?: string | null;
  command?: boolean;
  duration?: number | null;
  user_id?: string | null;
  franchise?: string | null;
  franchise_id?: number | null;
  platform_code?: string | null;
};

export async function updateBaccaratRow({
  id,
  level,
  pattern,
  target_profit,
  bet_size,
  strategy,
  status,
  command,
  duration,
  user_id,
  franchise,
  franchise_id,
  platform_code,
}: UpdateBaccaratPayload): Promise<void> {
  const supabase = await createClient2();

  const updateData: any = {
    level,
    pattern,
    target_profit,
  };

  if (status !== undefined && status !== null) {
    // Normalize status to title case (e.g., "idle" -> "Idle", "running" -> "Running")
    updateData.status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  } else if (status === null) {
    updateData.status = null;
  }

  if (command !== undefined) {
    updateData.command = command;
  }

  if (bet_size !== undefined) {
    updateData.bet = bet_size;
  }

  if (strategy !== undefined) {
    updateData.strategy = strategy;
  }

  if (duration !== undefined) {
    updateData.duration = duration;
  }

  if (user_id !== undefined) {
    updateData.user_id = user_id;
  }

  if (franchise !== undefined) {
    updateData.franchise = franchise;
  }

  if (franchise_id !== undefined) {
    updateData.franchise_id = franchise_id;
  }

  if (platform_code !== undefined) {
    updateData.platform_code = platform_code;
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

export async function createBaccaratRow(payload: any): Promise<any[]> {
  const supabase = await createClient2();

  const insertData = {
    pc_name: payload.pc_name,
    status: payload.status ? (payload.status.charAt(0).toUpperCase() + payload.status.slice(1).toLowerCase()) : "Idle",
    level: payload.level,
    pattern: payload.pattern,
    target_profit: payload.target_profit,
    bet: payload.bet_size,
    strategy: payload.strategy,
    duration: payload.duration,
    user_id: payload.user_id,
    franchise: payload.franchise,
    franchise_id: payload.franchise_id ?? null,
  };

  const { data, error } = await supabase
    .from("bot_monitoring")
    .insert([insertData])
    .select();

  if (error) {
    console.error("Error creating baccarat row:", error);
    throw error;
  }

  revalidatePath("/dashboard/trade/play-baccarat");
  return data || [];
}

export async function getFranchiseUnitCount(franchiseId: number): Promise<number> {
  const supabase = await createClient2();
  
  const { count, error } = await supabase
    .from("bot_monitoring")
    .select("*", { count: 'exact', head: true })
    .eq("franchise_id", franchiseId);
    
  if (error) {
    console.error("Error fetching franchise unit count:", error);
    return 0;
  }
  
  return count || 0;
}
