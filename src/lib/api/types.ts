/**
 * API types come from store-api's OpenAPI document (`npm run gen:api` → ./schema.d.ts).
 * Never hand-write API shapes: re-export the generated ones. The only exception is `Overview` below,
 * because `GET /admin/stats/overview` does not exist in the API yet (phase 5).
 */
import type { components } from "./schema";

type S = components["schemas"];

/** A translatable text: Arabic is required, French/English fall back to it when empty. */
export type I18n = S["OptionalI18n"];
export type AdminBrand = S["AdminBrand"];
export type BrandInput = Omit<AdminBrand, "id"> & { id?: string };
export type BrandsStripSettings = S["BrandsStripSettings"];
export type AdminOffer = S["AdminOffer"];
export type OfferInput = Omit<AdminOffer, "id"> & { id?: string };
export type SiteContent = S["SiteContent"];
export type SalePageSettings = S["SalePageSettings"];
export type LoginResult = S["LoginResult"];

// --- Temporary (no API endpoint yet) -------------------------------------------------------------
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned";

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

export interface AdminApi {
  login(email: string, password: string): Promise<LoginResult | "invalid" | "forbidden">;
  /** null when the API has no statistics endpoint yet. */
  getOverview(token: string): Promise<Overview | null>;

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

  getSalePage(token: string): Promise<SalePageSettings>;
  saveSalePage(token: string, settings: SalePageSettings): Promise<void>;

  getSiteContent(token: string): Promise<SiteContent>;
  saveSiteContent(token: string, content: SiteContent): Promise<void>;

  /** Uploads an image and returns its URL. */
  uploadImage(token: string, file: File): Promise<string>;
}
