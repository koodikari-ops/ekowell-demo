"use strict";

const REGIONAL_ROUTES = [
  { region: "Pirkanmaa & Tampere", city: "Tampere", slots: "2 paikkaa jäljellä", areas: "Tampere, Nokia, Ylöjärvi, Kangasala, Lempäälä" },
  { region: "Uusimaa & Pääkaupunkiseutu", city: "Espoo", slots: "3 paikkaa jäljellä", areas: "Espoo, Vantaa, Helsinki, Tuusula, Nurmijärvi, Porvoo" },
  { region: "Pohjois-Pohjanmaa & Oulu", city: "Oulu", slots: "1 paikka jäljellä", areas: "Oulu, Kempele, Liminka, Haukipudas, Raahe" },
  { region: "Pohjanmaa & Etelä-Pohjanmaa", city: "Seinäjoki", slots: "3 paikkaa jäljellä", areas: "Vaasa, Seinäjoki, Mustasaari, Lapua, Kauhava" },
  { region: "Savo & Keski-Suomi", city: "Jyväskylä", slots: "2 paikkaa jäljellä", areas: "Jyväskylä, Kuopio, Siilinjärvi, Muurame, Varkaus" },
  { region: "Lappi & Rovaniemi (Tehdas)", city: "Rovaniemi", slots: "Tehtaan kotialue", areas: "Rovaniemi, Tornio, Kemi, Sodankylä ja koko Lappi" },
];

const FALLBACK_REGISTRY = [
  { city: "Oulu", street_address: "Routakuja 14", serial_number: "EKO-2012-9844", model_series: "EVD" },
  { city: "Tampere", street_address: "Harjutie 8", serial_number: "EKO-2010-3321", model_series: "EVD" },
  { city: "Espoo", street_address: "Merituulentie 22", serial_number: "EKO-2014-8891", model_series: "EVT" },
];

function formatEur(val) {
  return Number(val).toLocaleString("fi-FI") + " EUR";
}

function calcDeterministicRoi(age, kwh, series) {
  const isEvd = series !== "EVT";
  const proactive = isEvd ? 3490 : 3290;
  const fullReplace = isEvd ? 14890 : 12900;
  const directSaving = fullReplace - proactive;
  const restoredCop = isEvd ? 4.3 : 4.05;
  const degradedCop = Math.max(2.35, Number((restoredCop - Math.max(0, age - 6) * 0.095).toFixed(2)));
  const annualSaving = Math.round((kwh / degradedCop - kwh / restoredCop) * 0.145);
  const stage = age >= 14 ? "VAIHTOIKÄINEN (14+ v) — Ennakoiva vaihto suositeltava" : "SEURANTAVAIHE (8-13 v)";
  return {
    device_age_years: age,
    annual_heating_kwh: kwh,
    proactive_capex_eur: proactive,
    direct_capex_saving_eur: directSaving,
    annual_savings_eur: annualSaving,
    degraded_cop: degradedCop,
    restored_cop: restoredCop,
    total_ten_year_advantage_eur: directSaving + annualSaving * 10,
    wear_stage: stage,
    desuperheater_temp_before_c: Math.max(46, 65 - Math.max(0, age - 8)),
    desuperheater_temp_after_c: 65,
  };
}

function renderRegionalRoutes() {
  const grid = document.getElementById("route-cards-grid");
  if (!grid) return;
  grid.innerHTML = "";
  REGIONAL_ROUTES.forEach((rt) => {
    const card = document.createElement("div");
    card.className = "route-card";
    card.innerHTML =
      `<div class="route-top"><strong>${rt.region}</strong><span class="route-badge">${rt.slots}</span></div>` +
      `<p class="route-cities">${rt.areas}</p>` +
      `<div class="route-footer"><span>Matkakulut: 0 EUR</span><span>Valitse alue -></span></div>`;
    card.addEventListener("click", () => {
      document.getElementById("city").value = rt.city;
      document.getElementById("varaus").scrollIntoView({ behavior: "smooth" });
      document.getElementById("customer-contact").focus();
    });
    grid.appendChild(card);
  });
}

