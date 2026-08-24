# SWIFT Emergency & Urgent Care — Website Mock Implementation Plan

A clickable, mobile-first **demo mock** to showcase the redesigned SWIFT website to the
client. Everything runs locally with **no build step**; all external integrations
(booking, email, NSW Health wait times, Google Maps, analytics, AI chatbot) are
**simulated in the browser**.

---

## 1. Goals

- Show the client the look, feel, and flow of the new **patient-centric, mobile-first** site.
- Keep the existing **brand**: teal palette and SWIFT logo style.
- Demonstrate key future features as working (mocked) UI: live wait times, booking,
  directions, enquiry email, promotions, and an AI assistant.
- Be instantly runnable and easy to present.

## 2. Non-Goals (for the mock)

- No real booking provider, email server, database, or live APIs.
- No real analytics collection or patient data handling.
- No production hosting/CI, SEO hardening, or accessibility certification (demo-level only).

---

## 3. Tech Approach

| Concern | Choice | Why |
|---|---|---|
| Markup/App | Single `index.html` | Zero setup, opens anywhere |
| Styling | Tailwind CSS (CDN) | Fast, responsive, on-brand teal |
| Interactivity | Vanilla JS (`mock/app.js`) | No toolchain, easy to demo |
| Data | Static JS object (`mock/data.js`) | Simple, editable content |
| Branding | Inline SVG logo + teal config | Matches current site |

**Brand palette (teal):** primary `#159595`, deep `#0e7676` / `#0a4040`, tints down to `#eafafa`.

---

## 4. File Structure

```
swiftdemo/
├─ index.html          # All page sections + widgets (DONE)
├─ mock/
│  ├─ data.js          # Clinic info, services, doctors, wait times, promos, chat (DONE)
│  └─ app.js           # Interactivity: render + mocked integrations (TO DO)
└─ plan.md             # This plan
```

---

## 5. Pages / Sections

1. **Header + nav** — sticky, teal, mobile hamburger, "Book Now" CTA, SWIFT logo.
2. **Campaign-aware hero** — "Emergency? Think SWIFT.", audience-focused headline that
   adapts to the social campaign the visitor arrived from (see §6). Quick-info cards
   (wait, hours, ages, location) + primary actions (Check-in, Book, Wait times).
3. **Trust bar** — rating, median wait, patients treated (Tier 1).
4. **Intent-based entry** — "I need care now / imaging / infusion" quick-route cards (Tier 2).
5. **Services** — card grid (Sports Injury, Fracture, Paediatrics, Infusion, Radiology, Physio).
6. **Our Doctors** — profile cards with initials avatar, role, specialty, bio.
7. **Live Wait Times** — SWIFT vs nearby hospital EDs, animated **Refresh** (Tier 1).
8. **Online check-in / queue** — reserve a spot → "You're #3, ~18 min" (Tier 1).
9. **"Can we treat this?" triage checker** — guided Q&A → scripted outcome (Tier 1).
10. **Pricing + cost estimator** — facility fee + Medicare scenarios (Tier 1).
11. **What to expect / what to bring** — patient-journey accordion (Tier 2).
12. **Amenities** — parking, WiFi, wheelchair, kids' area badges (Tier 2).
13. **Promotions** — seasonal/campaign banners.
14. **Location & Directions** — details + mock map + "Get Directions" button.
15. **Enquiries / Bookings / Referrals forms** — validate, show success toast (mock email) (Tier 2).
16. **Test results portal (shell)** — fake login → sample results (Tier 1, labelled demo).
17. **Accessibility controls** — large text / high contrast / language toggle (Tier 2).
18. **Footer** — contact, links, socials.
19. **Chat widget** — floating scripted "AI" assistant.
20. **Booking modal** — request appointment → success confirmation.

---

## 5a. Tier 1 & Tier 2 Feature Scope (all in the mock)

All features below are **fully mockable in-browser** and **mobile-friendly** unless noted.

