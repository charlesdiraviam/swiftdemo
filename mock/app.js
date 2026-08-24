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
    triage: {},
    a11y: {},
    state: { queueNumber: D.queuePosition.currentInQueue, lastCampaignId: null, lang: "en" },
    init: function () {},
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
              <span class="text-2xl">${escapeHTML(item.icon || "")}</span>
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
              <span class="text-2xl">${escapeHTML(item.icon || "")}</span>
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
          <span class="flex items-center gap-2"><span class="text-2xl">${escapeHTML(item.icon || "")}</span><span>${escapeHTML(item.title)}</span></span>
          <span class="text-teal-600 group-open:rotate-180 transition-transform">▾</span>
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
  };

  // ---------- Section templates ----------

  function serviceTemplate(s) {
    const treatments = (s.treatments || []).map((t) => `<li class="text-sm text-slate-600">• ${escapeHTML(t)}</li>`).join("");
    return `
      <div data-id="${escapeHTML(s.name)}" data-service="${escapeHTML(s.name)}" class="bg-white rounded-2xl border border-slate-200 p-6 transition hover:shadow-md">
        <div class="text-4xl">${escapeHTML(s.icon)}</div>
        <h3 class="mt-3 text-xl font-extrabold text-slate-800">${escapeHTML(s.name)}</h3>
        <p class="text-sm text-teal-600 font-semibold mt-1">${escapeHTML(s.cost)}</p>
        <p class="mt-3 text-slate-600">${escapeHTML(s.summary)}</p>
        <ul class="mt-3 space-y-1">${treatments}</ul>
        <button onclick="SWIFT.ui.openBooking('${escapeHTML(s.name).replace(/'/g, "\\'")}')" class="mt-5 w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2.5 rounded-xl text-sm">Book this service</button>
      </div>`;
  }

  function doctorTemplate(d) {
    return `
      <div class="bg-white rounded-2xl border border-slate-200 p-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-full bg-teal-500 text-white grid place-items-center font-extrabold text-lg shrink-0">${escapeHTML(d.initials)}</div>
          <div>
            <h3 class="text-lg font-extrabold text-slate-800">${escapeHTML(d.name)}</h3>
            <p class="text-sm text-teal-600 font-semibold">${escapeHTML(d.role)}</p>
            <p class="text-xs text-slate-400">${escapeHTML(d.specialty)}</p>
          </div>
        </div>
        <p class="mt-4 text-slate-600 text-sm">${escapeHTML(d.bio)}</p>
      </div>`;
  }

  function waitTemplate(h) {
    const isSwift = h.distanceKm === 0;
    return `
      <div class="flex items-center justify-between bg-white/10 rounded-xl p-4 border border-white/15">
        <div>
          <div class="font-semibold">${escapeHTML(h.name)}</div>
          <div class="text-xs text-slate-300">${h.distanceKm === 0 ? "On-site" : escapeHTML(h.distanceKm) + " km away"}</div>
        </div>
        <div class="text-right">
          <div class="text-2xl font-extrabold ${isSwift ? "text-teal-300" : "text-white"}">${h.mins} min</div>
          <div class="text-[10px] uppercase tracking-wider text-slate-300">wait</div>
        </div>
      </div>`;
  }

  function promoTemplate(p) {
    return `
      <div class="bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-2xl p-6">
        <div class="inline-block bg-white/20 text-xs font-semibold px-2 py-1 rounded-full">${escapeHTML(p.badge)}</div>
        <h3 class="mt-3 text-xl font-extrabold">${escapeHTML(p.title)}</h3>
        <p class="mt-2 text-teal-50/90">${escapeHTML(p.body)}</p>
      </div>`;
  }

  function trustTemplate(s) {
    return `
      <div class="text-center p-4">
        <div class="text-2xl sm:text-3xl font-extrabold text-teal-700">${escapeHTML(s.value)}</div>
        <div class="mt-1 text-sm font-semibold text-slate-700">${escapeHTML(s.label)}</div>
        <div class="text-xs text-slate-400">${escapeHTML(s.sub || "")}</div>
      </div>`;
  }

  function intentTemplate(i) {
    const label = i.action && (i.action.label || i.action.ctaLabel) || "Go";
    const onclick = `SWIFT.ui.runAction(${JSON.stringify(i.action || {}).replace(/"/g, "&quot;")})`;
    return `
      <button onclick='${onclick}' class="text-left bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-teal-300 transition">
        <div class="text-4xl">${escapeHTML(i.icon)}</div>
        <div class="mt-3 text-lg font-extrabold text-slate-800">${escapeHTML(i.title)}</div>
        <div class="mt-1 text-sm text-slate-500">${escapeHTML(i.sub)}</div>
        <div class="mt-4 text-teal-600 font-semibold text-sm">→ ${escapeHTML(label)}</div>
      </button>`;
  }

  function amenityTemplate(a) {
    return `
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
        <div class="text-3xl">${escapeHTML(a.icon)}</div>
        <div class="mt-2 text-sm font-semibold text-slate-700">${escapeHTML(a.label)}</div>
      </div>`;
  }

  function triageQuestionTemplate(q, idx, total) {
    const options = q.options.map((o, i) => `
      <button data-qid="${escapeHTML(q.id)}" data-oi="${i}" class="triage-option w-full text-left bg-white hover:bg-teal-50 border border-slate-200 rounded-xl p-4 font-semibold text-slate-700">${escapeHTML(o.label)}</button>
    `).join("");
    return `
      <div class="triage-card hidden bg-teal-50 border border-teal-200 rounded-2xl p-6" data-triage-q="${escapeHTML(q.id)}">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs uppercase tracking-wider text-teal-700 font-semibold">Question ${idx + 1} of ${total}</span>
          <button onclick="SWIFT.triage.reset()" class="text-xs text-teal-700 underline">Start over</button>
        </div>
        <p class="text-lg font-extrabold text-slate-800">${escapeHTML(q.text)}</p>
        <div class="mt-4 space-y-2">${options}</div>
      </div>`;
  }

  function triageOutcomeTemplate(o, key) {
    const onclick = `SWIFT.ui.runAction(${JSON.stringify(o.cta || {}).replace(/"/g, "&quot;")})`;
    return `
      <div class="triage-card hidden bg-white border-2 border-teal-300 rounded-2xl p-6 text-center" data-triage-outcome="${escapeHTML(key)}">
        <div class="text-5xl">${escapeHTML(o.icon)}</div>
        <h3 class="mt-3 text-2xl font-extrabold text-slate-800">${escapeHTML(o.title)}</h3>
        <p class="mt-2 text-slate-600">${escapeHTML(o.body)}</p>
        <button onclick='${onclick}' class="mt-5 bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-3 rounded-xl">${escapeHTML(o.cta.label)}</button>
        <div class="mt-3"><button onclick="SWIFT.triage.reset()" class="text-teal-700 underline text-sm">Start over</button></div>
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
  };

  SWIFT.render.renderPromos = function () {
    SWIFT.render.renderCardGrid("promoGrid", D.promotions, promoTemplate);
  };

  SWIFT.render.renderTrust = function () {
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

  SWIFT.render.renderTriageCards = function () {
    const container = $("triageQuestions");
    if (!container) return;
    const total = D.triageQuestions.length;
    const qCards = D.triageQuestions.map((q, i) => triageQuestionTemplate(q, i, total)).join("");
    const outcomeKeys = Object.keys(D.triageOutcomes);
    const outcomeCards = outcomeKeys.map((k) => triageOutcomeTemplate(D.triageOutcomes[k], k)).join("");
    container.innerHTML = qCards + outcomeCards;
    // Attach delegated click for options
    container.addEventListener("click", function (e) {
      const opt = e.target.closest(".triage-option");
      if (!opt) return;
      const qid = opt.getAttribute("data-qid");
      const oi = parseInt(opt.getAttribute("data-oi"), 10);
      SWIFT.triage.answer(qid, oi);
    });
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
      SWIFT.ui._chatAdd("bot", "Hi! I'm the SWIFT demo assistant. Ask me about wait times, fees, hours, services, or booking.");
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
    const match = D.chatScript.find((s) => s.q.test(text));
    const reply = match ? match.a : "Thanks — I'll pass that to the team. For anything urgent, please call (02) 8859 9099.";
    setTimeout(() => SWIFT.ui._chatAdd("bot", reply), 300);
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

  SWIFT.ui.openResults = function () {
    const m = $("resultsModal");
    if (!m) return;
    m.classList.remove("hidden");
    m.classList.add("flex");
    $("resultsLogin").classList.remove("hidden");
    $("resultsData").classList.add("hidden");
    $("resultsData").innerHTML = "";
  };

  SWIFT.ui.closeResults = function () {
    const m = $("resultsModal");
    if (!m) return;
    m.classList.add("hidden");
    m.classList.remove("flex");
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
    const container = $("checkinForm");
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
    // Restore the form
    const container = $("checkinForm");
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
    else scenarioId = "uninsured";
    const scenario = D.pricingScenarios.items.find((x) => x.id === scenarioId);
    const result = $("pricingResult");
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
          <div class="flex justify-between"><dt>Medicare rebate</dt><dd class="font-semibold">− $${D.pricingScenarios.medicareRebate.toFixed(2)}</dd></div>
        </dl>
        <button onclick="SWIFT.forms.resetPricing()" class="mt-5 text-teal-700 underline text-sm">Try another scenario</button>
      </div>`;
  };

  SWIFT.forms.resetPricing = function () {
    $("pricingForm").reset();
    $("pricingResult").classList.add("hidden");
    $("pricingResult").innerHTML = "";
  };

  SWIFT.forms.submitResultsLogin = function (e) {
    e.preventDefault();
    const u = $("resultsUser").value.trim();
    const p = $("resultsPass").value;
    const creds = D.testResultsSample.login;
    if (u !== creds.demoUser || p !== creds.demoPass) {
      SWIFT.ui.toast("Invalid demo credentials — try demo / demo");
      return;
    }
    const rows = D.testResultsSample.results.map((r) => `
      <tr class="border-b border-slate-200 last:border-0">
        <td class="py-3 pr-3 text-sm text-slate-700">${escapeHTML(r.date)}</td>
        <td class="py-3 pr-3 text-sm font-semibold text-slate-800">${escapeHTML(r.test)}</td>
        <td class="py-3 pr-3 text-sm text-slate-600">${escapeHTML(r.result)}</td>
        <td class="py-3 text-sm text-teal-700">${escapeHTML(r.status)}</td>
      </tr>
    `).join("");
    $("resultsLogin").classList.add("hidden");
    const data = $("resultsData");
    data.classList.remove("hidden");
    data.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <th class="py-2 pr-3">Date</th><th class="py-2 pr-3">Test</th><th class="py-2 pr-3">Result</th><th class="py-2">Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="mt-4 text-xs text-slate-400">Sample data only — real portal would link to your records.</p>`;
  };

  // ---------- Triage ----------

  SWIFT.triage.start = function () {
    $("triageIntro").classList.add("hidden");
    $$("#triageQuestions .triage-card").forEach((c) => c.classList.add("hidden"));
    SWIFT.triage._showQuestion(D.triageQuestions[0].id);
  };

  SWIFT.triage.reset = function () {
    $("triageIntro").classList.remove("hidden");
    $$("#triageQuestions .triage-card").forEach((c) => c.classList.add("hidden"));
  };

  SWIFT.triage.answer = function (qid, optionIndex) {
    const q = D.triageQuestions.find((x) => x.id === qid);
    if (!q) return;
    const opt = q.options[optionIndex];
    if (!opt) return;
    if (opt.outcome) {
      SWIFT.triage._showOutcome(opt.outcome);
    } else if (opt.next) {
      SWIFT.triage._showQuestion(opt.next);
    }
  };

  SWIFT.triage._showQuestion = function (qid) {
    $$("#triageQuestions .triage-card").forEach((c) => c.classList.add("hidden"));
    const card = document.querySelector(`[data-triage-q="${qid}"]`);
    if (card) card.classList.remove("hidden");
  };

  SWIFT.triage._showOutcome = function (key) {
    $$("#triageQuestions .triage-card").forEach((c) => c.classList.add("hidden"));
    const card = document.querySelector(`[data-triage-outcome="${key}"]`);
    if (card) card.classList.remove("hidden");
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

    // Highlight matching service card
    SWIFT.render.renderServices(c.highlightService);

    // Update switcher active state
    SWIFT.campaign._renderSwitcher(c.id);
  };

  SWIFT.campaign.reset = function () {
    sessionStorage.removeItem("swiftCampaign");
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

  // ---------- Init ----------

  SWIFT.init = function () {
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
    window.submitResultsLogin = SWIFT.forms.submitResultsLogin;
    window.openResults = SWIFT.ui.openResults;
    window.closeResults = SWIFT.ui.closeResults;

    // Esc closes any open modal / popover
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      const m1 = $("bookingModal");
      const m2 = $("resultsModal");
      const m3 = $("chatPanel");
      const p = $("a11yPanel");
      if (m1 && !m1.classList.contains("hidden")) SWIFT.ui.closeBooking();
      if (m2 && !m2.classList.contains("hidden")) SWIFT.ui.closeResults();
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
    SWIFT.render.renderTriageCards();
    // Services rendered again by campaign.apply() to support highlight; render default first so highlight can be added
    SWIFT.render.renderServices(null);

    // Apply campaign (URL or default)
    SWIFT.campaign.init();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", SWIFT.init);
  } else {
    SWIFT.init();
  }
})();
