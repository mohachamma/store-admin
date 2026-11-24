import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/** httpOnly cookie holding the API access token. Never readable from JavaScript; never in localStorage. */
export const SESSION_COOKIE = "admin_session";

export async function setSession(token: string, maxAgeSeconds: number) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

/** Use in every protected layout/page: the proxy check is only optimistic. */
export async function requireSession(): Promise<string> {
  const token = await getSessionToken();
  if (!token) redirect("/login");
  return token;
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Only allow same-site relative redirects after login. */
export function safeNext(next: unknown): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") ? next : "/";
}
