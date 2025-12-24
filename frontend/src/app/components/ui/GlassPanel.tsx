import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

export type GlassElevation = "base" | "raised" | "overlay";
export type GlassTint = "neutral" | "cyan" | "violet" | "amber";

export const glassElevationTokens: Record<
  GlassElevation,
  {
    blur: string;
    border: number;
    glow: string;
    surface: string;
    highlightStrength: number;
  }
> = {
  base: {
    blur: "var(--glass-blur-sm)",
    border: 0.12,
    glow: "0 8px 30px rgba(0, 0, 0, 0.35)",
    surface: "rgba(255, 255, 255, 0.02)",
    highlightStrength: 0.35,
  },
  raised: {
    blur: "var(--glass-blur-md)",
    border: 0.18,
    glow: "0 12px 45px rgba(56, 189, 248, 0.18)",
    surface: "rgba(255, 255, 255, 0.03)",
    highlightStrength: 0.55,
  },
  overlay: {
    blur: "var(--glass-blur-lg)",
    border: 0.22,
    glow: "0 18px 70px rgba(168, 85, 247, 0.25)",
    surface: "rgba(255, 255, 255, 0.04)",
    highlightStrength: 0.65,
  },
};

const tintLayers: Record<
  GlassTint,
  { wash: string; shine: string; border: string }
> = {
  neutral: {
    wash: "linear-gradient(135deg, rgba(255,255,255,0.05), transparent 50%)",
    shine: "linear-gradient(120deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))",
    border: "rgba(255,255,255,var(--glass-border-alpha,0.12))",
  },
  cyan: {
    wash: "linear-gradient(135deg, rgba(34,211,238,0.1), transparent 55%)",
    shine: "linear-gradient(120deg, rgba(125,211,252,0.2), rgba(56,189,248,0.06))",
    border: "rgba(125,211,252,0.35)",
  },
  violet: {
    wash: "linear-gradient(135deg, rgba(168,85,247,0.14), transparent 55%)",
    shine: "linear-gradient(120deg, rgba(192,132,252,0.24), rgba(168,85,247,0.08))",
    border: "rgba(192,132,252,0.32)",
  },
  amber: {
    wash: "linear-gradient(135deg, rgba(251,191,36,0.12), transparent 55%)",
    shine: "linear-gradient(120deg, rgba(253,230,138,0.24), rgba(245,158,11,0.08))",
    border: "rgba(253,230,138,0.35)",
  },
};

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevation?: GlassElevation;
  blur?: string | number;
  tint?: GlassTint;
}

export function GlassPanel({
  children,
  elevation = "base",
  tint = "neutral",
  blur,
  className,
  style,
  ...rest
}: GlassPanelProps) {
  const preset = glassElevationTokens[elevation];
  const tintToken = tintLayers[tint];

  const resolvedBlur =
    typeof blur === "number" ? `${blur}px` : blur || preset.blur;

  const panelStyle: CSSProperties = {
    backdropFilter: `blur(${resolvedBlur})`,
    WebkitBackdropFilter: `blur(${resolvedBlur})`,
    background: `linear-gradient(180deg, ${preset.surface}, rgba(255,255,255,0.01))`,
    boxShadow: preset.glow,
    borderColor: tintToken.border,
    ["--glass-highlight-opacity" as string]: preset.highlightStrength,
    ["--glass-border-alpha" as string]: preset.border,
    ...style,
  };

  return (
    <div
      className={cn(
        "group/glass relative isolate overflow-hidden rounded-3xl border transition-all duration-300",
        "before:absolute before:inset-0 before:pointer-events-none before:opacity-60",
        "before:bg-[radial-gradient(circle_at_18%_15%,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_82%_0%,rgba(255,255,255,0.12),transparent_25%)]",
        "after:absolute after:inset-[-40%] after:pointer-events-none after:bg-[conic-gradient(from_90deg_at_50%_50%,rgba(255,255,255,0.18),transparent_55%)] after:opacity-0 after:transition-opacity after:duration-700 group-hover/glass:after:opacity-30",
        className,
      )}
      style={panelStyle}
      {...rest}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-80"
        style={{ background: tintToken.wash }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-70 mix-blend-screen"
        style={{ background: tintToken.shine }}
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_25%)] opacity-[var(--glass-highlight-opacity,0.35)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
