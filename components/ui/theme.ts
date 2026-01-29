export const RP_COLORS = {
  base: "#191724",
  surface: "#1f1d2e",
  overlay: "#26233a",
  border: "#2a273f",
  muted: "#6e6a86",
  subtle: "#908caa",
  soft: "#e0def4",
  love: "#eb6f92",
  foam: "#9ccfd8",
  iris: "#c4a7e7",
  pine: "#3e8fb0",
  rose: "#ea9a97",
  gold: "#f6c177",
} as const;

export const CHART_COLORS = [
  RP_COLORS.love,
  RP_COLORS.foam,
  RP_COLORS.iris,
  RP_COLORS.pine,
  RP_COLORS.rose,
  RP_COLORS.gold,
] as const;
