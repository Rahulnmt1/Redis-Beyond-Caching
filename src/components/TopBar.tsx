"use client";

import { PERSONAS } from "@/data/ecosystem";
import type { PersonaId } from "@/lib/types";
import { RedisWordmark } from "./icons";

export function TopBar({
  persona,
  onPersona,
}: {
  persona: PersonaId | "all";
  onPersona: (p: PersonaId | "all") => void;
}) {
  const opts: { id: PersonaId | "all"; label: string }[] = [
    { id: "all", label: "All" },
    ...PERSONAS.map((p) => ({ id: p.id, label: p.short })),
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-3">
        <div className="flex items-center gap-3">
          <RedisWordmark height={26} />
          <span className="hidden h-8 w-px bg-line2 sm:block" aria-hidden />
          <div className="leading-tight">
            <span className="chip chip-yellow !px-2 !py-0.5 !text-[10px]">
              Beyond Caching
            </span>
            <div className="mt-1 text-[11px] font-medium text-redis">
              Banking capability ecosystem
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-faint md:inline">
            View as
          </span>
          <div className="flex items-center gap-1 rounded-full border border-line2 bg-surface2/70 p-1">
            {opts.map((o) => (
              <button
                key={o.id}
                onClick={() => onPersona(o.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  persona === o.id
                    ? "bg-redis text-white shadow-[0_8px_20px_-10px_rgba(255,68,56,0.8)]"
                    : "text-muted hover:text-fg"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
