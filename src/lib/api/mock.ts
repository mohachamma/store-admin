import type { AdminApi, AdminBrand, AdminCategory, AdminCollection, AdminDiscountCode, AdminOffer, AdminSlide, AdminWhyUs, AdminWomenPage, AdminMenPage, AdminInfoPage, AdminStoreInfo, AdminHomeCard, AdminNewsletter, AdminWilaya, AdminOrderDetail, Expense, ProfitSettings, ProfitReport, WhatsappMessages, AdminOrderRow, AdminProduct, BrandsStripSettings, OrderStatus, Overview, SalePageSettings, SiteContent } from "./types";

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
    { variantId: "v1", productName: "Essential Hoodie Black", size: "XS", color: "black", stock: 0, image: "/placeholders/hoodie-black.svg" },
    { variantId: "v2", productName: "Chelsea Boot", size: "40", color: "brown", stock: 1, image: "/placeholders/boot-cream.svg" },
    { variantId: "v3", productName: "Red Skate Mid Sneaker", size: "42", color: "red", stock: 2, image: "/placeholders/sneaker-red.svg" },
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
  products: AdminProduct[];
  categories: Omit<AdminCategory, "productCount">[];
  collections: AdminCollection[];
  wilayas: AdminWilaya[];
  deliveryProvider: string;
  trackingUrls: Record<string, string>;
  freeShippingOver: number | null;
  codes: AdminDiscountCode[];
  slides: AdminSlide[];
  whyUs: AdminWhyUs;
  womenPage: AdminWomenPage;
  menPage: AdminMenPage;
  pages: AdminInfoPage[];
  storeInfo: AdminStoreInfo;
  homeCards: AdminHomeCard[];
  newsletter: AdminNewsletter;
  subscribers: { id: string; email: string; createdAt: string }[];
  expenses: Expense[];
  profitSettings: ProfitSettings;
  whatsapp: WhatsappMessages;
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
    ...sampleCatalog(),
    deliveryProvider: "manual",
    trackingUrls: {},
    wilayas: [
      [16, "الجزائر", "Alger", 500, 350], [31, "وهران", "Oran", 700, 450], [25, "قسنطينة", "Constantine", 700, 450], [9, "البليدة", "Blida", 500, 350], [19, "سطيف", "Sétif", 800, 550], [30, "ورقلة", "Ouargla", 1200, 800],
    ].map(([code, nameAr, nameFr, homeFee, deskFee]) => ({ code: code as number, nameAr: nameAr as string, nameFr: nameFr as string, homeFee: homeFee as number, deskFee: deskFee as number, homeCost: Math.round((homeFee as number) * 0.7), deskCost: Math.round((deskFee as number) * 0.7), active: true })),
    expenses: [
      { id: "ex_1", spentOn: new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10), category: "ads" as const, platform: "facebook", campaign: "eid_sale", amount: 18_000, note: null },
      { id: "ex_2", spentOn: new Date(Date.now() - 864e5).toISOString().slice(0, 10), category: "ads" as const, platform: "tiktok", campaign: "new_hoodies", amount: 9_500, note: null },
      { id: "ex_3", spentOn: new Date().toISOString().slice(0, 10), category: "packaging" as const, platform: null, campaign: null, amount: 4_200, note: "Bags" },
    ],
    profitSettings: { returnFee: 200, returnedItemsLost: false, cardFeePercent: 0 },
    whatsapp: {
      ask: { ar: "مرحباً {name} 👋\nاستلمنا طلبك رقم #{number} بقيمة {total}.\nهل تؤكد الطلب؟ أجبنا بـ «نعم» ليتم شحنه إليك.", fr: "Bonjour {name}, confirmez-vous la commande n°{number} ({total}) ?", en: "Hello {name}, do you confirm order #{number} ({total})?" },
      confirm: { ar: "مرحباً، أؤكد طلبي رقم #{number} ✅", fr: "Bonjour, je confirme ma commande n°{number} ✅", en: "Hello, I confirm my order #{number} ✅" },
      tracking: { ar: "تم تأكيد طلبك رقم #{number} ✅\nرقم التتبع: {tracking}\nتابع طلبك: {link}", fr: "Commande n°{number} confirmée ✅ Suivi : {tracking} {link}", en: "Order #{number} confirmed ✅ Tracking: {tracking} {link}" },
    },
    freeShippingOver: 10000,
    codes: [{ id: "dc_welcome", code: "WELCOME10", kind: "percent" as const, value: 10, minSubtotal: 3000, maxUses: null, usedCount: 4, startsAt: null, endsAt: null, isActive: true }],
    menPage: { enabled: true, title: { ar: "رجال", fr: "Homme", en: "Men" }, subtitle: { ar: "أحدث ملابس الرجال", fr: "", en: "" }, heroUrl: null },
    womenPage: { enabled: true, title: { ar: "نساء", fr: "Femme", en: "Women" }, subtitle: { ar: "أحدث ملابس النساء", fr: "", en: "" }, heroUrl: null },
    pages: ["terms", "privacy", "returns", "shipping", "cod"].map((slug) => ({ slug, title: { ar: slug, fr: slug, en: slug }, body: { ar: "## مسودة\nنص تجريبي.", fr: "", en: "" }, isPublished: true, isDraft: true, updatedAt: new Date().toISOString() })),
    storeInfo: { phone: "", whatsapp: "", email: "", address: { ar: "", fr: "", en: "" }, hours: { ar: "", fr: "", en: "" }, siteTitle: { ar: "", fr: "", en: "" }, siteDescription: { ar: "", fr: "", en: "" } },
    whyUs: { enabled: true, title: { ar: "لماذا نحن", fr: "Pourquoi nous", en: "Why shop with us" }, items: [
      { icon: "truck", title: { ar: "توصيل إلى 58 ولاية", fr: "Livraison dans 58 wilayas", en: "Delivery to 58 wilayas" }, text: { ar: "نوصّل طلبك إلى باب بيتك.", fr: "", en: "" } },
      { icon: "card", title: { ar: "ادفع عند الاستلام", fr: "Paiement à la livraison", en: "Pay on delivery" }, text: { ar: "", fr: "", en: "" } },
    ] },
    homeCards: [
      { id: "hc_men", title: { ar: "رجال", fr: "Homme", en: "Men" }, subtitle: { ar: "أحدث الموديلات", fr: "", en: "" }, imageUrl: "/placeholders/hoodie-black-1.svg", href: "/search?category=outerwear", isActive: true },
      { id: "hc_casual", title: { ar: "كاجوال", fr: "Casual", en: "Casual" }, subtitle: { ar: "", fr: "", en: "" }, imageUrl: "/placeholders/tee-cream-1.svg", href: "/search?category=tops", isActive: true },
    ],
    newsletter: { enabled: true, title: { ar: "كن أول من يعلم", fr: "", en: "" }, subtitle: { ar: "اترك بريدك لتصلك العروض.", fr: "", en: "" }, button: { ar: "اشترك", fr: "", en: "" } },
    subscribers: [{ id: "ns_1", email: "sara@example.com", createdAt: new Date().toISOString() }],
    slides: [{ id: "sl_winter", title: { ar: "تشكيلة الشتاء", fr: "Collection hiver", en: "Winter Collection" }, subtitle: { ar: "قطع دافئة بخطوط بسيطة", fr: "", en: "" }, imageUrl: "/placeholders/hoodie-stone.svg", collectionId: "col_winter", linkUrl: null, isActive: true, startsAt: null, endsAt: null }],
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
      ad: n % 3 === 0 ? null : { source: n % 3 === 1 ? "facebook" : "tiktok", medium: "paid", campaign: n % 3 === 1 ? "eid_sale" : "new_hoodies", content: null },
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

