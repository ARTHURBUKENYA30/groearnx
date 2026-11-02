"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function siteUrl() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "https://groearnx.vercel.app";
  const withProtocol = configured.startsWith("http") ? configured : `https://${configured}`;
  return withProtocol.replace(/\/$/, "");
}

function authError(error: { code?: string; status?: number }, context: "login" | "signup") {
  if (error.code === "email_address_not_authorized") {
    return "Supabase is currently configured with its test email service, which only sends to project-team addresses. Public registration needs a verified custom SMTP sender. Please do not keep retrying; the owner must finish email setup.";
  }
  if (error.code === "email_not_confirmed") {
    return "Please confirm your email using the link we sent before signing in. If the link expired, create a fresh confirmation email.";
  }
  if (error.code === "over_email_send_rate_limit" || error.status === 429) {
    return "Email confirmation is temporarily rate-limited. Wait for the mailer rate-limit window to reset (up to an hour). The site owner must configure a dedicated SMTP provider for reliable public registration.";
  }
  if (context === "login" && error.code === "invalid_credentials") {
    return "The email or password is incorrect. If you just registered, confirm your email first.";
  }
  if (context === "signup" && error.code === "user_already_exists") {
    return "An account already exists for this email. Sign in or use Forgot password.";
  }
  return context === "login"
    ? "Sign-in could not be completed. Please try again."
    : "Account creation could not be completed. Please check your details and try again.";
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");
  if (!email || !password) redirect("/login?error=Enter%20email%20and%20password");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(authError(error, "login"))}`);
  redirect(safeNext(next));
}

export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim().slice(0, 100);
  const referral = String(formData.get("referral") ?? "").trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 10) {
    redirect("/signup?error=Enter%20a%20valid%20email%20and%20a%20password%20of%20at%20least%208%20characters");
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, referral_code: referral || null },
      emailRedirectTo: `${siteUrl()}/auth/callback?next=/dashboard`,
    },
  });
  if (error) redirect(`/signup?error=${encodeURIComponent(authError(error, "signup"))}`);
  if (data.session) redirect("/dashboard");
  redirect("/login?message=Account%20created.%20Check%20your%20email%20to%20confirm%20your%20account");
}

export async function resendConfirmationAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) redirect("/login?error=Enter%20a%20valid%20email%20address");
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback?next=/dashboard` },
  });
  if (error) {
    const message = error.code === "email_address_not_authorized"
      ? "This project can only email team addresses until custom SMTP is configured. Please contact the site owner."
      : error.code === "over_email_send_rate_limit"
      ? "Email sending is temporarily rate-limited. Wait for the mailer rate-limit window to reset (up to an hour), then try again."
      : "We could not resend the confirmation email. Check the address and try again later.";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }
  redirect("/login?message=If%20an%20unconfirmed%20account%20exists%2C%20a%20fresh%20confirmation%20email%20has%20been%20sent");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) redirect("/forgot-password?error=Enter%20a%20valid%20email%20address");
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
  });
  if (error) {
    const message = error.code === "email_address_not_authorized"
      ? "This project can only email team addresses until custom SMTP is configured. Please contact the site owner."
      : error.code === "over_email_send_rate_limit"
      ? "Email sending is temporarily rate-limited. Wait at least 60 seconds and try again."
      : "We could not send the reset email right now. Please try again later.";
    redirect(`/forgot-password?error=${encodeURIComponent(message)}`);
  }
  redirect("/forgot-password?message=If%20an%20account%20exists%20for%20that%20email%2C%20a%20reset%20link%20has%20been%20sent");
}

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (password.length < 10) redirect("/reset-password?error=Use%20at%20least%2010%20characters");
  if (password !== confirmPassword) redirect("/reset-password?error=Passwords%20do%20not%20match");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/forgot-password?error=Your%20reset%20session%20expired.%20Request%20a%20new%20link");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/reset-password?error=Could%20not%20update%20password.%20Request%20a%20new%20link");
  await supabase.auth.signOut();
  redirect("/login?message=Password%20updated.%20Please%20sign%20in%20with%20your%20new%20password");
}