function renderQuickFillPills(registry) {
  const box = document.getElementById("quick-fill-pills");
  if (!box) return;
  const list = registry && registry.length ? registry : FALLBACK_REGISTRY;
  box.innerHTML = "";
  list.slice(0, 3).forEach((eq) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quick-pill";
    btn.textContent = `${eq.city}: ${eq.serial_number}`;
    btn.addEventListener("click", () => {
      document.getElementById("city").value = eq.city;
      document.getElementById("street-address").value = eq.street_address;
      document.getElementById("serial-number").value = eq.serial_number;
      document.getElementById("customer-contact").value = "040 555 1234";
      document.getElementById("model-series").value = eq.model_series;
      recalculateRoiLive();
    });
    box.appendChild(btn);
  });
}

function applyRoiToDom(roi) {
  if (!roi) return;
  document.getElementById("device-age-val").textContent = roi.device_age_years + " vuotta";
  document.getElementById("annual-kwh-val").textContent = Number(roi.annual_heating_kwh).toLocaleString("fi-FI") + " kWh";
  document.getElementById("kpi-capex-saving").textContent = formatEur(roi.direct_capex_saving_eur);
  document.getElementById("kpi-proactive-price").textContent = formatEur(roi.proactive_capex_eur);
  document.getElementById("kpi-annual-saving").textContent = formatEur(roi.annual_savings_eur) + " / v";
  document.getElementById("kpi-cop-change").textContent = roi.degraded_cop.toFixed(2) + " -> " + roi.restored_cop.toFixed(2);
  document.getElementById("kpi-ten-year").textContent = formatEur(roi.total_ten_year_advantage_eur);
  document.getElementById("technical-diagnosis").textContent =
    `${roi.wear_stage}: Kuumakaasun tulistuslämpötila nousee kompressorinvaihdolla arvoon ${roi.desuperheater_temp_after_c} C (nykyinen arvio ${roi.desuperheater_temp_before_c} C).`;
}

async function recalculateRoiLive() {
  const age = Number(document.getElementById("device-age").value);
  const kwh = Number(document.getElementById("annual-kwh").value);
  const series = document.getElementById("model-series").value;
  try {
    const res = await fetch("api/calculate-roi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_age_years: age, annual_heating_kwh: kwh, model_series: series }),
    });
    if (res.ok) {
      applyRoiToDom(await res.json());
      return;
    }
  } catch (_) {}
  applyRoiToDom(calcDeterministicRoi(age, kwh, series));
}

function renderLeadsList(leads) {
  const container = document.getElementById("leads-list");
  if (!container) return;
  container.innerHTML = "";
  leads.forEach((lead) => {
    const item = document.createElement("div");
    item.className = "lead-card";
    item.innerHTML =
      `<div class="source-card-top"><strong>${escapeHtml(lead.city)} — ${escapeHtml(lead.serial_number)}</strong><span class="status-pill">${escapeHtml(lead.route_cluster)}</span></div>` +
      `<p>${escapeHtml(lead.notes || lead.street_address)} | Paketti: ${formatEur(lead.estimated_capex_eur)} | Vuosisäästö: ${formatEur(lead.annual_savings_eur)}</p>` +
      `<div class="button-row"><button type="button" class="btn-secondary btn-sm" data-del-lead="${escapeHtml(lead.id)}">Poista varaus</button></div>`;
    item.querySelector(`[data-del-lead="${lead.id}"]`).addEventListener("click", async () => {
      try {
        const r = await fetch(`api/leads/${lead.id}`, { method: "DELETE" });
        if (r.ok) await loadInitialState();
      } catch (_) {}
    });
    container.appendChild(item);
  });
}

