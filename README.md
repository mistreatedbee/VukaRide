# Vuka Ride website

Marketing website for **Vuka Ride** (_Moving Africa Forward_). The mobile app is built separately; this site links to it through configuration only. Nothing here builds or mocks app features.

**Stack:** Vite 8, React 18, React Router 6, Tailwind CSS 4, TypeScript (strict), React Hook Form + Zod, Vitest, Playwright. The design tool's export was a Vite project, so the existing stack was kept rather than rewritten to Next.js. Next-specific requirements were met with equivalents (see [Decisions](#decisions)).

## Run and build

```bash
npm install
npm run dev          # dev server at http://localhost:5173
npm run build        # typecheck, build, prerender every page to static HTML
npm run preview      # serve ./dist like a static host (http://localhost:4173)
npm run typecheck && npm run lint && npm run format:check
npm test             # Vitest unit tests
npx playwright install chromium   # once
npm run test:e2e     # Playwright smoke tests (needs a build first)
npm run placeholders # list every [bracket] placeholder (table below)
```

`npm run build` prints a warning until `NEXT_PUBLIC_SITE_URL` is set. Canonical links, social tags and the sitemap fall back to `https://example.com` until then, so set it before launch.

## Project structure

```
src/
  main.tsx, entry-server.tsx   client entry (hydrates) and build-time server render
  App.tsx                      routes (each page is lazy-loaded)
  pages/                       Home, Drive, Safety, About, Contact, Privacy, Terms, DeleteAccount, Download, NotFound
  components/                  Header, Footer, StoreButtons, CtaBanner, FaqAccordion, LegalLayout, PhoneMockup, DoorDecal ...
    brand/                     VukaMark, VukaLogo (official SVGs), PatternBackground (brand tiles)
    forms/                     fields, FormFrame (error summary, retry, success), the four forms
  content/legal.ts             privacy and terms outlines + LEGAL_DRAFT switch
  lib/
    site-config.ts             ALL app links and contact details (reads env vars)
    schemas.ts, phone.ts       Zod schemas, South African mobile validation
    submit-form.ts             the one submitForm(kind, data) function
    routes.ts, head.ts         page titles/descriptions and head tags (browser + build)
    analytics.ts               stub, no analytics installed
scripts/                       prerender.mjs, serve-dist.mjs, list-placeholders.mjs
public/                        favicons, icons, og/, images/ (logo SVGs), patterns/, .well-known/
tests/                         Playwright smoke tests
docs/app-linking-templates.md  how to fill assetlinks.json and apple-app-site-association
vuka-ride-brand 3/, vuka-ride-website-kit/   source brand pack and kit (not built; copy deck and legal templates live here)
```

## Environment variables

