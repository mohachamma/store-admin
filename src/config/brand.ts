/**
 * Brand of the store — the dashboard has its own dark frosted-glass / orange identity (the storefront keeps its black and white one).
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
    ink: "#f47a20",
    paper: "#14110f",
    mist: "#2a241f",
    line: "#3a322c",
    muted: "#a99f94",
    gold: "#f58a35",
  },
  currency: "DZD",
  /** Storefront URL, used for "view in store" links. */
  storefrontUrl: process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "http://localhost:3000",
} as const;
