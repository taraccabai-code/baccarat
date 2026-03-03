"use server";

import { createClient2 as createClient } from "@/lib/supabase/server";

export async function getFranchises() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("franchise")
    .select("id, franchise_name, franchise_code, investor_name, description")
    .order("franchise_name", { ascending: true });

  if (error) {
    console.error("Error fetching franchises:", error);
    return [];
  }
  
  // Map franchise_name to id to maintain compatibility with existing components
  // Keep the real DB id as db_id for foreign key references
  return (data || []).map(f => ({
      ...f,
      db_id: f.id,
      id: f.franchise_name
  }));
}

export async function getFranchiseById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("franchise")
    .select("*")
    .eq("franchise_name", id)
    .single();

  if (error) {
    console.error("Error fetching franchise:", error);
    return null;
  }
  return { ...data, id: data.franchise_name };
}

export async function createFranchise(formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("franchise")
    .insert([formData])
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function updateFranchise(id: string, formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("franchise")
    .update(formData)
    .eq("franchise_name", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function deleteFranchise(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("franchise").delete().eq("franchise_name", id);

  if (error) {
    throw new Error(error.message);
  }
  return true;
}
