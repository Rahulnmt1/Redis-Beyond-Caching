"use client";

import { ArrowRight } from "lucide-react";
import type { CapabilityBlock } from "@/data/capabilities";
import { PERSONAS } from "@/data/ecosystem";
import type { LensId, PersonaId } from "@/lib/types";
import { PillarIcon } from "./icons";

interface Props {
  capabilities: CapabilityBlock[];
  persona: PersonaId | "all";
  lens: LensId | "all";
  onSelect: (id: string) => void;
}

export function CapabilityGrid({ capabilities, persona, lens, onSelect }: Props) {
  const filtering = persona !== "all" || lens !== "all";
  const isRelevant = (c: CapabilityBlock) =>
    (persona === "all" || c.personas.includes(persona)) &&
    (lens === "all" || c.lenses.includes(lens));
  const personaLabel =
    persona === "all" ? "" : (PERSONAS.find((p) => p.id === persona)?.short ?? "");

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {capabilities.map((c) => {
        const hot = filtering && isRelevant(c);
        const dim = filtering && !isRelevant(c);
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            style={c.inUseToday ? { background: "#0C2530" } : undefined}
            className={`tile tile-hover group relative flex flex-col p-4 text-left ${
              hot ? "!border-redis/55 shadow-glow" : ""
            } ${dim ? "opacity-45" : ""}`}
          >
            {/* top-right tag */}
            <div className="absolute right-3 top-3 flex items-center gap-1.5">
              {c.inUseToday && (
                <span className="rounded-full bg-redis px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                  In use today
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 pr-20">
              <span
                className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl border transition-colors ${
                  hot
                    ? "border-redis/40 bg-redis/12 text-redis"
                    : "border-line2 bg-surface3 text-muted group-hover:border-redis/40 group-hover:text-redis-soft"
                }`}
              >
                <PillarIcon name={c.icon} className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <div className="text-[15px] font-bold tracking-tight text-fg">{c.name}</div>
                <div className="mt-0.5 text-[12px] leading-snug text-faint">{c.whatItIs}</div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.workloads.map((w) => (
                <span
                  key={w}
                  className="rounded-md border border-line2 bg-surface2/70 px-2 py-0.5 text-[10.5px] font-medium text-muted"
                >
                  {w}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between">
              {hot ? (
                <span className="inline-flex rounded-full bg-yellow/15 px-2 py-0.5 text-[10px] font-semibold text-yellow">
                  Top for {personaLabel}
                </span>
              ) : (
                <span />
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-faint transition-colors group-hover:text-redis-soft">
                Open
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
