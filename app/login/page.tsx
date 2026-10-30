import Link from "next/link";
import { loginAction } from "@/app/auth/actions";
import { ShieldCheck, LockKeyhole, Mail, ArrowRight } from "lucide-react";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; next?: string }> }) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/dashboard";
  return <main className="trx-auth">
    <div className="trx-auth-glow"/>
    <section className="trx-auth-wrap">
      <Link href="/" className="trx-brand trx-auth-brand"><span className="trx-mark">G</span><span>GROEARN<span className="trx-gold">X</span></span></Link>
      <div className="trx-auth-card">
        <h1>Welcome back</h1><p className="trx-auth-sub">Sign in to your GROEARNX workspace.</p>
        {params.error && <p className="trx-auth-error" role="alert">{params.error}</p>}
        {params.message && <p className="trx-auth-notice" role="status">{params.message}</p>}
        <form action={loginAction} className="trx-auth-form">
          <input type="hidden" name="next" value={next}/>
          <label htmlFor="email">EMAIL</label><div className="trx-input-wrap"><Mail/><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@email.com"/></div>
          <label htmlFor="password">PASSWORD</label><div className="trx-input-wrap"><LockKeyhole/><input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Your password"/></div>
          <button className="trx-button trx-submit" type="submit">Sign in <ArrowRight size={16}/></button>
        </form>
        <p className="trx-auth-switch">New to GROEARNX? <Link href="/signup">Create an account</Link></p>
      </div>
      <p className="trx-auth-foot"><ShieldCheck size={14}/> Secure account access · Exchange API keys are managed separately</p>
      <Link href="/" className="trx-auth-back">Back to GROEARNX</Link>
    </section>
  </main>;
}