"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function normalizeAsset(value: FormDataEntryValue | null) {
  const asset = String(value ?? "").trim().toUpperCase();
  return /^[A-Z0-9][A-Z0-9._/-]{0,39}$/.test(asset) ? asset : null;
}

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=Please%20sign%20in%20again");
  return { supabase, user };
}

function done(message: string): never {
  revalidatePath("/dashboard");
  redirect(`/dashboard?message=${encodeURIComponent(message)}`);
}

function fail(message: string): never {
  redirect(`/dashboard?error=${encodeURIComponent(message)}`);
}

export async function addWatchlistAsset(formData: FormData) {
  const assetId = normalizeAsset(formData.get("asset_id"));
  if (!assetId) fail("Enter a valid asset symbol such as BTC or BTC/USDT.");

  const { supabase, user } = await requireUser();
  const { count, error: countError } = await supabase
    .from("watchlist_assets")
    .select("asset_id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) fail("Could not load your watchlist. Please try again.");
  const { data: existing } = await supabase
    .from("watchlist_assets")
    .select("asset_id")
    .eq("user_id", user.id)
    .eq("asset_id", assetId)
    .maybeSingle();

  if (!existing && (count ?? 0) >= 20) fail("Your watchlist can contain up to 20 assets.");
  const { error } = await supabase
    .from("watchlist_assets")
    .upsert({ user_id: user.id, asset_id: assetId }, { onConflict: "user_id,asset_id", ignoreDuplicates: true });

  if (error) fail("Could not save this asset. Please try again.");
  done(`${assetId} saved to your watchlist.`);
}

export async function removeWatchlistAsset(formData: FormData) {
  const assetId = normalizeAsset(formData.get("asset_id"));
  if (!assetId) fail("Invalid asset symbol.");
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("watchlist_assets")
    .delete()
    .eq("user_id", user.id)
    .eq("asset_id", assetId);
  if (error) fail("Could not remove this asset. Please try again.");
  done(`${assetId} removed from your watchlist.`);
}

export async function savePortfolioHolding(formData: FormData) {
  const assetId = normalizeAsset(formData.get("asset_id"));
  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const quantity = Number(quantityRaw);
  if (!assetId) fail("Enter a valid asset symbol such as BTC or ETH.");
  if (!quantityRaw || !Number.isFinite(quantity) || quantity <= 0 || quantity > 1_000_000_000_000) {
    fail("Quantity must be a positive number.");
  }

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("portfolio_holdings")
    .upsert(
      { user_id: user.id, asset_id: assetId, quantity, updated_at: new Date().toISOString() },
      { onConflict: "user_id,asset_id" },
    );

  if (error) fail("Could not save this holding. Please try again.");
  done(`${assetId} holding saved.`);
}

export async function removePortfolioHolding(formData: FormData) {
  const assetId = normalizeAsset(formData.get("asset_id"));
  if (!assetId) fail("Invalid asset symbol.");
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("portfolio_holdings")
    .delete()
    .eq("user_id", user.id)
    .eq("asset_id", assetId);
  if (error) fail("Could not remove this holding. Please try again.");
  done(`${assetId} holding removed.`);
}
