import { cookies } from "next/headers";
import { COOKIE_NAME, parseCookie } from "./auth-cookie";
import { getDb } from "./db";

export type { Role } from "./auth-cookie";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "beneficiary" | "specialist" | "supervisor";
  category: string | null;
};

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const payload = parseCookie(raw);
  if (!payload) return null;

  const db = getDb();
  const user = db
    .prepare("SELECT id, name, email, role, category FROM users WHERE id = ?")
    .get(payload.id) as SessionUser | undefined;

  return user ?? null;
}
