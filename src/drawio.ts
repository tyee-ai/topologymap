import { showToast } from "./toast.ts";

export function getDrawIOXML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2026-09-14T00:00:00.000Z" agent="DrawIO" version="21.0.0" type="device">
  <diagram id="4k_fabric_topology" name="4K GPU Rail Fabric (16 SLG Topology)">
    <mxGraphModel dx="3800" dy="2200" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="3800" pageHeight="2200">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="hdr" value="&lt;b&gt;4,096 GPU THREE-LAYER FABRIC (NVIDIA NCP RA-11750-001 V4 — 16 SLGs)&lt;/b&gt;&lt;br&gt;16 SUs (511 HGX + 2 UFM HA) → 16 SLGs (128 Leaf &amp;amp; 128 Spine MQM9790) → 16 Core Groups (64 Core MQM9790 • 4,096 Bisection Links)" style="text;html=1;strokeColor=#334155;fillColor=#0F172A;fontColor=#F8FAFC;align=center;verticalAlign=middle;rounded=1;fontSize=15;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="40" y="20" width="3720" height="65" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

export async function copyDrawIO(): Promise<void> {
  try {
    await navigator.clipboard.writeText(getDrawIOXML());
    showToast("Copied Draw.io XML to Clipboard!");
  } catch {
    showToast("Clipboard unavailable — use Download .drawio");
  }
}

export function downloadDrawIO(): void {
  const blob = new Blob([getDrawIOXML()], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "4K_GPU_Fabric_16_SLG_Topology.drawio";
  anchor.click();
  URL.revokeObjectURL(url);
}
