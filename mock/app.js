// SWIFT Emergency & Urgent Care — Demo App
// All behaviour is mocked client-side. No build step.

(function () {
  const D = window.SWIFT_DATA;
  if (!D) { console.error("SWIFT_DATA missing — mock/data.js must load first."); return; }

  // ---------- Utilities ----------

  function escapeHTML(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function $(id) { return document.getElementById(id); }
  function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  // ---------- SWIFT namespace ----------

  const SWIFT = window.SWIFT = {
    render: {},
    ui: {},
    forms: {},
    campaign: {},
    a11y: {},
    ai: {},
    state: { queueNumber: D.queuePosition.currentInQueue, lastCampaignId: null, lang: "en", _baseline: null },
    init: function () {},
  };

  // ---------- Inline SVG icon map (Lucide-style, currentColor) ----------
  SWIFT.ui.icon = function (name, size) {
    size = size || 24;
    const paths = {
      // services / intents / journey
      stethoscope: `<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>`,
      bone: `<path d="M17 10c.7-.7 1-1.6 1-2.7a4 4 0 0 0-7-2.6c-.3.4-.7.6-1.2.4a4 4 0 1 0-2.6 7c.5-.2 1-.2 1.2.4a4 4 0 0 0 7 2.6c.4-.5.4-1 .2-1.4Z"/><path d="m13.5 9.5-5 5"/><path d="m9.5 13.5 5-5"/>`,
      baby: `<path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5 0 .6-.4 1-1 1H14a2 2 0 0 0-2 2v.5"/>`,
      syringe: `<path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>`,
      scan: `<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8v8"/><path d="M11 8v8"/><path d="M15 8v8"/><path d="M17 8v8"/>`,
      activity: `<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.5.5 0 0 1-.96 0L12 12 9.49 2.18a.5.5 0 0 0-.96 0L6.18 14.46A2 2 0 0 1 4.25 16H2"/>`,
      // amenities
      parking: `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>`,
      wifi: `<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/>`,
      wheelchair: `<circle cx="12" cy="4" r="2"/><path d="M19 13a7 7 0 1 1-14 0"/><path d="M12 6v5l3 1"/><path d="m9 17 3-3 3 3"/>`,
      coffee: `<path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>`,
      lift: `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 8h.01"/><path d="M9 12h.01"/><path d="M9 16h.01"/><path d="M15 8h.01"/><path d="M15 12h.01"/><path d="M15 16h.01"/><path d="M12 8v8"/><path d="m9 11 3-3 3 3"/><path d="m9 13 3 3 3-3"/>`,
      // intents
      ambulance: `<path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M6 10h4"/><path d="M8 8v4"/>`,
      // journey / bring
      clipboard: `<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6"/><path d="M9 16h6"/>`,
      doctor: `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/><path d="M12 6v6"/><path d="m9 9 3-3 3 3"/>`,
      pill: `<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>`,
      check: `<path d="M20 6 9 17l-5-5"/>`,
      id: `<rect width="18" height="14" x="3" y="5" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M12 10h5"/><path d="M12 14h5"/>`,
      card: `<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>`,
      wallet: `<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/><path d="M3 7h18"/><path d="M16 12h.01"/>`,
      // trust stats
      star: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
      clock: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
      users: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
      shield: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>`,
      // contact
      phone: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`,
      mail: `<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`,
      map: `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`,
    };
    const p = paths[name];
    if (!p) return "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  };

  // Render an <img> with lazy loading and graceful fallback (data-URI SVG if remote errors).
  SWIFT.ui.img = function (url, alt) {
    if (!url) return "";
    const safeAlt = escapeHTML(alt || "");
    const safeUrl = escapeHTML(url);
    const fallback = `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='#cffaf1'/><text x='2' y='1.8' text-anchor='middle' font-family='sans-serif' font-size='0.6' fill='#0f766e'>${safeAlt.replace(/[<>&]/g, '')}</text></svg>`
    )}`;
    return `<img src="${safeUrl}" alt="${safeAlt}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${fallback}';this.classList.add('img-fallback');" class="w-full h-full object-cover" />`;
  };

  // ---------- Generic render helpers ----------

  SWIFT.render.escapeHTML = escapeHTML;

  SWIFT.render.renderCardGrid = function (containerId, items, templateFn, opts) {
    opts = opts || {};
    const el = $(containerId);
    if (!el) return;
    if (!items || !items.length) {
      el.innerHTML = opts.emptyMessage ? `<div class="text-slate-400 text-sm">${escapeHTML(opts.emptyMessage)}</div>` : "";
      return;
    }
    el.innerHTML = items.map((item) => templateFn(item)).join("");
    if (opts.highlightId) {
      const target = el.querySelector(`[data-id="${opts.highlightId}"]`);
      if (target) target.classList.add("ring-2", "ring-teal-400");
    }
  };

  SWIFT.render.renderList = function (containerId, items, templateFn) {
    const el = $(containerId);
    if (!el) return;
    el.innerHTML = items.map(templateFn).join("");
  };

  SWIFT.render.renderStatGrid = function (containerId, items, templateFn) {
    SWIFT.render.renderCardGrid(containerId, items, templateFn);
  };

  SWIFT.render.renderBadgeGrid = function (containerId, items, templateFn) {
    SWIFT.render.renderCardGrid(containerId, items, templateFn);
  };

  SWIFT.render.renderAccordion = function (containerId, items, opts) {
    opts = opts || {};
    const el = $(containerId);
    if (!el) return;
    const style = opts.style || "accordion";

    if (style === "stepper") {
      el.innerHTML = `<ol class="space-y-3">` + items.map((item, i) => `
        <li class="flex gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div class="shrink-0 w-10 h-10 rounded-full bg-teal-500 text-white grid place-items-center font-extrabold">${i + 1}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-teal-600">${SWIFT.ui.icon(item.icon, 20)}</span>
              <h4 class="font-extrabold text-slate-800">${escapeHTML(item.title)}</h4>
            </div>
            <p class="mt-1 text-sm text-slate-600">${escapeHTML(item.body)}</p>
          </div>
        </li>`).join("") + `</ol>`;
      return;
    }

    if (style === "checklist") {
      el.innerHTML = `<ul class="space-y-2">` + items.map((item) => `
        <li class="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-teal-300 transition" data-bring-key="${escapeHTML(item.title)}">
          <input type="checkbox" class="mt-1 w-5 h-5 accent-teal-500 shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-teal-600">${SWIFT.ui.icon(item.icon, 20)}</span>
              <h4 class="font-extrabold text-slate-800">${escapeHTML(item.title)}</h4>
            </div>
            <p class="mt-1 text-sm text-slate-600">${escapeHTML(item.body)}</p>
          </div>
        </li>`).join("") + `</ul>`;
      // Wire checkbox toggle (whole row clickable)
      $$(".checklist li, [data-bring-key]", el).forEach((li) => {
        li.addEventListener("click", function (e) {
          if (e.target.tagName === "INPUT") return;
          const cb = li.querySelector('input[type="checkbox"]');
          if (cb) cb.checked = !cb.checked;
          li.classList.toggle("bg-teal-50", cb.checked);
        });
      });
      return;
    }

    // Default: classic <details> accordion
    el.innerHTML = items.map((item, i) => `
      <details class="bg-slate-50 border border-slate-200 rounded-xl p-4 group" ${i === 0 && opts.openFirst ? "open" : ""}>
        <summary class="cursor-pointer font-semibold text-slate-800 flex items-center justify-between gap-2 list-none min-h-[44px]">
          <span class="flex items-center gap-2"><span class="text-teal-600">${SWIFT.ui.icon(item.icon, 20)}</span><span>${escapeHTML(item.title)}</span></span>
          <span class="text-teal-600 group-open:rotate-180 transition-transform">${SWIFT.ui.icon("check", 18)}</span>
        </summary>
        <p class="mt-2 text-sm text-slate-600">${escapeHTML(item.body)}</p>
      </details>
    `).join("");
  };

  // ---------- Toast + Action DSL ----------

  SWIFT.ui.toast = function (msg) {
    const t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(SWIFT.ui._toastTimer);
    SWIFT.ui._toastTimer = setTimeout(() => t.classList.add("hidden"), 2400);
  };

  SWIFT.ui.runAction = function (action, fallbackEl) {
    if (!action) return;
    if (action.href) {
      if (/^https?:\/\//i.test(action.href)) {
        window.open(action.href, '_blank', 'noopener');
        return;
      }
      const target = document.querySelector(action.href);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (action.action === "openBooking") {
      SWIFT.ui.openBooking(action.service);
      return;
    }
    if (action.action === "openCheckIn") {
      const el = $("checkin");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (action.action === "scrollTo" && action.target) {
      const el = $(action.target);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (action.action === "openTab" && action.target) {
      SWIFT.ui.openTab(action.target);
      const el = $(action.target);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (action.href) {
      const el = $(action.href.replace(/^#/, ""));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  };

  // Activate a deep-link hash if it matches a panel id (e.g. #pricing lands
  // on the hidden pricingPanel inside #beforeYouVisit). Falls through to the
  // default scroll behaviour if the hash doesn't match anything.
  SWIFT.ui.handleHash = function (hash) {
    const id = (hash || window.location.hash || "").replace(/^#/, "");
    if (!id) return false;
    // FAQ detail deep-link (e.g. #faq-2) — open the specific question, then scroll to #faq.
    if (/^faq-\d+$/.test(id)) {
      const details = $(id);
      if (details) details.open = true;
      const faqSection = $("faq");
      if (faqSection) {
        faqSection.scrollIntoView({ behavior: "smooth", block: "start" });
        return true;
      }
    }
    const el = $(id);
    if (!el) return false;
    // 1) Hidden data-panel inside a tabs root? Activate the tab first.
    const panel = el.matches('[data-panel]') ? el : el.closest('[data-panel]');
    if (panel) {
      SWIFT.ui.openTab(panel.getAttribute("data-panel"));
    }
    // 2) Scroll the section / element into view (use the tabs root so the
    // user lands on the active panel rather than on the hidden one).
    const scrollTarget = (panel && panel.closest('[data-tabs-root]')) || el;
    scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  };

  // ---------- Tab controller for the "Before you visit" hub ----------
  // A tab is identified by a panel id (e.g. "pricingPanel"). Buttons sharing
  // data-tab="<id>" toggle their parent .tab-button group's active state and
  // reveal the matching [data-panel="<id>"] while hiding the others.
  SWIFT.ui.openTab = function (panelId) {
    // Accept the panel id either bare ("pricing") or with the "Panel" suffix
    // (matches both data-panel attrs in markup and action DSLs).
    const rawId = String(panelId || "");
    const target = rawId.replace(/Panel$/, "");
    // Find the root that owns this panel.
// Match if the root has any panel/button whose "Panel"-stripped name equals
// `target`. "Panel"-suffixed input is more selective so callers can pin to
// one root when names collide across roots.
    const inputHasPanelSuffix = rawId !== target;
    const matchInRoot = (r) => {
      const panels = $$("[data-panel]", r);
      for (const p of panels) {
        const pn = (p.getAttribute("data-panel") || "").replace(/Panel$/, "");
        if (pn === target) {
          if (!inputHasPanelSuffix) return true;
          const raw = p.getAttribute("data-panel") || "";
          if (raw === rawId) return true;
        }
      }
      const btns = $$(".tab-button", r);
      for (const b of btns) {
        const tstrip = (b.getAttribute("data-tab") || "").replace(/Panel$/, "");
        if (tstrip === target) {
          if (!inputHasPanelSuffix) return true;
          const traw = b.getAttribute("data-tab") || "";
          if (traw === rawId) return true;
        }
      }
      return false;
    };
    const root = $$("[data-tabs-root]").find(matchInRoot);
    if (!root) return;
    const buttons = $$(".tab-button", root);
    const panels = $$("[data-panel]", root);
    buttons.forEach((b) => {
      const t = (b.getAttribute("data-tab") || "").replace(/Panel$/, "");
      const isActive = inputHasPanelSuffix
        ? ((b.getAttribute("data-tab") || "") === rawId)
        : (t === target);
      b.classList.toggle("bg-teal-500", isActive);
      b.classList.toggle("text-white", isActive);
      b.classList.toggle("bg-white", !isActive);
      b.classList.toggle("text-slate-700", !isActive);
      b.setAttribute("aria-selected", isActive ? "true" : "false");
      b.setAttribute("tabindex", isActive ? "0" : "-1");
    });
    panels.forEach((p) => {
      const pn = (p.getAttribute("data-panel") || "").replace(/Panel$/, "");
      const isActive = inputHasPanelSuffix
        ? ((p.getAttribute("data-panel") || "") === rawId)
        : (pn === target);
      p.classList.toggle("hidden", !isActive);
    });
    // Sync deep-link anchor id onto the active panel so #pricing/etc still resolve.
    const active = panels.find((p) => {
      const pn = p.getAttribute("data-panel") || "";
      return inputHasPanelSuffix ? pn === rawId : (pn === rawId || pn === target);
    });
    if (active && !active.id) active.id = target;
  };

  // ---------- Section templates ----------

  function serviceTemplate(s) {
    const treatments = (s.treatments || []).map((t) => `<li class="text-sm text-slate-600 flex gap-2"><span class="text-teal-500 mt-0.5">${SWIFT.ui.icon("check", 16)}</span><span>${escapeHTML(t)}</span></li>`).join("");
    // Phase I4: AI picked badge — shown when the active campaign features this service.
    const aiBadge = `<span data-ai-badge="service" class="hidden absolute top-3 right-3 bg-teal-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow">AI picked</span>`;
    return `
      <div data-id="${escapeHTML(s.name)}" data-service="${escapeHTML(s.name)}" class="bg-white rounded-2xl border border-slate-200 overflow-hidden transition hover:shadow-md">
        <div class="aspect-[16/9] bg-teal-50 relative">${SWIFT.ui.img(s.image, s.imageAlt || s.name)}<div class="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur text-teal-700 grid place-items-center">${SWIFT.ui.icon(s.icon, 22)}</div>${aiBadge}</div>
        <div class="p-6">
          <h3 class="text-xl font-extrabold text-slate-800">${escapeHTML(s.name)}</h3>
          <p class="text-sm text-teal-600 font-semibold mt-1">${escapeHTML(s.cost)}</p>
          <p class="mt-3 text-slate-600">${escapeHTML(s.summary)}</p>
          <ul class="mt-3 space-y-1.5">${treatments}</ul>
          <button onclick="SWIFT.ui.openBooking('${escapeHTML(s.name).replace(/'/g, "\\'")}')" class="mt-5 w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2.5 rounded-xl text-sm">Book this service</button>
        </div>
      </div>`;
  }

  function doctorTemplate(d) {
    return `
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div class="aspect-[4/3] bg-teal-50 relative">${SWIFT.ui.img(d.image, d.imageAlt || d.name)}<div class="absolute top-3 left-3 bg-white/90 backdrop-blur text-teal-700 text-[10px] font-semibold px-2 py-1 rounded-full">Representative</div></div>
        <div class="p-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-teal-500 text-white grid place-items-center font-extrabold text-sm shrink-0">${escapeHTML(d.initials)}</div>
            <div>
              <h3 class="text-lg font-extrabold text-slate-800">${escapeHTML(d.name)}</h3>
              <p class="text-sm text-teal-600 font-semibold">${escapeHTML(d.role)}</p>
              <p class="text-xs text-slate-400">${escapeHTML(d.specialty)}</p>
            </div>
          </div>
          <p class="mt-4 text-slate-600 text-sm">${escapeHTML(d.bio)}</p>
        </div>
      </div>`;
  }

  function waitTemplate(h) {
    const isSwift = h.distanceKm === 0;
    return `
      <div class="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2 border border-white/10">
        <div class="min-w-0 pr-2">
          <div class="font-semibold text-sm truncate">${escapeHTML(h.name)}</div>
          <div class="text-[11px] text-slate-300">${h.distanceKm === 0 ? "On-site" : escapeHTML(h.distanceKm) + " km"}</div>
        </div>
        <div class="text-right shrink-0">
          <div class="text-lg font-extrabold leading-none ${isSwift ? "text-teal-300" : "text-white"}">${h.mins}<span class="text-xs font-semibold ml-0.5">min</span></div>
        </div>
      </div>`;
  }

  function promoTemplate(p) {
    const aiBadge = `<span data-ai-badge="promo" class="hidden absolute top-3 right-3 bg-teal-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow">AI picked</span>`;
    return `
      <div data-promo-id="${escapeHTML(p.id || "")}" class="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition relative">
        <div class="aspect-[16/9] bg-teal-50 relative">${SWIFT.ui.img(p.image, p.imageAlt || p.title)}${aiBadge}</div>
        <div class="p-6">
          <div class="inline-block bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-1 rounded-full">${escapeHTML(p.badge)}</div>
          <h3 class="mt-3 text-xl font-extrabold text-slate-800">${escapeHTML(p.title)}</h3>
          <p class="mt-2 text-slate-600">${escapeHTML(p.body)}</p>
        </div>
      </div>`;
  }

  function trustTemplate(s) {
    return `
      <div class="text-center p-4 bg-white rounded-2xl border border-slate-200">
        <div class="w-10 h-10 mx-auto rounded-full bg-teal-50 text-teal-700 grid place-items-center">${SWIFT.ui.icon(s.icon, 22)}</div>
        <div class="mt-2 text-2xl sm:text-3xl font-extrabold text-teal-700">${escapeHTML(s.value)}</div>
        <div class="mt-1 text-sm font-semibold text-slate-700">${escapeHTML(s.label)}</div>
        <div class="text-xs text-slate-400">${escapeHTML(s.sub || "")}</div>
      </div>`;
  }

  // Compact horizontal layout used in the Doctors aside panel (desktop only).
  function trustRowTemplate(s) {
    return `
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-full bg-teal-50 text-teal-700 grid place-items-center shrink-0">${SWIFT.ui.icon(s.icon, 18)}</div>
        <div class="min-w-0">
          <div class="text-lg font-extrabold text-teal-700 leading-tight">${escapeHTML(s.value)}</div>
          <div class="text-xs font-semibold text-slate-700">${escapeHTML(s.label)}</div>
          <div class="text-[11px] text-slate-400">${escapeHTML(s.sub || "")}</div>
        </div>
      </div>`;
  }


  function intentTemplate(i) {
    const label = i.action && (i.action.label || i.action.ctaLabel) || "Go";
    const onclick = `SWIFT.ui.runAction(${JSON.stringify(i.action || {}).replace(/"/g, "&quot;")})`;
    return `
      <button onclick='${onclick}' class="text-left bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-teal-300 transition group">
        <div class="w-12 h-12 rounded-full bg-teal-50 text-teal-700 grid place-items-center group-hover:bg-teal-100 transition">${SWIFT.ui.icon(i.icon, 24)}</div>
        <div class="mt-3 text-lg font-extrabold text-slate-800">${escapeHTML(i.title)}</div>
        <div class="mt-1 text-sm text-slate-500">${escapeHTML(i.sub)}</div>
        <div class="mt-4 text-teal-600 font-semibold text-sm">→ ${escapeHTML(label)}</div>
      </button>`;
  }

  function amenityTemplate(a) {
    return `
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
        <div class="w-10 h-10 mx-auto rounded-full bg-white text-teal-700 grid place-items-center">${SWIFT.ui.icon(a.icon, 22)}</div>
        <div class="mt-2 text-sm font-semibold text-slate-700">${escapeHTML(a.label)}</div>
      </div>`;
  }

  // ---------- Section renderers ----------

  SWIFT.render.renderServices = function (highlightName) {
    SWIFT.render.renderCardGrid("servicesGrid", D.services, serviceTemplate, { highlightId: highlightName });
  };

  SWIFT.render.renderDoctors = function () {
    SWIFT.render.renderCardGrid("doctorsGrid", D.doctors, doctorTemplate);
  };

  SWIFT.render.renderWaitTimes = function () {
    SWIFT.render.renderList("waitList", D.waitTimes.hospitals, waitTemplate);
    const label = `~${D.waitTimes.swiftCurrentMins} min`;
    const hwv = $("heroWaitValue");
    const hcw = $("headerWaitValue");
    if (hwv) hwv.textContent = label;
    if (hcw) hcw.textContent = label;
    // Phase I3: refresh the sparkline + trend arrow.
    if (typeof SWIFT.ai !== "undefined" && SWIFT.ai && SWIFT.ai.renderWaitTrend) {
      SWIFT.ai.renderWaitTrend();
    }
  };

  SWIFT.render.renderPromos = function () {
    SWIFT.render.renderCardGrid("promoGrid", D.promotions, promoTemplate);
  };

  SWIFT.render.renderTrust = function () {
    // J6: render the numeric trust bar once, into the canonical #trust strip
    // near the hero. The Doctors aside now hosts qualitative differentiators
    // (no duplicate numbers).
    SWIFT.render.renderStatGrid("trustGrid", D.trustStats, trustTemplate);
  };

  SWIFT.render.renderIntents = function () {
    SWIFT.render.renderCardGrid("intentsGrid", D.intents, intentTemplate);
  };

  SWIFT.render.renderAmenities = function () {
    SWIFT.render.renderBadgeGrid("amenitiesGrid", D.amenities, amenityTemplate);
  };

  SWIFT.render.renderJourney = function () {
    SWIFT.render.renderAccordion("journeyList", D.journeySteps, { style: "stepper" });
    SWIFT.render.renderAccordion("bringList", D.bringItems, { style: "checklist" });
  };

  SWIFT.render.populateQueueServiceSelect = function () {
    const sel = $("queueService");
    if (!sel) return;
    sel.innerHTML = `<option value="">— Choose service —</option>` +
      D.services.map((s) => `<option value="${escapeHTML(s.name)}">${escapeHTML(s.name)}</option>`).join("");
  };

  SWIFT.render.populateBookingServiceSelect = function (prefill) {
    const sel = $("bookingService");
    if (!sel) return;
    sel.innerHTML = `<option value="">— Choose service —</option>` +
      D.services.map((s) => `<option value="${escapeHTML(s.name)}" ${prefill === s.name ? "selected" : ""}>${escapeHTML(s.name)}</option>`).join("") +
      `<option value="General enquiry">General enquiry</option>`;
  };

  // ---------- UI handlers (called by inline onclick) ----------

  SWIFT.ui.toggleMobileNav = function () {
    const nav = $("mobileNav");
    if (nav) nav.classList.toggle("hidden");
  };

  SWIFT.ui.openBooking = function (prefillService) {
    SWIFT.render.populateBookingServiceSelect(prefillService);
    const modal = $("bookingModal");
    const form = modal && modal.querySelector("form");
    const success = $("bookingSuccess");
    if (form) form.classList.remove("hidden");
    if (success) success.classList.add("hidden");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  };

  SWIFT.ui.closeBooking = function () {
    const modal = $("bookingModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  };

  SWIFT.ui.refreshWaitTimes = function () {
    const spin = $("refreshSpin");
    if (spin) {
      spin.classList.add("animate-spin");
      setTimeout(() => spin.classList.remove("animate-spin"), 700);
    }
    // Jitter each row around its baseline ±15% (clamped to plausible range), so refreshes don't drift
    D.waitTimes.hospitals.forEach((h) => {
      if (typeof h.baselineMins !== "number") h.baselineMins = h.mins;
      const jitter = Math.round(h.baselineMins * 0.15 * (Math.random() * 2 - 1));
      h.mins = Math.max(1, h.baselineMins + jitter);
    });
    if (typeof D.waitTimes.swiftBaselineMins !== "number") D.waitTimes.swiftBaselineMins = D.waitTimes.swiftCurrentMins;
    const swiftJitter = Math.round(D.waitTimes.swiftBaselineMins * 0.2 * (Math.random() * 2 - 1));
    D.waitTimes.swiftCurrentMins = Math.max(5, D.waitTimes.swiftBaselineMins + swiftJitter);
    // Phase I3: append to the rolling trend buffer (last 7 readings).
    if (Array.isArray(D.waitTrend)) {
      D.waitTrend.push(D.waitTimes.swiftCurrentMins);
      if (D.waitTrend.length > 7) D.waitTrend.shift();
    }
    SWIFT.render.renderWaitTimes();
    const updated = $("waitUpdated");
    if (updated) updated.textContent = "just now";
    SWIFT.ui.toast("Wait times refreshed");
  };

  SWIFT.ui.getDirections = function () {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(D.clinic.address)}`;
    window.open(url, "_blank", "noopener");
  };

  SWIFT.ui.toggleChat = function () {
    const panel = $("chatPanel");
    if (!panel) return;
    const isHidden = panel.classList.contains("hidden");
    panel.classList.toggle("hidden");
    panel.classList.toggle("flex");
    if (isHidden && $("chatLog") && $("chatLog").children.length === 0) {
      SWIFT.ui._chatAdd("bot", "Hi! I'm the SWIFT demo AI assistant. Ask about wait times, fees, hours, services, or booking.");
      SWIFT.ui._chatAdd("bot", SWIFT.ai.disclaimer());
    }
  };

  SWIFT.ui.sendChat = function (e) {
    e.preventDefault();
    const input = $("chatInput");
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    SWIFT.ui._chatAdd("user", text);
    input.value = "";
    // Phase I2: grounded answer from D.aiConciergeIntents (reads SWIFT_DATA).
    const result = SWIFT.ai.conciergeAnswer(text);
    const reply = result.reply + " " + SWIFT.ai.disclaimer();
    setTimeout(function () {
      SWIFT.ui._chatAdd("bot", reply);
      // Optional inline CTA (e.g. "Open in Google Maps" for location intent).
      if (result.cta && typeof SWIFT.ui.runAction === "function") {
        const btn = document.createElement("button");
        btn.className = "mt-2 text-xs text-teal-700 underline";
        btn.textContent = result.cta.label || "Open";
        btn.onclick = function () { SWIFT.ui.runAction(result.cta); };
        const log = $("chatLog");
        if (log) {
          const wrap = document.createElement("div");
          wrap.className = "mr-8 max-w-[80%]";
          wrap.appendChild(btn);
          log.appendChild(wrap);
          log.scrollTop = log.scrollHeight;
        }
      }
    }, 300);
  };

  SWIFT.ui._chatAdd = function (who, text) {
    const log = $("chatLog");
    if (!log) return;
    const bubble = document.createElement("div");
    bubble.className = who === "user"
      ? "bg-teal-500 text-white px-3 py-2 rounded-lg ml-8 max-w-[80%]"
      : "bg-white border border-slate-200 px-3 py-2 rounded-lg mr-8 max-w-[80%]";
    bubble.textContent = text;
    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
  };

  // ---------- Form handlers ----------

  SWIFT.forms.submitEnquiry = function (e) {
    e.preventDefault();
    const form = e.target;
    const payload = Array.from(form.elements).filter((el) => el.tagName !== "BUTTON").map((el) => el.value);
    console.log("[SWIFT demo] enquiry:", payload);
    SWIFT.ui.toast("Message sent — we'll be in touch.");
    form.reset();
  };

  SWIFT.forms.submitBooking = function (e) {
    e.preventDefault();
    const form = e.target;
    const payload = {
      name: form.elements[0].value,
      phone: form.elements[1].value,
      service: form.elements[2].value,
      date: form.elements[3].value,
    };
    console.log("[SWIFT demo] booking:", payload);
    form.classList.add("hidden");
    const success = $("bookingSuccess");
    if (success) success.classList.remove("hidden");
    SWIFT.ui.toast("Appointment requested!");
  };

  SWIFT.forms.submitReferral = function (e) {
    e.preventDefault();
    const form = e.target;
    const payload = Array.from(form.elements).filter((el) => el.tagName !== "BUTTON").map((el) => el.value);
    console.log("[SWIFT demo] referral:", payload);
    SWIFT.ui.toast("Referral sent — we'll be in touch.");
    form.reset();
  };

  SWIFT.forms.submitQueue = function (e) {
    e.preventDefault();
    const form = e.target;
    const name = $("queueName").value.trim();
    const service = $("queueService").value;
    if (!name || !service) return;
    SWIFT.state.queueNumber += 1;
    const n = SWIFT.state.queueNumber;
    const mins = n * D.queuePosition.avgMinsPerPatient;
    // M1: #checkinForm is now a tab panel div; write into the inner content slot
    // so we don't clobber the panel's data-panel / role attributes.
    const container = $("checkinFormInner") || $("checkinForm");
    container.innerHTML = `
      <div class="text-center py-6">
        <div class="text-sm text-slate-500">${escapeHTML(D.queuePosition.prefix)}<span class="font-extrabold text-teal-700">${n}</span></div>
        <div class="mt-1 text-3xl font-extrabold text-slate-800">~${mins} min wait</div>
        <p class="mt-3 text-slate-600">Reason: ${escapeHTML(service)}</p>
        <p class="mt-1 text-xs text-slate-400">We'll text ${escapeHTML(name)} when we're ready.</p>
        <div class="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
          <button onclick="SWIFT.ui.getDirections()" class="bg-white border border-slate-300 hover:border-teal-400 text-slate-700 font-semibold px-5 py-2.5 rounded-xl">Get directions</button>
          <button onclick="SWIFT.forms.cancelQueue()" class="text-slate-500 hover:text-red-600 underline text-sm">Cancel my place</button>
        </div>
      </div>`;
    SWIFT.ui.toast(`Added to queue — #${n}`);
  };

  SWIFT.forms.cancelQueue = function () {
    SWIFT.state.queueNumber = Math.max(D.queuePosition.currentInQueue, SWIFT.state.queueNumber - 1);
    SWIFT.ui.toast("Your place was cancelled.");
    // Restore the form inside the panel's inner slot.
    const container = $("checkinFormInner") || $("checkinForm");
    container.innerHTML = `
      <form onsubmit="submitQueue(event)" class="grid sm:grid-cols-2 gap-4">
        <input required id="queueName" placeholder="Your name" class="border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-400 outline-none bg-white" />
        <select required id="queueService" class="border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-400 outline-none text-slate-600 bg-white"></select>
        <button class="sm:col-span-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl">Add me to the queue</button>
      </form>
      <p class="text-xs text-slate-400 mt-3 text-center">Demo only — no real queue, no real wait.</p>`;
    SWIFT.render.populateQueueServiceSelect();
  };

  SWIFT.forms.submitPricing = function (e) {
    e.preventDefault();
    const medicare = $("pricingMedicare").value;
    const insurance = $("pricingInsurance").value;
    const workcover = $("pricingWorkcover").value;
    let scenarioId;
    if (workcover === "yes") scenarioId = "workcover";
    else if (medicare === "yes") scenarioId = insurance === "yes" ? "insured" : "medicareOnly";
    // C13: private cover is no longer ignored when Medicare is absent.
    else scenarioId = insurance === "yes" ? "privateNoMedicare" : "uninsured";
    const scenario = D.pricingScenarios.items.find((x) => x.id === scenarioId);
    const result = $("pricingResult");
    // C13: no Medicare rebate line for WorkCover — the visit is billed
    // directly to the insurer, so itemising a rebate under a $0 total is wrong.
    const medicareLine = medicare === "yes" && scenarioId !== "workcover" ? `
      <div class="flex justify-between"><dt>Medicare rebate</dt><dd class="font-semibold">− $${D.pricingScenarios.medicareRebate.toFixed(2)}</dd></div>` : "";
    result.classList.remove("hidden");
    result.innerHTML = `
      <div class="bg-teal-50 border border-teal-200 rounded-2xl p-6">
        <div class="text-sm font-semibold text-teal-700">${escapeHTML(scenario.label)}</div>
        <div class="mt-2 text-3xl font-extrabold text-slate-800">${escapeHTML(scenario.outOfPocket)}</div>
        <div class="mt-1 text-slate-500 text-sm">estimated out-of-pocket</div>
        ${scenario.note ? `<p class="mt-3 text-sm text-slate-600">${escapeHTML(scenario.note)}</p>` : ""}
        <hr class="my-4 border-teal-200" />
        <dl class="space-y-1 text-sm text-slate-700">
          <div class="flex justify-between"><dt>Facility fee</dt><dd class="font-semibold">$${D.pricingScenarios.facilityFee}</dd></div>
          ${medicareLine}
        </dl>
        <button onclick="SWIFT.forms.resetPricing()" class="mt-5 text-teal-700 underline text-sm">Try another scenario</button>
      </div>`;
  };

  SWIFT.forms.resetPricing = function () {
    $("pricingForm").reset();
    $("pricingResult").classList.add("hidden");
    $("pricingResult").innerHTML = "";
  };

  // ---------- Campaign ----------

  SWIFT.campaign.readFromURL = function () {
    try {
      if (!window.location || !window.location.href) return null;
      const url = new URL(window.location.href);
      const keys = ["utm_campaign", "campaign", "c"];
      for (const k of keys) {
        const v = url.searchParams.get(k);
        if (v) return v.toLowerCase();
      }
      const hash = (window.location.hash || "").replace(/^#/, "").toLowerCase();
      if (hash && D.campaigns[hash]) return hash;
    } catch (e) { /* no-op */ }
    return null;
  };

  // ---- Campaign-driven sections (Phase H) -----------------------------
  // Helpers transform a campaign's optional fields into concrete page changes.
  // Every helper is a no-op if the field is absent, so "default" stays untouched
  // and adding a new campaign is purely data.
  SWIFT.campaign._applyServicesOrder = function (orderArr) {
    if (!Array.isArray(orderArr) || !orderArr.length) return;
    if (!Array.isArray(D.services)) return;
    const byName = {};
    D.services.forEach(function (s) { byName[s.name] = s; });
    const next = [];
    orderArr.forEach(function (n) { if (byName[n]) { next.push(byName[n]); delete byName[n]; } });
    Object.keys(byName).forEach(function (k) { next.push(byName[k]); });
    D.services = next;
    SWIFT.render.renderServices(SWIFT.state.lastHighlightService || null);
  };

  SWIFT.campaign._applyIntentsOrder = function (orderArr) {
    if (!Array.isArray(orderArr) || !orderArr.length) return;
    if (!Array.isArray(D.intents)) return;
    const byId = {};
    D.intents.forEach(function (i) { byId[i.id] = i; });
    const next = [];
    orderArr.forEach(function (id) { if (byId[id]) { next.push(byId[id]); delete byId[id]; } });
    Object.keys(byId).forEach(function (k) { next.push(byId[k]); });
    D.intents = next;
    if (typeof SWIFT.render.renderIntents === "function") SWIFT.render.renderIntents();
  };

  SWIFT.campaign._applySections = function (hideArr) {
    // Restore only real page sections first (idempotent for the default campaign).
    // Tab panels are controlled by the tab system, not by this helper.
    const known = ['intents', 'promotions', 'doctors', 'trust', 'getCare', 'wait', 'services', 'faq'];
    known.forEach(function (k) {
      const sec = $(k) || document.getElementById(k);
      if (sec && sec.classList) sec.classList.remove('hidden');
    });
    if (!Array.isArray(hideArr) || !hideArr.length) return;
    hideArr.forEach(function (k) {
      const sec = $(k) || document.getElementById(k);
      if (sec && sec.classList) sec.classList.add('hidden');
    });
  };

  SWIFT.campaign._applyBookingPrefill = function (serviceName) {
    if (!serviceName) return;
    const sel = $("bookingService");
    if (sel) {
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === serviceName || sel.options[i].text === serviceName) {
          sel.value = sel.options[i].value;
          break;
        }
      }
    }
    const csel = $("queueService");
    if (csel) {
      for (let i = 0; i < csel.options.length; i++) {
        if (csel.options[i].value === serviceName || csel.options[i].text === serviceName) {
          csel.value = csel.options[i].value;
          break;
        }
      }
    }
  };

  SWIFT.campaign._applyPricingPreset = function (preset) {
    if (!preset) return;
    setTimeout(function () {
      const m = $("pricingMedicare");
      const i = $("pricingInsurance");
      const w = $("pricingWorkcover");
      if (m && typeof preset.medicare !== "undefined") m.value = preset.medicare;
      if (i && typeof preset.insurance !== "undefined") i.value = preset.insurance;
      if (w && typeof preset.workcover !== "undefined") w.value = preset.workcover;
    }, 0);
  };

  SWIFT.campaign.apply = function (id) {
    const c = D.campaigns[id] || D.campaigns.default;
    if (!c) return;
    document.body.dataset.campaign = c.id;
    SWIFT.state.lastCampaignId = c.id;

    const eyebrow = $("heroEyebrow");
    const headline = $("heroHeadline");
    const sub = $("heroSubtext");
    if (eyebrow) eyebrow.textContent = c.eyebrow;
    if (headline) headline.innerHTML = c.headlineHTML;
    if (sub) sub.textContent = c.subtext;

    // Hero background image (clinic photo)
    const heroBg = $("heroBg");
    if (heroBg && D.clinic && D.clinic.heroImage) {
      heroBg.style.backgroundImage = `url("${D.clinic.heroImage}")`;
    }

    // Hero wait-card icon
    const heroWaitIcon = $("heroWaitIcon");
    if (heroWaitIcon) heroWaitIcon.innerHTML = SWIFT.ui.icon("clock", 28);

    // Primary CTA
    const pCta = $("heroPrimaryCta");
    if (pCta) {
      pCta.textContent = c.primaryCta.label;
      pCta.onclick = function () { SWIFT.ui.runAction(c.primaryCta); };
    }
    // Secondary CTA
    const sCta = $("heroSecondaryCta");
    if (sCta) {
      sCta.textContent = c.secondaryCta.label;
      sCta.setAttribute("href", c.secondaryCta.href || "#");
      sCta.onclick = function (e) {
        if (c.secondaryCta.action) { e.preventDefault(); SWIFT.ui.runAction(c.secondaryCta); }
      };
    }

    // Ribbon
    const ribbon = $("campaignRibbon");
    const ribbonText = $("campaignRibbonText");
    if (ribbon && ribbonText) {
      if (c.ribbonText) {
        ribbonText.textContent = c.ribbonText;
        ribbon.classList.remove("hidden");
      } else {
        ribbon.classList.add("hidden");
      }
    }

    // Sticky CTA (only for non-default + mobile)
    const sticky = $("stickyCta");
    const stickyBtn = $("stickyCtaBtn");
    if (sticky && stickyBtn) {
      stickyBtn.textContent = c.stickyCta.label;
      stickyBtn.onclick = function () { SWIFT.ui.runAction(c.stickyCta); };
      if (c.id !== "default") sticky.classList.remove("hidden");
      else sticky.classList.add("hidden");
    }

    // Highlight matching service card (remember for re-renders)
    SWIFT.state.lastHighlightService = c.highlightService || null;
    SWIFT.render.renderServices(SWIFT.state.lastHighlightService);

    // Phase I4: AI-pick badge dataset. Default campaign clears it.
    if (c.id && c.id !== "default") {
      document.body.dataset.aiPick = c.id;
    } else {
      delete document.body.dataset.aiPick;
    }
    // Re-render promos so any AI-pick badge targeting via c.promoId reflects the new state.
    SWIFT.render.renderPromos();

    // Phase H adapters — each is a no-op if the field is absent.
    SWIFT.campaign._applyServicesOrder(c.services);
    SWIFT.campaign._applyIntentsOrder(c.intentsOrder);
    SWIFT.campaign._applySections(c.hideSections);
    if (c.bookingService) SWIFT.campaign._applyBookingPrefill(c.bookingService);
    if (c.checkinService) SWIFT.campaign._applyBookingPrefill(c.checkinService);
    SWIFT.campaign._applyPricingPreset(c.pricingPreset);

    // Phase I4: stamp badges on the matching service + promo cards (one-shot DOM pass).
    SWIFT.ai.applyBadges(c);

    // Update switcher active state
    SWIFT.campaign._renderSwitcher(c.id);
  };

  SWIFT.campaign.reset = function () {
    sessionStorage.removeItem("swiftCampaign");
    // Restore the original services/intents order so a campaign re-order doesn't persist.
    if (SWIFT.state._baseline && SWIFT.state._baseline.services) {
      D.services = SWIFT.state._baseline.services.slice();
    }
    if (SWIFT.state._baseline && SWIFT.state._baseline.intents) {
      D.intents = SWIFT.state._baseline.intents.slice();
    }
    SWIFT.campaign.apply("default");
    SWIFT.ui.toast("Reset to default view");
    const home = $("home");
    if (home && typeof home.scrollIntoView === "function") {
      home.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  SWIFT.campaign.setPreview = function (id) {
    sessionStorage.setItem("swiftCampaign", id);
    SWIFT.campaign.apply(id);
    // Scroll to hero so the user can see what changed
    const home = $("home");
    if (home && typeof home.scrollIntoView === "function") {
      home.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    const c = D.campaigns[id];
    SWIFT.ui.toast(`Campaign: ${c && c.name ? c.name : id}`);
  };

  SWIFT.campaign.init = function () {
    // Wire ribbon reset
    const reset = $("campaignRibbonReset");
    if (reset) reset.onclick = SWIFT.campaign.reset;

    // Preview switcher
    const btn = $("campaignSwitcherBtn");
    const list = $("campaignSwitcherList");
    if (btn && list) {
      btn.onclick = function (e) {
        e.stopPropagation();
        list.classList.toggle("hidden");
      };
      document.addEventListener("click", function (e) {
        if (!$("campaignSwitcher").contains(e.target)) list.classList.add("hidden");
      });
    }
    SWIFT.campaign._renderSwitcher("default");

    // Read source: URL > sessionStorage > default
    const urlId = SWIFT.campaign.readFromURL();
    const sessionId = sessionStorage.getItem("swiftCampaign");
    const id = urlId || sessionId || "default";
    if (!D.campaigns[id]) {
      console.warn("[SWIFT demo] unknown campaign:", id, "— falling back to default");
      SWIFT.campaign.apply("default");
    } else {
      SWIFT.campaign.apply(id);
    }
  };

  SWIFT.campaign._renderSwitcher = function (activeId) {
    const list = $("campaignSwitcherList");
    if (!list) return;
    list.innerHTML = D.campaignPreviewOrder.map((id) => {
      const c = D.campaigns[id];
      const isActive = c.id === activeId;
      return `<button data-cid="${c.id}" class="cs-item w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${isActive ? "bg-teal-500 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"}">
        <span class="cs-check ${isActive ? "" : "invisible"}">✓</span>
        <span>${escapeHTML(c.name || c.id)}</span>
      </button>`;
    }).join("");
    $$(".cs-item", list).forEach((btn) => {
      btn.onclick = function () {
        SWIFT.campaign.setPreview(btn.getAttribute("data-cid"));
        list.classList.add("hidden");
      };
    });
  };

  // ---------- Accessibility ----------

  const A11Y_KEY = "swiftA11y";

  SWIFT.a11y.load = function () {
    try { return JSON.parse(localStorage.getItem(A11Y_KEY)) || {}; } catch (e) { return {}; }
  };

  SWIFT.a11y.save = function (prefs) {
    try { localStorage.setItem(A11Y_KEY, JSON.stringify(prefs)); } catch (e) {}
  };

  SWIFT.a11y._apply = function (prefs) {
    document.body.classList.toggle("a11y-large", !!prefs.large);
    document.body.classList.toggle("a11y-contrast", !!prefs.contrast);
    SWIFT.a11y._applyLang(prefs.lang || "en");
  };

  SWIFT.a11y._applyLang = function (lang) {
    SWIFT.state.lang = lang;
    const strings = D.translations[lang] || D.translations.en;
    $$("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (strings[key]) el.textContent = strings[key];
    });
  };

  SWIFT.a11y.setLargeText = function (on) {
    const p = SWIFT.a11y.load(); p.large = !!on; SWIFT.a11y.save(p); SWIFT.a11y._apply(p);
  };

  SWIFT.a11y.setHighContrast = function (on) {
    const p = SWIFT.a11y.load(); p.contrast = !!on; SWIFT.a11y.save(p); SWIFT.a11y._apply(p);
  };

  SWIFT.a11y.setLanguage = function (lang) {
    const p = SWIFT.a11y.load(); p.lang = lang; SWIFT.a11y.save(p); SWIFT.a11y._apply(p);
  };

  SWIFT.a11y.reset = function () {
    localStorage.removeItem(A11Y_KEY);
    SWIFT.a11y._apply({});
  };

  SWIFT.a11y.togglePanel = function () {
    $("a11yPanel").classList.toggle("hidden");
  };

  SWIFT.a11y.close = function () {
    $("a11yPanel").classList.add("hidden");
  };

  // ---------- Phase I: AI features (mocked) ----------

  // Shared disclaimer used by the chat concierge.
  SWIFT.ai.disclaimer = function () {
    return "AI demo — not medical advice; call 000 in an emergency.";
  };

  // ---- I2 — grounded AI concierge ---------------------------------------
  // Match user input against D.aiConciergeIntents; answer() reads SWIFT_DATA.
  SWIFT.ai.matchIntent = function (text) {
    const t = (text || "").toLowerCase();
    if (!t) return null;
    const intents = D.aiConciergeIntents || [];
    for (let i = 0; i < intents.length; i++) {
      const intent = intents[i];
      if (intent.patterns.some(function (p) { return p.test(t); })) return intent;
    }
    return null;
  };

  SWIFT.ai.conciergeAnswer = function (text) {
    const intent = SWIFT.ai.matchIntent(text);
    if (!intent) {
      return { reply: "That's outside what I can help with — try asking about hours, wait, cost, services, or booking.", cta: null };
    }
    let reply = "";
    try { reply = intent.answer(D); } catch (err) { reply = "I'm having trouble right now — please try again."; }
    return { reply: reply, cta: intent.cta || null };
  };

  // ---- I3 — AI-predicted wait chip --------------------------------------
  // Compute trend direction from the rolling D.waitTrend buffer.
  SWIFT.ai.waitTrendDirection = function () {
    if (!Array.isArray(D.waitTrend) || D.waitTrend.length < 2) return "flat";
    const prev = D.waitTrend[D.waitTrend.length - 2];
    const last = D.waitTrend[D.waitTrend.length - 1];
    if (last > prev) return "up";
    if (last < prev) return "down";
    return "flat";
  };

  SWIFT.ai.renderWaitTrend = function () {
    const spark = $("heroWaitSparkline");
    const arrow = $("heroWaitTrend");
    if (!spark || !Array.isArray(D.waitTrend) || D.waitTrend.length < 2) return;
    const max = Math.max.apply(null, D.waitTrend);
    const min = Math.min.apply(null, D.waitTrend);
    const range = Math.max(1, max - min);
    const w = 60, h = 16;
    const step = w / Math.max(1, D.waitTrend.length - 1);
    const pts = D.waitTrend.map(function (v, i) {
      const x = (i * step).toFixed(1);
      const y = (h - ((v - min) / range) * h).toFixed(1);
      return x + "," + y;
    }).join(" ");
    spark.innerHTML = '<polyline points="' + pts + '" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />';
    const dir = SWIFT.ai.waitTrendDirection();
    const arrowGlyph = dir === "up"
      ? '<polyline points="6 9 12 3 18 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
      : dir === "down"
      ? '<polyline points="6 15 12 21 18 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
      : '<line x1="6" x2="18" y1="12" y2="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
    arrow.innerHTML = arrowGlyph;
    arrow.setAttribute("aria-label", "Trend " + dir);
  };

  // ---- I4 — AI picked this badge ----------------------------------------
  // Helper for the templates to check whether a card should show the badge.
  SWIFT.ai.isPickActive = function () {
    return document.body.dataset.campaign && document.body.dataset.campaign !== "default";
  };

  // Hide every AI-pick badge first, then reveal only the ones that match the
  // active campaign. The badge markup lives inside serviceTemplate / promoTemplate.
  SWIFT.ai.applyBadges = function (campaign) {
    const all = document.querySelectorAll('[data-ai-badge]');
    all.forEach(function (el) { el.classList.add("hidden"); });
    if (!campaign || campaign.id === "default") return;
    // Featured service card
    if (campaign.highlightService) {
      const cards = document.querySelectorAll('[data-service="' + campaign.highlightService.replace(/"/g, '\\"') + '"] [data-ai-badge="service"]');
      cards.forEach(function (el) { el.classList.remove("hidden"); });
    }
    // Featured promo card (campaigns may set promoId in a later phase)
    if (campaign.promoId) {
      const promo = document.querySelector('[data-promo-id="' + campaign.promoId.replace(/"/g, '\\"') + '"] [data-ai-badge="promo"]');
      if (promo) promo.classList.remove("hidden");
    }
  };

  // ---- I5 — JSON-LD + FAQ section ---------------------------------------
  SWIFT.ai.buildJsonLd = function () {
    const clinic = D.clinic || {};
    const services = (D.services || []).map(function (s) {
      return {
        "@type": "MedicalProcedure",
        name: s.name,
        description: s.summary,
      };
    });
    // Naive split of the address: "G38, 32 Civic Way, Rouse Hill, NSW 2155"
    const parts = (clinic.address || "").split(",").map(function (s) { return s.trim(); });
    const streetAddress = parts[0] || "";
    const addressLocality = parts[2] || "";
    const statePostcode = (parts[3] || "").split(" ");
    const addressRegion = statePostcode[0] || "";
    const postalCode = statePostcode[1] || "";

    const clinicJson = {
      "@context": "https://schema.org",
      "@type": "MedicalClinic",
      name: clinic.name,
      description: clinic.tagline,
      url: window.location.origin,
      telephone: clinic.phone,
      email: clinic.email,
      image: clinic.heroImage,
      address: {
        "@type": "PostalAddress",
        streetAddress: streetAddress,
        addressLocality: addressLocality,
        addressRegion: addressRegion,
        postalCode: postalCode,
        addressCountry: "AU",
      },
      openingHours: ["Mo-Su 10:00-22:00"],
      priceRange: clinic.facilityFee,
      medicalSpecialty: "Emergency",
      availableService: services,
    };

    const faqJson = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: (D.faq || []).map(function (f) {
        return { "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } };
      }),
    };

    return { clinic: JSON.stringify(clinicJson), faq: JSON.stringify(faqJson) };
  };

  SWIFT.ai.renderJsonLd = function () {
    const pair = SWIFT.ai.buildJsonLd();
    const c = $("jsonld-clinic"); if (c) c.textContent = pair.clinic;
    const f = $("jsonld-faq"); if (f) f.textContent = pair.faq;
  };

  SWIFT.ai.renderFaq = function () {
    const root = $("faqList");
    if (!root || !Array.isArray(D.faq)) return;
    root.innerHTML = D.faq.map(function (f, i) {
      return [
        '<details id="faq-' + i + '" class="group bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-teal-200 transition">',
          '<summary class="cursor-pointer list-none flex items-center justify-between gap-2">',
            '<span class="font-semibold text-slate-800 text-sm">' + escapeHTML(f.q) + '</span>',
            '<span class="text-teal-600 shrink-0 group-open:rotate-180 transition-transform">' + SWIFT.ui.icon("chevron-down", 18) + '</span>',
          '</summary>',
          '<p class="mt-3 text-sm text-slate-600 leading-relaxed">' + escapeHTML(f.a) + '</p>',
        '</details>',
      ].join("");
    }).join("");
  };

  // ---------- Init ----------

  // ---- Phase K3 — jump-bar scroll-spy -----------------------------
  // Map `data-jump-target` values to either a section id or a tab-panel id.
  // For tab-panel targets (pricing) we watch the parent `[data-tabs-root]`.
  // For section ids we watch the section directly.
  SWIFT.ui.initJumpSpy = function () {
    const pills = document.querySelectorAll('[data-jump-target]');
    if (!pills.length || typeof IntersectionObserver === "undefined") return;

    const resolveTarget = function (key) {
      // Map each pill to the actual element id it should observe. Tab panels are
      // observed directly; only the active (non-hidden) panel intersects, so pills
      // in the same hub don't light up together.
      const map = {
        pricing: 'pricing',
        journey: 'journey',
        amenities: 'amenities',
        location: 'location',
        checkin: 'checkinForm',
        enquiries: 'enquiries',
        wait: 'wait',
        services: 'services',
        faq: 'faq',
        doctors: 'doctors',
        promotions: 'promotions',
        home: 'home',
        intents: 'intents',
        getCare: 'getCare',
      };
      return map[key] || key;
    };

    const active = new Set();
    // N9: nothing maps to the hero, the intent cards, the Get-care band or the
    // What-to-expect / Practical-info tabs — over those stretches the active
    // set empties and the bar used to go blank. Keep the last highlighted pill
    // lit instead (dropping it only if that pill is hidden on this viewport).
    let lastHighlight = null;
    const pickHighlight = function () {
      for (const pill of pills) {
        const key = pill.getAttribute("data-jump-target");
        if (active.has(key) && pill.offsetParent !== null) return key;
      }
      return null;
    };
    const apply = function () {
      const current = pickHighlight();
      if (current) {
        lastHighlight = current;
      } else if (lastHighlight) {
        const held = document.querySelector('[data-jump-target="' + lastHighlight + '"]');
        if (!held || held.offsetParent === null) lastHighlight = null;
      }
      pills.forEach(function (pill) {
        const key = pill.getAttribute("data-jump-target");
        const isOn = active.has(key) || (!active.size && key === lastHighlight);
        pill.classList.toggle("is-active", isOn);
      });
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        const id = e.target.id;
        if (!id) return;
        pills.forEach(function (pill) {
          const key = pill.getAttribute('data-jump-target');
          if (resolveTarget(key) === id) {
            if (e.isIntersecting && e.intersectionRatio > 0) active.add(key);
            else active.delete(key);
          }
        });
        apply();
      });
    }, { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.05, 0.5] });

    pills.forEach(function (pill) {
      const key = pill.getAttribute("data-jump-target");
      const id = resolveTarget(key);
      const target = document.getElementById(id);
      if (target) observer.observe(target);
    });
  };

  SWIFT.init = function () {
    // Snapshot the original services/intents ordering so campaign re-orders can be undone.
    SWIFT.state._baseline = {
      services: D.services.slice(),
      intents: Array.isArray(D.intents) ? D.intents.slice() : [],
    };

    // Wire all global window.* handlers required by inline onclick
    window.openBooking = function (svc) { SWIFT.ui.openBooking(svc); };
    window.closeBooking = SWIFT.ui.closeBooking;
    window.toggleMobileNav = SWIFT.ui.toggleMobileNav;
    window.refreshWaitTimes = SWIFT.ui.refreshWaitTimes;
    window.getDirections = SWIFT.ui.getDirections;
    window.toggleChat = SWIFT.ui.toggleChat;
    window.sendChat = SWIFT.ui.sendChat;
    window.submitEnquiry = SWIFT.forms.submitEnquiry;
    window.submitBooking = SWIFT.forms.submitBooking;
    window.submitReferral = SWIFT.forms.submitReferral;
    window.submitQueue = SWIFT.forms.submitQueue;
    window.submitPricing = SWIFT.forms.submitPricing;

    // Esc closes any open modal / popover
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      const m1 = $("bookingModal");
      const m3 = $("chatPanel");
      const p = $("a11yPanel");
      if (m1 && !m1.classList.contains("hidden")) SWIFT.ui.closeBooking();
      if (p && !p.classList.contains("hidden")) p.classList.add("hidden");
      if (m3 && !m3.classList.contains("hidden")) SWIFT.ui.toggleChat();
    });

    // Accessibility popover toggle
    const a11yBtn = $("a11yToggle");
    if (a11yBtn) a11yBtn.onclick = SWIFT.a11y.togglePanel;

    // Restore a11y prefs before first paint
    SWIFT.a11y._apply(SWIFT.a11y.load());

    // Render data-driven sections
    SWIFT.render.renderTrust();
    SWIFT.render.renderIntents();
    SWIFT.render.renderDoctors();
    SWIFT.render.renderWaitTimes();
    SWIFT.render.renderPromos();
    SWIFT.render.renderAmenities();
    SWIFT.render.renderJourney();
    SWIFT.render.populateQueueServiceSelect();
    // Services rendered again by campaign.apply() to support highlight; render default first so highlight can be added
    SWIFT.render.renderServices(null);

    // Phase I — AI surfaces
    SWIFT.ai.renderJsonLd();
    SWIFT.ai.renderFaq();
    SWIFT.ai.renderWaitTrend();

    // Phase K3 — jump-bar scroll-spy
    SWIFT.ui.initJumpSpy();

    // T5 — overflow affordance for tab strips that clip on small screens:
    // a right-edge fade shows only while there is still more to scroll.
    $$('[role="tablist"]').forEach(function (ts) {
      const update = function () {
        const overflows = ts.scrollWidth > ts.clientWidth + 2;
        const atEnd = ts.scrollLeft + ts.clientWidth >= ts.scrollWidth - 4;
        ts.classList.toggle("can-scroll", overflows && !atEnd);
      };
      ts.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      update();
    });

    // Wire the "Before you visit" tab buttons (delegated so dynamically
    // inserted campaigns still work).
    document.addEventListener("click", function (e) {
      const btn = e.target.closest(".tab-button");
      if (!btn) return;
      const id = btn.getAttribute("data-tab");
      if (id) SWIFT.ui.openTab(id);
    });
    // Keyboard navigation between tabs (left/right arrows).
    document.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const btn = e.target.closest && e.target.closest(".tab-button");
      if (!btn) return;
      const buttons = Array.from(btn.parentElement.querySelectorAll(".tab-button"));
      const idx = buttons.indexOf(btn);
      const next = e.key === "ArrowRight" ? (idx + 1) % buttons.length : (idx - 1 + buttons.length) % buttons.length;
      const target = buttons[next];
      if (target) {
        target.focus();
        SWIFT.ui.openTab(target.getAttribute("data-tab"));
      }
    });
    // Default-open the first tab so deep-link #pricing/#journey/#amenities
    // still scroll-resolve to the right pane.
    const firstTab = document.querySelector(".tab-button");
    if (firstTab) SWIFT.ui.openTab(firstTab.getAttribute("data-tab"));

    // Deep-link hash → activate hidden tabs (e.g. #pricing lands on pricingPanel).
    // Handles initial load + later hashchange.
    if (window.location.hash) SWIFT.ui.handleHash();
    window.addEventListener("hashchange", function () {
      SWIFT.ui.handleHash();
    });

    // Apply campaign (URL or default)
    SWIFT.campaign.init();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", SWIFT.init);
  } else {
    SWIFT.init();
  }
})();
