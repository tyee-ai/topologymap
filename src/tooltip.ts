const tooltip = document.getElementById("tooltip");

export function showTooltip(event: MouseEvent, html: string): void {
  if (!tooltip) return;
  tooltip.innerHTML = html;
  tooltip.style.display = "block";
  tooltip.style.left = `${Math.min(event.clientX + 15, window.innerWidth - 420)}px`;
  tooltip.style.top = `${Math.min(event.clientY + 15, window.innerHeight - 200)}px`;
}

export function hideTooltip(): void {
  if (!tooltip) return;
  tooltip.style.display = "none";
}

export function bindTooltips(root: ParentNode): void {
  root.querySelectorAll<SVGElement>("[data-tip]").forEach((el) => {
    el.addEventListener("mouseenter", (event) => {
      const tip = el.getAttribute("data-tip");
      if (tip) showTooltip(event, tip);
    });
    el.addEventListener("mouseleave", hideTooltip);
  });
}
