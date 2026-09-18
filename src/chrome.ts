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
    header.textContent = `SUPER SPINE / CORE TIER — ${spec.groupCount} CORE GROUPS (64x NVIDIA QUANTUM-2 MQM9790 • ${spec.switchesPerGroup} CORE SWITCHES PER GROUP)`;
  }

  const drawerLayout = document.getElementById("drawer-core-layout");
  if (drawerLayout) drawerLayout.textContent = `${spec.label} (${TOTAL_CORE_SWITCHES} MQM9790)`;

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
}

export function layoutFromUrl(): CoreLayoutId | null {
  const param = new URLSearchParams(window.location.search).get("cores");
  if (param === "8x8" || param === "16x4") return param;
  return null;
}

export function writeLayoutToUrl(layout: CoreLayoutId): void {
  const url = new URL(window.location.href);
  url.searchParams.set("cores", layout);
  window.history.replaceState({}, "", url);
}
