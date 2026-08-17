// Edge-safe — no Node.js dependencies, used by middleware too

export const COOKIE_NAME = process.env.SANAD_COOKIE_NAME || "sanad_session";

export type Role = "beneficiary" | "specialist" | "supervisor";

export type CookiePayload = {
  id: number;
  role: Role;
};

export function parseCookie(value: string): CookiePayload | null {
  try {
    const payload = JSON.parse(value) as CookiePayload;
    if (typeof payload.id !== "number" || !payload.role) return null;
    return payload;
  } catch {
    return null;
  }
}

export function buildCookieValue(id: number, role: Role): string {
  return JSON.stringify({ id, role });
}

export const ROLE_HOME: Record<Role, string> = {
  beneficiary: "/beneficiary",
  specialist: "/specialist",
  supervisor: "/supervisor",
};
