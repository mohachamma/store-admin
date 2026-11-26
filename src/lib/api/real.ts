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
  getOverview: (token, locale) => call<Overview>(`/admin/stats/overview?locale=${locale}`, { token }),

  listOrders: (token, f, locale) => {
    const q = new URLSearchParams({ locale });
    if (f.status) q.set("status", f.status);
    if (f.q) q.set("q", f.q);
    if (f.limit) q.set("limit", String(f.limit));
    if (f.offset) q.set("offset", String(f.offset));
    return call(`/admin/orders?${q}`, { token });
  },
  getOrder: (token, id, locale) => call(`/admin/orders/${id}?locale=${locale}`, { token }),
  confirmOrder: (token, id, input, locale) => call(`/admin/orders/${id}/confirm?locale=${locale}`, { token, method: "POST", body: JSON.stringify(input) }),
  setOrderStatus: (token, id, status, locale) => call(`/admin/orders/${id}/status?locale=${locale}`, { token, method: "POST", body: JSON.stringify({ status }) }),
  getEvents: (token) => call("/admin/events", { token }),
  markEventsRead: async (token) => void (await call("/admin/events/read", { token, method: "POST" })),

  listBrands: (token) => call("/admin/brands", { token }),
  saveBrand: (token, b) =>
    b.id ? call(`/admin/brands/${b.id}`, { token, method: "PUT", body: JSON.stringify(b) }) : call("/admin/brands", { token, method: "POST", body: JSON.stringify(b) }),
  deleteBrand: async (token, id) => void (await call(`/admin/brands/${id}`, { token, method: "DELETE" })),
  moveBrand: async (token, id, direction) => void (await call(`/admin/brands/${id}/move`, { token, method: "POST", body: JSON.stringify({ direction }) })),
  getBrandsStrip: (token) => call("/admin/brands-strip", { token }),
  saveBrandsStrip: async (token, s) => void (await call("/admin/brands-strip", { token, method: "PUT", body: JSON.stringify(s) })),

  listOffers: (token) => call("/admin/offers", { token }),
  saveOffer: (token, o) =>
    o.id ? call(`/admin/offers/${o.id}`, { token, method: "PUT", body: JSON.stringify(o) }) : call("/admin/offers", { token, method: "POST", body: JSON.stringify(o) }),
  deleteOffer: async (token, id) => void (await call(`/admin/offers/${id}`, { token, method: "DELETE" })),

  getSalePage: (token) => call("/admin/sale-page", { token }),
  saveSalePage: async (token, s) => void (await call("/admin/sale-page", { token, method: "PUT", body: JSON.stringify(s) })),

  getSiteContent: (token) => call("/admin/site", { token }),
  saveSiteContent: async (token, c) => void (await call("/admin/site", { token, method: "PUT", body: JSON.stringify(c) })),

  async uploadImage(token, file) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE}/admin/uploads`, { method: "POST", body: form, headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) throw new Error(`Upload failed (${res.status})`);
    return ((await res.json()) as { url: string }).url;
  },
};
