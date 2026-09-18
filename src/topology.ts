import { CORE_GROUP_COUNT, SLG_COUNT, SWITCHES_PER_SLG } from "./constants.ts";

/** Spine planes in one Rail SU group (Figure 13: Spine 1..8). */
export const SPINE_PLANES = SWITCHES_PER_SLG;

/**
 * Figure 13 (2K Rail SU group): "Core Group N To all Spine Ns".
 * 4K has 16 core groups and the same 8 spine planes, so each plane
 * uplinks to two core groups (N and N+8) across all 16 SLGs.
 * 32 spine uplinks → 16 links per core group; 16 SLGs × 16 = 256 ports/CG.
 */
export function coreGroupsForSpine(spineNum: number): readonly [number, number] {
  return [spineNum, spineNum + SPINE_PLANES];
}

export function spinePlaneForCoreGroup(coreGroupNum: number): number {
  return ((coreGroupNum - 1) % SPINE_PLANES) + 1;
}

export function shouldDrawSpineCoreLink(spineNum: number, coreGroupNum: number): boolean {
  return coreGroupsForSpine(spineNum).includes(coreGroupNum);
}

export type SpineCoreEdge = {
  slgNum: number;
  spineNum: number;
  coreGroupNum: number;
};

export function buildSpineCoreEdges(): SpineCoreEdge[] {
  const edges: SpineCoreEdge[] = [];
  for (let slgNum = 1; slgNum <= SLG_COUNT; slgNum += 1) {
    for (let spineNum = 1; spineNum <= SPINE_PLANES; spineNum += 1) {
      for (const coreGroupNum of coreGroupsForSpine(spineNum)) {
        edges.push({ slgNum, spineNum, coreGroupNum });
      }
    }
  }
  return edges;
}

export const SPINE_CORE_EDGE_COUNT = SLG_COUNT * SPINE_PLANES * 2;

export function assertCoreGroupCountFitsPlanes(): void {
  if (CORE_GROUP_COUNT !== SPINE_PLANES * 2) {
    throw new Error(
      `Expected ${SPINE_PLANES * 2} core groups for 4K dual-plane mapping, got ${CORE_GROUP_COUNT}`,
    );
  }
}
