"use server"

import { createClient2 } from "@/lib/supabase/server";

export type PlayHistory = {
    id: number | string
    pc_name: string
    level: number
    start_balance: number
    end_balance: number
    bet_size: number
    created_at?: string
}

export async function getPlayHistory(): Promise<PlayHistory[]> {
    const supabase = await createClient2();
    const { data, error } = await supabase
        .from("play_history")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching play history:", error);
        return [];
    }
    return data as PlayHistory[];
}
