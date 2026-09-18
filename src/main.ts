import "./style.css";
import { isCoreLayoutId, type CoreLayoutId } from "./constants.ts";
import { coreSwitchesFromUrl, layoutFromUrl, updateCoreChrome, writeViewToUrl } from "./chrome.ts";
import { copyDrawIO, downloadDrawIO } from "./drawio.ts";
import { buildFabricMarkup } from "./fabric.ts";
import { filterRail, onSelectSU, setViewMode } from "./filters.ts";
import { bindPanZoom, resetZoom, setTransform, zoomIn, zoomOut } from "./panzoom.ts";
import { state, type ViewMode } from "./state.ts";

function rebuildFabric(): void {
  buildFabricMarkup();
  updateCoreChrome();
  if (state.selectedSU !== "all") {
    onSelectSU(state.selectedSU);
    return;
  }
  if (typeof state.selectedRail === "number") {
    filterRail(state.selectedRail);
    return;
  }
  setViewMode(state.viewMode);
}

function setCoreLayout(layout: CoreLayoutId): void {
  if (state.coreLayout === layout) return;
  state.coreLayout = layout;
  writeViewToUrl();
  rebuildFabric();
}

function setShowCoreSwitches(show: boolean): void {
  if (state.showCoreSwitches === show) return;
  state.showCoreSwitches = show;
  writeViewToUrl();
  rebuildFabric();
}

function bindChrome(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "copy-drawio") void copyDrawIO();
      if (action === "download-drawio") downloadDrawIO();
      if (action === "zoom-in") zoomIn();
      if (action === "zoom-out") zoomOut();
      if (action === "fit-view") resetZoom();
    });
  });

  const selector = document.getElementById("su-selector");
  if (selector instanceof HTMLSelectElement) {
    selector.addEventListener("change", () => onSelectSU(selector.value));
  }

  document.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.view as ViewMode | undefined;
      if (mode) setViewMode(mode);
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-su]").forEach((button) => {
    button.addEventListener("click", () => {
      const su = button.dataset.su;
      if (su) onSelectSU(su);
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-rail]").forEach((button) => {
    button.addEventListener("click", () => {
      const rail = Number(button.dataset.rail);
      if (Number.isFinite(rail)) filterRail(rail);
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-core-layout]").forEach((button) => {
    button.addEventListener("click", () => {
      const layout = button.dataset.coreLayout;
      if (layout && isCoreLayoutId(layout)) setCoreLayout(layout);
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-core-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      setShowCoreSwitches(button.dataset.coreDetail === "switches");
    });
  });
}

const fromUrl = layoutFromUrl();
if (fromUrl) state.coreLayout = fromUrl;
const switchesFromUrl = coreSwitchesFromUrl();
if (switchesFromUrl !== null) state.showCoreSwitches = switchesFromUrl;

buildFabricMarkup();
updateCoreChrome();
bindPanZoom();
bindChrome();
setTransform();
