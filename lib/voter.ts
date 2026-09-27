import { cookies } from "next/headers";

const VOTER_COOKIE = "voter_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** The current browser's Voter ID, or null if it has never voted. */
export async function readVoterId(): Promise<string | null> {
  return (await cookies()).get(VOTER_COOKIE)?.value ?? null;
}

/**
 * The current browser's Voter ID, issuing one if needed.
 * Only callable from a Server Action, since it may set a cookie.
 */
export async function ensureVoterId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VOTER_COOKIE)?.value;
  if (existing) return existing;
  const id = crypto.randomUUID();
  store.set(VOTER_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
  });
  return id;
}
