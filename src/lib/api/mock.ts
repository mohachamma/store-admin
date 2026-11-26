import type { AdminApi, AdminBrand, AdminOffer, AdminOrderDetail, AdminOrderRow, BrandsStripSettings, OrderStatus, Overview, SalePageSettings, SiteContent } from "./types";

/** Demo credentials for mock mode only (never valid against the real API). */
export const MOCK_CREDENTIALS = { email: "admin@store.test", password: "admin1234" } as const;

const overview: Overview = {
  newOrdersToday: 14,
  revenue: { today: 96_400, week: 612_300, month: 2_418_900 },
  revenueLast7Days: [71_200, 88_500, 64_900, 102_300, 95_100, 93_900, 96_400],
  ordersByStatus: { pending: 9, confirmed: 17, shipped: 23, delivered: 141, cancelled: 6, returned: 2 },
  topProducts: [
    { id: "p1", name: "Nylon Full Zip Hoodie", image: "/placeholders/hoodie-stone.svg", unitsSold: 48, revenue: 379_200 },
    { id: "p2", name: "Red Skate Mid Sneaker", image: "/placeholders/sneaker-red.svg", unitsSold: 31, revenue: 303_800 },
    { id: "p3", name: "Slim Denim Jean", image: "/placeholders/jeans-light.svg", unitsSold: 29, revenue: 156_600 },
    { id: "p4", name: "Hooded Deck Coat", image: "/placeholders/coat-sand.svg", unitsSold: 12, revenue: 154_800 },
  ],
  lowStock: [
    { variantId: "v1", productName: "Essential Hoodie Black", size: "XS", stock: 0, image: "/placeholders/hoodie-black.svg" },
    { variantId: "v2", productName: "Chelsea Boot", size: "40", stock: 1, image: "/placeholders/boot-cream.svg" },
    { variantId: "v3", productName: "Red Skate Mid Sneaker", size: "42", stock: 2, image: "/placeholders/sneaker-red.svg" },
  ],
};

// In-memory state so the dashboard is fully usable in mock mode (resets when the server restarts).
interface MockDb {
  brands: AdminBrand[];
  strip: BrandsStripSettings;
  offers: AdminOffer[];
  site: SiteContent;
  sale: SalePageSettings;
  orders: MockOrder[];
  readEventIds: Set<string>;
}
/** An order as the dashboard shows it, with the customer's contact details kept only while it is pending (like the real API). */
type MockOrder = AdminOrderRow & {
  subtotal: number; shippingFee: number; discountTotal: number; discountCode: string | null; deliveryCompany: string | null; deliveryStatus: string | null; confirmedAt: string | null;
  items: AdminOrderDetail["items"]; contact: { name: string; phone: string; commune: string; daira: string | null; address: string } | null;
};

const g = globalThis as unknown as { __mockDb?: MockDb };
const db = (): MockDb =>
  (g.__mockDb ??= {
    brands: [
      ["atlas", "ATLAS"], ["nordik", "NORDIK"], ["maison-alba", "Maison Alba"], ["kasbah", "KASBAH"],
      ["oasis", "OASIS"], ["tamda", "tamda"], ["riviera", "RIVIERA"], ["sahari", "SAHARI"],
    ].map(([slug, name]) => ({ id: `b_${slug}`, name: name!, logoUrl: `/placeholders/brands/${slug}.svg`, href: null, isActive: true })),
    strip: { enabled: true, animated: true, speed: 30, pauseOnHover: true, title: { ar: "علاماتنا التجارية", fr: "Nos marques", en: "Our brands" } },
    offers: [
      {
        id: "o_friday",
        label: { ar: "عرض محدود", fr: "Offre limitée", en: "Limited offer" },
        title: { ar: "خصم 35% يوم الجمعة فقط", fr: "-35% ce vendredi seulement", en: "35% off only this Friday" },
        subtitle: { ar: "واحصل على هدية مميزة", fr: "et recevez un cadeau", en: "and get a special gift" },
        ctaLabel: { ar: "اغتنم العرض", fr: "J'en profite", en: "Grab it now" },
        href: "/sale",
        imageUrl: "/placeholders/offer-1.svg",
        theme: "dark",
        showCountdown: true,
        startsAt: null,
        endsAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
        isActive: true,
      },
    ],
    orders: sampleOrders(),
    readEventIds: new Set<string>(),
    sale: {
      enabled: true,
      title: { ar: "التخفيضات", fr: "Promotions", en: "Sale" },
      subtitle: { ar: "أفضل العروض لفترة محدودة", fr: "Les meilleures offres, pour une durée limitée", en: "Our best deals, for a limited time" },
    },
    site: {
      announcement: {
        ar: "توصيل مجاني ابتداءً من 10,000 دج · الدفع عند الاستلام في 58 ولاية",
        fr: "Livraison gratuite dès 10 000 DA · Paiement à la livraison dans 58 wilayas",
        en: "Free delivery from 10,000 DA · Cash on delivery in 58 wilayas",
      },
    },
  });