`.env.production` (committed, public values only) holds the **proposed** domain and email addresses so builds are not left on `example.com`; change them if you register something else. Copy `.env.example` to `.env` for local overrides, or set variables in Vercel (they win over the file). Both `NEXT_PUBLIC_*` (the kit's names) and `VITE_*` prefixes are read. Anything set here is visible in the browser: **never put secrets or database connection strings in these variables.**

| Variable                                                                                                              | Purpose                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                                                                                | Public site URL, no trailing slash. Used for canonical, Open Graph, sitemap, robots, QR code.                                         |
| `NEXT_PUBLIC_GOOGLE_PLAY_URL`                                                                                         | Google Play listing. Empty: Android buttons go to `/download` ("Coming soon").                                                        |
| `NEXT_PUBLIC_APP_STORE_URL`                                                                                           | App Store listing. Same behaviour.                                                                                                    |
| `NEXT_PUBLIC_APP_DEEP_LINK`                                                                                           | Optional app link / universal link base. Adds an "Open Vuka Ride" link on `/download`.                                                |
| `NEXT_PUBLIC_DRIVER_SIGNUP_URL`                                                                                       | Optional (added by this build). Where "Apply to drive" goes once the app has driver sign-up. Empty: the form on `/drive`.             |
| `NEXT_PUBLIC_API_BASE_URL`                                                                                            | Forms backend. Empty: **mock mode** (nothing is sent).                                                                                |
| `NEXT_PUBLIC_SUPPORT_EMAIL`, `_DRIVERS_EMAIL`, `_PRIVACY_EMAIL`, `_HELLO_EMAIL`, `_SUPPORT_PHONE`, `_WHATSAPP_NUMBER` | Contact details shown in the footer, contact page, driver FAQ, delete-account page and legal pages. Empty: a visible `[placeholder]`. |
| `NEXT_PUBLIC_FACEBOOK_URL`, `_INSTAGRAM_URL`, `_X_URL`                                                                | Optional social links. Empty: the icon is hidden (no dead links).                                                                     |

Values that are empty, not `http(s)` URLs, or still contain `[brackets]` count as "not set" (`src/lib/site-config.test.ts`).

## Linking the app

Everything that points at the app goes through `src/lib/site-config.ts`. No store URL appears anywhere else.

| Integration point                           | File                                                                       | What to do                                                                                                                                                                                                                                                         |
| ------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Store buttons (header sheet, hero, banners) | `src/lib/site-config.ts` `storeHref()` + `src/components/StoreButtons.tsx` | Set `NEXT_PUBLIC_GOOGLE_PLAY_URL` / `NEXT_PUBLIC_APP_STORE_URL`. Set: straight to the store. Empty: `/download`.                                                                                                                                                   |
| "Get the app" buttons                       | `src/lib/site-config.ts` `getAppHref()`                                    | Always `/download`, which redirects by device once URLs are set.                                                                                                                                                                                                   |
| "Apply to drive"                            | `src/lib/site-config.ts` `applyToDriveHref()`                              | Set `NEXT_PUBLIC_DRIVER_SIGNUP_URL` when the app has driver onboarding.                                                                                                                                                                                            |
| `/download` smart page                      | `src/pages/Download.tsx`                                                   | Android and iOS visitors are redirected to their store; desktop sees both buttons and a QR code (of the site's `/download` URL, so a phone scan lands on the right store). With no URLs: "Coming soon" and a launch-news sign-up (mock mode until the API is set). |
| Open in app                                 | `src/pages/Download.tsx`                                                   | Set `NEXT_PUBLIC_APP_DEEP_LINK`.                                                                                                                                                                                                                                   |
| Forms backend                               | `src/lib/submit-form.ts`                                                   | Set `NEXT_PUBLIC_API_BASE_URL`. See contract below.                                                                                                                                                                                                                |
| Android App Links                           | `public/.well-known/assetlinks.json`                                       | Empty `[]` for now. Fill from `docs/app-linking-templates.md` with the real package name and signing fingerprint.                                                                                                                                                  |
| iOS Universal Links                         | `public/.well-known/apple-app-site-association`                            | Empty for now. Fill from `docs/app-linking-templates.md` with the real Team ID and bundle ID.                                                                                                                                                                      |
| Analytics                                   | `src/lib/analytics.ts`                                                     | Stub only (see [Cookies and analytics](#cookies-and-analytics)).                                                                                                                                                                                                   |

Each point carries a `// TODO: link to the finished app` comment in the code. Package names, team IDs and fingerprints are deliberately **not** invented.

## Forms and the API contract

Forms: driver application, contact, delete-account request, and launch-news sign-up (`/download`). All use React Hook Form + Zod, inline errors, an error summary that is announced and focused, a loading state, a success panel and a general error with **Try again**. South African mobile numbers accept `+27` or `0` and are normalised to `+27XXXXXXXXX`.

Spam protection: a hidden honeypot field (`website`) and a time check (submits faster than 2.5 s are asked to resend). A comment in `submit-form.ts` marks where a CAPTCHA token would go.

**Mock mode (default).** With no `NEXT_PUBLIC_API_BASE_URL`, `submitForm` waits 600 ms and succeeds without sending anything. The success panel says "Demo mode: this form is not connected yet, so nothing was sent", so a forgotten variable cannot silently lose applications. Form data is printed to the console only by the dev server; a production build logs just the form kind.

**Real mode.** `POST ${NEXT_PUBLIC_API_BASE_URL}/forms/{kind}` with `Content-Type: application/json`. `kind` is `driver-application`, `contact`, `delete-account` or `notify`. Any 2xx is success; anything else shows the retry state. Body = the validated fields plus `_meta`:

```jsonc
// POST /forms/contact
{ "name": "Sam", "email": "sam@example.com", "topic": "Other", "message": "...", "_meta": { "elapsedMs": 8421 } }
// POST /forms/driver-application
{ "fullName": "...", "mobile": "+27821234567", "email": "...", "city": "...", "vehicle": "...", "year": "2019",
  "plate": "...", "licence": true, "terms": true, "_meta": { "elapsedMs": 41200 } }
// POST /forms/delete-account
{ "contact": "email or +27 number", "reason": "optional", "confirm": true, "_meta": { "elapsedMs": 9000 } }
// POST /forms/notify
{ "email": "optional", "mobile": "optional +27...", "consent": true, "_meta": { "elapsedMs": 6000 } }
```

The backend should validate again, rate-limit, and may reject `_meta.elapsedMs` below ~2500. Allow CORS from the site's origin. Personal data is never put in `localStorage`.

## Content rules

Proposed content from the business is recorded in `docs/content-decisions.md`: what was applied, what must be confirmed before launch, and what is still missing.

Copy comes from `vuka-ride-website-kit/content/copy-deck.md`. No statistics, prices, ratings, testimonials or invented facts: anything unknown is a visible highlighted `[placeholder]`. The draft's invented claims (for example what data is deleted, the in-app delete path, value statements) were replaced with placeholders. Imagery is brand patterns, the phone mockup and the door-sticker graphic only.

## Legal pages are drafts

`/privacy` and `/terms` follow `content/legal-templates.md` as outlines. Every `[bracket]` is visible and a "Draft: pending legal review" notice shows at the top. When a South African attorney has approved the final text, replace the section bodies in `src/content/legal.ts` and set `LEGAL_DRAFT = false` in the same file to remove the notice. `/delete-account` is public (no sign-in), as Google Play requires; its in-app steps, deleted/kept data and timing are placeholders.

## Placeholders to fill before launch

Generated by `npm run placeholders` (re-run it after editing; line numbers shift). Environment-driven items (email, phone, WhatsApp) show a placeholder until their variable is set.

| File                                 | Line | Placeholder                                                                                     |
| ------------------------------------ | ---- | ----------------------------------------------------------------------------------------------- |
| src/components/Footer.tsx            | 104  | [Support email]                                                                                 |
| src/components/Footer.tsx            | 114  | [Phone]                                                                                         |
| src/components/LegalLayout.tsx       | 58   | [date]                                                                                          |
| src/components/LegalLayout.tsx       | 127  | [Insert final ${title} text for this section]                                                   |
| src/components/forms/ContactForm.tsx | 28   | [Add expected response time]                                                                    |
| src/content/legal.ts                 | 11   | [Privacy email]                                                                                 |
| src/content/legal.ts                 | 12   | [Support email]                                                                                 |
| src/content/legal.ts                 | 23   | [confirm]                                                                                       |
| src/content/legal.ts                 | 26   | [confirm]                                                                                       |
| src/content/legal.ts                 | 27   | [confirm]                                                                                       |
| src/content/legal.ts                 | 28   | [confirm]                                                                                       |
| src/content/legal.ts                 | 31   | [confirm]                                                                                       |
| src/content/legal.ts                 | 41   | [Registered company name]                                                                       |
| src/content/legal.ts                 | 41   | [registration number]                                                                           |
| src/content/legal.ts                 | 41   | [registered address]                                                                            |
| src/content/legal.ts                 | 41   | [only if registered]                                                                            |
| src/content/legal.ts                 | 42   | [Name, Title]                                                                                   |
| src/content/legal.ts                 | 48   | [Confirm this list matches exactly what the app collects.]                                      |
| src/content/legal.ts                 | 66   | [Describe how they are protected and who can see them.]                                         |
| src/content/legal.ts                 | 72   | [Marketing, only with consent.]                                                                 |
| src/content/legal.ts                 | 79   | [Confirm.]                                                                                      |
| src/content/legal.ts                 | 87   | [Payment provider]                                                                              |
| src/content/legal.ts                 | 88   | [Maps provider]                                                                                 |
| src/content/legal.ts                 | 89   | [SMS provider]                                                                                  |
| src/content/legal.ts                 | 90   | [Provider]                                                                                      |
| src/content/legal.ts                 | 91   | [Provider and region]                                                                           |
| src/content/legal.ts                 | 92   | [Provider, or none]                                                                             |
| src/content/legal.ts                 | 93   | [Provider name]                                                                                 |
| src/content/legal.ts                 | 102  | [Country or region where data is stored.]                                                       |
| src/content/legal.ts                 | 102  | [List the countries.]                                                                           |
| src/content/legal.ts                 | 108  | [Confirm each one with an attorney and accountant, then apply it in the system.]                |
| src/content/legal.ts                 | 116  | [confirm]                                                                                       |
| src/content/legal.ts                 | 117  | [confirm]                                                                                       |
| src/content/legal.ts                 | 118  | [confirm]                                                                                       |
| src/content/legal.ts                 | 119  | [confirm]                                                                                       |
| src/content/legal.ts                 | 120  | [confirm]                                                                                       |
| src/content/legal.ts                 | 125  | [Describe reasonable measures: encryption in transit, access controls.]                         |
| src/content/legal.ts                 | 133  | [Confirm.]                                                                                      |
| src/content/legal.ts                 | 134  | [How you will notify users.]                                                                    |
| src/content/legal.ts                 | 138  | [Name, Title]                                                                                   |
| src/content/legal.ts                 | 138  | [Link the PAIA manual here.]                                                                    |
| src/content/legal.ts                 | 152  | [confirm]                                                                                       |
| src/content/legal.ts                 | 152  | [age, licence, PrDP]                                                                            |
| src/content/legal.ts                 | 158  | [fees]                                                                                          |
| src/content/legal.ts                 | 169  | [confirm with attorney]                                                                         |
| src/content/legal.ts                 | 169  | [commission and payouts]                                                                        |
| src/content/legal.ts                 | 177  | [describe]                                                                                      |
| src/content/legal.ts                 | 177  | [confirm]                                                                                       |
| src/content/legal.ts                 | 177  | [surge pricing, if any]                                                                         |
| src/content/legal.ts                 | 196  | [Registered company name]                                                                       |
| src/content/legal.ts                 | 202  | [Attorney to draft within the Consumer Protection Act limits.]                                  |
| src/content/legal.ts                 | 202  | [describe]                                                                                      |
| src/content/legal.ts                 | 207  | [Notice approach.]                                                                              |
| src/content/legal.ts                 | 212  | [Jurisdiction; dispute process; how to reach the Consumer Goods and Services Ombud or a court.] |
| src/content/legal.ts                 | 215  | [Registered address.]                                                                           |
| src/lib/schemas.ts                   | 26   | [City 1]                                                                                        |
| src/lib/schemas.ts                   | 26   | [City 2]                                                                                        |
| src/pages/About.tsx                  | 63   | [Add your founding story.]                                                                      |
| src/pages/Contact.tsx                | 27   | [Support email]                                                                                 |
| src/pages/Contact.tsx                | 28   | [Drivers email]                                                                                 |
| src/pages/Contact.tsx                | 29   | [Hello email]                                                                                   |
| src/pages/Contact.tsx                | 30   | [Phone]                                                                                         |
| src/pages/Contact.tsx                | 31   | [WhatsApp]                                                                                      |
| src/pages/Contact.tsx                | 32   | [Street address]                                                                                |
| src/pages/DeleteAccount.tsx          | 10   | [Confirm this is the real path in the app.]                                                     |
| src/pages/DeleteAccount.tsx          | 35   | [Registered company name]                                                                       |
| src/pages/DeleteAccount.tsx          | 66   | [Confirm every period with an attorney and an accountant.]                                      |
| src/pages/DeleteAccount.tsx          | 81   | [Confirm these times.]                                                                          |
| src/pages/DeleteAccount.tsx          | 94   | [privacy email]                                                                                 |
| src/pages/Drive.tsx                  | 27   | [confirm the cover required]                                                                    |
| src/pages/Drive.tsx                  | 30   | [Cars up to X years old, decide before publishing]                                              |
| src/pages/Drive.tsx                  | 38   | [Confirm these times.]                                                                          |
| src/pages/Drive.tsx                  | 86   | [Confirm.]                                                                                      |
| src/pages/Drive.tsx                  | 89   | [Commission: add the percentage, or say it is shown on every trip.]                             |
| src/pages/Drive.tsx                  | 95   | [number]                                                                                        |
| src/pages/Drive.tsx                  | 146  | [Confirm each item with your Provincial Regulatory Entity before publishing.]                   |
| src/pages/Drive.tsx                  | 202  | [Confirm.]                                                                                      |
| src/pages/Drive.tsx                  | 208  | [Confirm.]                                                                                      |
| src/pages/Drive.tsx                  | 211  | [Confirm.]                                                                                      |
| src/pages/Drive.tsx                  | 216  | [number]                                                                                        |
| src/pages/Drive.tsx                  | 222  | [Drivers email]                                                                                 |
| src/pages/Home.tsx                   | 182  | [City 1]                                                                                        |
| src/pages/Home.tsx                   | 182  | [City 2]                                                                                        |
| src/pages/Home.tsx                   | 193  | [Confirm this matches what the app supports.]                                                   |
| src/pages/Home.tsx                   | 212  | [Confirm the app has these features.]                                                           |
| src/pages/Safety.tsx                 | 21   | [Confirm the app has these features.]                                                           |
| src/pages/Safety.tsx                 | 94   | [Confirm these steps match what you really do before publishing.]                               |

## Cookies and analytics

No analytics, cookies or trackers are installed, and fonts are self-hosted (no Google Fonts requests). `src/lib/analytics.ts` is an empty stub. **If you add analytics, or anything that sets cookies or identifiers, add a consent banner first (POPIA)** and load the script only after consent.

## Accessibility, contrast and performance

- Targets WCAG 2.1 AA: skip link, landmarks, one `<h1>` per page, visible gold focus rings, keyboard-operable menu (focus trap, Escape, focus return) and accordion (Enter/Space, arrows, Home/End), labelled icon buttons, `prefers-reduced-motion` respected.
- Brand contrast rules are encoded in `src/lib/contrast.test.ts`. Small white text sits on green-600 (`#097235`), never `#0B8F3E`; orange is used only for graphics; gold buttons use ink text. The hero gradient starts at green-600 (not `#0B8F3E`) so small text on it stays above 4.5:1.
- Pages are prerendered to static HTML at build, the stylesheet is inlined, fonts are preloaded with a metric-matched fallback (no layout shift), and each page is its own JS chunk. The QR library loads only on `/download`.

## Deploy to Vercel

1. Push the repo to GitHub and import it in Vercel. Framework preset **Vite**; build command `npm run build`; output directory `dist`.
2. Add the environment variables above (at least `NEXT_PUBLIC_SITE_URL`), for Production and Preview.
3. `vercel.json` sets clean URLs, security headers (CSP, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`, HSTS), long caching for `/assets`, and JSON content types for the `.well-known` files. If you add an analytics or API host, update `connect-src` in the CSP.
4. Unknown URLs get a real 404 from the prerendered `404.html`.
5. Add the domain in Vercel and set DNS as it instructs.

## Launch checklist

- [ ] Domain bought, added in Vercel, DNS set, HTTPS working; `NEXT_PUBLIC_SITE_URL` set; redeploy.
- [ ] Store URLs set (`NEXT_PUBLIC_GOOGLE_PLAY_URL`, `NEXT_PUBLIC_APP_STORE_URL`); `/download` redirects correctly on a real Android phone and iPhone.
- [ ] `assetlinks.json` and `apple-app-site-association` filled in (`docs/app-linking-templates.md`) and verified.
- [ ] Forms backend live and `NEXT_PUBLIC_API_BASE_URL` set (otherwise the site runs in demo mode); test all four forms end to end; add a CAPTCHA if spam appears.
- [ ] Domain and the four mailboxes (support, drivers, privacy, hello) exist; phone, WhatsApp and street address set.
- [ ] Information Officer registered on the Information Regulator's portal; PAIA manual written and linked.
- [ ] Every Confirm item in `docs/content-decisions.md` checked (feature claims match the app, driver rules, retention periods).
- [ ] Every `[placeholder]` in the table above replaced; launch cities decided.
- [ ] Privacy Policy and Terms reviewed by a South African attorney (POPIA, Consumer Protection Act, Google Play, App Store); `LEGAL_DRAFT = false`.
- [ ] Delete-account page matches the app's real behaviour (Google Play requires a working public URL); add that URL to the Play Console data-safety form.
- [ ] Privacy review: what is collected, where it is stored, retention periods.
- [ ] Analytics decision. If added, add consent first (POPIA).
- [ ] Google Search Console: verify the domain, submit `/sitemap.xml`.
- [ ] Social profile URLs set (footer icons appear when set); social bios from the copy deck.
- [ ] Run Lighthouse on the deployed URL and re-check at 360, 390, 768, 1024 and 1440 px.

## Decisions

- **Kept Vite, not Next.js**, as instructed ("keep the existing stack"). Equivalents: static prerender at build for per-page metadata and fast first paint (instead of Next metadata routes); `@fontsource/poppins` with `font-display: swap` (instead of `next/font`); `vercel.json` headers (instead of `next.config`); `sitemap.xml` and `robots.txt` generated at build from `NEXT_PUBLIC_SITE_URL`; no raster images are used in the page content, so `next/image` has no equivalent need (the logo and patterns are SVG).
- **Replaced `framer-motion`** with small CSS transitions (smaller bundle, content visible without JavaScript) and removed unused dependencies (`@radix-ui/react-icons`, `date-fns`, `tailwind-merge`).
- The hero gradient and app icon use the brand's official SVG files; the gradient was adjusted to start at green-600 for contrast.
- `/download` QR encodes the site's `/download` page, not a single store URL, so one code works for both phones.
- Added optional env vars `NEXT_PUBLIC_DRIVER_SIGNUP_URL` and the three social URLs.
