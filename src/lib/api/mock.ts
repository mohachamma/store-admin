import type { AdminApi, AdminBrand, AdminOffer, BrandsStripSettings, Overview, SalePageSettings, SiteContent } from "./types";

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
}
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

const newId = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

export const mockApi: AdminApi = {
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
    return overview;
  },
};