### Tier 1 — highest patient impact
| Feature | Mock approach | Mobile note |
|---|---|---|
| Online check-in / join queue | Form → "You're #3, ~18 min" | One question per screen |
| "Can we treat this?" triage checker | Guided Q&A → walk-in / book / call 000 | Big tap targets |
| Pricing + cost estimator | Facility fee + Medicare scenarios in JS | Inputs stack; result as card |
| Test/imaging results access | Fake login → sample results (labelled demo) | Table → stacked cards |
| Trust bar (rating, median wait, treated) | Hardcoded stats | 2×2 stat grid |
| Live wait + queue position | Local data + Refresh jitter | Prominent number + list |

### Tier 2 — differentiators
| Feature | Mock approach | Mobile note |
|---|---|---|
| Intent-based homepage entry | "I need…" quick-route cards | Full-width stacked cards |
| What to bring / what to expect | Patient-journey accordion | Scannable, not long scroll |
| Practical visit info / amenities | Icon badges (parking, WiFi, wheelchair, kids) | 2-col grid |
| Multi-channel booking (per service) | Per-service modal → confirmation | Full-screen sheet on phones |
| Referrals (refer a patient / WorkCover) | Form → success toast | Standard stacked form |
| Accessibility (large text, contrast, language) | Real toggles + pre-translated strings | Toggles in menu |

---

## 6. Social-Media Campaign Landing (audience-focused redirects)

The site will be advertised on social media; ad clicks must land on a **relevant,
focused** experience — not the generic homepage. The mock demonstrates this with
**UTM-aware landing** (all simulated client-side; no tracking/backend).

- **Read campaign from the URL** — e.g. `?utm_campaign=flu`, `?campaign=sports`,
  `?c=infusion` (also supports `#flu`). A small campaign map in `mock/data.js` drives it.
- **Swap the hero to match the audience** — headline, subtext, hero image/emoji, and the
  **primary CTA** change per campaign so the message matches the ad. Examples:
  - `flu` → "Flu or fever? Walk in today." → CTA **Check current wait**
  - `sports` → "Sports injury? Seen fast by Emergency Physicians." → CTA **Online check-in**
  - `infusion` → "Iron infusion in under an hour." → CTA **Book infusion**
  - `kids` / `paeds` → "Sick child? In-house paediatricians, ages 3mo+." → CTA **Book / Walk in**
  - default (no campaign) → "Emergency? Think SWIFT."
- **Auto-scroll / highlight** the matching service card and pre-select it in the booking modal.
- **Campaign ribbon** — a subtle "You're viewing our <X> info" chip with a "See all services" reset.
- **Sticky primary CTA on mobile** — the campaign's main action stays reachable (thumb zone).
- **Fast, single-purpose above-the-fold** — minimal scrolling to the one action the ad promised.
- **Shareable/trackable in real build** — UTM params flow to analytics; each campaign can map
  to a clean path (e.g. `/flu`, `/sports`) later. Mocked as query/hash for the demo.
- **Demo switcher** — a small "Preview campaign" control (flu / sports / infusion / kids / default)
  so the client can see each landing variant live without editing URLs.

---

## 7. Mocked Integrations & Mock Requirements

**Requirements for the mock:** no build step, no backend, no API keys, runs by opening
`index.html`; every "live"-looking feature carries a subtle **"sample data / demo"** tag;
keep the **DEMO MOCK** ribbon; all data lives in `mock/data.js`; all behaviour in `mock/app.js`.