function sampleOrders(): MockOrder[] {
  const item = (name: string, size: string, unitPrice: number, quantity = 1) => ({ id: `i_${Math.random().toString(36).slice(2, 8)}`, name, size, color: "", unitPrice, quantity, lineTotal: unitPrice * quantity });
  const mk = (n: number, status: OrderStatus, hoursAgo: number, wilayaCode: number, wilaya: string, fee: number, items: ReturnType<typeof item>[], who?: { name: string; phone: string; commune: string; address: string }): MockOrder => {
    const subtotal = items.reduce((t, i) => t + i.lineTotal, 0);
    const pending = status === "pending";
    return {
      id: `o_${n}`, orderNumber: n, status, paymentMethod: "cod", paymentStatus: status === "delivered" ? "paid" : "unpaid", deliveryType: "home", wilayaCode, wilaya,
      total: subtotal + fee, itemCount: items.reduce((t, i) => t + i.quantity, 0), trackingNumber: pending ? null : `YAL-${n * 7}`, createdAt: new Date(Date.now() - hoursAgo * 3600_000).toISOString(),
      customerName: pending && who ? who.name : null, customerPhone: pending && who ? who.phone : null,
      subtotal, shippingFee: fee, discountTotal: 0, discountCode: null, deliveryCompany: pending ? null : "yalidine", deliveryStatus: pending ? null : "created",
      confirmedAt: pending ? null : new Date(Date.now() - (hoursAgo - 1) * 3600_000).toISOString(), items,
      contact: pending && who ? { ...who, daira: null } : null,
    };
  };
  return [
    mk(1007, "pending", 0.5, 16, "الجزائر", 500, [item("Nylon Full Zip Hoodie", "M", 7900)], { name: "كريم بن علي", phone: "0550123456", commune: "عين بنيان", address: "12 شارع ديدوش مراد" }),
    mk(1006, "pending", 3, 31, "وهران", 700, [item("Red Skate Mid Sneaker", "42", 9800), item("Heavy Tee Black", "L", 2400, 2)], { name: "سارة مرابط", phone: "0661987654", commune: "بئر الجير", address: "حي النصر، عمارة 4" }),
    mk(1005, "confirmed", 20, 25, "قسنطينة", 700, [item("Slim Denim Jean", "S", 5400)]),
    mk(1004, "shipped", 30, 16, "الجزائر", 500, [item("Hooded Deck Coat", "L", 12900)]),
    mk(1003, "delivered", 50, 9, "البليدة", 500, [item("Henley Pullover", "M", 4200), item("Heavy Tee Cream", "M", 2400)]),
    mk(1002, "cancelled", 70, 19, "سطيف", 800, [item("Chelsea Boot", "41", 11500)]),
  ];
}

const newId = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

const orderById = (id: string) => {
  const o = db().orders.find((x) => x.id === id);
  if (!o) throw Object.assign(new Error("not found"), { status: 404 });
  return o;
};
const rowOf = (o: MockOrder): AdminOrderRow => ({
  id: o.id, orderNumber: o.orderNumber, status: o.status, paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus, deliveryType: o.deliveryType, wilayaCode: o.wilayaCode,
  wilaya: o.wilaya, total: o.total, itemCount: o.itemCount, trackingNumber: o.trackingNumber, createdAt: o.createdAt, customerName: o.customerName, customerPhone: o.customerPhone,
});
const detailOf = (o: MockOrder): AdminOrderDetail => ({
  ...rowOf(o), subtotal: o.subtotal, shippingFee: o.shippingFee, discountTotal: o.discountTotal, discountCode: o.discountCode, deliveryCompany: o.deliveryCompany,
  deliveryStatus: o.deliveryStatus, confirmedAt: o.confirmedAt, items: o.items,
  customer: o.contact ? { ...o.contact, whatsappUrl: `https://wa.me/213${o.contact.phone.slice(1)}`, telUrl: `tel:${o.contact.phone}` } : null,
});

