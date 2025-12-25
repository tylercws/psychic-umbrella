export const formatTime = (seconds?: number | string) => {
  if (seconds === undefined || seconds === null) return "--:--";
  if (typeof seconds === "string") return seconds;

  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const renderBar = (percent: number, length: number = 20) => {
  const filled = Math.round((percent / 100) * length);
  return "█".repeat(filled) + "░".repeat(length - filled);
};
