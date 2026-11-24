/**
 * TEMPORARY types for the mock adapter, until store-api publishes /admin/* endpoints.
 * Then run `npm run gen:api` and alias these to `components["schemas"][...]` in ./schema.d.ts.
 * The shapes are listed under "Needs from API" in CLAUDE.md.
 */
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned";

export interface AdminUser {
  id: string;
  email: string;
  role: "admin";
}

export interface LoginResult {
  accessToken: string;
  /** Seconds. */
  expiresIn: number;
  user: AdminUser;
}

export interface Overview {
  newOrdersToday: number;
  /** Integer DZD. */
  revenue: { today: number; week: number; month: number };
  /** Daily revenue for the last 7 days, oldest first. */
  revenueLast7Days: number[];
  ordersByStatus: Record<OrderStatus, number>;
  topProducts: { id: string; name: string; image: string; unitsSold: number; revenue: number }[];
  lowStock: { variantId: string; productName: string; size: string; stock: number; image: string }[];
}

/** A translatable text: Arabic is required, French/English fall back to it when empty. */
export interface I18n {
  ar: string;
  fr: string;
  en: string;
}

export interface AdminBrand {
  id: string;
  name: string;
  logoUrl: string | null;
  href: string | null;
  isActive: boolean;
}
export type BrandInput = Omit<AdminBrand, "id"> & { id?: string };

/** How the storefront's brands strip behaves. */
export interface BrandsStripSettings {
  enabled: boolean;
  animated: boolean;
  /** Seconds per full loop (higher = slower). */
  speed: number;
  pauseOnHover: boolean;
  title: I18n;
}

export interface AdminOffer {
  id: string;
  label: I18n;
  title: I18n;
  subtitle: I18n;
  ctaLabel: I18n;
  href: string | null;
  imageUrl: string | null;
  theme: "dark" | "light";
  /** Show a live countdown to endsAt. */
  showCountdown: boolean;
  /** ISO strings (UTC) or null. */
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}
export type OfferInput = Omit<AdminOffer, "id"> & { id?: string };

export interface SiteContent {
  /** Text of the thin bar above the storefront header; empty hides it. */
  announcement: I18n;
}

export interface AdminApi {
  login(email: string, password: string): Promise<LoginResult | "invalid" | "forbidden">;
  getOverview(token: string): Promise<Overview>;

  listBrands(token: string): Promise<AdminBrand[]>;
  saveBrand(token: string, input: BrandInput): Promise<AdminBrand>;
  deleteBrand(token: string, id: string): Promise<void>;
  /** Move a brand one step earlier (-1) or later (+1) in the strip. */
  moveBrand(token: string, id: string, direction: -1 | 1): Promise<void>;
  getBrandsStrip(token: string): Promise<BrandsStripSettings>;
  saveBrandsStrip(token: string, settings: BrandsStripSettings): Promise<void>;

  listOffers(token: string): Promise<AdminOffer[]>;
  saveOffer(token: string, input: OfferInput): Promise<AdminOffer>;
  deleteOffer(token: string, id: string): Promise<void>;

  getSiteContent(token: string): Promise<SiteContent>;
  saveSiteContent(token: string, content: SiteContent): Promise<void>;

  /** Uploads an image and returns its URL. */
  uploadImage(token: string, file: File): Promise<string>;
}
