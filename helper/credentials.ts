"use server";

import { createClient2 as createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCredentials() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credentials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching credentials:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
    });
    return [];
  }
  return data;
}

export async function getCredentialById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credentials")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching credential:", error);
    return null;
  }
  return data;
}

export async function createCredential(formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credentials")
    .insert([formData])
    .select();

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/trading-accounts/credentials");
  return data;
}

export async function updateCredential(id: string, formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credentials")
    .update(formData)
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/trading-accounts/credentials");
  return data;
}

export async function deleteCredential(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("credentials").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/trading-accounts/credentials");
  return true;
}

export async function credentialsTable() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credentials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching credentials table data:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
    });
    return [];
  }
  return data;
}
