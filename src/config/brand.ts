/**
 * Brand of the store — same identity as the storefront (store-web/src/config/brand.ts).
 * Placeholder until the owner provides the real name and logo. Colours are mirrored as
 * CSS variables in `src/app/globals.css` (keep both in sync).
 */
export const brand = {
  name: "Store",
  wordmark: "STORE",
  monogram: "ST",
  /** Small tag shown next to the wordmark so staff always know they are in the dashboard. */
  adminTag: "ADMIN",
  colors: {
    ink: "#111111",
    paper: "#ffffff",
    mist: "#f4f4f4",
    line: "#e8e8e8",
    muted: "#8a8a8a",
  },
  currency: "DZD",
  /** Storefront URL, used for "view in store" links. */
  storefrontUrl: process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "http://localhost:3000",
} as const;