/** Six sample products with variants and local placeholder photos (mock mode only). */
function sampleCatalog() {
  const cat = (slug: string, ar: string, fr: string, en: string) => ({ id: `c_${slug}`, slug, name: { ar, fr, en }, imageUrl: null, isActive: true });
  const categories = [cat("outerwear", "ملابس خارجية", "Vestes & manteaux", "Outerwear"), cat("tops", "قمصان وتيشرتات", "Hauts", "Tops"), cat("footwear", "أحذية", "Chaussures", "Footwear"), cat("bottoms", "سراويل", "Bas", "Bottoms")];
  const p = (slug: string, ar: string, fr: string, en: string, categoryId: string, art: string, price: number, compare: number | null, sizes: string[], pub = true): AdminProduct => ({
    id: `p_${slug}`, slug, name: { ar, fr, en }, description: { ar: "", fr: "", en: "" }, categoryId, brandId: null, isPublished: pub, isNew: false, audience: "unisex",
    images: [{ url: `/placeholders/${art}.svg`, color: null }],
    variants: sizes.map((size, i) => ({ id: `v_${slug}_${size}`, size, color: "", colorHex: null, sku: `${slug}-${size}`.toUpperCase(), stock: i === 0 ? 1 : 4 + i, price, compareAtPrice: compare, costPrice: Math.round(price * 0.55) })),
  });
  const products = [
    p("nylon-zip-hoodie", "هودي بسحاب نايلون", "Hoodie zippé en nylon", "Nylon Full Zip Hoodie", "c_outerwear", "hoodie-stone", 7900, null, ["XS", "S", "M", "L", "XL"]),
    p("hooded-deck-coat", "معطف طويل بقبعة", "Manteau long à capuche", "Hooded Deck Coat", "c_outerwear", "coat-sand", 12900, null, ["S", "M", "L"]),
    p("essential-hoodie-black", "هودي أسود أساسي", "Hoodie essentiel noir", "Essential Hoodie Black", "c_outerwear", "hoodie-black", 5900, 7200, ["S", "M", "L"], false),
    p("red-skate-mid", "حذاء رياضي أحمر", "Baskets rouges", "Red Skate Mid Sneaker", "c_footwear", "sneaker-red", 9800, null, ["41", "42", "43"]),
    p("chelsea-boot", "حذاء تشيلسي", "Bottines Chelsea", "Chelsea Boot", "c_footwear", "boot-cream", 11500, null, ["41", "42"]),
    p("slim-denim-jean", "جينز ضيّق فاتح", "Jean slim clair", "Slim Denim Jean", "c_bottoms", "jeans-light", 5400, 6500, ["S", "M", "L"]),
  ];
  const collections: AdminCollection[] = [{ id: "col_winter", slug: "winter", title: { ar: "تشكيلة الشتاء", fr: "Collection hiver", en: "Winter Collection" }, subtitle: { ar: "", fr: "", en: "" }, heroUrl: "/placeholders/hoodie-stone.svg", isPublished: true, productIds: ["p_nylon-zip-hoodie", "p_hooded-deck-coat"] }];
  return { products, categories, collections };
}

