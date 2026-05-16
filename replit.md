# PropVault

A property manager intelligence platform that helps landlords find and vet trusted property managers by ZIP code, ranked by Google ratings, BBB standing, fee transparency, and years of experience.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/propvault run dev` — run the frontend (port 18089)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `GOOGLE_PLACES_API_KEY` — Google Places API key (Places API must be enabled in Google Cloud Console)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, framer-motion
- Fonts: Playfair Display (serif/headings), DM Sans (sans/body)
- Routing: wouter
- Data fetching: TanStack Query + Orval-generated hooks
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for all API shapes)
- `lib/api-client-react/` — generated React Query hooks (never edit manually)
- `lib/api-zod/` — generated Zod schemas for server-side validation
- `artifacts/api-server/src/routes/search.ts` — search, manager, stats routes + scoring engine + Google Places integration
- `artifacts/propvault/src/pages/Home.tsx` — main single-page experience
- `artifacts/propvault/src/components/ManagerCard.tsx` — manager card with locked overlay
- `artifacts/propvault/src/components/PlatformStatsBar.tsx` — top stats bar

## Architecture decisions

- **Contract-first API**: OpenAPI spec drives both server Zod validation and client React Query hooks via Orval codegen. Never write raw fetch calls on the frontend.
- **Server-side Google Places proxy**: The API key is kept server-side only; the frontend never touches Google APIs directly.
- **Places Text Search for geocoding**: We use `textsearch` to resolve ZIP → lat/lng instead of the Geocoding API, since Places API is the only requirement (avoids needing a second API enabled).
- **Graceful demo fallback**: If `GOOGLE_PLACES_API_KEY` is absent or the API errors, the server falls back to 7 realistic demo managers and sets `isDemo: true` in the response.
- **Freemium model**: Top 2 ranked results are returned with `locked: true`; the frontend blurs them with a paywall overlay.

## Product

- Search property managers by US ZIP code and radius (5/10/25/50 miles)
- Trust Score algorithm: Google rating (35%), BBB standing (30%), fee transparency (20%), experience (15%)
- Each card shows: Trust Score bar, Google rating, BBB rating, management fee %, specialties, response time
- Top 2 results are locked behind a PropVault membership paywall teaser
- Platform stats bar: total managers indexed, cities covered, avg trust score

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The Places API must be enabled in Google Cloud Console; the Geocoding API is NOT required (we use textsearch instead).
- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec changes before editing routes or components.
- Do not edit generated files in `lib/api-client-react/` or `lib/api-zod/` directly.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
