"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) redirect("/login?error=Enter%20email%20and%20password");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=Sign-in%20failed.%20Check%20your%20details");
  redirect(safeNext(next));
}

export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim().slice(0, 100);

  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    redirect("/signup?error=Enter%20a%20valid%20email%20and%20a%20password%20of%20at%20least%208%20characters");
  }

  const supabase = await createClient();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
    },
  });

  if (error) redirect("/signup?error=Account%20creation%20failed.%20Check%20your%20details%20or%20try%20again");
  if (data.session) redirect("/dashboard");
  redirect("/login?message=Account%20created.%20Check%20your%20email%20to%20confirm%20your%20account");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    redirect("/forgot-password?error=Enter%20a%20valid%20email%20address");
  }

  const supabase = await createClient();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  // Keep the response identical whether or not the account exists.
  redirect("/forgot-password?message=If%20an%20account%20exists%20for%20that%20email%2C%20a%20reset%20link%20has%20been%20sent");
}

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 10) {
    redirect("/reset-password?error=Use%20at%20least%2010%20characters");
  }
  if (password !== confirmPassword) {
    redirect("/reset-password?error=Passwords%20do%20not%20match");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/forgot-password?error=Your%20reset%20session%20expired.%20Request%20a%20new%20link");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/reset-password?error=Could%20not%20update%20password.%20Request%20a%20new%20link");
  await supabase.auth.signOut();
  redirect("/login?message=Password%20updated.%20Please%20sign%20in%20with%20your%20new%20password");
}
