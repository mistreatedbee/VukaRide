# Vuka Ride platform plan (website, driver dashboard, admin dashboard, app)

Status on 2026-11-11. The owner will add the mobile app code later, so the dashboards live inside this repo for now and are written so they can move out.

## What exists

| Part                                             | Where                                                   | State                                                                                                                       |
| ------------------------------------------------ | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Marketing website                                | `src/pages`, `src/components`                           | Built, prerendered, tested                                                                                                  |
| Website forms backend                            | `api/forms/[kind].ts`, `supabase/migrations/0001_*.sql` | Built and unit tested; not yet run against a real Supabase or Vercel                                                        |
| Portal: login, driver dashboard, admin dashboard | `src/portal`, `supabase/migrations/0002_portal.sql`     | Built; works end to end on demo data in development; SQL and Supabase calls **not yet run against a real Supabase project** |
| Mobile app (rider and driver)                    | not in repo yet                                         | Waiting for the owner                                                                                                       |

## Portal v1 (built)

- **Sign in:** Supabase email one-time code or link. Roles `driver` and `admin` in `profiles`. Nobody can change their own role. First admin is promoted by SQL (see the end of `0002_portal.sql`).
- **Driver dashboard** (`/driver`): overview and checklist, application form with save-draft and send-for-review, document upload (private storage, 10 MB, PDF/JPG/PNG/WebP), earnings placeholder, help.
- **Admin dashboard** (`/admin`): overview counts, applications queue with status filters, application detail with document review (accept or reject with a note) and decisions (start review, ask for more, approve, reject), website inbox (contact, deletion requests, launch sign-ups) with status.
- **Audit log:** every review decision writes a row.
- **Security:** row level security on every table, drivers only see their own rows, review state changes only through admin-checked SQL functions, portal pages are `noindex`, never prerendered, not in the sitemap, and closed ("not open yet") in a production build with no Supabase variables. Demo data exists only in the dev server.
- Portal code is a separate lazy chunk, so the public site's size is unchanged.

## Added after the CTO review (0003)

Document delete bug and storage rule fixed; approval needs every required document accepted; decisions cannot jump without reopening; audit log covers document views, inbox changes and role changes; admin two-step sign-in (TOTP) enforced in the database; POPIA erase-driver action; decision emails ready once email sending is configured; counts and inbox paging no longer capped by row limits; CSP connect-src tightened to Supabase; forms rate limit raised to 20/hour per IP with a separate unknown-IP bucket.

Then: drivers list with suspend and reinstate (0004), and an audit log viewer.

Still open from that review: Turnstile widget (not built), Lighthouse and screen reader pass on the portal, staging Supabase project, attorney review, SMTP once the domain exists.

## Waiting for the app code (do not guess these)

- Trips, riders, fares, ratings, payouts, driver earnings statements, support tickets, incident handling.
- Real feature claims on the website (shield button, share trip, weekly Wednesday payouts, delete-account path).
- Package name, signing fingerprints and team ID for the `.well-known` files.
- Whether the app has its own driver onboarding (then the dashboard's application flow may need to match or be replaced).
- Which backend the app already uses. If it is not Supabase, decide whether the portal moves to it or the app moves to Supabase.

## Next phases

1. **Go live with what exists.** New Supabase project, run both migrations, set Vercel variables, promote the first admin, test on a preview deployment. Customise the Supabase email template so it shows the `{{ .Token }}` code.
2. **App integration** (when the code arrives): read the data model, add trips, payouts and earnings tables or connect to the app's API, replace the Earnings placeholder, verify website claims.
3. **Admin growth:** drivers list with suspend and reinstate, trips and disputes, payouts and commission reports (commission percentage is not decided), support tickets, pricing and promo codes.
4. **Driver dashboard growth:** trip history, earnings statements, vehicle and insurance expiry reminders, profile and bank details.
5. **Hardening:** MFA for admins, SMS or WhatsApp codes (needs a provider), email notifications to drivers on decisions, data retention jobs, error monitoring, backups, a security review.

## Owner decisions still open

Supabase region (POPIA cross-border), SMS provider, payment provider, maps provider, commission percentage, vehicle age and class rule, launch cities, whether admins need MFA from day one.
