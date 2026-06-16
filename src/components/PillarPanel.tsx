"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { Pillar } from "@/lib/types";
import { LENSES } from "@/data/ecosystem";
import { PillarIcon } from "./icons";
import { ChipRow, SectionLabel } from "./ui";

export function PillarPanel({
  pillar,
  onSelectUseCase,
  onBack,
}: {
  pillar: Pillar;
  onSelectUseCase: (id: string) => void;
  onBack: () => void;
}) {
  const lensLabels = pillar.lenses
    .map((id) => LENSES.find((l) => l.id === id)?.label)
    .filter(Boolean) as string[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      <button onClick={onBack} className="btn btn-ghost !px-3 !py-1.5 text-xs">
        <ArrowLeft className="h-4 w-4" /> Ecosystem
      </button>

      {/* header band */}
      <div
        className="rounded-2xl border border-line p-6"
        style={{
          background:
            "radial-gradient(110% 130% at 0% 0%, rgba(255,68,56,0.12), rgba(28,62,75,0.45) 55%)",
        }}
      >
        <div className="flex items-start gap-4">
          <span
            className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl border border-redis/30 text-redis"
            style={{
              background:
                "radial-gradient(120% 120% at 30% 20%, rgba(255,68,56,0.2), rgba(28,62,75,0.5))",
            }}
          >
            <PillarIcon name={pillar.icon} className="h-8 w-8" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl font-bold tracking-tight text-fg">
                {pillar.name}
              </h1>
              {pillar.tag && <span className="chip chip-yellow">{pillar.tag}</span>}
            </div>
            <p className="mt-1.5 text-[15px] text-muted">{pillar.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {lensLabels.map((l) => (
                <span
                  key={l}
                  className="rounded-full border border-line2 bg-surface2/70 px-2.5 py-0.5 text-[11px] font-medium text-muted"
                >
                  {l}
                </span>
              ))}
            </div>
            {pillar.link && (
              <a
                href={pillar.link.href}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-redis hover:underline"
              >
                {pillar.link.label} &rarr;
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="card border-redis/25 bg-redis/[0.04] p-5">
        <SectionLabel>Why this is beyond caching</SectionLabel>
        <p className="mt-2 text-[15px] leading-relaxed text-fg/90">{pillar.why}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <SectionLabel>Capabilities</SectionLabel>
          <ChipRow items={pillar.capabilities} accent />
        </div>
        <div className="space-y-3">
          <SectionLabel>Consolidates / replaces</SectionLabel>
          <ChipRow items={pillar.replaces} />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold tracking-tight text-fg">
          Banking use cases
        </h2>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {pillar.useCases.map((uc) => (
            <button
              key={uc.id}
              onClick={() => onSelectUseCase(uc.id)}
              className="tile tile-hover group p-4 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-fg">{uc.name}</span>
                {uc.flagship && (
                  <span className="chip chip-accent !px-2 !py-0.5 !text-[10px]">
                    Flagship demo
                  </span>
                )}
                <ChevronRight className="ml-auto h-4 w-4 flex-none text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-redis-soft" />
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {uc.problem}
              </p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
