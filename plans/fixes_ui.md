# SWIFT mock — implementation & test plan

Companion to [fixes.md](fixes.md). This plan turns the reported bugs, additional findings,
and the UI/UX review into concrete edits with a thorough test pass for each.

- **Files touched:** [index.html](../index.html), [mock/app.js](../mock/app.js), [mock/data.js](../mock/data.js)
- **Constraints:** no build step, no backend, no new deps; keep the DEMO ribbon + "sample data" tags; keep the teal brand.
- **How to run while testing:** `python3 -m http.server 5175` in `swiftdemo/`, then open `http://localhost:5175`.
- **Definition of done:** every checkbox below verified in-browser at desktop **and** ~375px mobile width, with zero console errors.

---

## Phase A — Functional blockers

### A1. Triage never shows an outcome  🔴
**Cause:** `renderTriageCards` injects the outcome id with a broken string replace, corrupting the
`data-triage-outcome` value and stripping the card's CSS, so `_showOutcome()` can't match.

**Implementation**
1. In [mock/data.js](../mock/data.js) `triageOutcomes`, give each outcome an explicit `key` (e.g. `walkin`, `book`, `call000`).
2. In [mock/app.js](../mock/app.js) `triageOutcomeTemplate(o)`, render the attribute directly on the card:
   `<div class="triage-card hidden …" data-triage-outcome="${escapeHTML(o.key)}">`.
3. Delete the `.replace('class="triage-card hidden', …)` line in `renderTriageCards`; just join the outcome templates.
4. Confirm `_showOutcome(key)` and `answer()` still reference the same keys used in `triageQuestions[].options[].outcome`.

**Tests**
- [ ] Path A: Yes → No → *Injury* → **"Walk in now"** card renders, styled, with working "Get directions" CTA.
- [ ] Path B: Yes → No → *Planned therapy* → **"Book an appointment"** → CTA opens booking modal.
- [ ] Path C: *No* (under 3 months) → **"Call 000 now"**.
- [ ] Path D: Yes → *Yes* (life-threatening) → **"Call 000 now"**.
- [ ] "Start over" from a question **and** from an outcome returns to the intro card.
- [ ] Only one triage card is visible at any step (no stacking); no console errors.

---

## Phase B — Headline feature: campaign preview

### B1. Preview switch looks like it does nothing  🔴 (UX)
**Cause:** switching updates the hero at the top while the control sits at the bottom (off-screen);
labels are cryptic eyebrow fragments; no confirmation.

**Implementation**
1. In [mock/app.js](../mock/app.js) `SWIFT.campaign.setPreview(id)`: after `apply(id)`, smooth-scroll to the hero
   (`document.getElementById('home')?.scrollIntoView({behavior:'smooth'})`) and fire `SWIFT.ui.toast('Previewing: <name>')`.
2. Add a human `label` to each campaign in [mock/data.js](../mock/data.js) `campaigns` (Default / Flu / Sports / Infusion / Kids)
   and use it in `_renderSwitcher` instead of `eyebrow.split("·")[0]`.
3. Ensure the active item keeps its highlighted state after selection.

**Tests**
- [ ] From the footer, open **Preview campaign** → pick each of Default/Flu/Sports/Infusion/Kids.
- [ ] Page scrolls to hero; headline, eyebrow, sub, primary+secondary CTA, ribbon, and highlighted service all update per campaign.
- [ ] Toast confirms the selection; active item is highlighted in the list.
- [ ] URL params still work and match the switcher: `?utm_campaign=flu`, `?campaign=sports`, `?c=infusion`, `#kids`.
- [ ] Ribbon "See all services" resets to Default hero and clears the highlight.

### B2. Campaign persistence sanity  🟡
**Implementation:** confirm precedence in `campaign.init` stays **URL > sessionStorage > default**; verify `reset()` clears `swiftCampaign`.

**Tests**
- [ ] Select Sports via switcher → soft-navigate (hash change) → still Sports (session).
- [ ] Full reload with no params → Default. `reset()` clears session and restores Default.

---

## Phase C — Content & mobile-friendliness

### C1. "What to expect / What to bring" interactive + visual  🟡
**Cause:** plain text accordions; several `bringItems` have no `body` (empty on expand).

