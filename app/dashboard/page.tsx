import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReferenceWorkspace from "@/app/components/reference-workspace";

type Tab = "home" | "trade" | "bots" | "manual" | "market" | "profile";
const tabs: Tab[] = ["home", "trade", "bots", "manual", "market", "profile"];

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const requested = params.tab ?? "home";
  const activeTab: Tab = tabs.includes(requested as Tab) ? requested as Tab : "home";
  const userName = String(user.user_metadata?.full_name || user.email?.split("@")[0] || "Trader");
  return <ReferenceWorkspace activeTab={activeTab} userName={userName} />;
}