| Real feature | Mock behaviour in demo |
|---|---|
| Third-party booking | Modal form → fake confirmation + "email sent" state |
| Enquiry / referral email | Form submit → success toast, logged to console |
| NSW Health wait times | Local data + Refresh button jitters values, "updated just now" |
| Google Maps directions | Map placeholder + button opening a Maps URL (deep link) |
| Online check-in / queue | Form → fake queue position + est. wait |
| Triage checker | Scripted Q&A → outcome (walk-in / book / call 000) |
| Pricing estimator | Client-side calc from fee + Medicare scenarios |
| Test results portal | Fake login → sample results page (no real records) |
| Visitor analytics | (Optional) demo admin page with fake charts |
| AI chatbot | Scripted keyword responses (wait/fees/hours/book/location/services) |
| Social campaign redirect | UTM/hash → swapped hero, CTA, highlighted service (see §6) |
| Promotions publishing | Static promo data (future: CMS-driven) |

---

## 7. Build Phases & Tasks

### Phase 1 — Scaffold & brand ✅ (done)
- [x] `index.html` shell with teal Tailwind config + SVG logo
- [x] Responsive header/nav + mobile menu
- [x] All section markup and containers

### Phase 2 — Mock data ✅ (done)
- [x] `mock/data.js`: clinic, services, doctors, wait times, promotions, chat script

### Phase 3 — Interactivity (`mock/app.js`) ⏳ (next)
- [ ] Render services, doctors, wait-times, promotions from data
- [ ] Mobile nav toggle
- [ ] `refreshWaitTimes()` with loading spin + value jitter + timestamp
- [ ] Booking modal open/close + submit → success view (pre-select service from campaign)
- [ ] Enquiry / referral form submit → toast
- [ ] `getDirections()` → open Google Maps URL
- [ ] Chat widget: open/close, scripted responses

### Phase 3b — Campaign landing (§6)
- [ ] Read `utm_campaign`/`campaign`/`c`/hash → apply campaign hero + CTA + highlight
- [ ] Campaign ribbon + "See all services" reset
- [ ] Sticky mobile primary CTA per campaign
- [ ] "Preview campaign" switcher for the demo

### Phase 3c — Tier 1 features
- [ ] Online check-in / queue position
- [ ] "Can we treat this?" triage checker
- [ ] Pricing + cost estimator
- [ ] Test results portal shell (fake login)
- [ ] Trust bar stats

### Phase 3d — Tier 2 features
- [ ] Intent-based entry cards
- [ ] What to bring / what to expect accordion
- [ ] Amenity badges
- [ ] Per-service booking + referrals form
- [ ] Accessibility toggles (large text / contrast / language)

### Phase 4 — Polish
- [ ] Mobile QA (≤375px), tap targets, spacing
- [ ] Micro-interactions (hover, transitions), contrast check
- [ ] Realistic placeholder copy/imagery

### Phase 5 — (Optional) Wow extras
- [ ] Demo Admin/Analytics page (fake visitor charts)
- [ ] "Add a promotion" mock CMS screen

### Phase 6 — Present & share
- [ ] Local walkthrough
- [ ] (Optional) deploy static files to a shareable URL

---

## 8. How to Run

- Open `index.html` directly in a browser, **or**
- Serve locally for clean paths:
  ```
  cd swiftdemo
  python3 -m http.server 5173
  # visit http://localhost:5173
  ```

---

## 9. Demo Script (suggested flow)

Home → tap **Book Now** (modal → confirmation) → **Wait Times** (hit Refresh) →
view a **Doctor** → **Get Directions** → open **Chat** ("what are your fees?") →
scroll **Promotions** → submit **Enquiry** (success toast).

---

## 10. From Mock → Real (next steps after sign-off)

- Replace static data with a **headless CMS** (services, doctors, promotions).
- Real **booking** embed/deep-link from the chosen provider.
- **Enquiry** form → serverless function → email + spam protection + privacy consent.
- **Wait times** → verified NSW Health source via cached serverless proxy (with fallback).
- **Maps** → Google Maps Embed/Directions API.
- **Analytics** → GA4/Plausible + cookie consent + privacy policy.
- **SEO/AI discoverability** → semantic HTML, Schema.org `MedicalClinic`, sitemap, `llms.txt`.
- Future: **MCP server** + real **AI chatbot** over the structured content.
