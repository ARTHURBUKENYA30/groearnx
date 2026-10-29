import Link from "next/link";
import { redirect } from "next/navigation";
import { updatePasswordAction } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default async function ResetPassword({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/forgot-password?error=Open%20the%20latest%20reset%20email%20or%20request%20a%20new%20link");

  return <main className="auth">
    <Link className="back" href="/login"><ArrowLeft size={16}/> Back to login</Link>
    <section className="auth-card">
      <Link href="/" className="brand"><span className="mark">G</span> GROEARN<span className="lime">X</span></Link>
      <div className="eyebrow">SECURE YOUR ACCOUNT</div>
      <h1>Choose a new password</h1>
      <p className="muted">Use at least 10 characters. Don’t reuse a password from another site.</p>
      {params.error && <p className="notice error" role="alert">{params.error}</p>}
      <form action={updatePasswordAction}>
        <label htmlFor="password">New password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required placeholder="At least 10 characters" />
        <label htmlFor="confirmPassword">Confirm new password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={10} required placeholder="Enter it again" />
        <button className="button submit" type="submit">Update password →</button>
      </form>
      <div className="secure"><ShieldCheck size={16}/> Your password is handled by Supabase Auth</div>
    </section>
  </main>;
}
