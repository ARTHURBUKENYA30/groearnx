import "server-only";
import { createHmac, createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const BASE = "https://testnet.binance.vision";
function encryptionKey() {
  const value = process.env.GROEARNX_ENCRYPTION_KEY;
  if (!value || !/^[a-fA-F0-9]{64}$/.test(value)) throw new Error("GROEARNX_ENCRYPTION_KEY must be a 32-byte hex value.");
  return Buffer.from(value, "hex");
}
export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv.toString("hex"), cipher.getAuthTag().toString("hex"), encrypted.toString("hex")].join(":");
}
export function decryptSecret(value: string) {
  const [ivHex, tagHex, dataHex] = value.split(":");
  if (!ivHex || !tagHex || !dataHex) throw new Error("Stored exchange credential is invalid.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
}
export function adminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Server database credentials are not configured.");
  return createSupabaseClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
export async function binanceSigned<T>(apiKey: string, apiSecret: string, path: string, params: Record<string,string> = {}, method: "GET" | "POST" | "DELETE" = "GET"): Promise<T> {
  const query = new URLSearchParams({ ...params, recvWindow: "5000", timestamp: String(Date.now()) }).toString();
  const signature = createHmac("sha256", apiSecret).update(query).digest("hex");
  const response = await fetch(`${BASE}${path}?${query}&signature=${signature}`, {
    method, cache: "no-store", headers: { "X-MBX-APIKEY": apiKey, Accept: "application/json" }, signal: AbortSignal.timeout(10000),
  });
  const data: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data && typeof data === "object" && "msg" in data ? String((data as {msg:unknown}).msg) : "Binance request failed.";
    throw new Error(message.slice(0, 180));
  }
  return data as T;
}
export async function verifyBinance(apiKey: string, apiSecret: string) {
  const account = await binanceSigned<{ canTrade?: boolean; canWithdraw?: boolean }> (apiKey, apiSecret, "/api/v3/account");
  if (account.canTrade !== true) throw new Error("This API key does not have spot trading permission enabled.");
  if (account.canWithdraw === true) throw new Error("For safety, disable withdrawals on this API key before connecting.");
  return { canTrade: account.canTrade, canWithdraw: account.canWithdraw };
}
