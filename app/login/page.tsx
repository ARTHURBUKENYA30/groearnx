"use client";

import Link from "next/link";
import { useState } from "react";
import { loginAction } from "@/app/auth/actions";
import { ShieldCheck, LockKeyhole, Mail, Eye, EyeOff } from "lucide-react";

export default function Login({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; next?: string }> }) {
  const [visible, setVisible] = useState(false);
  const [params, setParams] = useState<{error?:string;message?:string;next?:string}>({});
  // searchParams are supplied by Next.js; resolve them through the server page wrapper.
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/dashboard";
  return <main className="trx-auth trx-login-exact">
    <section className="trx-auth-wrap">
      <Link href="/" className="trx-brand trx-auth-brand"><img src="https://trxcryptobot.com/images/favicon.png" alt="" /><span>GROEANRX</span></Link>
      <div className="trx-auth-card">
        <h1>Welcome back</h1><p className="trx-auth-sub">Sign in to your trading dashboard</p>
        {params.error && <p className="trx-auth-error" role="alert">{params.error}</p>}
        {params.message && <p className="trx-auth-notice" role="status">{params.message}</p>}
        <form action={loginAction} className="trx-auth-form">
          <input type="hidden" name="next" value={next}/>
          <label htmlFor="email">EMAIL</label><div className="trx-input-wrap"><Mail/><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@email.com"/></div>
          <label htmlFor="password">PASSWORD</label><div className="trx-input-wrap"><LockKeyhole/><input id="password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" required placeholder="••••••••"/><button className="trx-password-toggle" type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={()=>setVisible(!visible)}>{visible ? <EyeOff/> : <Eye/>}</button></div>
          <button className="trx-button trx-submit" type="submit">Sign In</button>
        </form>
        <p className="trx-auth-switch">New to GROEANRX? <Link href="/signup">Create account</Link></p>
      </div>
      <p className="trx-auth-foot"><ShieldCheck size={14}/> Encrypted at rest · No withdrawal access · Audit trail</p>
    </section>
  </main>;
}