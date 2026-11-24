import "server-only";
import type { AdminApi, LoginResult, Overview } from "./types";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

async function call<R>(path: string, init: RequestInit & { token?: string } = {}): Promise<R> {
  const { token, headers, ...rest } = init;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
  });
  if (!res.ok) throw Object.assign(new Error(`API ${res.status} on ${path}`), { status: res.status });
  return (await res.json()) as R;
}

export const realApi: AdminApi = {
  async login(email, password) {
    try {
      const r = await call<LoginResult>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      return r.user.role === "admin" ? r : "forbidden";
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status === 401 || status === 400 || status === 422) return "invalid";
      if (status === 403) return "forbidden";
      throw e;
    }
  },
  getOverview: (token) => call<Overview>("/admin/stats/overview", { token }),
};
