# Phase 2 — security and release verification

Operator Cockpit PWA: React 19, Czech UI, emerald #040C09 and copper #E2B48A.

## Verified 20 Oct 2026
- Production Vercel deployment READY; HTML, routes, manifest, service worker and icons returned HTTP 200.
- Security response headers include nosniff, DENY frame policy and strict-origin-when-cross-origin referrer policy.
- Node 24: npm ci, lint, TypeScript + Vite build and nine local PWA smoke checks passed in an isolated Vercel sandbox.
- npm audit --omit=dev: **zero** vulnerabilities.
- Unused browser dependencies axios, openai, clsx removed. server-reference/providers.ts is intentionally non-deployed sample code.
- CI tests production dependency audit and offline PWA smoke after npm ci and build.

## Outstanding risks
- Full npm audit: **5 high and 2 moderate** vulnerabilities in development/build-time Tailwind CSS 3 tree (braces/chokidar/fast-glob/micromatch and postcss-nested/postcss-selector-parser). Migrating to Tailwind 4 requires separate testing; no forced upgrade.
- No authenticated Booking/Airbnb provider backend. Do not place API secrets into VITE_* variables.
- Unknown /api/* currently falls back to an HTML page with HTTP 200. Fix routing before introducing real API endpoints.
- Browser E2E for authenticated data awaits backend and test credentials.

Smoke: npm run smoke; deployed smoke: SMOKE_URL=https://your-site.example npm run smoke.