const fail = (status: number, message: string) => Object.assign(new Error(message), { status });
const slugOf = (name: { fr: string; en: string }, fallback: string) =>
  (name.fr || name.en).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `${fallback}-${Math.random().toString(36).slice(2, 6)}`;
const move = <T extends { id: string }>(list: T[], id: string, direction: -1 | 1) => {
  const i = list.findIndex((x) => x.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j]!, list[i]!];
};

const newId = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

const orderById = (id: string) => {
  const o = db().orders.find((x) => x.id === id);
  if (!o) throw Object.assign(new Error("not found"), { status: 404 });
  return o;
};
const rowOf = (o: MockOrder): AdminOrderRow => ({
  id: o.id, orderNumber: o.orderNumber, status: o.status, paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus, deliveryType: o.deliveryType, wilayaCode: o.wilayaCode,
  wilaya: o.wilaya, total: o.total, itemCount: o.itemCount, trackingNumber: o.trackingNumber, createdAt: o.createdAt, customerName: o.customerName, customerPhone: o.customerPhone, ad: o.ad,
});
const detailOf = (o: MockOrder): AdminOrderDetail => ({
  ...rowOf(o), subtotal: o.subtotal, shippingFee: o.shippingFee, discountTotal: o.discountTotal, discountCode: o.discountCode, deliveryCompany: o.deliveryCompany,
  deliveryStatus: o.deliveryStatus, carrierTrackingUrl: null, confirmedAt: o.confirmedAt, items: o.items,
  customer: o.contact ? { ...o.contact, whatsappUrl: `https://wa.me/213${o.contact.phone.slice(1)}`, whatsappAskUrl: `https://wa.me/213${o.contact.phone.slice(1)}?text=${encodeURIComponent(`مرحباً ${o.contact.name}، هل تؤكد طلبك رقم #${o.orderNumber}؟`)}`, telUrl: `tel:${o.contact.phone}` } : null,
  whatsappTrackingUrl: null,
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
    const auto = db().deliveryProvider !== "manual" && !input.trackingNumber;
    if (!auto && !input.trackingNumber) throw Object.assign(new Error("tracking required"), { status: 422 });
    const phone = o.contact?.phone;
    Object.assign(o, { status: "confirmed", deliveryCompany: auto ? db().deliveryProvider : input.company, trackingNumber: auto ? `YAL-MOCK-${o.orderNumber}` : input.trackingNumber, deliveryStatus: "created", confirmedAt: new Date().toISOString(), contact: null, customerName: null, customerPhone: null });
    return { ...detailOf(o), whatsappTrackingUrl: phone ? `https://wa.me/213${phone.slice(1)}?text=${encodeURIComponent(`تم تأكيد طلبك رقم #${o.orderNumber} ✅ رقم التتبع: ${o.trackingNumber}`)}` : null };
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

  async listProducts(_t, f, locale) {
    const d = db();
    const lang = (locale === "fr" ? "fr" : "ar") as "ar" | "fr";
    let rows = d.products.filter((p) => (!f.status || (f.status === "published") === p.isPublished) && (!f.categoryId || p.categoryId === f.categoryId));
    if (f.q) {
      const q = f.q.toLowerCase();
      rows = rows.filter((p) => [p.name.ar, p.name.fr, p.name.en, p.slug].some((x) => x.toLowerCase().includes(q)));
    }
    const items = rows.slice(f.offset ?? 0, (f.offset ?? 0) + (f.limit ?? 30)).map((p) => {
      const cheapest = [...p.variants].sort((a, b) => a.price - b.price)[0];
      const cat = d.categories.find((c) => c.id === p.categoryId);
      return {
        id: p.id, slug: p.slug, name: p.name[lang] || p.name.ar, categoryName: cat ? cat.name[lang] || cat.name.ar : "", isPublished: p.isPublished, isNew: p.isNew, audience: p.audience,
        price: cheapest?.price ?? null, compareAtPrice: cheapest?.compareAtPrice ?? null, totalStock: p.variants.reduce((n, v) => n + v.stock, 0), variantCount: p.variants.length, soldOut: p.variants.filter((v) => v.stock <= 0).map((v) => ({ color: v.color, size: v.size })), image: p.images[0]?.url ?? null,
      };
    });
    return { items, total: rows.length };
  },
  async getProduct(_t, id) {
    const p = db().products.find((x) => x.id === id);
    if (!p) throw fail(404, "Product not found");
    return p;
  },
  async saveProduct(_t, id, input) {
    const d = db();
    if (input.isPublished && (!input.variants?.length || !input.images?.length)) throw fail(422, "A published product needs at least one variant and one image");
    const old = id ? d.products.find((x) => x.id === id) : undefined;
    if (id && !old) throw fail(404, "Product not found");
    const product: AdminProduct = {
      id: old?.id ?? newId("p"), slug: old?.slug ?? slugOf(input.name, "product"), name: { ...input.name }, description: { ar: input.description?.ar ?? "", fr: input.description?.fr ?? "", en: input.description?.en ?? "" },
      categoryId: input.categoryId, brandId: input.brandId ?? null, isPublished: input.isPublished ?? false, isNew: input.isNew ?? false, audience: input.audience ?? "unisex",
      images: (input.images ?? []).map((url, i) => ({ url, color: input.imageColors?.[i] ?? null })),
      variants: (input.variants ?? []).map((v) => ({ id: v.id ?? newId("v"), size: v.size, color: v.color ?? "", colorHex: v.colorHex ?? null, sku: v.sku?.trim() ? v.sku.trim().toUpperCase() : null, stock: v.stock, price: v.price, compareAtPrice: v.compareAtPrice ?? null, costPrice: v.costPrice ?? null })),
    };
    if (old) d.products[d.products.indexOf(old)] = product;
    else d.products.unshift(product);
    return product;
  },
  async deleteProduct(_t, id) {
    const d = db();
    d.products = d.products.filter((p) => p.id !== id);
    for (const c of d.collections) c.productIds = c.productIds.filter((x) => x !== id);
  },
  async publishProducts(_t, ids, isPublished) {
    let n = 0;
    for (const p of db().products) if (ids.includes(p.id) && (!isPublished || (p.variants.length && p.images.length))) { p.isPublished = isPublished; n++; }
    return n;
  },
  async setAudience(_t, ids, audience) {
    let n = 0;
    for (const p of db().products) if (ids.includes(p.id)) { p.audience = audience; n++; }
    return n;
  },
  async getMenPage() {
    return db().menPage;
  },
  async saveMenPage(_t, input) {
    db().menPage = input;
  },
  async getWomenPage() {
    return db().womenPage;
  },
  async saveWomenPage(_t, input) {
    db().womenPage = input;
  },
  async listCategories() {
    const d = db();
    return d.categories.map((c) => ({ ...c, productCount: d.products.filter((p) => p.categoryId === c.id).length }));
  },
  async saveCategory(_t, id, input) {
    const d = db();
    const base = { name: { ...input.name }, imageUrl: input.imageUrl ?? null, isActive: input.isActive ?? true };
    const existing = id ? d.categories.find((c) => c.id === id) : undefined;
    if (id && !existing) throw fail(404, "Category not found");
    const cat = existing ? Object.assign(existing, base) : { id: newId("c"), slug: slugOf(input.name, "category"), ...base };
    if (!existing) d.categories.push(cat);
    return { ...cat, productCount: d.products.filter((p) => p.categoryId === cat.id).length };
  },
  async deleteCategory(_t, id) {
    const d = db();
    if (d.products.some((p) => p.categoryId === id)) throw fail(409, "Move or delete the category's products first");
    d.categories = d.categories.filter((c) => c.id !== id);
  },
  async moveCategory(_t, id, direction) {
    move(db().categories, id, direction);
  },
  async listCollections() {
    return db().collections;
  },
  async saveCollection(_t, id, input) {
    const d = db();
    const existing = id ? d.collections.find((c) => c.id === id) : undefined;
    if (id && !existing) throw fail(404, "Collection not found");
    const base = { title: { ...input.title }, subtitle: { ar: input.subtitle?.ar ?? "", fr: input.subtitle?.fr ?? "", en: input.subtitle?.en ?? "" }, heroUrl: input.heroUrl ?? null, isPublished: input.isPublished ?? false, productIds: [...new Set(input.productIds ?? [])] };
    const col = existing ? Object.assign(existing, base) : { id: newId("col"), slug: slugOf(input.title, "collection"), ...base };
    if (!existing) d.collections.push(col);
    return col;
  },
  async deleteCollection(_t, id) {
    db().collections = db().collections.filter((c) => c.id !== id);
  },
  async moveCollection(_t, id, direction) {
    move(db().collections, id, direction);
  },
  async listVariants(_t, f, locale) {
    const lang = (locale === "fr" ? "fr" : "ar") as "ar" | "fr";
    let rows = db().products.flatMap((p) => p.variants.map((v) => ({ variantId: v.id, productId: p.id, productName: p.name[lang] || p.name.ar, image: p.images[0]?.url ?? null, size: v.size, color: v.color, stock: v.stock, price: v.price, compareAtPrice: v.compareAtPrice, costPrice: v.costPrice })));
    if (f.lowStock) rows = rows.filter((r) => r.stock <= 3);
    if (f.q) rows = rows.filter((r) => `${r.productName} ${r.size}`.toLowerCase().includes(f.q!.toLowerCase()));
    return { items: rows.slice(f.offset ?? 0, (f.offset ?? 0) + (f.limit ?? 100)), total: rows.length };
  },
  async bulkUpdateVariants(_t, updates) {
    const all = db().products.flatMap((p) => p.variants);
    // all or nothing: validate first
    for (const u of updates) {
      const v = all.find((x) => x.id === u.variantId);
      if (!v) throw fail(404, "A variant does not exist");
      const price = u.price ?? v.price;
      const compare = u.compareAtPrice === undefined ? v.compareAtPrice : u.compareAtPrice;
      if (compare !== null && compare <= price) throw fail(422, "The compare-at price must be higher than the price");
    }
    for (const u of updates) {
      const v = all.find((x) => x.id === u.variantId)!;
      if (u.price !== undefined) v.price = u.price;
      if (u.compareAtPrice !== undefined) v.compareAtPrice = u.compareAtPrice;
      if (u.stock !== undefined) v.stock = u.stock;
      if (u.costPrice !== undefined) v.costPrice = u.costPrice;
    }
    return updates.length;
  },

  async getShipping() {
    return { freeShippingOver: db().freeShippingOver, wilayas: db().wilayas };
  },
  async updateWilayas(_t, updates) {
    for (const u of updates) {
      const w = db().wilayas.find((x) => x.code === u.code);
      if (!w) throw fail(404, "Wilaya does not exist");
      Object.assign(w, { ...(u.homeFee !== undefined && { homeFee: u.homeFee }), ...(u.deskFee !== undefined && { deskFee: u.deskFee }), ...(u.homeCost !== undefined && { homeCost: u.homeCost }), ...(u.deskCost !== undefined && { deskCost: u.deskCost }), ...(u.active !== undefined && { active: u.active }) });
    }
    return updates.length;
  },
  async getAds(_t, range) {
    const today = new Date().toISOString().slice(0, 10);
    const from = range.from ?? today.slice(0, 8) + "01";
    const to = range.to ?? today;
    const spend = (s: string, c: string) => db().expenses.filter((e) => e.category === "ads" && e.platform === s && (e.campaign ?? "") === c && e.spentOn >= from && e.spentOn <= to).reduce((n, e) => n + e.amount, 0);
    const mk = (source: string, campaign: string, orders: number, delivered: number, returned: number, sales: number, profit: number) => {
      const sp = spend(source, campaign);
      return { source, campaign, orders, delivered, returned, inProgress: orders - delivered - returned, sales, profit, spend: sp, netProfit: profit - sp, roas: sp > 0 ? Math.round((sales / sp) * 100) / 100 : null, costPerOrder: sp > 0 && orders > 0 ? Math.round(sp / orders) : null };
    };
    const campaigns = [mk("facebook", "eid_sale", 62, 48, 5, 372_000, 131_000), mk("tiktok", "new_hoodies", 31, 22, 4, 168_500, 52_000), mk("", "", 40, 35, 2, 255_000, 98_000)].sort((a, b) => b.netProfit - a.netProfit);
    const sum = (f: (r: (typeof campaigns)[number]) => number) => campaigns.reduce((n, r) => n + f(r), 0);
    return { from, to, campaigns, totals: { orders: sum((r) => r.orders), sales: sum((r) => r.sales), profit: sum((r) => r.profit), spend: sum((r) => r.spend), netProfit: sum((r) => r.netProfit) } };
  },
  async getProfit(_t, range) {
    const demo = [
      { key: "p1", name: "Nylon Full Zip Hoodie", unitsSold: 48, unitsReturned: 2, sales: 379_200, productCost: 211_000, deliveryCost: 21_000, returnLoss: 1_200 },
      { key: "p2", name: "Red Skate Mid Sneaker", unitsSold: 31, unitsReturned: 3, sales: 303_800, productCost: 170_000, deliveryCost: 14_000, returnLoss: 1_800 },
      { key: "p3", name: "Slim Denim Jean", unitsSold: 29, unitsReturned: 1, sales: 156_600, productCost: 98_000, deliveryCost: 12_000, returnLoss: 600 },
    ].map((x) => ({ ...x, profit: x.sales - x.productCost - x.deliveryCost - x.returnLoss }));
    const today = new Date().toISOString().slice(0, 10);
    const from = range.from ?? today.slice(0, 8) + "01";
    const to = range.to ?? today;
    const exp = db().expenses.filter((e) => e.spentOn >= from && e.spentOn <= to);
    const byCat = new Map<Expense["category"], number>();
    for (const e of exp) byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount);
    const total = exp.reduce((n, e) => n + e.amount, 0);
    // Demo numbers: a month of sales with returns.
    const s = db().profitSettings;
    const sales = 1_240_000, shipping = 96_000, productCost = 682_000, deliveryCost = 71_000, returnedOrders = 6, deliveredOrders = 141;
    const deliveryLoss = returnedOrders * 400, returnFees = returnedOrders * s.returnFee;
    const report: ProfitReport = {
      from, to,
      delivered: { orders: deliveredOrders, sales, shippingCollected: shipping, productCost, deliveryCost, cardFees: 0 },
      returned: { orders: returnedOrders, deliveryLoss, returnFees, lostGoods: 0 },
      expenses: { total, byCategory: [...byCat].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount) },
      netProfit: sales + shipping - productCost - deliveryCost - deliveryLoss - returnFees - total,
      returnRatePercent: Math.round((returnedOrders / (deliveredOrders + returnedOrders)) * 100),
      warnings: { itemsWithoutCost: 0, activeWilayasWithoutDeliveryCost: 0 },
      byProduct: demo,
    };
    return report;
  },
  async listExpenses(_t, range) {
    const today = new Date().toISOString().slice(0, 10);
    const from = range.from ?? today.slice(0, 8) + "01";
    const to = range.to ?? today;
    return db().expenses.filter((e) => e.spentOn >= from && e.spentOn <= to).sort((a, b) => b.spentOn.localeCompare(a.spentOn));
  },
  async saveExpense(_t, id, input) {
    const row: Expense = { id: id ?? newId("ex"), spentOn: input.spentOn, category: input.category, platform: input.platform ?? null, campaign: input.campaign ?? null, amount: input.amount, note: input.note ?? null };
    const i = db().expenses.findIndex((e) => e.id === id);
    if (id && i < 0) throw fail(404, "Expense not found");
    if (i >= 0) db().expenses[i] = row;
    else db().expenses.push(row);
    return row;
  },
  async deleteExpense(_t, id) {
    db().expenses = db().expenses.filter((e) => e.id !== id);
  },
  async getProfitSettings() {
    return db().profitSettings;
  },
  async saveProfitSettings(_t, input) {
    db().profitSettings = input;
  },
  async getDelivery() {
    return { provider: db().deliveryProvider, trackingUrls: db().trackingUrls, providers: [{ id: "manual", name: "Manual", configured: true }, { id: "yalidine", name: "Yalidine", configured: true }] };
  },
  async setTrackingUrls(_t, urls) {
    for (const [k, v] of Object.entries(urls)) {
      if (v && (!/^https:\/\/\S+$/.test(v) || !v.includes("{tracking}"))) throw Object.assign(new Error("invalid link"), { status: 422 });
      if (v) db().trackingUrls[k] = v;
      else delete db().trackingUrls[k];
    }
    return mockApi.getDelivery("");
  },
  async setDelivery(_t, provider) {
    if (!["manual", "yalidine"].includes(provider)) throw Object.assign(new Error("unknown"), { status: 422 });
    db().deliveryProvider = provider;
    return this.getDelivery("");
  },
  async refreshTracking(_t, id) {
    const o = orderById(id);
    o.deliveryStatus = "in_transit";
    return "in_transit";
  },
  async setFreeShipping(_t, over) {
    db().freeShippingOver = over;
  },
  async listDiscountCodes() {
    return db().codes;
  },
  async saveDiscountCode(_t, id, input) {
    const d = db();
    const code = input.code.trim().toUpperCase();
    if (d.codes.some((c) => c.code === code && c.id !== id)) throw fail(409, "This value already exists");
    const base = { code, kind: input.kind, value: input.value, minSubtotal: input.minSubtotal ?? 0, maxUses: input.maxUses ?? null, startsAt: input.startsAt ?? null, endsAt: input.endsAt ?? null, isActive: input.isActive ?? true };
    const existing = id ? d.codes.find((c) => c.id === id) : undefined;
    if (id && !existing) throw fail(404, "Discount code not found");
    const row = existing ? Object.assign(existing, base) : { id: newId("dc"), usedCount: 0, ...base };
    if (!existing) d.codes.unshift(row);
    return row;
  },
  async deleteDiscountCode(_t, id) {
    db().codes = db().codes.filter((c) => c.id !== id);
  },
  async listPages() {
    return db().pages;
  },
  async savePage(_t, slug, input) {
    const page = db().pages.find((p) => p.slug === slug);
    if (!page) throw fail(404, "Page not found");
    return Object.assign(page, { ...input, updatedAt: new Date().toISOString() });
  },
  async getWhatsappMessages() {
    return db().whatsapp;
  },
  async saveWhatsappMessages(_t, input) {
    db().whatsapp = input;
  },
  async getStoreInfo() {
    return db().storeInfo;
  },
  async saveStoreInfo(_t, input) {
    db().storeInfo = input;
  },
  async getWhyUs() {
    return db().whyUs;
  },
  async saveWhyUs(_t, input) {
    db().whyUs = input;
  },
  async listHomeCards() {
    return db().homeCards;
  },
  async saveHomeCard(_t, id, input) {
    const d = db();
    const t = (v?: { ar?: string; fr?: string; en?: string }) => ({ ar: v?.ar ?? "", fr: v?.fr ?? "", en: v?.en ?? "" });
    const base = { title: t(input.title), subtitle: t(input.subtitle), imageUrl: input.imageUrl, href: input.href ?? null, isActive: input.isActive ?? true };
    const existing = id ? d.homeCards.find((c) => c.id === id) : undefined;
    if (id && !existing) throw fail(404, "Card not found");
    const row = existing ? Object.assign(existing, base) : { id: newId("hc"), ...base };
    if (!existing) d.homeCards.push(row);
    return row;
  },
  async deleteHomeCard(_t, id) {
    db().homeCards = db().homeCards.filter((c) => c.id !== id);
  },
  async moveHomeCard(_t, id, direction) {
    move(db().homeCards, id, direction);
  },
  async getNewsletter() {
    return db().newsletter;
  },
  async saveNewsletter(_t, input) {
    db().newsletter = input;
  },
  async listSubscribers() {
    return { total: db().subscribers.length, items: db().subscribers };
  },
  async deleteSubscriber(_t, id) {
    db().subscribers = db().subscribers.filter((x) => x.id !== id);
  },
  async listSlides() {
    return db().slides;
  },
  async saveSlide(_t, id, input) {
    const d = db();
    const t = (v?: { ar?: string; fr?: string; en?: string }) => ({ ar: v?.ar ?? "", fr: v?.fr ?? "", en: v?.en ?? "" });
    const base = { title: t(input.title), subtitle: t(input.subtitle), imageUrl: input.imageUrl, collectionId: input.collectionId ?? null, linkUrl: input.linkUrl ?? null, isActive: input.isActive ?? true, startsAt: input.startsAt ?? null, endsAt: input.endsAt ?? null };
    const existing = id ? d.slides.find((s) => s.id === id) : undefined;
    if (id && !existing) throw fail(404, "Slide not found");
    const row = existing ? Object.assign(existing, base) : { id: newId("sl"), ...base };
    if (!existing) d.slides.push(row);
    return row;
  },
  async deleteSlide(_t, id) {
    db().slides = db().slides.filter((s) => s.id !== id);
  },
  async moveSlide(_t, id, direction) {
    move(db().slides, id, direction);
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