**Implementation**
1. In [mock/data.js](../mock/data.js), give **every** `journeySteps` and `bringItems` entry an `icon` and a non-empty `body`.
2. In [mock/app.js](../mock/app.js) `renderAccordion`, render the icon next to the title; for the journey, render a numbered
   visual stepper (1–5) with large tap targets; keep it collapsible on mobile.
3. Optional: make "What to bring" a checkable list (tap to tick) — state in memory only.

**Tests**
- [ ] No accordion expands to an empty panel; each shows icon + body text.
- [ ] Journey reads as a clear 1→5 sequence on mobile; taps toggle correctly; targets ≥44px.
- [ ] Layout holds at 375px (no overflow/clipping).

---

## Phase D — UI/UX flow (aligns to spec: shorter scroll, clearer nav)

### D1. Reorder sections to match the decision flow
**Implementation (reorder markup in [index.html](../index.html)):**
Hero → Trust → Intent → **Triage** → **Wait times** → **Pricing** → Services → Check-in/Booking →
Doctors → What to expect/bring → Amenities → Location → Results/Referrals → Footer.
Update in-page anchors after moving sections.

**Tests**
- [ ] Visual order matches the target; all anchor links and the campaign highlight still resolve.
- [ ] No duplicate `id`s; no broken `#…` links (click each nav item).

### D2. Navigation: expose key tasks + mobile action bar
**Implementation:**
1. Add nav/quick-links for **Check-in · Wait times · Pricing · Book** (desktop nav + mobile menu).
2. Add a sticky bottom action bar on mobile: **Call · Directions · Book** (thumb zone), hidden on desktop.
3. Add a persistent live-wait chip in the header/hero that reflects `D.waitTimes.swiftCurrentMins`.

**Tests**
- [ ] Every new nav item scrolls to the right section on desktop and mobile.
- [ ] Mobile bottom bar visible ≤ `sm`, hidden on desktop, doesn't overlap the chat FAB or campaign control.
- [ ] Wait chip matches the Live Wait Times value and updates after **Refresh**.

### D3. Reduce CTA competition
**Implementation:** one primary (solid teal) action per section; downgrade the rest to secondary/ghost styling.

**Tests**
- [ ] Each viewport has a single obvious primary action; visual hierarchy reads clearly at a glance.

---

## Phase E — Polish

### E1. Wait-time jitter clamping  🟡
**Implementation:** in `refreshWaitTimes`, jitter around each hospital's **baseline** (store original `mins`) within a sane band
(e.g. ±20%, floor per site) instead of an unbounded random walk.

**Tests**
- [ ] Hit Refresh 15× — values stay realistic (SWIFT ~8–20; hospitals within plausible ranges); timestamp shows "just now".

### E2. Accessibility QA  🟡
**Implementation:** verify `a11y` large-text / high-contrast / language toggles apply + persist (localStorage); ensure focus states and one semantic `<h1>`.

**Tests**
- [ ] Toggle large text / contrast → visible change, persists across reload.
- [ ] Language toggle swaps `data-i18n` strings; untranslated copy falls back to English.
- [ ] Keyboard: Tab reaches nav, forms, modals; visible focus ring; Esc closes modals.

### E3. Icon style (optional, brand polish)
**Implementation:** swap key emoji for a consistent inline-SVG line-icon set (hero/services/amenities). Defer if time-boxed.

**Tests**
- [ ] Icons render consistently across browsers; no layout shift.

---

## Phase F — Professional imagery (replace emojis with stock images)  🔴

Client wants a professional/medical feel; emoji read informal.

**Implementation**
1. Add an `image` field per Service, Doctor, and Promotion in [mock/data.js](../mock/data.js); render
   `<img loading="lazy" alt="…">` (photos: hero, services, doctors, promotions). Source free-license
   stock (Unsplash/Pexels) via hosted URLs or a new `assets/img/` folder.
2. Replace small emoji affordances (amenities, journey steps, quick-info, contact) with one consistent
   inline-SVG line-icon set via an icon map in [mock/app.js](../mock/app.js) (teal `currentColor`).
3. Doctors: label headshots "representative" for the demo; add graceful image fallback.

**Tests**
- [ ] Every service/doctor/promo shows a relevant image with real `alt`; lazy-loads; fallback works if a URL fails.
- [ ] Amenities/steps/quick-info use consistent SVG icons (no emoji); crisp on retina; no layout shift.
- [ ] Mobile 375px: images scale, don't blow up the scroll; "sample imagery" note present for demo.

---

## Phase G — Aggressive scroll reduction (page still feels long)  🔴

