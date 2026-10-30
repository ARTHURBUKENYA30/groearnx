import Link from "next/link";
import { signupAction } from "@/app/auth/actions";
import { ShieldCheck, UserRound, Mail, LockKeyhole, ArrowLeft, ArrowRight } from "lucide-react";

export default async function Signup({ searchParams }: { searchParams: Promise<{ error?: string; ref?: string }> }) {
  const params = await searchParams;
  const referral = (params.ref ?? "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
  return <main className="trx-auth">
    <div className="trx-auth-glow"/>
    <section className="trx-auth-wrap">
      <Link href="/" className="trx-brand trx-auth-brand"><span className="trx-mark">G</span><span>GROEARN<span className="trx-gold">X</span></span></Link>
      <div className="trx-auth-card">
        <h1>Create account</h1><p className="trx-auth-sub">Start building your trading workspace.</p>
        {params.error && <p className="trx-auth-error" role="alert">{params.error}</p>}
        <form action={signupAction} className="trx-auth-form">
          <label htmlFor="name">FULL NAME</label><div className="trx-input-wrap"><UserRound/><input id="name" name="name" autoComplete="name" placeholder="Your full name"/></div>
          <label htmlFor="email">EMAIL</label><div className="trx-input-wrap"><Mail/><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@email.com"/></div>
          <label htmlFor="password">PASSWORD</label><div className="trx-input-wrap"><LockKeyhole/><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required placeholder="Create a strong password"/></div>
          <div className="trx-password-rules"><b>Password requirements:</b><span>At least 8 characters</span><span>Use a mix of letters, numbers and symbols</span></div>
          <label htmlFor="referral">REFERRAL CODE (OPTIONAL)</label><div className="trx-input-wrap"><ShieldCheck/><input id="referral" name="referral" defaultValue={referral} placeholder="Enter referral code"/></div>
          <button className="trx-button trx-submit" type="submit">Create account <ArrowRight size={16}/></button>
        </form>
        <p className="trx-auth-switch">Already a trader? <Link href="/login">Sign in</Link></p>
      </div>
      <p className="trx-auth-foot"><ShieldCheck size={14}/> Secure account access · Exchange API keys are managed separately</p>
      <Link href="/" className="trx-auth-back"><ArrowLeft size={14}/> Back to GROEANRX</Link>
    </section>
  </main>;
}