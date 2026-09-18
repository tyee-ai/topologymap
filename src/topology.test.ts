import { describe, expect, it } from "vitest";
import { SLG_COUNT, TOTAL_CORE_SWITCHES } from "./constants.ts";
import {
  SPINE_PLANES,
  buildSpineCoreEdges,
  coreGroupUplinkPorts,
  coreGroupsForSpine,
  coreLayoutSpec,
  shouldDrawSpineCoreLink,
  spineCoreEdgeCount,
  spinePlaneForCoreGroup,
  coreSwitchIndexForSlg,
} from "./topology.ts";

describe("8 × 8 core layout (Figure 13)", () => {
  it("maps Core Group N only to Spine N", () => {
    for (let spine = 1; spine <= SPINE_PLANES; spine += 1) {
      expect(coreGroupsForSpine(spine, "8x8")).toEqual([spine]);
      expect(shouldDrawSpineCoreLink(spine, spine, "8x8")).toBe(true);
      expect(shouldDrawSpineCoreLink(spine, spine === 8 ? 1 : spine + 1, "8x8")).toBe(false);
    }
  });

  it("uses 8 groups of 8 switches and 128 plane-aligned uplinks", () => {
    expect(coreLayoutSpec("8x8").groupCount * coreLayoutSpec("8x8").switchesPerGroup).toBe(
      TOTAL_CORE_SWITCHES,
    );
    expect(buildSpineCoreEdges("8x8")).toHaveLength(spineCoreEdgeCount("8x8"));
    expect(spineCoreEdgeCount("8x8")).toBe(128);
    expect(coreGroupUplinkPorts("8x8")).toBe(512);
  });

  it("connects Core Group 1 to Spine 1 in every SLG", () => {
    const cg1 = buildSpineCoreEdges("8x8").filter((e) => e.coreGroupNum === 1);
    expect(cg1).toHaveLength(SLG_COUNT);
    expect(cg1.every((e) => e.spineNum === 1)).toBe(true);
  });
});

describe("16 × 4 core layout", () => {
  it("pairs Core Group N and N+8 on the same spine plane", () => {
    for (let spine = 1; spine <= SPINE_PLANES; spine += 1) {
      expect(coreGroupsForSpine(spine, "16x4")).toEqual([spine, spine + SPINE_PLANES]);
    }
    expect(spinePlaneForCoreGroup(1, "16x4")).toBe(1);
    expect(spinePlaneForCoreGroup(9, "16x4")).toBe(1);
    expect(spinePlaneForCoreGroup(8, "16x4")).toBe(8);
    expect(spinePlaneForCoreGroup(16, "16x4")).toBe(8);
  });

  it("does not draw a full mesh", () => {
    expect(shouldDrawSpineCoreLink(1, 2, "16x4")).toBe(false);
    expect(shouldDrawSpineCoreLink(1, 16, "16x4")).toBe(false);
  });

  it("spreads SLG uplinks across switches inside a group", () => {
    expect(coreSwitchIndexForSlg(1, 4)).toBe(1);
    expect(coreSwitchIndexForSlg(4, 4)).toBe(4);
    expect(coreSwitchIndexForSlg(5, 4)).toBe(1);
    expect(coreSwitchIndexForSlg(8, 8)).toBe(8);
    expect(coreSwitchIndexForSlg(9, 8)).toBe(1);
  });

  it("uses 16 groups of 4 switches and 256 plane-aligned uplinks", () => {
    expect(coreLayoutSpec("16x4").groupCount * coreLayoutSpec("16x4").switchesPerGroup).toBe(
      TOTAL_CORE_SWITCHES,
    );
    expect(spineCoreEdgeCount("16x4")).toBe(256);
    expect(coreGroupUplinkPorts("16x4")).toBe(256);
  });
});
