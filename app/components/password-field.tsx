"use client";
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
export default function PasswordField() {
  const [visible,setVisible]=useState(false);
  return <div className="trx-input-wrap"><LockKeyhole/><input id="password" name="password" type={visible?"text":"password"} autoComplete="current-password" required placeholder="••••••••"/><button className="trx-password-toggle" type="button" aria-label={visible?"Hide password":"Show password"} onClick={()=>setVisible(!visible)}>{visible?<EyeOff/>:<Eye/>}</button></div>;
}