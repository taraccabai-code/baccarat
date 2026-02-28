"use server";

import { createClient2 } from "@/lib/supabase/server";

export type PlatformWebsiteRecord = {
    id: number | string;
    platform_name: string | null;
    platform_website: string | null;
    min_bet: number | string | null;
    platform_code: string | null;
    text_color: string | null;
    bg_color: string | null;
};

/**
 * Fetch rows from the platform_website table.
 */
export async function getPlatformWebsites(): Promise<PlatformWebsiteRecord[]> {
    const supabase = await createClient2();

    const { data, error } = await supabase
        .from("platform_website")
        .select("id, platform_name, platform_website, min_bet, platform_code, text_color, bg_color")
        .order("id", { ascending: true });

    if (error) {
        console.error("Error fetching platform_website data:", error);
        return [];
    }

    return (data || []) as PlatformWebsiteRecord[];
}

export async function createPlatformWebsite(formData: Omit<PlatformWebsiteRecord, "id">) {
    const supabase = await createClient2();
    const { data, error } = await supabase
        .from("platform_website")
        .insert([formData])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function updatePlatformWebsite(id: string | number, formData: Partial<Omit<PlatformWebsiteRecord, "id">>) {
    const supabase = await createClient2();
    const { data, error } = await supabase
        .from("platform_website")
        .update(formData)
        .eq("id", id)
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function deletePlatformWebsite(id: string | number) {
    const supabase = await createClient2();
    const { error } = await supabase
        .from("platform_website")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    return true;
}
