import { describe, expect, it } from "vitest";
import { CORE_GROUP_COUNT, SLG_COUNT } from "./constants.ts";
import {
  SPINE_CORE_EDGE_COUNT,
  SPINE_PLANES,
  buildSpineCoreEdges,
  coreGroupsForSpine,
  shouldDrawSpineCoreLink,
  spinePlaneForCoreGroup,
} from "./topology.ts";

describe("Figure 13 SLG → core mapping", () => {
  it("Core Group N connects only to Spine N (and the 4K paired group N+8)", () => {
    for (let spine = 1; spine <= SPINE_PLANES; spine += 1) {
      expect(coreGroupsForSpine(spine)).toEqual([spine, spine + SPINE_PLANES]);
      expect(shouldDrawSpineCoreLink(spine, spine)).toBe(true);
      expect(shouldDrawSpineCoreLink(spine, spine + SPINE_PLANES)).toBe(true);
    }
  });

  it("does not draw a full spine–core mesh", () => {
    expect(shouldDrawSpineCoreLink(1, 2)).toBe(false);
    expect(shouldDrawSpineCoreLink(2, 1)).toBe(false);
    expect(shouldDrawSpineCoreLink(8, 1)).toBe(false);
    expect(shouldDrawSpineCoreLink(1, 16)).toBe(false);
  });

  it("labels Core Group 1/9 as Spine 1s and Core Group 8/16 as Spine 8s", () => {
    expect(spinePlaneForCoreGroup(1)).toBe(1);
    expect(spinePlaneForCoreGroup(9)).toBe(1);
    expect(spinePlaneForCoreGroup(8)).toBe(8);
    expect(spinePlaneForCoreGroup(16)).toBe(8);
  });

  it("connects each core group to Spine N in every SLG", () => {
    const edges = buildSpineCoreEdges();
    const cg1 = edges.filter((e) => e.coreGroupNum === 1);
    expect(cg1).toHaveLength(SLG_COUNT);
    expect(cg1.every((e) => e.spineNum === 1)).toBe(true);
    expect(new Set(cg1.map((e) => e.slgNum)).size).toBe(SLG_COUNT);
  });

  it("keeps 4K port math: 256 plane-aligned uplinks, not 2048 full-mesh links", () => {
    expect(CORE_GROUP_COUNT).toBe(16);
    expect(buildSpineCoreEdges()).toHaveLength(SPINE_CORE_EDGE_COUNT);
    expect(SPINE_CORE_EDGE_COUNT).toBe(256);
  });
});
