# store-admin

Admin dashboard — Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui components (`src/components/ui`), next-intl (`ar` default RTL, `fr`; stored in a cookie).

```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3001 — demo login (mock mode): admin@store.test / admin1234
```

| Script | |
|---|---|
| `npm run build` / `npm run lint` | Run both before every push |
| `npm run gen:api` | Regenerate `src/lib/api/schema.d.ts` from `${NEXT_PUBLIC_API_URL}/openapi.json` |

- Identity: same tokens as the storefront (`src/config/brand.ts`, `src/app/globals.css`) + black **ADMIN** tag next to the wordmark.
- Auth: `src/proxy.ts` redirects to `/login` without a session; `requireSession()` re-checks on the server. The API token lives only in an httpOnly cookie.
- `noindex` everywhere: page metadata, `X-Robots-Tag` header, `robots.txt`.
- shadcn/ui: `components.json` is configured; `npx shadcn@latest add <component>` works where `ui.shadcn.com` is reachable.
