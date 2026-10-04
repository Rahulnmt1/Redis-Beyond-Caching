"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, ChevronRight } from "lucide-react";
import { AI_GROUPS, AI_META, AI_MODULES, AI_USE_CASES } from "@/data/ai";
import { ModuleDeepDive } from "./ModuleDeepDive";
import { PillarIcon } from "./icons";
import { SectionHeader } from "./ui";

// Redis Iris context-engine architecture strip.
function IrisArchitecture() {
  const pillars = [
    { icon: "Network", name: "Context Retriever", sub: "governed tools" },
    { icon: "agent-memory", name: "Agent Memory", sub: "working + long-term" },
    { icon: "redis-langcache", name: "LangCache", sub: "semantic cache" },
    { icon: "redis-search", name: "Search & Vectors", sub: "retrieval" },
  ];
  const valueProps: { icon: string; k: string; v: string; tone: "yellow" | "sky" | "redis" }[] = [
    { icon: "Gauge", k: "Fast", v: "Sub-ms vector search, memory & cache on one in-memory engine", tone: "yellow" },
    { icon: "ShieldCheck", k: "Accurate", v: "Grounded on fresh (RDI), governed context + memory — fewer hallucinations", tone: "sky" },
    { icon: "LineChart", k: "Cost-effective", v: "LangCache cuts LLM tokens up to ~70% · one platform, not four", tone: "redis" },
  ];
  const toneText: Record<string, string> = { yellow: "text-yellow", sky: "text-sky", redis: "text-redis-soft" };
  const toneBar: Record<string, string> = { yellow: "bg-yellow", sky: "bg-sky", redis: "bg-redis" };

  return (
    <div
      className="rounded-2xl border border-line p-5 sm:p-6"
      style={{ background: "radial-gradient(120% 130% at 100% 0%, rgba(255,68,56,0.10), rgba(28,62,75,0.35) 60%)" }}
    >
      <div className="flex items-center gap-2.5">
        <PillarIcon name="redis-iris" className="h-6 w-6" />
        <div className="text-sm font-bold tracking-tight text-fg">The Redis Iris context engine</div>
        <span className="chip chip-accent ml-1">one runtime</span>
      </div>

      <div className="mt-4 grid items-stretch gap-3 lg:grid-cols-[0.85fr_auto_1.7fr_auto_0.85fr]">
        {/* sources */}
        <div className="flex flex-col justify-center rounded-xl border border-line bg-surface2/50 p-3.5 text-center">
          <PillarIcon name="redis-database" className="mx-auto h-7 w-7" />
          <div className="mt-2 text-[13px] font-semibold text-fg">Systems of record</div>
          <div className="mt-0.5 text-[11px] text-faint">Postgres · Oracle · Mongo</div>
        </div>

        {/* arrow */}
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center text-redis/80">
            <ChevronRight className="hidden h-5 w-5 lg:block" />
            <span className="mt-0.5 hidden font-mono text-[9px] uppercase tracking-wide text-faint lg:block">RDI · CDC</span>
          </div>
        </div>

        {/* iris runtime */}
        <div className="rounded-xl border border-redis/30 bg-redis/[0.06] p-3.5">
          <div className="mb-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-redis-soft">
            Redis Iris runtime
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {pillars.map((p) => (
              <div key={p.name} className="rounded-lg border border-line2 bg-surface/60 p-2.5 text-center">
                <PillarIcon name={p.icon} className="mx-auto h-6 w-6" />
                <div className="mt-1.5 text-[11.5px] font-semibold leading-tight text-fg">{p.name}</div>
                <div className="mt-0.5 text-[10px] leading-tight text-faint">{p.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* arrow */}
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center text-redis/80">
            <ChevronRight className="hidden h-5 w-5 lg:block" />
            <span className="mt-0.5 hidden font-mono text-[9px] uppercase tracking-wide text-faint lg:block">context</span>
          </div>
        </div>

        {/* agent */}
        <div className="flex flex-col justify-center rounded-xl border border-line bg-surface2/50 p-3.5 text-center">
          <PillarIcon name="Bot" className="mx-auto h-7 w-7 text-redis" />
          <div className="mt-2 text-[13px] font-semibold text-fg">Agent / LLM</div>
          <div className="mt-0.5 text-[11px] text-faint">fresh, grounded context</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {valueProps.map((r) => (
          <div key={r.k} className="relative overflow-hidden rounded-xl border border-line2 bg-surface2/50 p-3.5">
            <span className={`absolute left-0 top-0 h-full w-1 ${toneBar[r.tone]} opacity-80`} />
            <div className="flex items-center gap-2">
              <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-lg border border-line2 bg-surface3 ${toneText[r.tone]}`}>
                <PillarIcon name={r.icon} className="h-4 w-4" />
              </span>
              <div className={`text-[13.5px] font-bold tracking-tight ${toneText[r.tone]}`}>{r.k}</div>
            </div>
            <p className="mt-1.5 text-[12px] leading-snug text-muted">{r.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CatalogCard({ id, onOpen }: { id: string; onOpen: (id: string) => void }) {
  const m = AI_MODULES[id]?.meta;
  if (!m) return null;
  return (
    <button onClick={() => onOpen(id)} className="tile tile-hover group flex flex-col p-4 text-left">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-line2 bg-surface3 text-muted group-hover:text-redis-soft">
          <PillarIcon name={m.icon} className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <div className="text-sm font-bold tracking-tight text-fg">{m.name}</div>
          <div className="mt-0.5 text-[11.5px] leading-snug text-faint">{m.alias}</div>
        </div>
      </div>
      <p className="mt-3 flex-1 text-[12.5px] leading-relaxed text-muted">{m.tagline}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-full border border-redis/30 bg-redis/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-redis-soft">
          Deep-dive
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-faint group-hover:text-redis-soft">
          Open <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

function HubL1({ onBack, onOpen }: { onBack: () => void; onOpen: (id: string) => void }) {
  return (
    <div className="space-y-8">
      <button onClick={onBack} className="btn btn-ghost !px-3 !py-1.5 text-xs">
        <ArrowLeft className="h-4 w-4" /> Ecosystem
      </button>

      {/* header */}
      <div
        className="rounded-2xl border border-line p-6 sm:p-7"
        style={{ background: "radial-gradient(120% 130% at 0% 0%, rgba(255,68,56,0.14), rgba(28,62,75,0.45) 55%)" }}
      >
        <div className="flex flex-wrap items-start gap-4">
          <span
            className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl border border-redis/30 text-redis"
            style={{ background: "radial-gradient(120% 120% at 30% 20%, rgba(255,68,56,0.22), rgba(28,62,75,0.5))" }}
          >
            <PillarIcon name={AI_META.icon} className="h-11 w-11" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">{AI_META.name}</h1>
              <span className="chip chip-accent">{AI_META.alias}</span>
            </div>
            <p className="mt-2 text-[15px] font-medium text-redis-soft">{AI_META.tagline}</p>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">{AI_META.whatItIs}</p>
            <a
              href={AI_META.link.href}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-redis hover:underline"
            >
              {AI_META.link.label}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* iris architecture */}
      <IrisArchitecture />

      {/* practical use cases */}
      <section className="space-y-3">
        <SectionHeader
          eyebrow="Practical use cases"
          title="What banks build with Redis for AI"
          description="Customer-facing assistants, advisor agents, fraud and similarity, grounded search and agentic routing — real-time AI workloads on one Redis platform."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {AI_USE_CASES.map((u) => (
            <div key={u.title} className="tile flex flex-col p-4">
              <div className="text-sm font-bold leading-snug tracking-tight text-fg">{u.title}</div>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted">{u.detail}</p>
              <div className="mt-3 inline-flex w-fit rounded-md border border-redis/20 bg-redis/[0.07] px-2 py-0.5 font-mono text-[10.5px] font-semibold text-redis-soft">
                {u.primitives}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* grouped capability catalog */}
      {AI_GROUPS.map((g) => (
        <section key={g.id} className="space-y-3">
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-redis" />
            {g.eyebrow}
          </span>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-fg">{g.title}</h2>
            <span className="text-xs font-semibold text-faint">{g.members.length} capabilities</span>
          </div>
          <p className="max-w-3xl text-[14px] leading-relaxed text-muted">{g.desc}</p>
          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2 lg:grid-cols-3">
            {g.members.map((id) => (
              <CatalogCard key={id} id={id} onOpen={onOpen} />
            ))}
          </div>
        </section>
      ))}

      {/* built-with */}
      <div className="rounded-2xl border border-redis/25 bg-redis/[0.05] p-5">
        <div className="label mb-1 text-redis-soft">Built with</div>
        <p className="text-[13px] leading-relaxed text-muted">
          <span className="font-semibold text-fg">RedisVL</span> (the Redis Vector Library) ties the foundations
          together — index management, vectorizers, semantic cache, message history and semantic router — and
          Redis for AI integrates with <span className="font-semibold text-fg">LangChain, LlamaIndex, LangGraph
          and Spring AI</span>, plus MCP for agent tooling. The four managed services above are{" "}
          <span className="font-semibold text-fg">Redis Iris</span>, the context-engine runtime on Redis Cloud.
        </p>
      </div>
    </div>
  );
}

export function RedisForAiHub({ onBack }: { onBack: () => void }) {
  const [moduleId, setModuleId] = useState<string | null>(null);
  const spec = moduleId ? AI_MODULES[moduleId] : null;

  return (
    <div className="animate-fade-up">
      {spec ? (
        <ModuleDeepDive spec={spec} onBack={() => setModuleId(null)} backLabel="Redis for AI" />
      ) : (
        <HubL1 onBack={onBack} onOpen={setModuleId} />
      )}
    </div>
  );
}
