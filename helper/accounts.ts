"use server"

import { createClient2 as createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAccounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_account")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user_account:", error);
    return [];
  }

  return data;
}

export async function getAccountById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_account")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching account by id:", error);
    return null;
  }
  return data;
}

export async function createAccount(formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_account")
    .insert([formData])
    .select();

  if (error) {
    console.error("Error creating account:", error);
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/trading-accounts/user-accounts");
  return data;
}

export async function updateAccount(id: string, formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_account")
    .update(formData)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating account:", error);
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/trading-accounts/user-accounts");
  return data;
}

export async function deleteAccount(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_account")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting account:", error);
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/trading-accounts/user-accounts");
  return true;
}


export async function accountsTable() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_account")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user_account table data:", error);
    return [];
  }
  return data;
}