Reordering wasn't enough — **collapse** secondary content into compact, tabbed/accordion components.

**Implementation**
1. **"Before you visit" hub** — merge Triage, Pricing estimator, What-to-expect, What-to-bring, and
   Amenities into ONE section with tabs (desktop) / accordion (mobile). Replaces ~5 tall sections with one.
2. **"Get care" band** — Check-in + "Can we treat this?" + Book as a 3-tab card near the top.
3. **Tighten rhythm** — section padding `py-16` → `py-10 sm:py-12`; cap hero ~80vh; trim oversized mobile headings/gaps.
4. **Two-column desktop** for paired sections (Location + Enquiry; Doctors + Trust).
5. **Compact lists** — Doctors → 3-up row / horizontal scroll; Promotions/Amenities → slim strips.
6. **"More" disclosure** — move Results portal + Referrals behind a toggle or into the footer.
7. **Sticky "jump to" chip bar** so info is reachable without scrolling.

**Tests**
- [ ] Primary journey (hero → trust → get care → wait → pricing) fits ~3–4 mobile viewports.
- [ ] Tabs/accordion switch correctly; only active panel visible; keyboard + screen-reader friendly.
- [ ] All moved anchors/nav links still resolve; no duplicate `id`s; campaign highlight still works.
- [ ] Total page height measurably shorter at 375px (spot-check scroll length before/after).

---

## Phase H — Campaign-driven dynamic sections  🔴

When a campaign is active (URL param or preview), the **whole page adapts**, not just the hero — and the
campaign landing becomes short + focused (reinforces Phase G).

