# Cedokamall — Multi-Perspective System Review

Scope: the whole application as it stands after the solar-plan integration, Farm "Coming Soon" page and the responsive pass.
Method: independent read of every page/component, a live probe of the Supabase project, route/interaction smoke tests, plan-lifecycle tests, and a line-by-line responsive audit of public pages, admin pages and shared UI.

Each perspective answers: **Fine / Wrong / Difficult / Missing / Do next.**

> **Update — second remediation pass (same day).** The findings below are the audit snapshot.
> Since then the following have been fixed in code: conditional-hook crash in `FloatingActions`;
> fake order tracking now performs a real transaction lookup; fake sales seeding no longer runs
> on admin page load; checkout totals/discount/delivery/payment labels and "completed" status corrected;
> admin product filter stale closure; Flash Deals View/Edit now work and deals reach the storefront;
> silent save failures now show errors; ratings/reviews no longer falsely report success; header
> search no longer forces a category; newsletter/contact messaging is honest; analytics metrics are
> computed instead of hardcoded; accessibility labels added; sitemap/robots and fallback images
> corrected; and the full responsive pass (2-column mobile grids, stacked filters, scrollable modals,
> 44px targets, 16px inputs, tablet navigation) applied.
>
> **Routing audit result:** 0 broken internal routes, 0 `href="#"` links, all hash anchors valid.
> Remaining external limitations: Supabase/API environment values must be set in production, and the
> `/api/checkout/initialize` client is unused because online payments are not implemented.

---

## 1. The Shopper (customer on phone and desktop)

**Fine**
- Clear top-level navigation (Electronics, Solar, Farms, Calculator), category filters, search, sort and price range.
- Product and plan cards are visually consistent, with fixed image ratios and readable prices.
- Solar plans are now grouped under named sections (Basic, Standard, Premium, Residential, Commercial, Custom) with a dedicated details page for each.
- The energy calculator turns "I don't know what I need" into a concrete recommendation.
- Every plan offers "Request a Quote" and the details page offers phone and WhatsApp contact.
- Loading skeletons, retry buttons and graceful empty states instead of blank screens.
- Mobile bottom navigation and a cart drawer; the drawer now opens as a proper overlay.

**Wrong**
- The Farm section is Honest but disappointing — it is now a Coming Soon page, not a catalogue.
- Some plans intentionally have no price ("Request a quote"); that is fine, but the visitor must leave the site to WhatsApp to learn it.
- Long product/plan names and very large naira prices used to wrap badly in narrow cards; the card geometry has been corrected but long names remain a layout stress point.
- The cart flow is long and asks for name, phone, address and payment choice before generating a WhatsApp message.

**Difficult**
- Comparing plans side by side still requires opening several details pages.
- Tracking an order depends on remembering an exact reference; pasted long strings previously overflowed (now handled).
- Finding a previously viewed plan after leaving the site — there is no account or recently-viewed list.

**Missing**
- Customer accounts, saved addresses, wishlist across devices, order history.
- A real checkout with card/transfer confirmation inside the site (currently WhatsApp hand-off).
- Delivery-date estimates and stock alerts.

**Do next**
- Add a lightweight "compare plans" view and a saved-quote list.
- Add guest checkout with Paystack/Flutterwave while keeping WhatsApp as an assisted channel.
- Add customer accounts for order history and repeat purchases.

---

## 2. The Critic (independent UX/quality reviewer)

**Fine**
- Coherent navy/gold/ivory palette and serif heading rhythm.
- Good information hierarchy: short card specs, full specs on the detail page.
- Mobile-first Tailwind approach and code-split routes keep initial load small.

**Wrong**
- Project documentation claims "all components responsive, 48px buttons, all breakpoints tested"; the audit found 8px bottom-nav labels, three-column grids at 320px, modals without scroll bounds, and no navigation at all on tablets. The docs were aspirational, not factual.
- Decorative labels at 9–11px with wide letter-spacing hurt readability.
- Several undefined utility classes (`font-display`, `cta-orange-light`, `animate-pulse-gold`, `animate-count-up`) silently produce no styling.
- `theme-color` is `#ff6b35` (orange) while the brand is navy/gold.
- Contact details conflict: `COMPANY_CONFIG.email = support@cedoka.com`, footer/SEO use `hello@cedokamall.com`, and an older summary claims a different showroom address than the one in code.

**Difficult**
- The admin solar-plan editor had a five-column fixed grid active at 640px (corrected to stack/wrap).
- The analytics charts reserved ~290px of label space, so bar charts collapsed on phones (corrected).
- Toast notifications originally covered the sticky header (now offset below it).

