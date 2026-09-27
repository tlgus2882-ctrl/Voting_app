import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "operator_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", requireEnv("OPERATOR_SESSION_SECRET"))
    .update(payload)
    .digest("base64url");
}

/** Constant-time string comparison that doesn't leak length either. */
function safeEqual(a: string, b: string): boolean {
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export function isCorrectOperatorPassword(password: string): boolean {
  return safeEqual(password, requireEnv("OPERATOR_PASSWORD"));
}

/** Starts a 7-day Operator session. Server Actions only. */
export async function startOperatorSession(): Promise<void> {
  const expiresAt = String(Date.now() + SESSION_SECONDS * 1000);
  (await cookies()).set(SESSION_COOKIE, `${expiresAt}.${sign(expiresAt)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_SECONDS,
    path: "/",
  });
}

/** Ends the Operator session. Server Actions only. */
export async function endOperatorSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Whether this request carries a valid, unexpired Operator session. */
export async function isOperator(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;
  if (!safeEqual(signature, sign(expiresAt))) return false;
  return Number(expiresAt) > Date.now();
}