**Data (per campaign in [mock/data.js](../mock/data.js) `campaigns`)** — extend each entry with:
- `services`: ordered list (or filter) of service names to feature first;
- `promoId`/`promoFilter`: which promotion(s) to show;
- `intentsOrder`: order/priority of the "What do you need" cards;
- `triagePreset`: an outcome/first-question hint to steer the triage;
- `pricingPreset`: default estimator answers or highlighted scenario;
- `bookingService` / `checkinService`: pre-selected service;
- `showSections` / `hideSections`: which sections to keep vs collapse for this campaign;
- optional `amenityHighlight`, `copy` overrides (e.g. section subtitles).
- (`default` keeps today's full, unfiltered content.)

**Implementation (extend `SWIFT.campaign.apply(id)` in [mock/app.js](../mock/app.js))**
1. **Services** — re-render ordered by campaign (feature the relevant service(s) first; optionally show
   "See all services" to reveal the rest) in addition to the existing ring highlight.
2. **Promotions** — filter to the campaign's promo(s).
3. **Intent router** — reorder cards so the campaign's intent leads.
4. **Booking + Check-in** — pre-select the campaign service in both selects.
5. **Triage** — apply `triagePreset` (e.g. jump toward the relevant outcome / preselect category).
6. **Pricing** — apply `pricingPreset` (prefill selects or highlight the relevant scenario).
7. **Section visibility** — apply `showSections`/`hideSections` to collapse irrelevant sections for a
   focused, shorter campaign landing; **`reset()` restores full default order/content**.
8. Keep everything data-driven and null-safe so `default` and unknown campaigns behave exactly as now.

### Modularity & maintainability (add a campaign = data only; removing must never break)
Design rules so a new campaign is one data object and removing one is safe:
1. **Registry, not scattered config** — campaigns live in one keyed map `campaigns[id]` in
   [mock/data.js](../mock/data.js). Adding a campaign = add one self-contained object; **no code change**.
2. **Merge over `default`** — `resolve(id) = { ...campaigns.default, ...campaigns[id] }`. Omitted fields
   inherit the default; an **unknown/removed id resolves to `default`** (fail-open, non-breaking).
3. **Reference items by `id`, resolve null-safe** — campaign `services`/`promoId`/etc. point at existing
   `service.id` / `promo.id`. Missing ids are filtered out with a dev-only `console.warn`, never a throw —
   so deleting a service/promo can't crash a campaign.
4. **`apply()` pure & idempotent from baseline** — every `apply()` first resets the page to the default
   state, then layers the resolved campaign (never diff-from-previous). `reset()` is just `apply('default')`.
   This is what makes switching **and** removing campaigns clean and residue-free.
5. **Derive UI from the registry** — the preview switcher, `campaignPreviewOrder`, and URL/`utm` handling
   all read `Object.keys(campaigns)`. A new campaign auto-appears; a removed one auto-disappears. No
   parallel list to maintain.
6. **Section-adapter pattern** — instead of per-campaign DOM code, register a fixed list of adapters
   (`services`, `promos`, `intents`, `booking`, `triage`, `pricing`, `visibility`). Each reads exactly one
   campaign field and **no-ops when absent**. Adding a new *kind* of personalization = one adapter;
   adding a campaign = still just data.
7. **Dev-only validation on init** — walk each campaign's referenced ids and `console.warn` on dangling
   refs; catches typos when authoring a new campaign without affecting production behaviour.

**Add-a-campaign checklist:** add one object to `campaigns` (+ optional image) → done.
**Remove-a-campaign checklist:** delete the object → references fall back to `default`, switcher drops it,
any stale URL/sessionStorage id resolves to `default`.

**Maintainability tests**
- [ ] Adding a campaign object (no JS changes) makes it appear in the switcher and work end-to-end.
- [ ] Deleting a campaign object: switcher drops it; a saved/URL id for it falls back to `default`; no errors.
- [ ] A campaign referencing a non-existent service/promo id logs a dev warning and skips it (no crash).
- [ ] Rapidly switching campaigns A→B→default leaves no residue (state equals a fresh load of each).

**Tests (per campaign: flu / sports / infusion / kids)**
- [ ] Featured service(s) appear first; correct promo(s) shown; intent card order matches campaign.
- [ ] Booking modal + Check-in open with the campaign service pre-selected.
- [ ] Triage/pricing reflect the preset; still fully usable (can change answers).
- [ ] Hidden sections are collapsed and the campaign landing is noticeably shorter; nav still resolves.
- [ ] `See all services` / ribbon **reset** restores the full default page (order, promos, sections).
- [ ] URL param and the preview switcher produce identical results; no console errors.

---

## Phase I — AI features (all mocked, in-browser)  🔴

The mock is currently rule-based (scripted chat, decision-tree triage). Add AI-flavoured surfaces that
run entirely client-side against `SWIFT_DATA` — no backend, clear "not medical advice" disclaimers.

### I1. AI symptom checker (hero AI moment)
**Implementation:** natural-language box ("describe your symptoms") that maps keywords → a mocked
recommendation (walk-in / book / call 000) with a typing indicator; reuses the triage outcome cards.
Upgrades the existing button-based triage into a conversational entry point.
**Tests**
- [ ] Typical inputs ("chest pain", "sprained ankle", "fever") return a sensible mocked outcome + disclaimer.
- [ ] Emergency keywords route to **call 000**; empty/gibberish input handled gracefully.

### I2. Grounded AI concierge (replace scripted FAB)
**Implementation:** mocked assistant answering hours / pricing / services / location by reading `SWIFT_DATA`
(so replies look intelligent and stay accurate); keep scripted fallbacks for unknowns.
**Tests**
- [ ] "Are you open now?", "How much for X?", "Do you treat sprains?" return data-grounded answers.
- [ ] Unknown questions fall back politely; no console errors; "AI demo" label present.

### I3. AI wait-time prediction (reframe existing chip)
**Implementation:** relabel the wait chip as "AI-predicted wait ~N min, trending ↑/↓" with a mini sparkline;
still uses the mocked/clamped values from Phase E1.
**Tests**
- [ ] Chip shows a trend + sparkline; value matches Live Wait Times; updates on Refresh.

### I4. "AI picked this for you" (ties to Phase H)
**Implementation:** when a campaign is active, show a mocked recommendation badge on the featured
service/promo.
**Tests**
- [ ] Badge appears only when a campaign is active and clears on reset.

### I5. SEO-for-AI (real, from [spec.md](../spec.md))
**Implementation:** add JSON-LD structured data (`MedicalClinic` + hours/geo/services, and `FAQPage`) plus
a short FAQ section so AI answer-engines can cite the clinic.
**Tests**
- [ ] JSON-LD validates (Rich Results / schema.org); FAQ renders; values match `SWIFT_DATA`.

> All AI copy must carry a visible "AI assistant — not medical advice; call 000 in an emergency" disclaimer.

---

## Phase J — Post-consolidation fixes (Phase F/G regressions)  🔴

Phases **F (imagery)** and **G (scroll reduction)** are implemented, but the tabbed-hub consolidation
introduced regressions found in the `localhost:5176` review. Full root causes in
[fixes.md](fixes.md) → **New bugs**.

### J1. Deep-link anchors land on hidden tab panels  🔴
**Cause:** `#pricing` (and `#journey`, `#amenities`) ids sit on hidden `data-panel`s inside
`#beforeYouVisit`, so nav/deep links scroll to invisible content.
**Implementation**
1. Add a global handler: on `hashchange`/load, if the hash matches a `[data-panel]` id, call
   `SWIFT.ui.openTab(panelId)` on its `[data-tabs-root]`, then scroll the section into view.
2. Point nav **Pricing** at `#beforeYouVisit` + `openTab('pricingPanel')` (not the hidden `#pricing`).
**Tests**
- [ ] Nav Pricing/What-to-expect/Practical each open the correct tab and are visible after click.
- [ ] Direct URL `…/#pricing` (fresh load) opens the Pricing tab, not a blank scroll target.

### J2. `#location` dead on desktop  🔴
**Cause:** `<section id="location" … lg:hidden>`; desktop location card in `#contact` has no id.
**Implementation:** move `id="location"` onto the desktop contact location card (single canonical
anchor), or retarget nav **Location** to `#contact` on `lg`. Ensure only one `id="location"` exists.
**Tests**
- [ ] Nav Location scrolls to a **visible** location block on desktop **and** mobile; no duplicate ids.

### J3. Remove duplicated triage from the Get-care band  🔴
**Implementation:** delete the **"Can we treat this?"** tab + panel from `#getCare` (leave Check-in +
Book online). Triage stays only in `#beforeYouVisit`.
**Tests**
- [ ] Get-care band shows exactly two tabs; triage appears once on the page; no dead tab controls.

### J4. "Reserve my spot" opens the wrong tab  🟡
**Implementation:** in the Get-care Check-in CTA, remove `SWIFT.ui.openTab('pricing')`; just
`scrollIntoView` to `#checkinForm`.
**Tests**
- [ ] Clicking Reserve my spot scrolls to the check-in form and does **not** flip the hub to Pricing.

### J5. Doctors + "Why choose us" alignment  🔴
**Implementation:** even the doctors grid (3-up on `lg`, or fill the empty cell), keep `items-start`,
and size the trust aside to align with the grid's top edge.
**Tests**
- [ ] At `lg`, doctor cards and the aside top-align; no orphaned empty cell; holds at 1280/1440px.

### J6. De-duplicate trust stats  🟡
**Implementation:** render the numeric trust bar once (keep `#trust` near the hero); convert the
Doctors `trustAside` to qualitative "Why choose SWIFT" points and drop `trustMobile` if it repeats
`#trust`.
**Tests**
- [ ] The four numbers appear once per viewport; Doctors aside reads as differentiators, not a repeat.

### J7. Get-care band = launcher only (optional)  🟢
**Implementation:** ensure the band only *links* to existing sections/modal without repeating their
headings; or remove it if it adds no shortcut value.
**Tests**
- [ ] No section heading is shown twice; band clearly acts as a shortcut.

---

## Regression pass (run after all phases)
- [ ] Booking modal: validates empty fields → fills → success/"email sent" state → toast.
- [ ] Online check-in: name+service → queue position + est. wait → cancel restores form.
- [ ] Pricing estimator: each scenario returns a result; "try another" resets.
- [ ] Results portal: `demo`/`demo` logs in → sample table; wrong creds → toast.
- [ ] Enquiry + referral forms → success toast + console log; forms reset.
- [ ] Directions opens Google Maps deep link; chat scripted replies work.
- [ ] Console clean (ignore the known Tailwind-CDN production warning).
- [ ] Full mobile pass at 375px: nav, sticky bar, tables→cards, full-screen sheets, tap targets.

## Suggested execution order
A1 → B1/B2 → C1 → D1 → D2 → D3 → E1 → E2 → **F (imagery ✅) → G (scroll reduction ✅) → J (fix G/F regressions) → H (campaign-driven sections) → I (AI features)** → (E3 optional).
Do **J next** — it repairs broken nav anchors and duplication from the G consolidation before more is layered on.
G and H are complementary — build the tabbed hubs (G) first so H can simply show/hide/reorder within them.
Within I, do **I5 (JSON-LD/FAQ)** early (cheap, real SEO value) and **I1/I2** as the headline AI demo.
Commit per phase so each is independently testable.