export const mockApi: AdminApi = {
  async listOrders(_t, f) {
    let rows = db().orders.filter((o) => !f.status || o.status === f.status);
    if (f.q) rows = rows.filter((o) => String(o.orderNumber) === f.q!.replace(/^#/, "") || o.trackingNumber?.toLowerCase().includes(f.q!.toLowerCase()));
    const items = rows.slice(f.offset ?? 0, (f.offset ?? 0) + (f.limit ?? 30)).map(rowOf);
    return { items, total: rows.length };
  },
  async getOrder(_t, id) {
    return detailOf(orderById(id));
  },
  async confirmOrder(_t, id, input) {
    const o = orderById(id);
    if (o.status !== "pending") throw Object.assign(new Error("not pending"), { status: 409 });
    Object.assign(o, { status: "confirmed", deliveryCompany: input.company, trackingNumber: input.trackingNumber, deliveryStatus: "created", confirmedAt: new Date().toISOString(), contact: null, customerName: null, customerPhone: null });
    return detailOf(o);
  },
  async setOrderStatus(_t, id, status) {
    const o = orderById(id);
    const allowed: Record<string, OrderStatus[]> = { shipped: ["confirmed"], delivered: ["shipped"], returned: ["shipped", "delivered"], cancelled: ["pending", "confirmed"] };
    if (!allowed[status]!.includes(o.status)) throw Object.assign(new Error("invalid transition"), { status: 409 });
    o.status = status;
    if (status === "cancelled") Object.assign(o, { contact: null, customerName: null, customerPhone: null });
    if (status === "delivered") o.paymentStatus = "paid";
    if (status === "returned" && o.paymentStatus === "paid") o.paymentStatus = "refunded";
    return detailOf(o);
  },
  async getEvents() {
    const items = [...db().orders]
      .filter((o) => o.status === "pending" || o.status === "confirmed")
      .map((o, i) => ({ id: o.orderNumber, type: "order_created", orderId: o.id, orderNumber: o.orderNumber, total: o.total, createdAt: o.createdAt, read: db().readEventIds.has(o.id) || i > 1 }));
    return { unreadCount: items.filter((e) => !e.read).length, items };
  },
  async markEventsRead() {
    for (const o of db().orders) db().readEventIds.add(o.id);
  },

  async listBrands() {
    return db().brands;
  },
  async saveBrand(_t, input) {
    const brands = db().brands;
    const brand: AdminBrand = { id: input.id ?? newId("b"), name: input.name, logoUrl: input.logoUrl, href: input.href, isActive: input.isActive };
    const i = brands.findIndex((b) => b.id === brand.id);
    if (i >= 0) brands[i] = brand;
    else brands.push(brand);
    return brand;
  },
  async deleteBrand(_t, id) {
    db().brands = db().brands.filter((b) => b.id !== id);
  },
  async moveBrand(_t, id, direction) {
    const brands = db().brands;
    const i = brands.findIndex((b) => b.id === id);
    const j = i + direction;
    if (i < 0 || j < 0 || j >= brands.length) return;
    [brands[i], brands[j]] = [brands[j]!, brands[i]!];
  },
  async getBrandsStrip() {
    return db().strip;
  },
  async saveBrandsStrip(_t, settings) {
    db().strip = settings;
  },

  async listOffers() {
    return db().offers;
  },
  async saveOffer(_t, input) {
    const offers = db().offers;
    const offer: AdminOffer = { ...input, id: input.id ?? newId("o") };
    const i = offers.findIndex((o) => o.id === offer.id);
    if (i >= 0) offers[i] = offer;
    else offers.unshift(offer);
    return offer;
  },
  async deleteOffer(_t, id) {
    db().offers = db().offers.filter((o) => o.id !== id);
  },

  async getSalePage() {
    return db().sale;
  },
  async saveSalePage(_t, settings) {
    db().sale = settings;
  },

  async getSiteContent() {
    return db().site;
  },
  async saveSiteContent(_t, content) {
    db().site = content;
  },

  async uploadImage(_t, file) {
    // Mock only: keep the image inline. The real API stores it in Supabase Storage and returns its URL.
    const buf = Buffer.from(await file.arrayBuffer());
    return `data:${file.type || "image/png"};base64,${buf.toString("base64")}`;
  },

  async login(email, password) {
    if (email.trim().toLowerCase() !== MOCK_CREDENTIALS.email || password !== MOCK_CREDENTIALS.password) return "invalid";
    return { accessToken: "mock-token", expiresIn: 60 * 60 * 8, user: { id: "u_mock", email: MOCK_CREDENTIALS.email, role: "admin" } };
  },
  async getOverview() {
    // Counts follow the in-memory orders, so confirming or cancelling in mock mode is reflected here.
    const orders = db().orders;
    const live = orders.filter((o) => o.status !== "cancelled" && o.status !== "returned");
    const sum = live.reduce((n, o) => n + o.total, 0);
    const byStatus = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0, returned: 0 };
    for (const o of orders) byStatus[o.status]++;
    return { ...overview, newOrdersToday: orders.length, revenue: { today: sum, week: sum, month: sum }, revenueLast7Days: [...overview.revenueLast7Days.slice(0, 6), sum], ordersByStatus: byStatus };
  },
};
