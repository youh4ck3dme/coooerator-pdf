# PHASE 2 â€” Dependency & production hardening

Scope: Operator Cockpit PWA. This is a frontend preview, **not** a deployed Booking/Airbnb integration.

## Verified baseline (2026-10-20)

- Production deployment: READY; Vercel Git integration from `main`.
- Production endpoint returns HTTP 200 for `/`, `/calendar`, `/rates`, `/manifest.webmanifest`, `/sw.js` and PWA icons.
- HTTPS security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
- `npm audit --omit=dev`: **0 vulnerabilities**.
- Full `npm audit`: **7 findings (5 high, 2 moderate)** entirely in the Tailwind CSS 3.4.19 build-tool dependency graph:
  - `braces@3.0.3` (GHSA-vfj7-8cjw-p6xm; advisory needs a future fixed major)
  - `chokidar@3.6.0`, `fast-glob@3.3.3`, `micromatch@4.0.8` (inherited/related)
  - `postcss-selector-parser@6.1.4` (GHSA-rj75-hqrm-r3gf), `postcss-nested@6.2.0` and `tailwindcss@3.4.19`.
- npm proposes **Tailwind CSS 4**, a semver-major migration. Do not run `npm audit fix --force` without migrating and verifying the stylesheet/theme. The risk is in the *build toolchain*, not the deployed JS bundle, but the findings are still open.
- Unused browser package dependencies `axios`, `openai`, and `clsx` have been removed. `server-reference/providers.ts` remains a **non-deployed reference**. A future backend must declare its own runtime dependencies and store secrets server-side.

## Automated gates

- `npm ci`
- `npm run security:r¶»§q«^