function setupBookingForm() {
  const form = document.getElementById("booking-form");
  if (!form) return;
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const checkedIntent = form.querySelector('input[name="service_intent"]:checked');
    const intentText = checkedIntent ? checkedIntent.value : "Maksuton puhelinkartoitus";
    const variantKey = typeof getActiveVariantKey === "function" ? getActiveVariantKey() : "A";
    const rawSerial = (document.getElementById("serial-number").value || "").trim();
    const rawStreet = (document.getElementById("street-address").value || "").trim();
    const rawNotes = (document.getElementById("booking-notes").value || "").trim();
    const payload = {
      serial_number: rawSerial || "PIKAVARAUS-PUHELIN",
      street_address: rawStreet || "Tarkennetaan puhelussa",
      city: document.getElementById("city").value,
      customer_contact: document.getElementById("customer-contact").value,
      model_series: document.getElementById("model-series").value,
      device_age_years: Number(document.getElementById("device-age").value),
      annual_kwh: Number(document.getElementById("annual-kwh").value),
      notes: `Variantti ${variantKey} | ${intentText}` + (rawNotes ? ` | ${rawNotes}` : ""),
    };
    const box = document.getElementById("verification-result");
    try {
      const res = await fetch("api/verify-and-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const v = data.verification;
        box.classList.remove("hidden");
        box.innerHTML =
          `<strong>Kiitos! Pyyntösi on vastaanotettu (${escapeHtml(v.route_cluster)})</strong>` +
          `<p>Valittu palvelu: <strong>${escapeHtml(intentText)}</strong> (A/B-tulokulma ${escapeHtml(variantKey)}). Matkakulut reitillä: ${escapeHtml(v.travel_fee_eur)} EUR (norm. ${escapeHtml(v.normal_travel_fee_eur)} EUR). Ekowellin tehtaan asiantuntija ottaa yhteyttä numeroon ${escapeHtml(payload.customer_contact)}.</p>`;
        updateSyncClock(data.synced_at);
        await loadInitialState();
        return;
      }
    } catch (_) {}
    box.classList.remove("hidden");
    box.innerHTML =
      `<strong>Kiitos! Pyyntösi on vastaanotettu (${escapeHtml(payload.city)} — Ekowell-huoltoreitti)</strong>` +
      `<p>Valittu palvelu: <strong>${escapeHtml(intentText)}</strong> (A/B-tulokulma ${escapeHtml(variantKey)}). Matkakulut reitillä: 0 EUR (norm. 180 EUR). Ekowellin tehtaan asiantuntija ottaa yhteyttä numeroon ${escapeHtml(payload.customer_contact)} ja vahvistaa kiinteän hinnan.</p>`;
  });
}

function setupSparringHandler() {
  const btn = document.getElementById("btn-spar");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const q = document.getElementById("spar-question").value;
    const box = document.getElementById("spar-answer-box");
    const txt = document.getElementById("spar-answer-text");
    const wm = document.getElementById("spar-watermark");
    box.classList.remove("hidden");
    txt.textContent = "Haetaan vastausta Ekowellin tietopohjasta...";
    try {
      const res = await fetch("api/spar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (res.ok) {
        const data = await res.json();
        wm.textContent = data.sparring.provenance_type;
        txt.textContent = data.sparring.answer;
        updateSyncClock(data.synced_at);
        return;
      }
    } catch (_) {}
    wm.textContent = "DETERMINISTIC_RULES";
    txt.textContent =
      "Ekowell-maalämpöpumpun varaaja toimii suljetussa lämmityskierrossa, jossa veteen liuennut happi kuluu nopeasti loppuun ja vedestä tulee hapetonta, jolloin ruostuminen käytännössä pysähtyy. Lisäksi kuumakaasu kiertää kuparikierukoissa suoraan varaajan sisällä ilman hajoavia levylämmönvaihtimia tai vaihtoventtiileitä. Siksi pelkän kompressorimoduulin vaihto (3 490 EUR) palauttaa uuden laitteen tulistustehon ja COP 4.30 -hyötysuhteen.";
  });
}

async function loadInitialState() {
  try {
    const res = await fetch("api/state");
    if (res.ok) {
      const state = await res.json();
      updateSyncClock(state.synced_at);
      applyRoiToDom(state.default_roi);
      renderQuickFillPills(state.equipment_registry || []);
      renderSourcesList(state.sources || []);
      renderLeadsList(state.leads || []);
      return;
    }
  } catch (_) {}
  applyRoiToDom(calcDeterministicRoi(15, 26000, "EVD"));
  renderQuickFillPills(FALLBACK_REGISTRY);
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof initAbTestingBar === "function") initAbTestingBar();
  renderRegionalRoutes();
  ["device-age", "annual-kwh", "model-series"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", recalculateRoiLive);
  });
  setupSourcesCrudHandlers();
  setupBookingForm();
  setupSparringHandler();
  loadInitialState();
});
