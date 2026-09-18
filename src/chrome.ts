import { TOTAL_CORE_SWITCHES, type CoreLayoutId } from "./constants.ts";
import { state } from "./state.ts";
import { coreLayoutSpec } from "./topology.ts";

export function updateCoreChrome(): void {
  const spec = coreLayoutSpec(state.coreLayout);
  const coresLabel = `${TOTAL_CORE_SWITCHES} (${spec.label.replaceAll(" ", "")})`;

  const subtitle = document.getElementById("header-subtitle");
  if (subtitle) {
    subtitle.textContent = `511 HGX + 2 UFM HA (16 SUs) → 16 SLGs (128 Leaf / 128 Spine) → ${spec.groupCount} Core Groups (${TOTAL_CORE_SWITCHES} Core MQM9790)`;
  }

  const coreStat = document.getElementById("core-stat");
  if (coreStat) coreStat.textContent = coresLabel;

  const header = document.getElementById("core-tier-header");
  if (header) {
    const detail = state.showCoreSwitches
      ? `${spec.switchesPerGroup} SWITCHES DRAWN PER GROUP`
      : `${spec.switchesPerGroup} CORE SWITCHES PER GROUP`;
    header.textContent = `SUPER SPINE / CORE TIER — ${spec.groupCount} CORE GROUPS (64x NVIDIA QUANTUM-2 MQM9790 • ${detail})`;
  }

  const drawerLayout = document.getElementById("drawer-core-layout");
  if (drawerLayout) {
    drawerLayout.textContent = state.showCoreSwitches
      ? `${spec.label} · all ${spec.switchesPerGroup} switches shown`
      : `${spec.label} (${TOTAL_CORE_SWITCHES} MQM9790)`;
  }

  const drawerSc = document.getElementById("drawer-spine-core");
  if (drawerSc) {
    drawerSc.textContent =
      spec.id === "8x8"
        ? "Core Group N → all Spine Ns (8 × 8)"
        : "Core Group N & N+8 → all Spine Ns (16 × 4)";
  }

  document.querySelectorAll<HTMLButtonElement>("[data-core-layout]").forEach((button) => {
    button.classList.toggle("active", button.dataset.coreLayout === spec.id);
  });

  document.querySelectorAll<HTMLButtonElement>("[data-core-detail]").forEach((button) => {
    const expanded = button.dataset.coreDetail === "switches";
    button.classList.toggle("active", expanded === state.showCoreSwitches);
  });
}

export function layoutFromUrl(): CoreLayoutId | null {
  const param = new URLSearchParams(window.location.search).get("cores");
  if (param === "8x8" || param === "16x4") return param;
  return null;
}

export function coreSwitchesFromUrl(): boolean | null {
  const param = new URLSearchParams(window.location.search).get("coreSwitches");
  if (param === "1" || param === "true") return true;
  if (param === "0" || param === "false") return false;
  return null;
}

export function writeViewToUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.set("cores", state.coreLayout);
  if (state.showCoreSwitches) url.searchParams.set("coreSwitches", "1");
  else url.searchParams.delete("coreSwitches");
  window.history.replaceState({}, "", url);
}
