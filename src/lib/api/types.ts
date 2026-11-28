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

export type AdminProduct = S["AdminProduct"];
export type AdminProductRow = S["AdminProductRow"];
export type AdminProductList = S["AdminProductList"];
export type ProductInput = S["ProductInput"];
export type VariantInput = S["VariantInput"];
export type AdminCategory = S["AdminCategory"];
export type CategoryInput = S["CategoryInput"];
export type AdminCollection = S["AdminCollection"];
export type CollectionInput = S["CollectionInput"];
export type AdminVariantRow = S["AdminVariantRow"];
export type AdminVariantList = S["AdminVariantList"];

export type AdminShipping = S["AdminShipping"];
export type AdminWilaya = S["AdminWilaya"];
export type AdminDiscountCode = S["AdminDiscountCode"];
export type DiscountCodeInput = S["DiscountCodeInput"];
export type AdminSlide = S["AdminSlide"];
export type AdminDelivery = S["AdminDelivery"];
export type AdminWhyUs = S["AdminWhyUs"];
export type AdminWomenPage = S["AdminWomenPage"];
export type AdminMenPage = S["AdminMenPage"];
export type Audience = "women" | "men" | "unisex";
export type AdminInfoPage = S["AdminInfoPage"];
export type InfoPageInput = S["InfoPageInput"];
export type AdminStoreInfo = S["AdminStoreInfo"];
export type AdminHomeCard = S["AdminHomeCard"];
export type HomeCardInput = S["HomeCardInput"];
export type AdminNewsletter = S["AdminNewsletter"];
export type NewsletterSubscribers = S["NewsletterSubscribers"];
export type SlideInput = S["SlideInput"];
export type WhatsappMessages = S["WhatsappMessages"];
export type AdsReport = S["AdsReport"];
export type ProfitReport = S["ProfitReport"];
export type Expense = S["Expense"];
export type ExpenseInput = S["ExpenseInput"];
export type ExpenseCategory = Expense["category"];
export type ProfitSettings = S["ProfitSettings"];
export interface DateRange {
  from?: string;
  to?: string;
}
export interface WilayaUpdate {
  code: number;
  homeFee?: number;
  deskFee?: number;
  homeCost?: number;
  deskCost?: number;
  active?: boolean;
}

export interface ProductFilters {
  q?: string;
  status?: "published" | "draft";
  categoryId?: string;
  limit?: number;
  offset?: number;
}
export interface VariantFilters {
  q?: string;
  lowStock?: boolean;
  limit?: number;
  offset?: number;
}
export interface BulkVariantUpdate {
  variantId: string;
  price?: number;
  compareAtPrice?: number | null;
  stock?: number;
  costPrice?: number | null;
}

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
  confirmOrder(token: string, id: string, input: { company: string; trackingNumber?: string }, locale: string): Promise<AdminOrderDetail>;
  setOrderStatus(token: string, id: string, status: "shipped" | "delivered" | "returned" | "cancelled", locale: string): Promise<AdminOrderDetail>;
  listProducts(token: string, filters: ProductFilters, locale: string): Promise<AdminProductList>;
  getProduct(token: string, id: string): Promise<AdminProduct>;
  /** id = null creates; otherwise edits (images and variants are synchronised with the given lists). */
  saveProduct(token: string, id: string | null, input: ProductInput): Promise<AdminProduct>;
  deleteProduct(token: string, id: string): Promise<void>;
  publishProducts(token: string, ids: string[], isPublished: boolean): Promise<number>;
  setAudience(token: string, ids: string[], audience: Audience): Promise<number>;
  getWomenPage(token: string): Promise<AdminWomenPage>;
  saveWomenPage(token: string, input: AdminWomenPage): Promise<void>;
  getMenPage(token: string): Promise<AdminMenPage>;
  saveMenPage(token: string, input: AdminMenPage): Promise<void>;
  listCategories(token: string): Promise<AdminCategory[]>;
  saveCategory(token: string, id: string | null, input: CategoryInput): Promise<AdminCategory>;
  deleteCategory(token: string, id: string): Promise<void>;
  moveCategory(token: string, id: string, direction: -1 | 1): Promise<void>;
  listCollections(token: string): Promise<AdminCollection[]>;
  saveCollection(token: string, id: string | null, input: CollectionInput): Promise<AdminCollection>;
  deleteCollection(token: string, id: string): Promise<void>;
  moveCollection(token: string, id: string, direction: -1 | 1): Promise<void>;
  listVariants(token: string, filters: VariantFilters, locale: string): Promise<AdminVariantList>;
  bulkUpdateVariants(token: string, updates: BulkVariantUpdate[]): Promise<number>;

  getShipping(token: string): Promise<AdminShipping>;
  updateWilayas(token: string, updates: WilayaUpdate[]): Promise<number>;
  setFreeShipping(token: string, over: number | null): Promise<void>;
  getProfit(token: string, range: DateRange, locale: string): Promise<ProfitReport>;
  getAds(token: string, range: DateRange): Promise<AdsReport>;
  listExpenses(token: string, range: DateRange): Promise<Expense[]>;
  saveExpense(token: string, id: string | null, input: ExpenseInput): Promise<Expense>;
  deleteExpense(token: string, id: string): Promise<void>;
  getProfitSettings(token: string): Promise<ProfitSettings>;
  saveProfitSettings(token: string, input: ProfitSettings): Promise<void>;
  getDelivery(token: string): Promise<AdminDelivery>;
  setDelivery(token: string, provider: string): Promise<AdminDelivery>;
  setTrackingUrls(token: string, urls: Record<string, string>): Promise<AdminDelivery>;
  refreshTracking(token: string, id: string): Promise<string>;
  listDiscountCodes(token: string): Promise<AdminDiscountCode[]>;
  saveDiscountCode(token: string, id: string | null, input: DiscountCodeInput): Promise<AdminDiscountCode>;
  deleteDiscountCode(token: string, id: string): Promise<void>;
  listSlides(token: string): Promise<AdminSlide[]>;
  saveSlide(token: string, id: string | null, input: SlideInput): Promise<AdminSlide>;
  deleteSlide(token: string, id: string): Promise<void>;
  moveSlide(token: string, id: string, direction: -1 | 1): Promise<void>;

  listPages(token: string): Promise<AdminInfoPage[]>;
  savePage(token: string, slug: string, input: InfoPageInput): Promise<AdminInfoPage>;
  getWhatsappMessages(token: string): Promise<WhatsappMessages>;
  saveWhatsappMessages(token: string, input: WhatsappMessages): Promise<void>;
  getStoreInfo(token: string): Promise<AdminStoreInfo>;
  saveStoreInfo(token: string, input: AdminStoreInfo): Promise<void>;
  getWhyUs(token: string): Promise<AdminWhyUs>;
  saveWhyUs(token: string, input: AdminWhyUs): Promise<void>;
  listHomeCards(token: string): Promise<AdminHomeCard[]>;
  saveHomeCard(token: string, id: string | null, input: HomeCardInput): Promise<AdminHomeCard>;
  deleteHomeCard(token: string, id: string): Promise<void>;
  moveHomeCard(token: string, id: string, direction: -1 | 1): Promise<void>;
  getNewsletter(token: string): Promise<AdminNewsletter>;
  saveNewsletter(token: string, input: AdminNewsletter): Promise<void>;
  listSubscribers(token: string): Promise<NewsletterSubscribers>;
  deleteSubscriber(token: string, id: string): Promise<void>;

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
