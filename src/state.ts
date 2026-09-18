import { DEFAULT_CORE_LAYOUT, type CoreLayoutId } from "./constants.ts";

export type ViewMode = "all" | "leaf-spine" | "host-leaf" | "spine-core";
export type Selection = "all" | number;

export const state = {
  selectedSU: "all" as Selection,
  selectedRail: "all" as Selection,
  viewMode: "all" as ViewMode,
  coreLayout: DEFAULT_CORE_LAYOUT as CoreLayoutId,
};
