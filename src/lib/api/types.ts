/**
 * API types come from store-api's OpenAPI document (`npm run gen:api` → ./schema.d.ts).
 * Never hand-write API shapes: re-export the generated ones.
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

export type Overview = S["AdminOverview"];
export type AdminOrderRow = S["AdminOrderRow"];
export type AdminOrderList = S["AdminOrderList"];
export type AdminOrderDetail = S["AdminOrderDetail"];
export type AdminEvents = S["AdminEvents"];
export type OrderStatus = AdminOrderRow["status"];

export interface OrderFilters {
  status?: OrderStatus;
  /** Order number or tracking number. */
  q?: string;
  limit?: number;
  offset?: number;
}

export interface AdminApi {
  login(email: string, password: string): Promise<LoginResult | "invalid" | "forbidden">;
  getOverview(token: string, locale: string): Promise<Overview>;

  listOrders(token: string, filters: OrderFilters, locale: string): Promise<AdminOrderList>;
  getOrder(token: string, id: string, locale: string): Promise<AdminOrderDetail>;
  /** Stores the tracking number and erases the customer's personal data. */
  confirmOrder(token: string, id: string, input: { company: string; trackingNumber: string }, locale: string): Promise<AdminOrderDetail>;
  setOrderStatus(token: string, id: string, status: "shipped" | "delivered" | "returned" | "cancelled", locale: string): Promise<AdminOrderDetail>;
  getEvents(token: string): Promise<AdminEvents>;
  markEventsRead(token: string): Promise<void>;

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
