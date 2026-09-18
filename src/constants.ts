export const RAIL_COLORS = [
  "#2563EB",
  "#DC2626",
  "#16A34A",
  "#DB2777",
  "#854D0E",
  "#0284C7",
  "#7C3AED",
  "#EA580C",
] as const;

export const SLG_COUNT = 16;
export const SU_COUNT = 16;
export const SWITCHES_PER_SLG = 8;
export const TOTAL_CORE_SWITCHES = 64;

export type CoreLayoutId = "8x8" | "16x4";

export type CoreLayout = {
  id: CoreLayoutId;
  groupCount: number;
  switchesPerGroup: number;
  label: string;
};

export const CORE_LAYOUTS: Record<CoreLayoutId, CoreLayout> = {
  "8x8": { id: "8x8", groupCount: 8, switchesPerGroup: 8, label: "8 × 8" },
  "16x4": { id: "16x4", groupCount: 16, switchesPerGroup: 4, label: "16 × 4" },
};

export const DEFAULT_CORE_LAYOUT: CoreLayoutId = "16x4";

export function isCoreLayoutId(value: string): value is CoreLayoutId {
  return value === "8x8" || value === "16x4";
}
