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

export interface AdminApi {
  login(email: string, password: string): Promise<LoginResult | "invalid" | "forbidden">;
  getOverview(token: string): Promise<Overview>;
}
