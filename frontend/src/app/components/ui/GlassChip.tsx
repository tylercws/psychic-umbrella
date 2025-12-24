import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

type Tone = "neutral" | "cyan" | "violet" | "amber";

interface GlassChipProps extends HTMLAttributes<HTMLElement> {
  as?: "button" | "div";
  active?: boolean;
  tone?: Tone;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const toneTokens: Record<
  Tone,
  { surface: string; border: string; glow: string; text: string }
> = {
  neutral: {
    surface: "linear-gradient(120deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
    border: "rgba(255,255,255,0.25)",
    glow: "0 6px 24px rgba(255, 255, 255, 0.12)",
    text: "text-white",
  },
  cyan: {
    surface: "linear-gradient(120deg, rgba(14,165,233,0.18), rgba(125,211,252,0.08))",
    border: "rgba(125,211,252,0.6)",
    glow: "0 8px 30px rgba(56, 189, 248, 0.35)",
    text: "text-cyan-50",
  },
  violet: {
    surface: "linear-gradient(120deg, rgba(139,92,246,0.18), rgba(196,181,253,0.08))",
    border: "rgba(196,181,253,0.55)",
    glow: "0 8px 30px rgba(167, 139, 250, 0.32)",
    text: "text-purple-50",
  },
  amber: {
    surface: "linear-gradient(120deg, rgba(251,191,36,0.2), rgba(252,211,77,0.1))",
    border: "rgba(253,230,138,0.6)",
    glow: "0 8px 26px rgba(251, 191, 36, 0.35)",
    text: "text-amber-50",
  },
};

export function GlassChip({
  as = "button",
  active = false,
  tone = "neutral",
  leadingIcon,
  trailingIcon,
  className,
  children,
  style,
  ...rest
}: GlassChipProps) {
  const Component = as;
  const toneStyles = toneTokens[tone];

  const { role, tabIndex, ...otherProps } = rest;
  const fallbackRole = as === "div" ? "button" : undefined;
  const fallbackTabIndex = as === "div" ? 0 : undefined;

  return (
    <Component
      role={role ?? fallbackRole}
      tabIndex={tabIndex ?? fallbackTabIndex}
      aria-pressed={active}
      {...otherProps}
      className={cn(
        "group/chip relative inline-flex items-center gap-2 overflow-hidden rounded-full border px-4 py-2 text-[11px] uppercase tracking-tight font-mono transition-all duration-300",
        "before:absolute before:inset-0 before:bg-[linear-gradient(115deg,rgba(255,255,255,0.08),transparent_55%)] before:opacity-60 before:pointer-events-none",
        active
          ? ""
          : "hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(255,255,255,0.12)]",
        active ? toneStyles.text : "text-white/70 hover:text-white",
        className,
      )}
      style={{
        background: toneStyles.surface,
        borderColor: toneStyles.border,
        boxShadow: active ? toneStyles.glow : undefined,
        ...style,
      }}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover/chip:opacity-70 group-hover/chip:animate-[glass-glint_1.2s_ease-in-out]" />
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_40%)] opacity-50 pointer-events-none" />
      <div className="relative z-10 flex items-center gap-2">
        {leadingIcon && <span className="text-xs opacity-80">{leadingIcon}</span>}
        <span className={cn("font-semibold", active ? "text-white" : undefined)}>
          {children}
        </span>
        {trailingIcon && <span className="text-xs opacity-80">{trailingIcon}</span>}
      </div>
    </Component>
  );
}
