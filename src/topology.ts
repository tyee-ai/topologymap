import {
  CORE_LAYOUTS,
  SLG_COUNT,
  SWITCHES_PER_SLG,
  type CoreLayoutId,
} from "./constants.ts";

/** Spine planes in one Rail SU group (Figure 13: Spine 1..8). */
export const SPINE_PLANES = SWITCHES_PER_SLG;

/**
 * Figure 13: Core Group N → all Spine Ns.
 * 8×8: one core group per spine plane (8 groups × 8 switches).
 * 16×4: two core groups per plane, N and N+8 (16 groups × 4 switches).
 */
export function coreGroupsForSpine(spineNum: number, layout: CoreLayoutId): number[] {
  if (layout === "8x8") return [spineNum];
  return [spineNum, spineNum + SPINE_PLANES];
}

export function spinePlaneForCoreGroup(coreGroupNum: number, layout: CoreLayoutId): number {
  if (layout === "8x8") return coreGroupNum;
  return ((coreGroupNum - 1) % SPINE_PLANES) + 1;
}

export function shouldDrawSpineCoreLink(
  spineNum: number,
  coreGroupNum: number,
  layout: CoreLayoutId,
): boolean {
  return coreGroupsForSpine(spineNum, layout).includes(coreGroupNum);
}

export type SpineCoreEdge = {
  slgNum: number;
  spineNum: number;
  coreGroupNum: number;
};

export function buildSpineCoreEdges(layout: CoreLayoutId): SpineCoreEdge[] {
  const edges: SpineCoreEdge[] = [];
  for (let slgNum = 1; slgNum <= SLG_COUNT; slgNum += 1) {
    for (let spineNum = 1; spineNum <= SPINE_PLANES; spineNum += 1) {
      for (const coreGroupNum of coreGroupsForSpine(spineNum, layout)) {
        edges.push({ slgNum, spineNum, coreGroupNum });
      }
    }
  }
  return edges;
}

export function spineCoreEdgeCount(layout: CoreLayoutId): number {
  return SLG_COUNT * SPINE_PLANES * (layout === "8x8" ? 1 : 2);
}

export function linksPerSpineToCoreGroup(layout: CoreLayoutId): number {
  return layout === "8x8" ? 32 : 16;
}

export function coreGroupUplinkPorts(layout: CoreLayoutId): number {
  return SLG_COUNT * linksPerSpineToCoreGroup(layout);
}

export function coreLayoutSpec(layout: CoreLayoutId) {
  return CORE_LAYOUTS[layout];
}

/** Spread SLG uplinks across the switches inside a core group. */
export function coreSwitchIndexForSlg(slgNum: number, switchesPerGroup: number): number {
  return ((slgNum - 1) % switchesPerGroup) + 1;
}
