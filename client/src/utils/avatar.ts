const AVATAR_COLORS = [
  "#fc7753",
  "#3498db",
  "#368d28",
  "#9b59b6",
  "#f39c12",
  "#e74c3c",
  "#1abc9c",
  "#fba875",
];

export const getAvatarColor = (id: number): string =>
  AVATAR_COLORS[id % AVATAR_COLORS.length];

export const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
