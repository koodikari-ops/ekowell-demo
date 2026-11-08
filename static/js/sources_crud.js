"use strict";

function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function updateSyncClock(isoTimestamp) {
  const el = document.getElementById("hud-sync");
  if (el && isoTimestamp) {
    el.textContent = "Synkronoitu " + isoTimestamp.slice(0, 19).replace("T", " ");
  }
}

function renderSourcesList(sources) {
  const container = document.getElementById("sources-list");
  if (!container) return;
  container.innerHTML = "";
  sources.forEach((src) => {
    const card = document.createElement("div");
    card.className = "source-card";
    card.innerHTML =
      `<div class="source-card-top">` +
      `<strong>${escapeHtml(src.title)}</strong>` +
      `<span class="status-pill">${escapeHtml(src.source_type)}</span>` +
      `</div>` +
      `<p>${escapeHtml(src.summary)}</p>` +
      `<div class="button-row">` +
      `<button type="button" class="btn-secondary btn-sm" data-edit="${escapeHtml(src.id)}">Muokkaa</button>` +
      `<button type="button" class="btn-secondary btn-sm" data-del="${escapeHtml(src.id)}">Poista</button>` +
      `</div>`;
    card.querySelector(`[data-edit="${src.id}"]`).addEventListener("click", () => {
      openSourceEditForm(src);
    });
    card.querySelector(`[data-del="${src.id}"]`).addEventListener("click", async () => {
      const r = await fetch(`/api/sources/${src.id}`, { method: "DELETE" });
      if (r.ok) await refreshSourcesFromServer();
    });
    container.appendChild(card);
  });
}

function openSourceEditForm(src) {
  const form = document.getElementById("source-form");
  if (!form) return;
  form.classList.remove("hidden");
  document.getElementById("source-id").value = src ? src.id : "";
  document.getElementById("source-title").value = src ? src.title : "";
  document.getElementById("source-type").value = src ? src.source_type : "Strategia";
  document.getElementById("source-url").value = src ? src.reference_url || "" : "";
  document.getElementById("source-summary").value = src ? src.summary : "";
}

async function refreshSourcesFromServer() {
  const res = await fetch("/api/sources");
  if (!res.ok) return;
  const data = await res.json();
  renderSourcesList(data.sources || []);
  updateSyncClock(data.synced_at);
}

function setupSourcesCrudHandlers() {
  const toggleBtn = document.getElementById("btn-toggle-add-source");
  const cancelBtn = document.getElementById("btn-cancel-source");
  const form = document.getElementById("source-form");
  if (!toggleBtn || !form) return;

  toggleBtn.addEventListener("click", () => {
    openSourceEditForm(null);
  });

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      form.reset();
      form.classList.add("hidden");
    });
  }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const editId = document.getElementById("source-id").value;
    const payload = {
      title: document.getElementById("source-title").value,
      source_type: document.getElementById("source-type").value,
      reference_url: document.getElementById("source-url").value,
      summary: document.getElementById("source-summary").value,
    };
    const url = editId ? `/api/sources/${editId}` : "/api/sources";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      form.reset();
      form.classList.add("hidden");
      await refreshSourcesFromServer();
    }
  });
}
