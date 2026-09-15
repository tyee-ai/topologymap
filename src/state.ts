export type ViewMode = "all" | "leaf-spine" | "host-leaf" | "spine-core";
export type Selection = "all" | number;

export const state = {
  selectedSU: "all" as Selection,
  selectedRail: "all" as Selection,
  viewMode: "all" as ViewMode,
};
