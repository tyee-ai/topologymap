const scene = document.getElementById("scene");
const container = document.getElementById("viewport-container");

export const MIN_SCALE = 0.18;
export const MAX_SCALE = 3.5;
export const DEFAULT_SCALE = 0.88;

let scale = DEFAULT_SCALE;
let pointX = 20;
let pointY = 10;
let isPanning = false;
let startX = 0;
let startY = 0;

const listeners = new Set<(next: number) => void>();

function clampScale(value: number): number {
  return Math.min(Math.max(value, MIN_SCALE), MAX_SCALE);
}

function notifyZoom(): void {
  listeners.forEach((listener) => listener(scale));
}

export function getScale(): number {
  return scale;
}

export function onZoomChange(listener: (next: number) => void): void {
  listeners.add(listener);
}

export function setTransform(): void {
  scene?.setAttribute("transform", `translate(${pointX}, ${pointY}) scale(${scale})`);
  notifyZoom();
}

export function applyScale(next: number, clientX?: number, clientY?: number): void {
  if (!container) {
    scale = clampScale(next);
    setTransform();
    return;
  }
  const originX = clientX ?? container.clientWidth / 2;
  const originY = clientY ?? container.clientHeight / 2;
  const xs = (originX - pointX) / scale;
  const ys = (originY - pointY) / scale;
  scale = clampScale(next);
  pointX = originX - xs * scale;
  pointY = originY - ys * scale;
  setTransform();
}

export function zoomIn(): void {
  applyScale(scale * 1.12);
}

export function zoomOut(): void {
  applyScale(scale / 1.12);
}

export function resetZoom(): void {
  scale = DEFAULT_SCALE;
  pointX = 20;
  pointY = 10;
  setTransform();
}

export function bindPanZoom(): void {
  if (!container) return;

  container.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const lineMode = event.deltaMode === 1;
      const pixelDelta = lineMode ? event.deltaY * 16 : event.deltaY;
      const factor = 2 ** (-pixelDelta * 0.00055);
      applyScale(scale * factor, event.clientX, event.clientY);
    },
    { passive: false },
  );

  container.addEventListener("mousedown", (event) => {
    const target = event.target as Element | null;
    if (
      target?.closest(".toolbar") ||
      target?.closest(".legend-bar") ||
      target?.closest("#info-drawer") ||
      target?.closest(".zoom-control")
    ) {
      return;
    }
    isPanning = true;
    startX = event.clientX - pointX;
    startY = event.clientY - pointY;
  });

  window.addEventListener("mousemove", (event) => {
    if (!isPanning) return;
    pointX = event.clientX - startX;
    pointY = event.clientY - startY;
    setTransform();
  });

  window.addEventListener("mouseup", () => {
    isPanning = false;
  });
}

export function bindZoomSlider(slider: HTMLInputElement, label: HTMLElement): void {
  const sync = (next: number): void => {
    const percent = Math.round((next / DEFAULT_SCALE) * 100);
    slider.value = String(Math.round(next * 100));
    label.textContent = `${percent}%`;
  };

  slider.min = String(Math.round(MIN_SCALE * 100));
  slider.max = String(Math.round(MAX_SCALE * 100));
  sync(scale);

  slider.addEventListener("input", () => {
    applyScale(Number(slider.value) / 100);
  });

  onZoomChange(sync);
}
