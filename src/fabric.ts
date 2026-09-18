import { bindTooltips } from "./tooltip.ts";
import {
  CORE_GROUP_COUNT,
  RAIL_COLORS,
  SLG_COUNT,
  SU_COUNT,
  SWITCHES_PER_SLG,
} from "./constants.ts";
import { onSelectSU } from "./filters.ts";
import { coreGroupsForSpine, spinePlaneForCoreGroup } from "./topology.ts";

type Point = { x: number; y: number };
type SpinePos = Point & { slgNum: number; spineNum: number };
type LeafPos = Point & { slgNum: number; leafNum: number; connectedSu: number };

function range(start: number, end: number): number[] {
  const values: number[] = [];
  for (let i = start; i < end; i += 1) values.push(i);
  return values;
}

export function buildFabricMarkup(): void {
  const renderGroup = document.getElementById("renderGroup");
  if (!renderGroup) return;

  let slgBoxesHtml = "";
  let switchBoxesHtml = "";
  let spineCoreLinks = "";
  let leafSpineLinks = "";
  let hostLeafLinks = "";

  const corePositions: Point[] = [];
  const cgWidth = 200;
  const cgGap = 15;
  const cgStartX = 50;
  const cgY = 55;

  for (let c = 0; c < CORE_GROUP_COUNT; c += 1) {
    const cx = cgStartX + c * (cgWidth + cgGap);
    corePositions.push({ x: cx + cgWidth / 2, y: cgY + 95 });
    const spinePlane = spinePlaneForCoreGroup(c + 1);
    switchBoxesHtml += `
      <g class="switch-box core-box core-box-${c + 1}" data-tip="<b>Core Group ${c + 1}</b><br>• Figure 13: <b>To all Spine ${spinePlane}s</b> (one spine in every SLG)<br>• Switches: Core 1..4 (4x MQM9790)<br>• Cages: 32x OSFP per switch (64x 400G ports)<br>• Total Ports: 256x 400G NDR (16 SLGs × 16 links from Spine ${spinePlane})">
        <rect x="${cx}" y="${cgY}" width="${cgWidth}" height="95" rx="6" fill="#1E1B4B" stroke="#818CF8" stroke-width="1.4" />
        <text x="${cx + cgWidth / 2}" y="${cgY + 22}" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">Core Group ${c + 1}</text>
        <text x="${cx + cgWidth / 2}" y="${cgY + 38}" font-size="9.5" fill="#A5B4FC" text-anchor="middle">To all Spine ${spinePlane}s (16 SLGs)</text>
        <rect x="${cx + 10}" y="${cgY + 48}" width="${cgWidth - 20}" height="35" rx="4" fill="#0F172A" stroke="#4338CA" />
        <text x="${cx + cgWidth / 2}" y="${cgY + 63}" font-size="9" fill="#E0E7FF" text-anchor="middle">Core 1..4 (4x MQM9790)</text>
        <text x="${cx + cgWidth / 2}" y="${cgY + 76}" font-size="8" fill="#38BDF8" text-anchor="middle">256x 400G Links (128 OSFP)</text>
      </g>`;
  }

  const slgWidth = 200;
  const slgGap = 15;
  const slgStartX = 50;
  const slgY = 245;
  const spinePositions: SpinePos[] = [];
  const leafPositions: LeafPos[] = [];

  for (let r = 0; r < SLG_COUNT; r += 1) {
    const sx = slgStartX + r * (slgWidth + slgGap);
    const slgNum = r + 1;
    const railIdx = r % 8;
    const color = RAIL_COLORS[railIdx];

    slgBoxesHtml += `
      <g class="slg-group-box slg-box-${slgNum}">
        <rect x="${sx}" y="${slgY}" width="${slgWidth}" height="570" rx="8" fill="rgba(15, 23, 42, 0.88)" stroke="${color}" stroke-width="2" />
        <rect x="${sx}" y="${slgY}" width="${slgWidth}" height="28" rx="8" fill="${color}" />
        <text x="${sx + slgWidth / 2}" y="${slgY + 18}" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">SLG ${slgNum} (Rail ${railIdx + 1})</text>
        <text x="${sx + 8}" y="${slgY + 42}" font-size="9" font-weight="bold" fill="${color}">8x Spines (Spine 1..8)</text>
        <line x1="${sx + 8}" y1="${slgY + 290}" x2="${sx + slgWidth - 8}" y2="${slgY + 290}" stroke="#334155" stroke-width="1.2" stroke-dasharray="4,3" />
        <text x="${sx + 8}" y="${slgY + 310}" font-size="9" font-weight="bold" fill="${color}">8x Leafs (Leaf 1..8)</text>
      </g>`;

    for (let s = 0; s < SWITCHES_PER_SLG; s += 1) {
      const row = Math.floor(s / 4);
      const col = s % 4;
      const spx = sx + 8 + col * 45;
      const spy = slgY + 50 + row * 110;
      spinePositions.push({ x: spx + 21, y: spy + 42, slgNum, spineNum: s + 1 });

      const spineNum = s + 1;
      const [coreA, coreB] = coreGroupsForSpine(spineNum);
      switchBoxesHtml += `
        <g class="spine-group spine-slg${slgNum}-s${spineNum}" data-tip="<b>SLG ${slgNum} Spine ${spineNum}</b><br>• Downlinks: 32x 400G downlinks to 8 Leafs in SLG ${slgNum}<br>• Uplinks: 32x 400G to <b>Core Group ${coreA}</b> and <b>Core Group ${coreB}</b> (16 links each; Fig. 13 plane)">
          <rect class="switch-box spine-box" x="${spx}" y="${spy}" width="42" height="90" rx="4" fill="#0F2942" stroke="${color}" stroke-width="1.2" />
          <text x="${spx + 21}" y="${spy + 15}" font-size="8" font-weight="bold" fill="#fff" text-anchor="middle">Spine</text>
          <text x="${spx + 21}" y="${spy + 28}" font-size="9" font-weight="bold" fill="${color}" text-anchor="middle">${spineNum}</text>
          <line x1="${spx + 3}" y1="${spy + 33}" x2="${spx + 39}" y2="${spy + 33}" stroke="#1e293b" />
          <text x="${spx + 21}" y="${spy + 45}" font-size="7" fill="#38BDF8" text-anchor="middle">32 Up</text>
          <line x1="${spx + 3}" y1="${spy + 51}" x2="${spx + 39}" y2="${spy + 51}" stroke="#1e293b" />
          <text x="${spx + 21}" y="${spy + 64}" font-size="7" fill="#34D399" text-anchor="middle">32 Dn</text>
          <text x="${spx + 21}" y="${spy + 78}" font-size="6" fill="#FBBF24" text-anchor="middle">4x/Leaf</text>
        </g>`;

      for (const coreGroupNum of coreGroupsForSpine(spineNum)) {
        const cg = corePositions[coreGroupNum - 1];
        spineCoreLinks += `<line x1="${spx + 21}" y1="${spy}" x2="${cg.x}" y2="${cg.y}" stroke="${color}" stroke-width="1.2" class="fabric-link spine-core-link rail-link-${railIdx + 1} slg-link-${slgNum} core-link-${coreGroupNum} spine-plane-${spineNum}" />`;
      }
    }

    for (let l = 0; l < SWITCHES_PER_SLG; l += 1) {
      const row = Math.floor(l / 4);
      const col = l % 4;
      const lpx = sx + 8 + col * 45;
      const lpy = slgY + 325 + row * 100;
      const leafNum = l + 1;
      const connectedSuNum = slgNum <= 8 ? leafNum : 8 + leafNum;

      leafPositions.push({
        x: lpx + 21,
        y: lpy,
        slgNum,
        leafNum,
        connectedSu: connectedSuNum,
      });

      switchBoxesHtml += `
        <g class="leaf-group leaf-slg${slgNum}-l${leafNum}" data-tip="<b>SLG ${slgNum} Leaf ${leafNum} (Rail ${railIdx + 1})</b><br>• Downlinks: 32x 400G NDR to 32 hosts in <b>SU ${connectedSuNum}</b> (Port SP ${railIdx + 1})<br>• Uplinks: 32x 400G NDR to all 8 Spines in SLG ${slgNum}">
          <rect class="switch-box leaf-box leaf-box-su${connectedSuNum} leaf-box-slg${slgNum} leaf-rail-${leafNum}" x="${lpx}" y="${lpy}" width="42" height="92" rx="4" fill="#0F172A" stroke="${RAIL_COLORS[l]}" stroke-width="1.2" />
          <text x="${lpx + 21}" y="${lpy + 14}" font-size="7.5" font-weight="bold" fill="#fff" text-anchor="middle">Leaf ${leafNum}</text>
          <text x="${lpx + 21}" y="${lpy + 27}" font-size="8.5" font-weight="bold" fill="${RAIL_COLORS[l]}" text-anchor="middle">SU${connectedSuNum}</text>
          <line x1="${lpx + 3}" y1="${lpy + 32}" x2="${lpx + 39}" y2="${lpy + 32}" stroke="#1e293b" />
          <text x="${lpx + 21}" y="${lpy + 44}" font-size="7" fill="#38BDF8" text-anchor="middle">32 Up</text>
          <text x="${lpx + 21}" y="${lpy + 55}" font-size="6" fill="#FBBF24" text-anchor="middle">4x/Spine</text>
          <line x1="${lpx + 3}" y1="${lpy + 61}" x2="${lpx + 39}" y2="${lpy + 61}" stroke="#1e293b" />
          <text x="${lpx + 21}" y="${lpy + 74}" font-size="7" fill="#34D399" text-anchor="middle">32 Dn</text>
          <text x="${lpx + 21}" y="${lpy + 85}" font-size="6" fill="#94A3B8" text-anchor="middle">(SU${connectedSuNum})</text>
        </g>`;

      for (let s = 0; s < SWITCHES_PER_SLG; s += 1) {
        const spTarget = spinePositions.find((sp) => sp.slgNum === slgNum && sp.spineNum === s + 1);
        if (!spTarget) continue;
        const startX = lpx + 21;
        const startY = lpy;
        const endX = spTarget.x;
        const endY = spTarget.y + 42;
        const midY = (startY + endY) / 2;
        const d = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
        leafSpineLinks += `<path d="${d}" stroke="${RAIL_COLORS[l]}" stroke-width="1.5" class="ls-crossbar-link rail-link-${l + 1} su-leaf-spine-link-${connectedSuNum} slg-crossbar-${slgNum}" />`;
      }
    }
  }

  const suWidth = 200;
  const suGap = 15;
  const suStartX = 50;
  const suY = 880;

  for (let u = 0; u < SU_COUNT; u += 1) {
    const suX = suStartX + u * (suWidth + suGap);
    const suNum = u + 1;
    const isUfm = u === 15;
    const hgxStart = u * 32 + 1;
    const hgxEnd = isUfm ? u * 32 + 30 : (u + 1) * 32;
    const targetSlgs = suNum <= 8 ? "SLGs 1..8" : "SLGs 9..16";
    const hostLine = isUfm
      ? `<text x="${suX + 12}" y="${suY + 92}" font-size="9" font-weight="bold" fill="#34D399">★ 2x UFM HA Appliances</text><text x="${suX + 12}" y="${suY + 107}" font-size="7.5" fill="#A7F3D0">Primary + Standby Active Failover</text>`
      : `<text x="${suX + 12}" y="${suY + 92}" font-size="9" fill="#CBD5E1">256x H100/H200/B200 GPUs</text>`;

    switchBoxesHtml += `
      <g class="su-group su-box-group-${suNum}" data-select-su="${suNum}" data-tip="<b>SU ${suNum}</b><br>• Hosts: ${isUfm ? "30 HGX + 2 UFM HA" : "32 HGX Nodes (256 GPUs)"}<br>• Downlink Fanout: Connects across ${targetSlgs}">
        <rect class="switch-box su-box su-card-${suNum}" x="${suX}" y="${suY}" width="${suWidth}" height="540" rx="8" fill="#1E293B" stroke="${isUfm ? "#10B981" : "#60A5FA"}" stroke-width="1.6" />
        <rect x="${suX}" y="${suY}" width="${suWidth}" height="32" rx="8" fill="${isUfm ? "#059669" : "#2563EB"}" />
        <text x="${suX + suWidth / 2}" y="${suY + 21}" font-size="11.5" font-weight="bold" fill="#fff" text-anchor="middle">SU ${suNum} ${isUfm ? "(30 HGX + 2 UFM)" : "(32 HGX)"}</text>
        <text x="${suX + 12}" y="${suY + 54}" font-size="10.5" fill="#E2E8F0">Compute Hosts: ${isUfm ? "30 HGX Nodes" : "32 HGX Nodes"}</text>
        <text x="${suX + 12}" y="${suY + 72}" font-size="9.5" fill="#94A3B8">HGX ${hgxStart} … HGX ${hgxEnd}</text>
        ${hostLine}
        <line x1="${suX + 10}" y1="${suY + 118}" x2="${suX + suWidth - 10}" y2="${suY + 118}" stroke="#334155" />
        <text x="${suX + 12}" y="${suY + 140}" font-size="10.5" fill="#38BDF8">InfiniBand Endpoints:</text>
        <text x="${suX + 12}" y="${suY + 158}" font-size="9" fill="#CBD5E1">${isUfm ? "240 GPUs + 2 UFM HA Ports" : "256 GPUs (8 HCAs per Host)"}</text>
        <text x="${suX + 12}" y="${suY + 185}" font-size="10" fill="#A5B4FC">Rail Connections (SP1..8):</text>
        <text x="${suX + 12}" y="${suY + 204}" font-size="8.5" fill="#E2E8F0">SP 1..8 → ${targetSlgs} (Leaf ${suNum <= 8 ? suNum : suNum - 8})</text>
        <rect x="${suX + 12}" y="${suY + 225}" width="${suWidth - 24}" height="60" rx="4" fill="#0F172A" stroke="#475569" />
        <text x="${suX + suWidth / 2}" y="${suY + 245}" font-size="9" font-weight="bold" fill="#6EE7B7" text-anchor="middle">256x 400G Host Downlinks</text>
        <text x="${suX + suWidth / 2}" y="${suY + 261}" font-size="8" fill="#38BDF8" text-anchor="middle">→ ${targetSlgs} Leaf Switches</text>
        <text x="${suX + suWidth / 2}" y="${suY + 275}" font-size="7.5" fill="#94A3B8" text-anchor="middle">(32 Links per Rail Leaf)</text>
        <text x="${suX + 12}" y="${suY + 312}" font-size="9" fill="#94A3B8">SU Leaf Uplinks to Spines:</text>
        <text x="${suX + 12}" y="${suY + 330}" font-size="9.5" font-weight="bold" fill="#FBBF24">256x 400G (8 Spines × 4)</text>
        <text x="${suX + 12}" y="${suY + 360}" font-size="9" fill="#94A3B8">Total SU Bi-dir Bandwidth:</text>
        <text x="${suX + 12}" y="${suY + 380}" font-size="10" font-weight="bold" fill="#38BDF8">102.4 Tb/s Non-Blocking</text>
      </g>`;

    const slgRange = suNum <= 8 ? range(1, 9) : range(9, 17);
    slgRange.forEach((targetSlg, portIdx) => {
      const leafMatch = leafPositions.find((lf) => lf.slgNum === targetSlg && lf.connectedSu === suNum);
      if (!leafMatch) return;
      hostLeafLinks += `<line x1="${suX + 12 + portIdx * 22}" y1="${suY}" x2="${leafMatch.x}" y2="${leafMatch.y + 92}" stroke="${RAIL_COLORS[portIdx]}" stroke-width="1" class="fabric-link host-leaf-link rail-link-${portIdx + 1} su-host-link-${suNum}" />`;
    });
  }

  renderGroup.innerHTML = slgBoxesHtml + spineCoreLinks + hostLeafLinks + leafSpineLinks + switchBoxesHtml;
  bindTooltips(renderGroup);

  renderGroup.querySelectorAll<SVGElement>("[data-select-su]").forEach((el) => {
    el.addEventListener("click", () => {
      const su = Number(el.getAttribute("data-select-su"));
      if (Number.isFinite(su)) onSelectSU(su);
    });
  });
}
