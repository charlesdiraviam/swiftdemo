# SWIFT Demo — Implement plan.md (Phases 3 → 6)

## Context

The SWIFT Emergency & Urgent Care demo (`/Users/charlesdiraviam/swiftdemo/`) is a static, no-build client-facing mock. Phases 1 (scaffold) and 2 (mock data) of `plan.md` are done: `index.html` exists with brand, header, hero, services/doctors/wait/promo containers, location, contact form, footer, chat widget, booking modal, toast. `mock/data.js` exposes `window.SWIFT_DATA` with `clinic`, `services`, `doctors`, `waitTimes`, `promotions`, `chatScript`.

The remaining 22 of 28 plan.md checkboxes need to be implemented. The page currently displays empty `<div id="servicesGrid">`, etc., because `mock/app.js` does not exist — every `onclick` in `index.html` calls a function that's missing, and several Tier 1 / Tier 2 features (trust bar, intent cards, triage, pricing, queue, test results, referrals, accordion, amenities, accessibility, campaign ribbon, sticky CTA, preview switcher) have no markup at all.

The deliverable is a clickable mobile-first demo the client can walk through, with social-campaign landing variants, scripted AI chat, mocked booking/email/NSW Health/Google Maps integrations, and a per-session "preview campaign" switcher. No backend, no build step, no frameworks.

## Critical files

- `/Users/charlesdiraviam/swiftdemo/index.html` — one markup pass to add new section markup, hero IDs, accessibility (`data-i18n`) attributes, and the campaign ribbon / sticky CTA / preview switcher containers.
- `/Users/charlesdiraviam/swiftdemo/mock/data.js` — additive extension of `window.SWIFT_DATA` with `campaigns`, `trustStats`, `intents`, `amenities`, `journeySteps`, `bringItems`, `triageQuestions`, `triageOutcomes`, `pricingScenarios`, `queuePosition`, `testResultsSample`, `translations`, `campaignPreviewOrder`.
- `/Users/charlesdiraviam/swiftdemo/mock/app.js` — created from scratch. Owns all behaviour.
- `/Users/charlesdiraviam/swiftdemo/plan.md` — source of phase ordering and feature scope; `spec.md` is the underlying brief.

## Approach

Single-file vanilla JS in `mock/app.js`, organised under a `window.SWIFT` namespace with sub-namespaces (`render`, `ui`, `forms`, `campaign`, `triage`, `a11y`). One IIFE wrapping everything. All inline `onclick` handlers in `index.html` resolve to `window.*` functions set inside `init()`.

All rendering goes through a small set of generic helpers (`renderCardGrid`, `renderList`, `renderBadgeGrid`, `renderStatGrid`, `renderAccordion`) — each section supplies a pure `templateFn(item) -> string`. All templates escape user-supplied strings via a shared `escapeHTML()` utility. This keeps the ~10 data-driven sections consistent without forking render logic.

Hero swapping uses IDs added during the markup pass (`heroEyebrow`, `heroHeadline`, `heroSubtext`, `heroPrimaryCta`, `heroSecondaryCta`). Campaign application is one `applyCampaign(id)` call that updates textContent + shows/hides ribbon and sticky CTA + adds a highlight ring on the matching service card.

A small action DSL — `{ action: "openBooking" | "openCheckIn" | "scrollTo", service?, target? }` or `{ href: "#anchor" }` — drives every CTA in the campaign/intent systems, resolved by a single `SWIFT.ui.runAction()`.

State that should not leak between client demo sessions (campaign preview override) lives in `sessionStorage`; accessibility preferences persist via `localStorage`.

## Phase 0 — Markup pass (`index.html`, large single edit)

In top-to-bottom order, add to `index.html`:

1. **Hero IDs** — `heroEyebrow`, `heroHeadline`, `heroSubtext`, `heroPrimaryCta`, `heroSecondaryCta` on existing hero elements; wrap the hero wait number in `<span id="heroWaitValue">`.
2. **Campaign ribbon** — `<div id="campaignRibbon" class="hidden ...">` near the top with a "See all services" reset link.
3. **Trust bar** — `<section id="trust">` with `<div id="trustGrid">`.
4. **Intent entry cards** — `<section id="intents">` with `<div id="intentsGrid">`.
5. **Online check-in / queue** — `<section id="checkin">` with a `<form>` for name + service select.
6. **Triage checker** — `<section id="triage">` with intro card and `<div id="triageQuestions">` for question/outcome swap.
7. **Pricing estimator** — `<section id="pricing">` with the radio form and `<div id="pricingResult">`.
8. **What to expect / what to bring accordion** — `<section id="journey">` with `<div id="journeyList">` and `<div id="bringList">`.
9. **Amenities** — `<section id="amenities">` with `<div id="amenitiesGrid">`.
10. **Test results portal** — `<section id="results">` with intro + button opening a results modal (markup inside existing `#bookingModal` pattern, separate ID).
11. **Referrals form** — `<section id="referrals">`.
12. **Accessibility popover** — `<div id="a11yPanel">` linked from a footer button.
13. **Sticky mobile CTA** — `<div id="stickyCta" class="hidden ...">` fixed at bottom.
14. **Campaign preview switcher** — `<div id="campaignSwitcher">` fixed bottom-left, `md+` visible only.
15. **`data-i18n` attributes** — added to all translatable static copy across header, hero, section headings, footer.

