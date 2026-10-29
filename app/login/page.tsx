import Link from "next/link";
import { loginAction } from "@/app/auth/actions";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; next?: string }> }) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/dashboard";
  return <main className="auth">
    <Link className="back" href="/"><ArrowLeft size={16}/> Back to GROEARNX</Link>
    <section className="auth-card">
      <Link href="/" className="brand"><span className="mark">G</span> GROEARN<span className="lime">X</span></Link>
      <div className="eyebrow">WELCOME BACK</div>
      <h1>Log in to your account</h1>
      <p className="muted">Your market dashboard is waiting.</p>
      {params.error && <p className="notice error" role="alert">{params.error}</p>}
      {params.message && <p className="notice" role="status">{params.message}</p>}
      <form action={loginAction}>
        <input type="hidden" name="next" value={next}/>
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com"/>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Your password"/>
        <p className="forgot-link"><Link href="/forgot-password">Forgot your password?</Link></p>
        <button className="button submit" type="submit">Log in →</button>
      </form>
      <p className="switch">New here? <Link href="/signup">Create an account</Link></p>
      <div className="secure"><ShieldCheck size={16}/> Server-side session protection</div>
    </section>
  </main>;
}
