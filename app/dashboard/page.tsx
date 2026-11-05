import { createClient } from "@/lib/supabase/server";
import ReferenceWorkspace from "@/app/components/reference-workspace";

type Tab = "home" | "trade" | "bots" | "manual" | "market" | "profile";
const tabs: Tab[] = ["home", "trade", "bots", "manual", "market", "profile"];

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  let userName = "Guest";
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) userName = String(user.user_metadata?.full_name || user.email?.split("@")[0] || "Trader");
  } catch {
    // The public workspace preview stays visible if auth configuration is unavailable.
  }
  const requested = params.tab ?? "home";
  const activeTab: Tab = tabs.includes(requested as Tab) ? requested as Tab : "home";
  return <ReferenceWorkspace activeTab={activeTab} userName={userName} />;
}
