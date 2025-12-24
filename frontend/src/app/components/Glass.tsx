import { type HTMLAttributes } from 'react';

import { cn } from './ui/utils';

type Depth = 'base' | 'raised' | 'float';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  depth?: Depth;
}

interface GlassChipProps extends HTMLAttributes<HTMLDivElement> {}

const depthClassnames: Record<Depth, string> = {
  base: 'z-10 shadow-[0_12px_40px_rgba(0,0,0,0.35)]',
  raised: 'z-20 shadow-[0_18px_50px_rgba(0,0,0,0.38)]',
  float: 'z-30 shadow-[0_24px_80px_rgba(0,0,0,0.45)]',
};

export function GlassPanel({ className, children, depth = 'base', ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl min-h-0',
        'before:pointer-events-none before:absolute before:inset-0 before:content-[\"\"]',
        'before:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1),transparent_35%)] before:opacity-60',
        depthClassnames[depth],
        className,
      )}
      {...props}
    >
      <div className="relative">{children}</div>
    </div>
  );
}

export function GlassChip({ className, children, ...props }: GlassChipProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-mono uppercase tracking-[0.2em]',
        'backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.35)] text-white',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
