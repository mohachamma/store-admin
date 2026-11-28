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
  if (!res.ok) {
    // Keep the API's own error code/message so the dashboard can explain what was refused.
    const body = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string; details?: unknown } } | null;
    throw Object.assign(new Error(body?.error?.message ?? `API ${res.status} on ${path}`), { status: res.status, code: body?.error?.code, details: body?.error?.details });
  }
  return (await res.json()) as R;
}

const rangeQuery = (r: { from?: string; to?: string }, locale?: string) => {
  const q = new URLSearchParams();
  if (locale) q.set("locale", locale);
  if (r.from) q.set("from", r.from);
  if (r.to) q.set("to", r.to);
  const s = q.toString();
  return s ? `?${s}` : "";
};

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

  listProducts: (token, f, locale) => {
    const q = new URLSearchParams({ locale });
    if (f.q) q.set("q", f.q);
    if (f.status) q.set("status", f.status);
    if (f.categoryId) q.set("categoryId", f.categoryId);
    if (f.limit) q.set("limit", String(f.limit));
    if (f.offset) q.set("offset", String(f.offset));
    return call(`/admin/products?${q}`, { token });
  },
  getProduct: (token, id) => call(`/admin/products/${id}`, { token }),
  saveProduct: (token, id, input) => call(id ? `/admin/products/${id}` : "/admin/products", { token, method: id ? "PUT" : "POST", body: JSON.stringify(input) }),
  deleteProduct: async (token, id) => void (await call(`/admin/products/${id}`, { token, method: "DELETE" })),
  publishProducts: async (token, ids, isPublished) => (await call<{ updated: number }>("/admin/products/publish", { token, method: "POST", body: JSON.stringify({ ids, isPublished }) })).updated,
  setAudience: async (token, ids, audience) => (await call<{ updated: number }>("/admin/products/audience", { token, method: "POST", body: JSON.stringify({ ids, audience }) })).updated,
  getMenPage: (token) => call("/admin/men-page", { token }),
  saveMenPage: async (token, input) => void (await call("/admin/men-page", { token, method: "PUT", body: JSON.stringify(input) })),
  getWomenPage: (token) => call("/admin/women-page", { token }),
  saveWomenPage: async (token, input) => void (await call("/admin/women-page", { token, method: "PUT", body: JSON.stringify(input) })),
  listCategories: (token) => call("/admin/categories", { token }),
  saveCategory: (token, id, input) => call(id ? `/admin/categories/${id}` : "/admin/categories", { token, method: id ? "PUT" : "POST", body: JSON.stringify(input) }),
  deleteCategory: async (token, id) => void (await call(`/admin/categories/${id}`, { token, method: "DELETE" })),
  moveCategory: async (token, id, direction) => void (await call(`/admin/categories/${id}/move`, { token, method: "POST", body: JSON.stringify({ direction }) })),
  listCollections: (token) => call("/admin/collections", { token }),
  saveCollection: (token, id, input) => call(id ? `/admin/collections/${id}` : "/admin/collections", { token, method: id ? "PUT" : "POST", body: JSON.stringify(input) }),
  deleteCollection: async (token, id) => void (await call(`/admin/collections/${id}`, { token, method: "DELETE" })),
  moveCollection: async (token, id, direction) => void (await call(`/admin/collections/${id}/move`, { token, method: "POST", body: JSON.stringify({ direction }) })),
  listVariants: (token, f, locale) => {
    const q = new URLSearchParams({ locale });
    if (f.q) q.set("q", f.q);
    if (f.lowStock) q.set("lowStock", "true");
    if (f.limit) q.set("limit", String(f.limit));
    if (f.offset) q.set("offset", String(f.offset));
    return call(`/admin/variants?${q}`, { token });
  },
  bulkUpdateVariants: async (token, updates) => (await call<{ updated: number }>("/admin/variants/bulk", { token, method: "POST", body: JSON.stringify({ updates }) })).updated,

  getShipping: (token) => call("/admin/shipping", { token }),
  updateWilayas: async (token, updates) => (await call<{ updated: number }>("/admin/shipping/wilayas", { token, method: "PUT", body: JSON.stringify({ updates }) })).updated,
  getDelivery: (token) => call("/admin/delivery", { token }),
  setDelivery: (token, provider) => call("/admin/delivery", { token, method: "PUT", body: JSON.stringify({ provider }) }),
  refreshTracking: async (token, id) => (await call<{ deliveryStatus: string }>(`/admin/orders/${id}/refresh-tracking`, { token, method: "POST" })).deliveryStatus,
  setFreeShipping: async (token, over) => void (await call("/admin/shipping/rules", { token, method: "PUT", body: JSON.stringify({ freeShippingOver: over }) })),
  getProfit: (token, r, locale) => call(`/admin/profit${rangeQuery(r, locale)}`, { token }),
  listExpenses: (token, r) => call(`/admin/expenses${rangeQuery(r)}`, { token }),
  saveExpense: (token, id, input) => call(id ? `/admin/expenses/${id}` : "/admin/expenses", { token, method: id ? "PUT" : "POST", body: JSON.stringify(input) }),
  deleteExpense: async (token, id) => void (await call(`/admin/expenses/${id}`, { token, method: "DELETE" })),
  getProfitSettings: (token) => call("/admin/profit-settings", { token }),
  saveProfitSettings: async (token, input) => void (await call("/admin/profit-settings", { token, method: "PUT", body: JSON.stringify(input) })),
  listDiscountCodes: (token) => call("/admin/discount-codes", { token }),
  saveDiscountCode: (token, id, input) => call(id ? `/admin/discount-codes/${id}` : "/admin/discount-codes", { token, method: id ? "PUT" : "POST", body: JSON.stringify(input) }),
  deleteDiscountCode: async (token, id) => void (await call(`/admin/discount-codes/${id}`, { token, method: "DELETE" })),
  listPages: (token) => call("/admin/pages", { token }),
  savePage: (token, slug, input) => call(`/admin/pages/${slug}`, { token, method: "PUT", body: JSON.stringify(input) }),
  getStoreInfo: (token) => call("/admin/store-info", { token }),
  saveStoreInfo: async (token, input) => void (await call("/admin/store-info", { token, method: "PUT", body: JSON.stringify(input) })),
  getWhyUs: (token) => call("/admin/why-us", { token }),
  saveWhyUs: async (token, input) => void (await call("/admin/why-us", { token, method: "PUT", body: JSON.stringify(input) })),
  listHomeCards: (token) => call("/admin/home-cards", { token }),
  saveHomeCard: (token, id, input) => call(id ? `/admin/home-cards/${id}` : "/admin/home-cards", { token, method: id ? "PUT" : "POST", body: JSON.stringify(input) }),
  deleteHomeCard: async (token, id) => void (await call(`/admin/home-cards/${id}`, { token, method: "DELETE" })),
  moveHomeCard: async (token, id, direction) => void (await call(`/admin/home-cards/${id}/move`, { token, method: "POST", body: JSON.stringify({ direction }) })),
  getNewsletter: (token) => call("/admin/newsletter", { token }),
  saveNewsletter: async (token, input) => void (await call("/admin/newsletter", { token, method: "PUT", body: JSON.stringify(input) })),
  listSubscribers: (token) => call("/admin/newsletter/subscribers", { token }),
  deleteSubscriber: async (token, id) => void (await call(`/admin/newsletter/subscribers/${id}`, { token, method: "DELETE" })),
  listSlides: (token) => call("/admin/slides", { token }),
  saveSlide: (token, id, input) => call(id ? `/admin/slides/${id}` : "/admin/slides", { token, method: id ? "PUT" : "POST", body: JSON.stringify(input) }),
  deleteSlide: async (token, id) => void (await call(`/admin/slides/${id}`, { token, method: "DELETE" })),
  moveSlide: async (token, id, direction) => void (await call(`/admin/slides/${id}/move`, { token, method: "POST", body: JSON.stringify({ direction }) })),

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
