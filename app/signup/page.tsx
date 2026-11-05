import Link from "next/link";
import { signupAction } from "@/app/auth/actions";
import { ShieldCheck, UserRound, Mail, LockKeyhole, ArrowLeft, ArrowRight } from "lucide-react";

export default async function Signup({ searchParams }: { searchParams: Promise<{ error?: string; ref?: string }> }) {
  const params = await searchParams;
  const referral = (params.ref ?? "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
  return <main className="trx-auth">
    <div className="trx-auth-glow"/>
    <section className="trx-auth-wrap">
      <Link href="/" className="trx-brand trx-auth-brand"><span className="trx-auth-logo-mark" aria-hidden="true">G</span><span>GROEARNX</span></Link>
      <div className="trx-auth-card">
        <h1>Create account</h1>
        <p className="trx-auth-sub">Start automating your trades in 60 seconds</p>
        {params.error && <p className="trx-auth-error" role="alert">{params.error}</p>}
        <form action={signupAction} className="trx-auth-form">
          <label htmlFor="name">Full name</label>
          <div className="trx-input-wrap"><UserRound/><input id="name" name="name" autoComplete="name" placeholder="John Trader"/></div>
          <label htmlFor="email">Email</label>
          <div className="trx-input-wrap"><Mail/><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@email.com"/></div>
          <label htmlFor="password">Password</label>
          <div className="trx-input-wrap"><LockKeyhole/><input id="password" name="password" type="password" autoComplete="new-password" minLength={10} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{10,}" required placeholder="••••••••"/></div>
          <div className="trx-password-rules"><b>Password requirements:</b><span>At least 10 characters</span><span>Lowercase letters (a-z)</span><span>Uppercase letters (A-Z)</span><span>At least one symbol (!@#$%^&amp;* etc.)</span></div>
          <label htmlFor="referral">Referral code (optional)</label>
          <div className="trx-input-wrap"><ShieldCheck/><input id="referral" name="referral" defaultValue={referral} placeholder="e.g. AB12CD34"/></div>
          <button className="trx-button trx-submit" type="submit">Create Account <ArrowRight size={16}/></button>
        </form>
        <p className="trx-auth-switch">Already a trader? <Link href="/login">Sign in</Link></p>
      </div>
      <p className="trx-auth-foot"><ShieldCheck size={14}/> Encrypted at rest · No withdrawal access · Audit trail</p>
      <Link href="/" className="trx-auth-back"><ArrowLeft size={14}/> Back to GROEARNX</Link>
    </section>
  </main>;
}
