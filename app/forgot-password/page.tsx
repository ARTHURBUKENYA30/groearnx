import Link from "next/link";
import { requestPasswordResetAction } from "@/app/auth/actions";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default async function ForgotPassword({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  return <main className="auth">
    <Link className="back" href="/login"><ArrowLeft size={16}/> Back to login</Link>
    <section className="auth-card">
      <Link href="/" className="brand"><span className="mark">G</span> GROEARN<span className="lime">X</span></Link>
      <div className="eyebrow">ACCOUNT RECOVERY</div>
      <h1>Reset your password</h1>
      <p className="muted">Enter the email used for your account. If it exists, we’ll send a secure reset link.</p>
      {params.error && <p className="notice error" role="alert">{params.error}</p>}
      {params.message && <p className="notice" role="status">{params.message}</p>}
      <form action={requestPasswordResetAction}>
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        <button className="button submit" type="submit">Send reset link →</button>
      </form>
      <p className="switch"><Link href="/login">Return to login</Link></p>
      <div className="secure"><ShieldCheck size={16}/> Account existence is not disclosed</div>
    </section>
  </main>;
}
