import type { AdminApi, Overview } from "./types";

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

export const mockApi: AdminApi = {
  async login(email, password) {
    if (email.trim().toLowerCase() !== MOCK_CREDENTIALS.email || password !== MOCK_CREDENTIALS.password) return "invalid";
    return { accessToken: "mock-token", expiresIn: 60 * 60 * 8, user: { id: "u_mock", email: MOCK_CREDENTIALS.email, role: "admin" } };
  },
  async getOverview() {
    return overview;
  },
};
