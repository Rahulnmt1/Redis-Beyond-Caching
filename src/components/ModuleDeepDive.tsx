import { Fragment } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronRight, ExternalLink, X } from "lucide-react";
import { PERSONAS } from "@/data/ecosystem";
import type { ModuleSpec } from "@/data/modules";
import type { PersonaId } from "@/lib/types";
import { PillarIcon } from "./icons";
import { SectionHeader } from "./ui";

function FlowRow({ steps }: { steps: ModuleSpec["how"]["flow"] }) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
      {steps.map((s, i) => (
        <Fragment key={s.title}>
          <div className="flex-1 rounded-xl border border-line bg-surface2/50 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-redis/30 bg-redis/10 text-redis">
              <PillarIcon name={s.icon} className="h-[18px] w-[18px]" />
            </span>
            <div className="mt-2.5 text-sm font-semibold text-fg">{s.title}</div>
            <div className="mt-0.5 font-mono text-[11px] text-faint">{s.sub}</div>
          </div>
          {i < steps.length - 1 && (
            <div className="flex items-center justify-center text-redis/70">
              <ChevronRight className="hidden h-5 w-5 lg:block" />
              <ChevronDown className="h-5 w-5 lg:hidden" />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}

export function ModuleDeepDive({
  spec,
  onBack,
  backLabel = "Specialized modules",
}: {
  spec: ModuleSpec;
  onBack: () => void;
  backLabel?: string;
}) {
  const { meta, useCases, how, features, personaValue, demo } = spec;
  const personaIds = Object.keys(personaValue) as PersonaId[];

  return (
    <div className="animate-fade-up space-y-9">
      <button onClick={onBack} className="btn btn-ghost !px-3 !py-1.5 text-xs">
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </button>

      {/* header */}
      <div
        className="rounded-2xl border border-line p-6 sm:p-7"
        style={{
          background:
            "radial-gradient(120% 130% at 0% 0%, rgba(255,68,56,0.14), rgba(28,62,75,0.45) 55%)",
        }}
      >
        <div className="flex flex-wrap items-start gap-4">
          <span
            className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl border border-redis/30 text-redis"
            style={{
              background:
                "radial-gradient(120% 120% at 30% 20%, rgba(255,68,56,0.22), rgba(28,62,75,0.5))",
            }}
          >
            <PillarIcon name={meta.icon} className="h-11 w-11" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">{meta.name}</h1>
              <span className="chip chip-accent">{meta.alias}</span>
            </div>
            <p className="mt-2 text-[15px] font-medium text-redis-soft">{meta.tagline}</p>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">{meta.whatItIs}</p>
            <a
              href={meta.link.href}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-redis hover:underline"
            >
              {meta.link.label}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* practical use cases */}
      <section className="space-y-3">
        <SectionHeader
          eyebrow="Practical use cases"
          title="What banks build with it"
          description="The everyday real-time banking workloads this module maps onto — drawn from the same use-case catalog as the rest of the platform."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((u) => (
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

      {/* how it works */}
      <section className="space-y-3">
        <SectionHeader eyebrow="How it works" title={how.title} description={how.description} />
        <div className="mt-2 space-y-3">
          <FlowRow steps={how.flow} />
          <div className="grid gap-2 sm:grid-cols-3">
            {how.notes.map((n) => (
              <div key={n.t} className="rounded-lg border border-redis/20 bg-redis/[0.05] px-3 py-2">
                <div className="label text-redis-soft">{n.t}</div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">{n.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* feature cards — worked examples */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Capabilities"
          title="Each capability, with a banking worked example"
          description="For every capability — what it does, the banking use case, a worked example (data → commands → output), what you achieved, and what it would take without it."
        />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {features.map((f) => (
            <div key={f.id} className="tile flex flex-col p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-redis/30 bg-redis/10 text-redis">
                  <PillarIcon name={f.icon} className="h-5 w-5" />
                </span>
                <h3 className="text-base font-bold tracking-tight text-fg">{f.name}</h3>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted">{f.what}</p>

              <div className="mt-3 rounded-lg border border-redis/20 bg-redis/[0.06] px-3 py-2.5">
                <div className="label mb-1 text-redis-soft">Banking usecase</div>
                <p className="text-[13px] leading-relaxed text-fg/90">{f.usecase}</p>
              </div>

              {/* worked example: data pattern → commands → output */}
              <div className="mt-3 space-y-2 rounded-xl border border-line bg-surface2/40 p-3">
                <div className="label text-faint">Worked example</div>

                <div>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-faint">
                    Data pattern
                  </div>
                  <pre className="overflow-x-auto rounded-md border border-line bg-surface/60 px-2.5 py-1.5 font-mono text-[11px] leading-relaxed text-dusk30">
                    {f.pattern}
                  </pre>
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-faint">
                    Commands
                    <ChevronDown className="h-3 w-3 text-redis/70" />
                  </div>
                  <pre className="overflow-x-auto rounded-md border border-white/10 bg-midnight px-2.5 py-2 font-mono text-[11px] leading-relaxed text-[#D5E0E3]">
                    {f.query}
                  </pre>
                </div>

                <div>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-yellow">
                    Output
                  </div>
                  <p className="rounded-md border border-yellow/20 bg-yellow/[0.06] px-2.5 py-1.5 font-mono text-[11.5px] leading-relaxed text-fg/90">
                    {f.output}
                  </p>
                </div>
              </div>

              {/* outcome vs without */}
              <div className="mt-3 grid grid-cols-1 gap-2">
                <div className="rounded-lg border border-sky/25 bg-sky/[0.06] px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 flex-none text-sky" />
                    <span className="label text-sky">What you achieved</span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-fg/90">{f.outcome}</p>
                </div>
                <div className="rounded-lg border border-line bg-surface2/40 px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <X className="h-3.5 w-3.5 flex-none text-redis/70" />
                    <span className="label text-faint">Without Redis</span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{f.without}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* value */}
      <section className="space-y-3">
        <SectionHeader eyebrow="Value" title="Why each stakeholder cares" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {personaIds.map((pid) => (
            <div key={pid} className="card p-4">
              <div className="text-xs font-semibold text-redis">
                {PERSONAS.find((p) => p.id === pid)?.label ?? pid}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{personaValue[pid]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* runnable RedisInsight script */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Run it live"
          title="Try it in RedisInsight · Workbench"
          description="Connected to your database on :12000. Paste these in order — open the Browser alongside Workbench to watch keys appear and change."
        />
        <div className="rounded-2xl border border-redis/25 bg-redis/[0.05] p-5">
          <div className="label mb-1 text-redis-soft">
            RedisInsight · Workbench — connected to localhost:12000
          </div>
          <p className="mb-4 text-[13px] leading-relaxed text-muted">{demo.intro}</p>
          {demo.note && (
            <div className="mb-4 rounded-lg border border-yellow/25 bg-yellow/[0.07] px-3 py-2 text-[12px] leading-relaxed text-fg/90">
              {demo.note}
            </div>
          )}

          <ol className="space-y-2.5">
            {demo.steps.map((s, i) => (
              <li key={s.title} className="rounded-xl border border-line bg-surface2/40 p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-redis/15 text-[10px] font-bold text-redis-soft">
                    {i + 1}
                  </span>
                  <span className="text-[13px] font-semibold text-fg">{s.title}</span>
                </div>
                <pre className="mt-2 overflow-x-auto rounded-lg border border-white/10 bg-midnight px-3 py-2 font-mono text-[11.5px] leading-relaxed text-[#D5E0E3]">
                  {s.cmd}
                </pre>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button onClick={onBack} className="btn btn-ghost">
          Back to {backLabel}
        </button>
        <span className="text-xs text-faint">
          Concept walkthrough · synthetic banking data · no real PII
        </span>
      </div>
    </div>
  );
}
