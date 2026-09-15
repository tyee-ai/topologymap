const scene = document.getElementById("scene");
const container = document.getElementById("viewport-container");

let scale = 0.88;
let pointX = 20;
let pointY = 10;
let isPanning = false;
let startX = 0;
let startY = 0;

export function setTransform(): void {
  scene?.setAttribute("transform", `translate(${pointX}, ${pointY}) scale(${scale})`);
}

export function zoomIn(): void {
  scale = Math.min(scale * 1.25, 3.5);
  setTransform();
}

export function zoomOut(): void {
  scale = Math.max(scale / 1.25, 0.18);
  setTransform();
}

export function resetZoom(): void {
  scale = 0.88;
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
      const xs = (event.clientX - pointX) / scale;
      const ys = (event.clientY - pointY) / scale;
      scale = event.deltaY < 0 ? scale * 1.1 : scale / 1.1;
      scale = Math.min(Math.max(0.18, scale), 3.5);
      pointX = event.clientX - xs * scale;
      pointY = event.clientY - ys * scale;
      setTransform();
    },
    { passive: false },
  );

  container.addEventListener("mousedown", (event) => {
    const target = event.target as Element | null;
    if (target?.closest(".toolbar") || target?.closest(".legend-bar") || target?.closest("#info-drawer")) {
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
