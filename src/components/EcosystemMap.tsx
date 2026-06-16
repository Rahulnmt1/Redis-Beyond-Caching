"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LensId, PersonaId, Pillar } from "@/lib/types";
import { PERSONAS } from "@/data/ecosystem";
import { PillarIcon, RedisLogo } from "./icons";

interface Props {
  pillars: Pillar[];
  persona: PersonaId | "all";
  lens: LensId | "all";
  onSelect: (id: string) => void;
}

export function EcosystemMap({ pillars, persona, lens, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const filtering = persona !== "all" || lens !== "all";
  const isRelevant = (p: Pillar) =>
    (persona === "all" || p.personas.includes(persona)) &&
    (lens === "all" || p.lenses.includes(lens));
  const personaLabel =
    persona === "all" ? "" : (PERSONAS.find((p) => p.id === persona)?.short ?? "");

  const { w, h } = size;
  const cx = w / 2;
  const cy = h / 2;
  const rx = Math.max(180, w / 2 - 112);
  const ry = Math.max(150, h / 2 - 96);

  const nodes = pillars.map((p, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / pillars.length;
    return { p, a, x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) };
  });

  const ready = w > 0 && h > 0;

  return (
    <div
      ref={ref}
      className="relative h-[580px] w-full overflow-hidden rounded-2xl sm:h-[660px]"
    >
      {/* stage vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 50%, rgba(36,74,88,0.55), transparent 70%)",
        }}
      />

      {ready && (
        <svg
          width={w}
          height={h}
          className="pointer-events-none absolute inset-0"
          aria-hidden
        >
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="rgba(185,194,198,0.16)"
            strokeWidth={1}
            strokeDasharray="2 9"
            className="animate-dash"
          />
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx * 0.62}
            ry={ry * 0.62}
            fill="none"
            stroke="rgba(185,194,198,0.08)"
            strokeWidth={1}
          />
          {nodes.map(({ p, x, y }) => {
            const hot = filtering && isRelevant(p);
            const dim = filtering && !isRelevant(p);
            return (
              <g key={p.id}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke={
                    hot
                      ? "rgba(255,68,56,0.28)"
                      : dim
                        ? "rgba(185,194,198,0.06)"
                        : "rgba(185,194,198,0.16)"
                  }
                  strokeWidth={hot ? 2 : 1}
                />
                {hot && (
                  <line
                    x1={cx}
                    y1={cy}
                    x2={x}
                    y2={y}
                    stroke="#FF4438"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeDasharray="1 9"
                    className="animate-flow-dash"
                  />
                )}
              </g>
            );
          })}
        </svg>
      )}

      {ready && (
        <div
          className="absolute"
          style={{ left: cx, top: cy, transform: "translate(-50%,-50%)" }}
        >
          <div className="relative grid place-items-center">
            <span
              className="absolute h-44 w-44 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,68,56,0.32), transparent 66%)",
              }}
            />
            <span className="absolute h-[150px] w-[150px] rounded-full border border-redis/30 animate-pulse-ring" />
            <span
              className="absolute h-[150px] w-[150px] rounded-full border border-redis/25 animate-pulse-ring"
              style={{ animationDelay: "1.6s" }}
            />
            <div
              className="relative grid h-[132px] w-[132px] place-items-center rounded-full border border-redis/45 text-center shadow-glow"
              style={{
                background:
                  "radial-gradient(120% 120% at 30% 20%, #2C5563, #163341 80%)",
              }}
            >
              <div className="flex flex-col items-center gap-1.5">
                <RedisLogo size={32} />
                <div className="leading-tight">
                  <div className="font-display text-[13px] font-bold text-fg">
                    Redis core
                  </div>
                  <div className="px-3 text-[10px] leading-tight text-muted">
                    One real-time data platform
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {ready &&
        nodes.map(({ p, x, y }, i) => {
          const hot = filtering && isRelevant(p);
          const dim = filtering && !isRelevant(p);
          return (
            <div
              key={p.id}
              className="absolute"
              style={{ left: x, top: y, transform: "translate(-50%,-50%)" }}
            >
              <motion.button
                onClick={() => onSelect(p.id)}
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: dim ? 0.4 : 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                whileHover={{ y: -3 }}
                className={`tile-hover group relative w-[190px] rounded-2xl border px-3.5 py-3 text-left backdrop-blur-sm ${
                  hot
                    ? "border-redis/60 bg-surface2/95 shadow-glow"
                    : "border-line bg-surface2/90 shadow-card"
                }`}
              >
                {p.tag && (
                  <span className="absolute -right-2 -top-2 rounded-full bg-yellow px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-midnight shadow-[0_6px_16px_-6px_rgba(220,255,30,0.7)]">
                    {p.tag}
                  </span>
                )}
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl border transition-colors ${
                      hot
                        ? "border-redis/40 bg-redis/12 text-redis"
                        : "border-line2 bg-surface3 text-muted group-hover:border-redis/40 group-hover:text-redis-soft"
                    }`}
                  >
                    <PillarIcon name={p.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-fg">
                      {p.name}
                    </div>
                    <div className="truncate text-[11px] text-muted">
                      {p.tagline}
                    </div>
                  </div>
                </div>
                {hot ? (
                  <div className="mt-2 inline-flex rounded-full bg-yellow/15 px-2 py-0.5 text-[10px] font-semibold text-yellow">
                    Top for {personaLabel}
                  </div>
                ) : null}
              </motion.button>
            </div>
          );
        })}
    </div>
  );
}
