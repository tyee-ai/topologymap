import "./style.css";
import { copyDrawIO, downloadDrawIO } from "./drawio.ts";
import { buildFabricMarkup } from "./fabric.ts";
import { filterRail, onSelectSU, setViewMode } from "./filters.ts";
import { bindPanZoom, resetZoom, setTransform, zoomIn, zoomOut } from "./panzoom.ts";
import type { ViewMode } from "./state.ts";

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
}

buildFabricMarkup();
bindPanZoom();
bindChrome();
setTransform();
