# SWIFT mock — bug list & fixes

Reviewed live at `localhost:5175` + traced to source in [mock/app.js](../mock/app.js) and [mock/data.js](../mock/data.js).

## Status (as of latest review)

**Implemented ✅** (verified in code + live): triage now ends with an outcome (#1); "what to
expect / what to bring" is a numbered stepper with icons + bodies (#2); campaign preview
scrolls to hero, shows a toast, and uses readable campaign names (#3); wait-time jitter now
clamps around a per-hospital baseline (#5); section order redone; header live-wait chip +
mobile action bar + quick-nav (Check-in / Wait / Pricing) added.

**Still open (new priorities):**
- **P1 — Scroll length: DONE (Phase G).** Collapsed into a tabbed "Get care" band + "Before you
  visit" hub. ⚠️ The consolidation introduced anchor / duplication / alignment regressions — see
  **New bugs** at the bottom.
- **P1 — Imagery: mostly DONE (Phase F).** Stock photos added for services/doctors/promotions with
  an Unsplash attribution ribbon; small affordances are now inline SVG. Remaining: one smiley-style
  icon still reads as an emoji (New bug 1).
- **P1 — Campaign-driven dynamic sections:** when a campaign is active (URL param or preview), the
  whole page should adapt — feature the relevant service(s), filter promotions, reorder intent cards,
  pre-select booking/check-in, steer triage/pricing, and collapse irrelevant sections so the campaign
  landing is short and focused. Details in [fixes_ui.md](fixes_ui.md) **Phase H**.
- **P1 — AI features (mocked):** the mock has no AI surface yet (chat/triage are rule-based). Add an AI
  symptom checker, a grounded AI concierge (answers from `SWIFT_DATA`), AI-predicted wait times, an
  "AI picked this" campaign badge, and real SEO-for-AI (JSON-LD + FAQ per [spec.md](../spec.md)). All
  client-side with "not medical advice" disclaimers. Details in [fixes_ui.md](fixes_ui.md) **Phase I**.
- **P2 — Campaign persistence:** a clean-URL visit still shows the last previewed campaign
  (sessionStorage). Fresh loads should default unless a UTM/param is present (#4).
- **P3 — Minor:** booking date is free text (#6); two pricing scenarios share the same figure (#7);
  a11y toggles need a QA pass (#8); Tailwind CDN prod warning (#9).
- **Note:** automated click on "Start triage" reported *element not stable* — check for a
  perpetual CSS animation (e.g. `animate-pulse`/`animate-ping`) that never settles; harmless
  functionally but worth removing for polish/performance.

---

## P1 — Long scroll: collapse, don't just reorder

The page is ~17 stacked full-bleed sections; on mobile this re-creates the client's original
"too long to scroll" complaint. Plan:

1. **Consolidate the "before you visit" content into ONE tabbed hub.** Merge Triage, Pricing
   estimator, What-to-expect, What-to-bring, and Amenities into a single section with tabs
   (or an accordion on mobile). Replaces ~5 tall sections with one compact component.
2. **Turn "Get care" actions into a compact band.** Put Online check-in + "Can we treat this?"
   + Book behind a 3-tab card near the top instead of three separate sections.
3. **Tighten vertical rhythm.** Drop section padding from `py-16` → `py-10` (`sm:py-12`), cap
   the hero to ~80vh, reduce large empty gaps and oversized headings on mobile.
4. **Two-column on desktop** for naturally paired sections (Location + Enquiry; Doctors + Trust)
   so they don't stack into extra height.
5. **Collapse long lists.** Doctors → compact 3-up row (or horizontal scroll on mobile);
   Promotions/Amenities → slim strips.
6. **Move rarely-used sections behind a "More" disclosure** (Results portal, Referrals) or into
   the footer, so the primary path (wait → triage → pricing → book) is short.
7. **Add a sticky "jump to" chip bar** so people reach info without scrolling.

**Target:** primary journey (hero → trust → get care → wait → pricing) fits in ~3–4 mobile
viewports; everything else is one tap away.

---

## P1 — Imagery: replace emojis with stock images

Client wants a professional/medical feel; emoji icons read informal and render inconsistently.

- **Photos (stock) for content blocks:** hero background, each Service card, Doctors (representative
  headshots, clearly labelled "representative" for the demo), Promotions.
  - Source: free-license stock (Unsplash/Pexels). For a no-build mock, reference hosted URLs
    (e.g. Unsplash) or drop curated files in a new `assets/img/` folder; add a `image` field per
    item in [mock/data.js](../mock/data.js) and render `<img loading="lazy" alt="…">`.
- **Line icons (SVG) for small affordances:** amenities, journey steps, quick-info cards, contact.
  Use one consistent inline-SVG set (e.g. Lucide/Heroicons) via a small icon map in
  [mock/app.js](../mock/app.js) instead of emoji — sharper and on-brand (teal `currentColor`).
- **Rules:** always set `alt` text; lazy-load; provide a neutral fallback if an image fails;
  keep a "sample imagery" note for the demo; verify licence/attribution before client hand-off.

---

## Reported bugs (confirmed + root cause)

### 1. Broken triage flow — never ends with an outcome  🔴 confirmed
- **Repro:** Triage → Start → answer all 3 (e.g. Yes → No → Injury). Final question card disappears and **nothing renders** — dead end.
- **Root cause:** in `SWIFT.render.renderTriageCards` the outcome id is injected by a string replace:
  ```js
  t.replace('class="triage-card hidden', `class="triage-card hidden" data-triage-outcome="${k}`)
  ```
  This closes the `class` attribute early and folds every styling class into the attribute value, producing
  `data-triage-outcome="walkin bg-white border-2 … text-center"`. So `_showOutcome('walkin')`'s selector
  `[data-triage-outcome="walkin"]` never matches (and the outcome card also loses all its CSS).
- **Fix:** add `data-triage-outcome` inside `triageOutcomeTemplate` directly (e.g. `<div class="triage-card hidden …" data-triage-outcome="${escapeHTML(o.key)}">`) and drop the `.replace`. Give each outcome a `key`/`id` in `D.triageOutcomes`.

### 2. "What to expect / What to bring" should be interactive + visual for mobile  🟡 enhancement
- Currently plain text `<details>` accordions rendered by `renderAccordion`.
- Several `D.bringItems` have **no `body`**, so expanding shows an empty panel (looks broken).
- **Fix:** give every item a body; add an icon/emoji (or small image) per step; consider a numbered visual stepper for the journey and a checkable "what to bring" list. Ensure large tap targets.

### 3. "Preview campaign" appears to do nothing  🔴 confirmed (UX) — actually works but invisible
- **Finding:** selecting a campaign *does* update the hero headline/eyebrow/CTAs, show the ribbon and highlight the service (verified switching to Sports). It only *looks* dead because:
  1. The switcher is a floating control at the **bottom** of the page, but the change happens in the **hero at the very top** — off-screen, so nothing appears to happen.
  2. Option labels come from `c.eyebrow.split("·")[0]` → cryptic ("Walk-in", "Seen fast", "By appointment"); users can't tell which campaign is which.
  3. No confirmation (toast) on select.
- **Fix:** on `setPreview`, smooth-scroll to `#home` (or the hero) and/or fire a toast; label switcher items by campaign name (Default / Flu / Sports / Infusion / Kids) instead of the eyebrow fragment.

## Additional findings

### 4. Campaign choice sticks via `sessionStorage`  🟡
- `setPreview` writes `swiftCampaign` and it persists for the tab, so later in-tab navigation keeps the campaign. The ribbon "See all services" resets it, but a tester may be surprised. Consider clearing on full reload, or make the reset more prominent.

### 5. Wait-time jitter random-walks with no re-centering  🟡 polish
- `refreshWaitTimes` applies ±5 (hospitals) / ±3 (SWIFT) each refresh with no pull back to a baseline, so repeated refreshes drift to unrealistic values (hospitals → 0, SWIFT stuck near its floor of 5). Clamp to a plausible per-hospital range or jitter around each hospital's baseline.

### 6. Booking "date" field is free text  🟢 minor
- `submitBooking` reads `form.elements[3].value` as `date`, but the 4th modal field is a plain textbox. Fine for a mock; use a real date/time input if the client expects a picker.

### 7. Pricing scenarios show duplicate output  🟢 minor
- "Insured (Medicare + private)" and "Medicare only" both estimate **$355** in `D.pricingScenarios`. Confirm intended, or differentiate the insured figure.

### 8. Accessibility toggles — verify + surface  🟡
- Large-text / high-contrast / language toggles exist (`SWIFT.a11y.*`) behind the footer "♿ Accessibility" button. Needs a QA pass: confirm each toggle applies, persists (localStorage), and that `data-i18n` strings actually cover visible copy (translations map is small, so most text stays English).

### 9. Tailwind via CDN  🟢 expected for demo
- Console warns `cdn.tailwindcss.com should not be used in production`. Fine for the showcase; note a compiled Tailwind build for any real deployment.

## Suggested fix order
1. Triage outcome (#1) — functional blocker.
2. Preview campaign scroll + labels (#3) — headline feature looks broken.
3. What to expect/bring content + visuals (#2, and empty bodies).
4. Polish: wait-time clamping (#5), a11y QA (#8), sessionStorage reset (#4).

---

## UI/UX review — flow & look vs. the brief

Measured against [spec.md](../spec.md). Overall: **strong, modern, on-brand** and a big step up from the current site — but two of the client's *original complaints* (too long to scroll, non-intuitive navigation) are partially re-created and need attention.

### Aligns well with the brief ✅
- **Brand kept:** teal palette + logo retained throughout; consistent rounded-card system, generous whitespace — reads "medical" and modern, not the current busy layout.
- **Patient-centric, not ad-like:** trust bar (rating / median wait / patients treated), intent router ("What do you need today?"), triage, and transparent pricing all lead with patient needs rather than marketing. Good.
- **Less verbose:** copy is tight and scannable vs. the current wordy site.
- **Mobile-first intent:** hamburger nav, `sm:` breakpoints, stacked cards, full-width CTAs, sticky campaign CTA — the building blocks are right.
- **Required integrations present (mocked):** enquiry email, NSW-Health-style wait widget, Google Maps directions, social/campaign landing — all represented.

### Gaps vs. expectations ⚠️
1. **"Too long to scroll" is re-emerging.** The page is ~17–20 stacked sections in one scroll. On mobile this reproduces the exact complaint from the brief. → Introduce a clear information hierarchy: a compact hero + primary actions, then group secondary content behind tabs/anchors or a "More" section; consider collapsing lower-priority sections.
2. **Navigation is thin (non-intuitive risk).** Top nav exposes only 5 anchors (Services, Doctors, Wait Times, Location, Contact) while there are ~15 sections — key tasks (Check-in, Triage, Pricing, Results) aren't reachable from the nav. → Add these to the nav or a secondary sticky "quick actions" bar (Check-in · Wait times · Pricing · Book).
3. **Section order doesn't match decision flow.** "Can we treat this?" (triage) and Pricing appear *after* Services, Check-in and Promotions — yet those are the questions a worried patient asks *first*. → Reorder roughly: Hero → Trust → Intent → **Triage** → Wait times → **Pricing** → Services → Check-in/Booking → Doctors → What to expect/bring → Location → Results/Referrals → Footer.
4. **CTA overload.** Many competing primary buttons per viewport (header Book Now, hero primary+secondary, per-service Book, Check-in, sticky CTA). → One clear primary action per section; make others secondary/ghost styling.
5. **Icon style is informal for healthcare.** Emoji carry most of the visual identity; they render inconsistently across devices and read less clinical. → Swap for a consistent line-icon set (or a few real photos in hero/services) to lift the "medical, trustworthy" goal.
6. **Demo scaffolding adds visual noise.** The persistent DEMO ribbon + repeated "sample data" tags are correct for a mock but clutter the composition — plan to strip/replace for the client-facing build.

### Quick UX wins
- Add a sticky, thumb-reachable bottom action bar on mobile (Call · Directions · Book) — high value for an urgent-care audience.
- Surface the live wait time in the header/hero as a persistent chip (it's the #1 reason people choose urgent care over ED).
- Tighten vertical rhythm on mobile (section padding is large → more scrolling); verify tap targets ≥44px and focus states for the a11y goal.
- Ensure one semantic `<h1>` and logical heading order for the "SEO for AI" goal.

### Verdict
Look & feel: **meets the modern, medical, patient-centric, on-brand expectations.** Flow: **80% there** — fix the long-scroll/navigation/order issues so the rebuild doesn't inherit the current site's two biggest problems, and it will fully land the brief.


#### new bugs

Reviewed live at `localhost:5176` (post Phase F/G) + traced to source. Root cause + fix for each.
Most are **side-effects of the Phase G consolidation** (tabbed hubs), so they cluster together.

**1. Smiley icon on "We treat ages / 3 months +" reads as an emoji** 🔴 confirmed
- The hero quick-info card uses a **smiley-face** SVG ([index.html](../index.html) ~L216) which looks
  informal/childish for a clinical site. (No literal emoji remain in the data — the 3mo+ trust stat
  uses `icon:"shield"`.)
- **Fix:** swap the smiley path for a clinical child/family line-icon from the icon map (teal
  `currentColor`); keep the stat icon consistent.

**2. `#pricing` and `#location` nav links don't work** 🔴 confirmed (root cause found)
- `#pricing` — the `id="pricing"` sits on the **hidden** pricing tab panel
  (`data-panel="pricingPanel" class="hidden"`, [index.html](../index.html):300) inside `#beforeYouVisit`.
  Clicking nav “Pricing” scrolls to a hidden element → nothing appears. Same latent bug for `#journey`
  and `#amenities` (also ids on hidden tab panels).
- `#location` — `<section id="location" … lg:hidden>` ([index.html](../index.html):425) is **hidden on
  desktop**; the desktop location lives in `#contact` as a compact card with **no** `id="location"`.
  So nav “Location” is dead on desktop.
- **Fix:** add a global `hashchange`→`openTab` handler so a deep link to a panel id activates its tab
  (and make nav “Pricing” call `SWIFT.ui.openTab('pricingPanel')` + scroll to `#beforeYouVisit`). Give
  the **desktop** contact location card `id="location"` (single canonical anchor) or retarget nav
  “Location” to `#contact` on desktop.

**3. Triage is duplicated** 🔴 confirmed
- “Can we treat this?” appears as a **tab in the Get-care band** (`data-tab="triage"`,
  [index.html](../index.html):254) *and* as the **Triage tab/panel** in `#beforeYouVisit`
  ([index.html](../index.html):296). The band's tab only deep-links into the hub.
- **Fix:** remove the “Can we treat this?” tab from the Get-care band (band = **Check-in + Book
  online**); triage lives solely in “Before you visit”.

**4. “Our Doctors” + “Why choose us” misaligned** 🔴 confirmed
- `#doctors` is `grid lg:grid-cols-[2fr,1fr]` with a `doctorsGrid` of **3** cards in an
  `sm:grid-cols-2 lg:grid-cols-2` grid (leaves an empty 4th cell) next to a `hidden lg:block` trust
  aside — uneven columns + mismatched baselines make it look misaligned.
- **Fix:** even the layout (e.g., doctors 3-up on `lg`, or fill the empty cell), keep `items-start`,
  and size the aside to align with the grid top.

**5. Trust stats duplicated 2–3× on one page** 🟡 new finding
- The same four numbers (4.9★ / 12 min / 20,000+ / 3 mo+) render in `#trust` (mobile strip near the
  hero), **and** in `#doctors` as both the desktop “Why choose SWIFT” aside (`trustAsideGrid`) and the
  `trustMobile` strip. On mobile the stats can show twice in one scroll.
- **Fix:** show the numeric trust bar **once**; make the Doctors “Why choose SWIFT” aside qualitative
  (differentiators/copy), not a repeat of the four stats.

**6. “Reserve my spot” opens the wrong tab** 🟡 new finding
- In the Get-care **Check-in** panel the CTA calls `SWIFT.ui.openTab('pricing')` before scrolling to
  `#checkinForm` ([index.html](../index.html):262) — wrong tab id (a copy-paste artefact; it flips the
  Before-you-visit hub to Pricing on the way down).
- **Fix:** drop the `openTab('pricing')` call; just scroll to `#checkinForm`.

**7. Get-care band mostly duplicates existing sections** 🟡 new finding (design)
- The band's Check-in tab deep-links to the standalone `#checkin` section, Book online opens the
  booking modal, and (before fix 3) Triage jumped to the hub — i.e., it repeats content already on
  the page, adding perceived length/duplication.
- **Fix:** keep the band as a compact **launcher** only (no repeated headings), or drop the
  standalone duplicate; don't present both with the same titles.

### Fix order (new bugs)
1. Anchors (2) — broken nav is highest-visibility; add the `hashchange`→tab handler + fix `#location`.
2. Triage duplication (3) + Reserve-my-spot tab (6) — both in the Get-care band; fix together.
3. Doctors/why-choose alignment (4) + trust-stat dedupe (5).
4. Smiley icon (1); Get-care band cleanup (7).