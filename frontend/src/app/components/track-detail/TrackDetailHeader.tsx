import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { trackDetailMotion } from "./trackDetailMotion";

interface TrackDetailHeaderProps {
  id?: string;
  meta?: {
    title?: string;
    artist?: string;
  };
}

export function TrackDetailHeader({ id, meta }: TrackDetailHeaderProps) {
  return (
    <motion.div
      className="flex items-center justify-between mb-6 border-b border-white/15 pb-4 flex-shrink-0"
      variants={trackDetailMotion.header}
    >
      <Link
        to="/"
        className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span
          style={{ fontFamily: "VT323, monospace" }}
          className="text-xl"
        >
          [RETURN_DASHBOARD]
        </span>
      </Link>
      <div className="text-right">
        <motion.h1
          className="text-3xl lg:text-4xl text-white font-bold tracking-tight"
          style={{ fontFamily: "Share Tech Mono, monospace" }}
          layoutId={`scan-title-${id}`}
        >
          {meta?.title || "UNKNOWN_TITLE"}
        </motion.h1>
        <p className="text-gray-500 font-mono text-sm">
          {meta?.artist || "UNKNOWN_ARTIST"}
        </p>
      </div>
    </motion.div>
  );
}
