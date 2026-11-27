/**
 * Brand of the store — the dashboard has its own warm cream / serif identity (the storefront keeps its black and white one).
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
    ink: "#2b2521",
    paper: "#f6f1e8",
    mist: "#ebe3d3",
    line: "#e3dac8",
    muted: "#776c5f",
    gold: "#a9833f",
  },
  currency: "DZD",
  /** Storefront URL, used for "view in store" links. */
  storefrontUrl: process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "http://localhost:3000",
} as const;