## Phase 3 — Foundation (`mock/app.js`)

Create `mock/app.js` and implement in order:

- **3.1** — IIFE skeleton with `SWIFT = { render, ui, forms, campaign, triage, a11y, init }`. `init()` runs on `DOMContentLoaded`, registers all 9 `window.*` handlers, calls every render function.
- **3.2** — `renderServices()` via `renderCardGrid('servicesGrid', D.services, serviceTemplate)`. Each card includes a `data-service="<name>"` attribute (used later for campaign highlight ring) and a "Book this service" button calling `SWIFT.ui.openBooking(name)`.
- **3.3** — `renderDoctors()`.
- **3.4** — `renderWaitTimes()` via `renderList('waitList', ...)`. Updates `#heroWaitValue` from `D.waitTimes.swiftCurrentMins`.
- **3.5** — `renderPromos()`.
- **3.6** — `toggleMobileNav()`.
- **3.7** — `refreshWaitTimes()` with spin animation, ±5 min jitter, timestamp update.
- **3.8** — Booking modal `openBooking(prefillService?)`, `closeBooking()`, `submitBooking(e)`. `openBooking` populates `#bookingService` select from `D.services[].name`.
- **3.9** — `submitEnquiry(e)` — toast + console.log of payload.
- **3.10** — `getDirections()` — opens Google Maps directions URL in new tab using `D.clinic.address`.
- **3.11** — Chat `toggleChat()`, `sendChat(e)` — iterate `D.chatScript` regexes, first match → bot reply; fallback message otherwise.
- **3.12** — Generic helpers (`renderCardGrid`, `renderList`, `renderBadgeGrid`, `renderStatGrid`, `renderAccordion`) + `escapeHTML()` + `SWIFT.ui.toast(msg)` + `SWIFT.ui.runAction(action)`.

## Phase 3b — Campaign landing

- **3b.1** — Append `campaigns` and `campaignPreviewOrder` to `mock/data.js` (shapes per design Q4/Q5: `default`, `flu`, `sports`, `infusion`, `kids`; each with `headlineHTML`, `subtext`, `eyebrow`, `primaryCta`, `secondaryCta`, `highlightService`, `ribbonText`, `stickyCta`).
- **3b.2** — `SWIFT.campaign.readCampaignFromURL()` checks `?utm_campaign=`, `?campaign=`, `?c=`, then `#hash` (first segment), then `sessionStorage.swiftCampaign`. Unknown → `default` with `console.warn`. `applyCampaign(id)` swaps hero text via IDs, sets `body.dataset.campaign`, shows/hides ribbon + sticky CTA, adds `.ring-2 ring-teal-400` on the matching `[data-service]` card.
- **3b.3** — Ribbon "See all services" link calls `resetCampaign()` (clear sessionStorage, `applyCampaign('default')`).
- **3b.4** — Sticky mobile CTA wiring — visible when `body.dataset.campaign !== 'default'` and viewport `< md`; click invokes `stickyCta.action` via `runAction`.
- **3b.5** — Preview switcher floating control; `setPreviewCampaign(id)` updates `sessionStorage.swiftCampaign`, calls `applyCampaign`, highlights active option in the switcher.

## Phase 3c — Tier 1

Append to `data.js`: `trustStats`, `triageQuestions`, `triageOutcomes`, `pricingScenarios`, `queuePosition`, `testResultsSample` (shapes per design Q5).

- **3c.1** — Trust bar via `renderStatGrid('trustGrid', D.trustStats, trustTemplate)`.
- **3c.2** — Queue check-in: `submitQueue(e)` validates name + service, increments in-memory queue, renders a result card with `You're #${n}` and `~${mins} min` estimate, plus "Get directions" and "Cancel my place" buttons.
- **3c.3** — Triage: `SWIFT.triage.start()` initialises state; `SWIFT.triage.answer(option)` follows `next` / `outcome` from the data; renders current question from `D.triageQuestions`, or the outcome card from `D.triageOutcomes[outcome]`. Pre-renders all question cards, toggles `.hidden`. Includes "Start over" link.
- **3c.4** — Pricing: `submitPricing(e)` selects the matching `pricingScenarios.items` entry based on Medicare / private / WorkCover radio combination, renders headline estimate + line-items in `#pricingResult`, with a "Try another scenario" reset.
- **3c.5** — Test results portal: `openResults()` opens modal; `submitResultsLogin(e)` checks `demo` / `demo`, on success renders a stacked-on-mobile table from `D.testResultsSample.results`.