**Missing**
- A written, current design-system specification (type scale, spacing, tap targets, states).
- Consistent empty/error/loading patterns across every surface.

**Do next**
- Treat the code as the source of truth; rewrite or delete stale documentation.
- Define and apply one type scale with a 12px floor and 44px minimum touch targets.
- Replace undefined utilities and remove the orange theme colour.

---

## 3. The Manager (operations owner)

**Fine**
- One admin dashboard manages products, categories, sales, analytics, flash deals and solar plans.
- Publication status is explicit (Published / Draft) and changes now reach the public site automatically.
- Solar-plan categories map cleanly to public sections; the admin is the single management point.

**Wrong**
- The live `solar_plans` table was verified empty: no plan had ever been persisted. The manager's "create" action was being rejected at the database layer.
- There are two definitions of "admin": the dashboard trusts a frontend email list, while the database trusts `public.is_admin()` from `admin_users`. A person can log in yet be unable to write.
- No record of *who* changed a plan or product, and when.

**Difficult**
- Onboarding a new administrator requires a database change, not a dashboard action.
- Understanding why a newly created plan is invisible required developer investigation.

**Missing**
- Draft → review → publish workflow with approval.
- Change log / audit trail, bulk import, scheduled publishing.
- A short "how to publish a solar plan" SOP for staff.

**Do next**
- Run `SOLAR_PLANS_SETUP.sql` once and keep `admin_users` in sync with staff emails.
- Use the new "Load example plans" action only for demos, never as the publishing path.
- Add an admin audit table and a one-page publishing SOP.

---

## 4. The Sales Person (conversion-focused)

**Fine**
- WhatsApp quote links are present on every plan card and details page; phone CTA is on the details page.
- The energy calculator is an excellent consultative selling tool.
- Category grouping supports a natural upsell path: Basic → Standard → Premium → Residential → Commercial.
- "Best for", "Can power" and "Backup time" answer the questions buyers actually ask.

**Wrong**
- Prices marked "Request a quote" depend on staff replying quickly on WhatsApp; there is no lead record if the chat is missed.
- Farm Coming Soon removes a whole cross-sell category from the conversation.
- No structured way to capture a lead's name, location, load requirement and budget before the chat starts.

**Difficult**
- Building a custom or commercial quote currently means going back to the admin form.
- Explaining differences between five plans without a comparison table.

**Missing**
- Lead capture form with follow-up reminders (a simple CRM).
- Downloadable/PDF quotation, plan comparison table, financing or instalment messaging.
- Upsell prompts on the calculator results.

**Do next**
- Add a "Get a written quote" form that stores name, phone, plan and load notes.
- Add a compare-plans table and a shareable quote summary.
- Train sales staff on the new category sections and details-page CTAs.

---

## 5. The Auditor (risk, control, evidence)

**Fine**
- Row-level security exists on catalog tables, security headers are configured in `vercel.json`, SEO structured data and sitemap are present.
- There is an ErrorBoundary, typed stores, smoke tests, lifecycle tests, and a build verification script.
- Failed plan writes now surface explicit messages (`42501`, `42703`) instead of being swallowed.

**Wrong**
- The production database had zero plan rows despite admin activity — a control failure with direct commercial impact.
- RLS policy drift: multiple SQL files define overlapping, sometimes permissive, policies (`anon can insert/update/delete solar plans` in `FIX_DATABASE.sql` vs admin-only policies elsewhere). The canonical migration now drops all of them.
- Documentation asserts compliance ("touch-friendly 48px", "tested") that the code did not satisfy.
- Admin actions have no immutable audit trail; there is no evidence of who published or unpublished a plan.

**Difficult**
- Reconstructing the history of a price or image change.
- Demonstrating that configuration matches documentation without reading source.

**Missing**
- Migration runbook with verification queries.
- Alerting on failed database writes and realtime disconnects.
- Admin action log, privacy/terms pages, and a single canonical configuration source for contact details.

**Do next**
- Run the canonical migration, then verify with: `select count(*) from solar_plans;` and an admin-role insert test.
- Add an `admin_audit_log` table and write an entry for every create/update/delete/publish.
- Reconcile documentation and configuration; add monitoring for write failures.

---

## 6. The Designer (visual craft and consistency)

**Fine**
- Strong, restrained brand palette; serif headings; generous whitespace; consistent card shell between products and plans.
- Fixed 4:5 image ratios and two-line title clamps keep grids visually aligned.
- The Farm Coming Soon page is clean, uncluttered and brand-consistent, with an honest message and one primary CTA.

