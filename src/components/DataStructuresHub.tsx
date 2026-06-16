"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { CAPABILITIES, DS_META, type CapabilityBlock } from "@/data/capabilities";
import { MODULES } from "@/data/modules";
import { PillarIcon } from "./icons";
import { DataStructuresDeepDive } from "./DataStructuresDeepDive";
import { ModuleDeepDive } from "./ModuleDeepDive";

type View = "hub" | "foundational" | "specialized" | "module";

const FOUNDATIONAL_MEMBERS = [
  "Strings & counters",
  "Hashes",
  "Lists",
  "Sets",
  "Sorted sets",
  "Bitmaps & bitfields",
  "HyperLogLog",
];

// Specialized branch — purpose-built models/messaging on the same engine.
const SPECIALIZED_IDS = ["json", "streams", "pubsub", "timeseries", "geospatial", "probabilistic", "vector"];

function cap(id: string): CapabilityBlock | undefined {
  return CAPABILITIES.find((c) => c.id === id);
}
function caps(ids: string[]): CapabilityBlock[] {
  return ids.map(cap).filter((c): c is CapabilityBlock => Boolean(c));
}

function BranchCard({
  icon,
  eyebrow,
  title,
  desc,
  members,
  onOpen,
}: {
  icon: string;
  eyebrow: string;
  title: string;
  desc: string;
  members: string[];
  onOpen: () => void;
}) {
  return (
    <button onClick={onOpen} className="tile tile-hover group flex flex-col p-6 text-left">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl border border-redis/30 bg-redis/10 text-redis">
          <PillarIcon name={icon} className="h-8 w-8" />
        </span>
        <div>
          <div className="label text-redis-soft">{eyebrow}</div>
          <div className="mt-0.5 text-xl font-bold tracking-tight text-fg">{title}</div>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{desc}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {members.map((m) => (
          <span key={m} className="rounded-md border border-line2 bg-surface2/70 px-2 py-0.5 text-[11px] font-medium text-muted">
            {m}
          </span>
        ))}
      </div>
      <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-redis-soft">
        Open deep-dive
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

function HubL1({ onBack, onBranch }: { onBack: () => void; onBranch: (v: View) => void }) {
  return (
    <div className="space-y-7">
      <button onClick={onBack} className="btn btn-ghost !px-3 !py-1.5 text-xs">
        <ArrowLeft className="h-4 w-4" /> Ecosystem
      </button>

      <div
        className="rounded-2xl border border-line p-6 sm:p-7"
        style={{ background: "radial-gradient(120% 130% at 0% 0%, rgba(255,68,56,0.14), rgba(28,62,75,0.45) 55%)" }}
      >
        <div className="flex flex-wrap items-start gap-4">
          <span
            className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl border border-redis/30 text-redis"
            style={{ background: "radial-gradient(120% 120% at 30% 20%, rgba(255,68,56,0.22), rgba(28,62,75,0.5))" }}
          >
            <PillarIcon name={DS_META.icon} className="h-11 w-11" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">{DS_META.name}</h1>
              <span className="chip chip-accent">{DS_META.alias}</span>
            </div>
            <p className="mt-2 text-[15px] font-medium text-redis-soft">{DS_META.tagline}</p>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
              Redis is a data-structure server — 20+ native types on one engine. Start with the
              foundational primitives you already run, or the specialized modules built for documents,
              events, time, geo, probability and similarity. Choose a branch to go deep.
            </p>
            <a
              href={DS_META.link.href}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-redis hover:underline"
            >
              {DS_META.link.label}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BranchCard
          icon="strings"
          eyebrow="Branch 1 · the primitives"
          title="Foundational data structures"
          desc="The classic in-memory types behind sessions, counters, rate limits, queues, leaderboards and population-scale analytics — atomic O(1)/O(log N) commands, no schema."
          members={FOUNDATIONAL_MEMBERS}
          onOpen={() => onBranch("foundational")}
        />
        <BranchCard
          icon="redis-stack"
          eyebrow="Branch 2 · purpose-built"
          title="Specialized capabilities / modules"
          desc="Higher-order models & messaging — documents, event streams, pub/sub, time series, geo, probabilistic sketches and vectors. Each its own deep-dive."
          members={caps(SPECIALIZED_IDS).map((c) => c.name)}
          onOpen={() => onBranch("specialized")}
        />
      </div>
    </div>
  );
}

function SpecializedCatalog({ onBack, onOpen }: { onBack: () => void; onOpen: (id: string) => void }) {
  return (
    <div className="space-y-7">
      <button onClick={onBack} className="btn btn-ghost !px-3 !py-1.5 text-xs">
        <ArrowLeft className="h-4 w-4" /> Data structures
      </button>

      <div
        className="rounded-2xl border border-line p-6"
        style={{ background: "radial-gradient(120% 130% at 0% 0%, rgba(255,68,56,0.12), rgba(28,62,75,0.45) 55%)" }}
      >
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl border border-redis/30 bg-redis/10 text-redis">
            <PillarIcon name="redis-stack" className="h-8 w-8" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">Specialized capabilities / modules</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
              Purpose-built data models on the same engine. Each opens its own deep-dive — same depth as
              Search &amp; query.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {caps(SPECIALIZED_IDS).map((c) => (
          <button key={c.id} onClick={() => onOpen(c.id)} className="tile tile-hover group flex flex-col p-4 text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-line2 bg-surface3 text-muted group-hover:text-redis-soft">
                <PillarIcon name={c.icon} className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold tracking-tight text-fg">{c.name}</div>
                <div className="mt-0.5 text-[11.5px] leading-snug text-faint">{c.whatItIs}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="rounded-full border border-redis/30 bg-redis/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-redis-soft">
                Deep-dive
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-faint group-hover:text-redis-soft">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function PlannedDeepDive({ id, onBack }: { id: string; onBack: () => void }) {
  const c = cap(id);
  if (!c) return null;
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="btn btn-ghost !px-3 !py-1.5 text-xs">
        <ArrowLeft className="h-4 w-4" /> Specialized modules
      </button>
      <div className="rounded-2xl border border-dashed border-line2 bg-surface2/30 p-12 text-center">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-line2 bg-surface3 text-muted">
          <PillarIcon name={c.icon} className="h-9 w-9" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-fg">{c.name}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">{c.whatItIs}</p>
        <p className="mx-auto mt-4 max-w-lg text-[12.5px] leading-relaxed text-faint">
          Deep-dive in progress — built to the same depth as Search &amp; query and Data structures
          (practical use cases, how it works, feature cards and a runnable RedisInsight script).
        </p>
      </div>
    </div>
  );
}

export function DataStructuresHub({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>("hub");
  const [moduleId, setModuleId] = useState<string>("json");

  const spec = MODULES[moduleId];

  return (
    <div className="animate-fade-up">
      {view === "hub" && <HubL1 onBack={onBack} onBranch={setView} />}
      {view === "foundational" && <DataStructuresDeepDive onBack={() => setView("hub")} />}
      {view === "specialized" && (
        <SpecializedCatalog
          onBack={() => setView("hub")}
          onOpen={(id) => {
            setModuleId(id);
            setView("module");
          }}
        />
      )}
      {view === "module" &&
        (spec ? (
          <ModuleDeepDive spec={spec} onBack={() => setView("specialized")} />
        ) : (
          <PlannedDeepDive id={moduleId} onBack={() => setView("specialized")} />
        ))}
    </div>
  );
}