## Phase 3d — Tier 2

Append to `data.js`: `intents`, `amenities`, `journeySteps`, `bringItems`, `translations` (English plus Spanish + Chinese).

- **3d.1** — Intent cards via `renderCardGrid('intentsGrid', D.intents, intentTemplate)`. Each card's button resolves its `action` via `SWIFT.ui.runAction`.
- **3d.2** — Accordion for `journeyList` and `bringList` using native `<details><summary>` (no JS toggle complexity).
- **3d.3** — Amenity badges via `renderBadgeGrid('amenitiesGrid', D.amenities, amenityTemplate)`.
- **3d.4** — Per-service booking already wired in Phase 3.2 (button on each service card). Add referrals section with `submitReferral(e)` mirroring `submitEnquiry`.
- **3d.5** — Accessibility popover: `setLargeText(on)`, `setHighContrast(on)`, `setLanguage(code)`, `restorePrefs()`, `savePrefs()`. Toggles body classes, walks `[data-i18n]` and replaces textContent from `D.translations[code]`. Persists to `localStorage.swiftA11y`. `restorePrefs()` runs in `init()` before first render.

## Phase 4 — Polish

- Mobile QA at 375 px viewport: tap targets ≥ 44 px, hero padding, sticky CTA doesn't overlap chat widget or content.
- Micro-interactions: hover transitions on buttons, focus rings, refresh spin timing.
- Copy pass: replace Lorem / placeholder copy with on-brand realistic clinic copy consistent with `spec.md`.

## Phase 5 — Wow extras (optional)

- **5.1** — `admin.html` with fake visitor charts (use the `dataviz` skill design system; inline SVG; reads a `localStorage` event log that `app.js` writes to on each interaction).
- **5.2** — Mock CMS for promotions: hidden footer link → list existing promos + "Add promo" form that appends to in-memory array and re-renders `#promoGrid`.

## Phase 6 — Present & share

- Walk through the `plan.md` §9 demo script: hero → Book Now → Wait Times (refresh) → Doctor → Directions → Chat ("fees") → Promotions → Enquiry (toast) → campaign URL swap (`?c=flu`).
- Optionally serve via `python3 -m http.server 5173` for clean paths.

## Key patterns reused throughout

- **Generic render helpers + per-section `templateFn`** — single source of truth for grid-fill mechanics.
- **Action DSL + `SWIFT.ui.runAction()`** — every CTA (campaigns, intents, sticky) routes through one resolver.
- **`escapeHTML()`** — every template uses it; no XSS in the demo even though it's static.
- **Body dataset flags** (`data-campaign`, `data-a11y-*`) — CSS-driven theming keeps JS clean.
- **`sessionStorage` for per-session demo state** (campaign preview), **`localStorage` for cross-session prefs** (a11y).
- **Modal pattern reused** for both booking and test results — show/hide via class toggle, reset state on close.

## Verification

End-to-end manual walkthrough in browser:

1. **Static load** — open `index.html` directly; no console errors; services, doctors, wait times, promos all render.
2. **Mobile (375 × 812)** — header nav, booking modal, chat widget all usable; chat replies to "fees" / "wait" / "open" / "book".
3. **Forms** — enquiry shows toast; booking modal flips to success view.
4. **Wait refresh** — spin animates, hospital mins jitter ± 5, timestamp resets to "just now".
5. **Campaign URLs** — `?c=flu`, `?c=sports`, `?c=infusion`, `?c=kids`, `#flu`, `?utm_campaign=flu` each swap hero, show ribbon, highlight matching service, show sticky CTA on mobile.
6. **Preview switcher** — click each campaign; state persists in `sessionStorage`; refresh page resets.
7. **Tier 1** — check-in yields `#3, ~18 min`; triage ends in walk-in / book / call 000 outcome; pricing renders estimate for each radio combination; test results `demo`/`demo` shows sample table; trust bar visible.
8. **Tier 2** — intent cards link correctly; accordion expands; amenity badges show; per-service Book opens modal pre-filled with that service; referrals submits → toast; accessibility toggles (large text, high contrast, language) update DOM and persist across reload.
9. **Reset** — ribbon's "See all services" clears campaign override; each form has a reset path.
10. **Optional server** — `python3 -m http.server 5173` confirms `mock/data.js` and `mock/app.js` still load via relative paths.

No automated tests are in scope (one-shot demo).