**Wrong**
- `theme-color` orange clashes with navy/gold; several undefined utility classes produce missing or inconsistent styling.
- 9–11px uppercase labels with wide tracking are hard to read on phones.
- Icon-only admin buttons were 28–32px, below touch guidelines (now raised to 40–44px).
- The calculator's hand-rolled tooltips were hover-only and could be clipped.

**Difficult**
- Very long plan names and multi-line prices inside narrow cards.
- Six-column bottom navigation leaves very little width per label (labels are now 10px and truncated with accessible names).

**Missing**
- A real farm/agriculture image asset in the project (the page currently uses a remote image with a graceful fallback).
- Documented component states and a spacing/type token sheet.

**Do next**
- Replace the orange theme colour, define all utility classes used, adopt a 12px type floor.
- Add a local farm image and document the card/grid specs so product and plan cards cannot drift apart.

---

## 7. The Developer (maintainability and velocity)

**Fine**
- Vite + React + TypeScript, Zustand stores, lazy-loaded routes, shared Radix primitives.
- Typecheck, lint, build verification and Vitest suites are scripted and pass.
- Realtime subscription pattern already existed for products and is now mirrored for solar plans.

**Wrong**
- The database was treated as an afterthought: the code and schema drifted until writes failed. The canonical schema now exists, but the project still contains four overlapping SQL files.
- Two category concepts share similar names (`solarCategoryStore` for product categories vs `SOLAR_PLAN_CATEGORIES` for plan categories) — easy to confuse.
- `mapRowToPlan` depends on a JSONB `features` bag; there is no runtime validation of database rows.
- The admin auth fallback means the UI and the database disagree about who is an admin.

**Difficult**
- Onboarding: 20+ markdown files describe an idealised system that does not match the code.
- Debugging data issues without an audit log or a single documented schema.

**Missing**
- Zod validation at the data boundary, a single canonical SQL migration, Playwright E2E tests, CI, Storybook.
- A short ARCHITECTURE-NOW document describing the actual current system.

**Do next**
- Consolidate SQL files into one canonical migration; validate rows with Zod.
- Add E2E tests for the admin→public lifecycle and CI on every PR.
- Write a current architecture note and delete or archive stale docs.

---

## 8. The Investor (value, risk, scalability)

**Fine**
- A functioning marketplace with 122 catalogued products, a differentiated solar-plan vertical, admin tooling and SEO foundations.
- Mobile-first architecture and code splitting keep infrastructure costs low.
- New plan changes propagate automatically, reducing manual operations cost.

**Wrong**
- The core solar revenue pipeline was effectively inert: the plan table was empty and admin writes were blocked. That is a go-to-market risk, not a cosmetic bug.
- Farm, a promised vertical, is not ready and is now honestly gated behind Coming Soon.
- Checkout ends in WhatsApp, so conversion and revenue are not instrumented end to end.

**Difficult**
- Measuring retention, repeat purchase and true unit economics without customer accounts or a first-party checkout.
- Forecasting solar demand without reliable plan and lead data.

**Missing**
- KPI layer (GMV, conversion rate, AOV, repeat rate, quote-to-order rate).
- In-site payments, CRM, lead attribution, and a dated roadmap for the Farm vertical.

**Do next**
- Treat data integrity as the first milestone: run the migration, verify writes, populate real plans.
- Instrument funnel analytics and add a first-party checkout while keeping WhatsApp-assisted sales.
- Publish a realistic roadmap with a Farm launch date and KPI targets.

---

## Cross-cutting actions agreed by all eight views

| Priority | Action | Owner |
|---|---|---|
| P0 | Run `SOLAR_PLANS_SETUP.sql` in Supabase and sync `admin_users` | Ops / developer |
| P0 | Publish real solar plans through the admin and verify on `/solar` | Manager |
| P0 | Keep the Farm Coming Soon page until the catalogue is ready | Manager |
| P1 | Adopt the responsive rules already applied (2-col mobile grids, stacked filters, scrollable modals, 44px targets, 12px+ text) | Designer / developer |
| P1 | Add audit logging and write-failure alerting | Developer |
| P1 | Add lead capture and plan comparison | Sales / product |
| P2 | Reconcile documentation and configuration (contact data, theme colour) | Manager / developer |
| P2 | Add E2E tests and CI | Developer |

**Verification evidence:** `npm run typecheck`, `npm test` (26/26), `npm run build`, plus browser DOM checks of the Farm page, grouped plan catalogue, plan details route and cart drawer.
