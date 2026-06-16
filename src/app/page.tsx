"use client";

import { useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { PERSONAS } from "@/data/ecosystem";
import { CAPABILITIES } from "@/data/capabilities";
import type { PersonaId } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { MaturityStrip } from "@/components/MaturityStrip";
import { StackConsolidation } from "@/components/StackConsolidation";
import { HeroArchitecture } from "@/components/HeroArchitecture";
import { CapabilityPanel } from "@/components/CapabilityPanel";
import { PillarIcon } from "@/components/icons";
import { SectionHeader } from "@/components/ui";

const KPIS: { eyebrow: string; value: string; sub: string; tone: string }[] = [
  { eyebrow: "Latency", value: "<1 ms", sub: "p99 cached reads", tone: "yellow" },
  { eyebrow: "Throughput", value: "200M+", sub: "ops/sec at scale", tone: "redis" },
  { eyebrow: "Availability", value: "99.999%", sub: "Active-Active SLA", tone: "sky" },
  { eyebrow: "Scale", value: "Petabyte", sub: "datasets · Auto Tiering", tone: "purple" },
  { eyebrow: "Compliance", value: "Audit-ready", sub: "RBI · PCI-DSS · GDPR", tone: "mint" },
];

function toneText(tone: string) {
  return tone === "yellow"
    ? "text-yellow"
    : tone === "sky"
      ? "text-sky"
      : tone === "purple"
        ? "text-purple"
        : tone === "mint"
          ? "text-[#34E0A1]"
          : "text-redis-soft";
}
function toneBar(tone: string) {
  return tone === "yellow"
    ? "bg-yellow"
    : tone === "sky"
      ? "bg-sky"
      : tone === "purple"
        ? "bg-purple"
        : tone === "mint"
          ? "bg-[#34E0A1]"
          : "bg-redis";
}

// L0 entry — the data-structures hub presented as a full-width hero tile.
function HubHeroTile({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="tile tile-hover group relative flex w-full flex-col gap-5 p-6 text-left sm:flex-row sm:items-center"
    >
      <span className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl border border-redis/30 bg-redis/10 text-redis">
        <PillarIcon name="strings" className="h-10 w-10" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-lg font-bold tracking-tight text-fg">Data structures</div>
        <p className="mt-1 max-w-2xl text-[13px] leading-snug text-muted">
          Foundational structures + specialized modules — 20+ native types on one engine. Two branches:
          reach for a primitive you already run, or a purpose-built data model.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-md border border-redis/30 bg-redis/10 px-2 py-0.5 text-[10.5px] font-semibold text-redis-soft">
            Foundational · 7 types
          </span>
          <span className="rounded-md border border-redis/30 bg-redis/10 px-2 py-0.5 text-[10.5px] font-semibold text-redis-soft">
            Specialized · 7 modules
          </span>
          {["Sessions", "Counters", "Queues", "Leaderboards"].map((w) => (
            <span key={w} className="rounded-md border border-line2 bg-surface2/70 px-2 py-0.5 text-[10.5px] font-medium text-muted">
              {w}
            </span>
          ))}
        </div>
      </div>
      <span className="inline-flex flex-none items-center gap-1 self-end text-[11px] font-semibold text-faint transition-colors group-hover:text-redis-soft sm:self-center">
        Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

// L0 entry — Search & query, the flagship engine, featured on its own.
function FeaturedSearchTile({ onOpen }: { onOpen: () => void }) {
  const c = CAPABILITIES.find((x) => x.id === "search");
  if (!c) return null;
  return (
    <button
      onClick={onOpen}
      className="tile tile-hover group relative flex w-full flex-col gap-5 p-6 text-left sm:flex-row sm:items-center"
    >
      <span className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl border border-line2 bg-surface3 text-muted transition-colors group-hover:border-redis/40 group-hover:text-redis-soft">
        <PillarIcon name={c.icon} className="h-10 w-10" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-lg font-bold tracking-tight text-fg">{c.name}</div>
        <p className="mt-1 max-w-2xl text-[13px] leading-snug text-muted">
          {c.whatItIs} The flagship query engine on the same engine — featured here rather than inside
          the hub.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {c.workloads.map((w) => (
            <span key={w} className="rounded-md border border-line2 bg-surface2/70 px-2 py-0.5 text-[10.5px] font-medium text-muted">
              {w}
            </span>
          ))}
        </div>
      </div>
      <span className="inline-flex flex-none items-center gap-1 self-end text-[11px] font-semibold text-faint transition-colors group-hover:text-redis-soft sm:self-center">
        Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

export default function Page() {
  const [capId, setCapId] = useState<string | null>(null);
  const [persona, setPersona] = useState<PersonaId | "all">("all");

  const cap = CAPABILITIES.find((c) => c.id === capId);
  const personaObj = PERSONAS.find((p) => p.id === persona);

  return (
    <div className="min-h-screen">
      <TopBar persona={persona} onPersona={setPersona} />

      <div className="mx-auto max-w-7xl px-5 py-4">
        <nav className="flex flex-wrap items-center gap-1.5 text-sm">
          <button
            onClick={() => setCapId(null)}
            className={`rounded-md px-1.5 py-0.5 transition-colors hover:text-fg ${
              cap ? "text-faint" : "font-medium text-fg"
            }`}
          >
            Ecosystem
          </button>
          {cap && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-faint" />
              <span className="px-1.5 py-0.5 font-medium text-fg">{cap.name}</span>
            </>
          )}
        </nav>
      </div>

      <main className="mx-auto max-w-7xl px-5 pb-24">
        {!cap && (
          <div className="space-y-14">
            {/* HERO */}
            <section className="relative pt-3">
              <div
                className="pointer-events-none absolute inset-x-0 -top-6 h-[420px] bg-grid opacity-60 [mask-image:radial-gradient(70%_60%_at_45%_0%,#000,transparent)]"
                aria-hidden
              />
              <div className="relative">
                <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
                  <div>
                    <span className="eyebrow">
                      <span className="h-1.5 w-1.5 rounded-full bg-redis" />
                      Redis Enterprise · Banking
                    </span>
                    <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-fg sm:text-5xl lg:text-[52px]">
                      From cache to{" "}
                      <span className="text-redis">
                        real-time unified data platform
                      </span>
                    </h1>
                    <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-[17px]">
                      Most banks run Redis as a cache. The same trusted engine is a
                      multi-model, real-time data platform — search, vectors and
                      GenAI, Redis Iris for agentic AI, live data integration and
                      global resilience. Explore the ecosystem, then drill into
                      banking use cases with architecture, demos and value for
                      every stakeholder.
                    </p>

                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <a href="#ecosystem" className="btn btn-primary btn-lg">
                        Explore the ecosystem
                        <ArrowRight className="h-4 w-4" />
                      </a>
                      <a href="#consolidation" className="btn btn-ghost btn-lg">
                        See the TCO story
                      </a>
                    </div>
                  </div>

                  <HeroArchitecture />
                </div>

                <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {KPIS.map((k) => (
                    <div key={k.eyebrow} className="kpi">
                      <span
                        className={`absolute left-0 top-0 h-full w-1 ${toneBar(k.tone)} opacity-80`}
                      />
                      <div className="label text-faint">{k.eyebrow}</div>
                      <div
                        className={`mt-1.5 font-display text-2xl font-bold tracking-tight ${toneText(k.tone)}`}
                      >
                        {k.value}
                      </div>
                      <div className="mt-0.5 text-[12px] text-muted">{k.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* MATURITY */}
            <section className="card p-6 sm:p-7">
              <SectionHeader
                eyebrow="The journey"
                title="Beyond-caching maturity model"
                description="Most banks sit at L0. Each stage unlocks more of the platform you already operate — no rip-and-replace required."
              />
              <div className="mt-7">
                <MaturityStrip />
              </div>
            </section>

            {/* ECOSYSTEM — one engine, many engineering choices */}
            <section id="ecosystem" className="scroll-mt-24 space-y-5">
              <SectionHeader
                eyebrow="Capability ecosystem"
                title="One engine, many engineering choices"
                description="One in-memory engine, many data models — and each one is a real banking workload. Open a block to see its features, live demo and the commands behind it."
              />

              {/* reframe banner (slide: "you use ~5%") */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-line bg-midnight/70 px-5 py-4">
                <span className="font-display text-lg font-bold tracking-tight text-fg">
                  One cluster.
                </span>
                <span className="text-[15px] text-muted">
                  9 data models · 450+ commands.
                </span>
                <span className="ml-auto font-display text-lg font-bold tracking-tight text-redis">
                  Most teams use ~5%.
                </span>
              </div>

              {personaObj && (
                <div className="flex items-start gap-3 rounded-xl border border-redis/25 bg-redis/[0.06] px-4 py-3">
                  <span className="mt-0.5 inline-flex rounded-md bg-redis/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-redis-soft">
                    {personaObj.short}
                  </span>
                  <p className="text-sm leading-relaxed text-muted">{personaObj.blurb}</p>
                </div>
              )}

              <HubHeroTile onOpen={() => setCapId("data-structures")} />

              <div className="space-y-3 pt-1">
                <div className="label text-faint">Query engine · standalone capability</div>
                <FeaturedSearchTile onOpen={() => setCapId("search")} />
              </div>

              <p className="pt-1 text-center text-xs text-faint">
                <span className="font-semibold text-muted">Data structures</span> and{" "}
                <span className="font-semibold text-muted">Search &amp; query</span> are
                fully built out — the specialized modules inside the hub are detailed next.
              </p>
            </section>

            {/* CONSOLIDATION */}
            <StackConsolidation />
          </div>
        )}

        {cap && (
          <CapabilityPanel
            key={cap.id}
            cap={cap}
            onBack={() => setCapId(null)}
            onSelect={setCapId}
          />
        )}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-faint">
          <span>
            Redis — Beyond Caching for Banking · illustrative concept with
            synthetic data
          </span>
          <a
            href="https://redis.io/docs/latest/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-fg"
          >
            redis.io/docs
          </a>
        </div>
      </footer>
    </div>
  );
}
