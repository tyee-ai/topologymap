import { RAIL_COLORS } from "./constants.ts";
import { state, type Selection, type ViewMode } from "./state.ts";

const statusText = document.getElementById("active-status-text");

function setStatus(html: string): void {
  if (statusText) statusText.innerHTML = html;
}

function clearPillActive(): void {
  document.querySelectorAll(".legend-pill").forEach((pill) => pill.classList.remove("active"));
}

export function showAllRails(): void {
  state.selectedRail = "all";
  state.selectedSU = "all";
  clearPillActive();
  document.getElementById("su-btn-all")?.classList.add("active");

  const selector = document.getElementById("su-selector");
  if (selector instanceof HTMLSelectElement) selector.value = "all";

  setStatus("Viewing full 16 SU / 16 SLG fabric topology");

  document.querySelectorAll<HTMLElement>(".su-box").forEach((box) => {
    box.style.filter = "none";
    box.style.strokeWidth = "1.6px";
  });
  document.querySelectorAll<HTMLElement>(".leaf-box").forEach((box) => {
    box.style.filter = "none";
    box.style.strokeWidth = "1.2px";
  });
  document.querySelectorAll<HTMLElement>(".fabric-link").forEach((link) => {
    link.style.opacity = "0.35";
    link.style.strokeWidth = "1px";
    link.style.display = "block";
  });
  document.querySelectorAll<HTMLElement>(".ls-crossbar-link").forEach((link) => {
    link.style.opacity = "0.75";
    link.style.strokeWidth = "1.5px";
    link.style.display = "block";
  });
}

export function filterRail(railNum: number): void {
  state.selectedRail = railNum;
  clearPillActive();
  document.getElementById(`rail-btn-${railNum}`)?.classList.add("active");

  setStatus(
    `Filtered by <b style="color:${RAIL_COLORS[railNum - 1]};">Rail ${railNum} (SP${railNum})</b> across ALL 16 SUs &amp; 16 SLGs`,
  );

  document.querySelectorAll<HTMLElement>(".su-box").forEach((box) => {
    box.style.filter = "brightness(1.1)";
    box.style.strokeWidth = "1.6px";
  });

  document.querySelectorAll<HTMLElement>(".leaf-box").forEach((box) => {
    if (box.classList.contains(`leaf-rail-${railNum}`)) {
      box.style.filter = `brightness(1.6) drop-shadow(0 0 8px ${RAIL_COLORS[railNum - 1]})`;
      box.style.strokeWidth = "2.2px";
    } else {
      box.style.filter = "brightness(0.3)";
      box.style.strokeWidth = "0.8px";
    }
  });

  document.querySelectorAll<HTMLElement>(".fabric-link, .ls-crossbar-link").forEach((link) => {
    if (link.classList.contains(`rail-link-${railNum}`)) {
      link.style.opacity = "1";
      link.style.strokeWidth = "2.2px";
      link.style.display = "block";
    } else {
      link.style.opacity = "0.03";
      link.style.strokeWidth = "0.8px";
    }
  });
}

export function onSelectSU(suVal: Selection | string): void {
  const normalized: Selection = suVal === "all" ? "all" : Number(suVal);
  state.selectedSU = normalized;

  const selector = document.getElementById("su-selector");
  if (selector instanceof HTMLSelectElement) selector.value = String(suVal);

  clearPillActive();

  if (normalized === "all") {
    document.getElementById("su-btn-all")?.classList.add("active");
    showAllRails();
    applyViewMode(state.viewMode);
    return;
  }

  document.getElementById(`su-btn-${normalized}`)?.classList.add("active");

  const targetSlgs = normalized <= 8 ? "SLGs 1..8" : "SLGs 9..16";
  setStatus(
    `Tracing <b style="color:#6EE7B7;">SU ${normalized}</b>: Hosts → Leaf-SU${normalized} in ${targetSlgs} → Spines 1..8 → Active Core Mesh`,
  );

  document.querySelectorAll<HTMLElement>(".su-box").forEach((box, idx) => {
    if (idx + 1 === normalized) {
      box.style.filter = "brightness(1.5) drop-shadow(0 0 12px #38bdf8)";
      box.style.strokeWidth = "2.6px";
    } else {
      box.style.filter = "brightness(0.5)";
      box.style.strokeWidth = "1px";
    }
  });

  document.querySelectorAll<HTMLElement>(".leaf-box").forEach((box) => {
    if (box.classList.contains(`leaf-box-su${normalized}`)) {
      box.style.filter = "brightness(1.6) drop-shadow(0 0 8px #FBBF24)";
      box.style.strokeWidth = "2.4px";
    } else {
      box.style.filter = "brightness(0.4)";
      box.style.strokeWidth = "0.8px";
    }
  });

  document.querySelectorAll<HTMLElement>(".ls-crossbar-link").forEach((link) => {
    if (link.classList.contains(`su-leaf-spine-link-${normalized}`)) {
      link.style.opacity = "1";
      link.style.strokeWidth = "2.8px";
      link.style.filter = "drop-shadow(0 0 5px currentColor)";
    } else {
      link.style.opacity = "0.02";
      link.style.strokeWidth = "0.5px";
      link.style.filter = "none";
    }
  });

  document.querySelectorAll<HTMLElement>(".host-leaf-link").forEach((link) => {
    if (link.classList.contains(`su-host-link-${normalized}`)) {
      link.style.opacity = "1";
      link.style.strokeWidth = "2.2px";
    } else {
      link.style.opacity = "0.02";
    }
  });

  document.querySelectorAll<HTMLElement>(".spine-core-link").forEach((link) => {
    link.style.opacity = "0.85";
    link.style.strokeWidth = "0.8px";
  });
}

function applyViewMode(mode: ViewMode): void {
  const showLs = mode === "all" || mode === "leaf-spine";
  const showHl = mode === "all" || mode === "host-leaf";
  const showSc = mode === "all" || mode === "spine-core";

  document.querySelectorAll<HTMLElement>(".ls-crossbar-link").forEach((link) => {
    link.style.display = showLs ? "block" : "none";
  });
  document.querySelectorAll<HTMLElement>(".host-leaf-link").forEach((link) => {
    link.style.display = showHl ? "block" : "none";
  });
  document.querySelectorAll<HTMLElement>(".spine-core-link").forEach((link) => {
    link.style.display = showSc ? "block" : "none";
  });
}

export function setViewMode(mode: ViewMode): void {
  state.viewMode = mode;
  document.querySelectorAll(".control-strip .btn").forEach((btn) => btn.classList.remove("active"));
  const activeId =
    mode === "all"
      ? "btn-view-all"
      : mode === "leaf-spine"
        ? "btn-view-ls"
        : mode === "host-leaf"
          ? "btn-view-hl"
          : "btn-view-sc";
  document.getElementById(activeId)?.classList.add("active");

  if (state.selectedSU !== "all") {
    onSelectSU(state.selectedSU);
    return;
  }

  applyViewMode(mode);
}
