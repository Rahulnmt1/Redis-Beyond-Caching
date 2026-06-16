import { Fragment } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronRight, ExternalLink, X } from "lucide-react";
import { PERSONAS } from "@/data/ecosystem";
import { DS_FEATURES, DS_META, DS_USE_CASES } from "@/data/capabilities";
import type { PersonaId } from "@/lib/types";
import { PillarIcon } from "./icons";
import { SectionHeader } from "./ui";

// Mental model: app → pick a structure → atomic in-memory op → instant answer.
const MENTAL = [
  { icon: "Network", title: "Your app", sub: "a real-time banking job" },
  { icon: "Layers", title: "Choose a structure", sub: "counter · map · queue · set · rank" },
  { icon: "Gauge", title: "Atomic op", sub: "O(1) / O(log N) · in-memory" },
  { icon: "real-time-analytics", title: "Instant response", sub: "sub-ms · no schema, no race" },
];

// The "many engineering choices" — job → structure → command.
const CHOICES: { need: string; structure: string; cmd: string; icon: string }[] = [
  { need: "Count or cap something", structure: "String", cmd: "INCR · EXPIRE", icon: "strings" },
  { need: "Model an object with fields", structure: "Hash", cmd: "HSET · HINCRBY", icon: "Braces" },
  { need: "Buffer work in order", structure: "List", cmd: "LPUSH · BRPOP", icon: "ListOrdered" },
  { need: "Guarantee uniqueness", structure: "Set", cmd: "SADD · SISMEMBER", icon: "Boxes" },
  { need: "Rank or window by score", structure: "Sorted set", cmd: "ZADD · ZRANGEBYSCORE", icon: "leaderboards" },
  { need: "Track presence flags", structure: "Bitmap", cmd: "SETBIT · BITCOUNT", icon: "Binary" },
  { need: "Count uniques at scale", structure: "HyperLogLog", cmd: "PFADD · PFCOUNT", icon: "probabilistic" },
];

const HOW_NOTES = [
  { t: "Atomic by default", b: "Every command is atomic — counters, dedupe and balances stay correct without app-side locks." },
  { t: "Predictable latency", b: "O(1) / O(log N) ops in memory mean sub-ms responses that hold as data grows." },
  { t: "The engine you already run", b: "Same Redis you use as a cache — more capability, no new system to buy or sync." },
];

const PERSONA_VALUE: Partial<Record<PersonaId, string>> = {
  Dev: "Reach for a purpose-built structure — counter, queue, set, leaderboard — instead of hand-rolling it on a table. Fewer lines, no races.",
  DB: "Offload hot key-value, counter and queue workloads off the core — one engine, atomic ops, no schema migrations.",
  SRE: "The cache you already run, doing more — predictable O(1)/O(log N) latency and per-key TTLs keep memory and SLAs in check.",
  SA: "Model real-time features on infrastructure you already operate — no new system to buy, just more of Redis.",
};

// A runnable RedisInsight Workbench script — every command works on a fresh
// database (each creates its own keys), against localhost:12000.
const DS_DEMO: { title: string; cmd: string; desc: string }[] = [
  {
    title: "Cache a balance with a TTL",
    cmd: "SET acct:C1001:bal 2480000 EX 30\nGET acct:C1001:bal\nTTL acct:C1001:bal",
    desc: "Write a hot value that auto-expires in 30 s; GET serves it in sub-ms, TTL shows the countdown.",
  },
  {
    title: "Rate-limit with an atomic counter",
    cmd: "INCR otp:99900:count\nEXPIRE otp:99900:count 300\nGET otp:99900:count",
    desc: "Each OTP send increments the counter; gate at a threshold and let the key expire after the window.",
  },
  {
    title: "Model a session as a hash",
    cmd: "HSET sess:ab12 custId C1001 role priority hits 1\nHINCRBY sess:ab12 hits 1\nHGETALL sess:ab12",
    desc: "One key holds the whole session; HINCRBY bumps a single field atomically.",
  },
  {
    title: "Use a list as a work queue",
    cmd: "LPUSH q:payments txn:88126 txn:88127\nLRANGE q:payments 0 -1\nRPOP q:payments",
    desc: "Producers push jobs; a worker pops the oldest (FIFO). BRPOP blocks until work arrives.",
  },
  {
    title: "Dedupe with a set",
    cmd: "SADD txn:processed 88124\nSADD txn:processed 88124\nSISMEMBER txn:processed 88124\nSCARD txn:processed",
    desc: "The second SADD returns 0 — the duplicate is ignored; SCARD is the unique count.",
  },
  {
    title: "Rank with a sorted set",
    cmd: "ZADD aml:risk 73 C1005 68 C1011 61 C1003\nZREVRANGE aml:risk 0 2 WITHSCORES\nZRANGEBYSCORE aml:risk 60 +inf",
    desc: "Top-N riskiest customers and everyone above a risk threshold — ordered, in O(log N).",
  },
  {
    title: "Track daily-active with a bitmap",
    cmd: "SETBIT dau:2026-06-16 1001 1\nSETBIT dau:2026-06-16 1006 1\nBITCOUNT dau:2026-06-16",
    desc: "One bit per customer; BITCOUNT is the active-user count in ~1 ms across millions of bits.",
  },
  {
    title: "Count uniques with HyperLogLog",
    cmd: "PFADD uniq:payers C1001 C1006 C1001\nPFCOUNT uniq:payers",
    desc: "Duplicates collapse; PFCOUNT estimates uniques within ~0.81% error in a fixed 12 KB.",
  },
  {
    title: "Inspect the structure & encoding",
    cmd: "TYPE sess:ab12\nOBJECT ENCODING sess:ab12\nMEMORY USAGE sess:ab12",
    desc: "Show the data type, its memory-optimised encoding (e.g. listpack) and bytes used — the structure behind the key.",
  },
  {
    title: "Expire & evict",
    cmd: "EXPIRE sess:ab12 600\nTTL sess:ab12\nPERSIST sess:ab12",
    desc: "Per-key TTLs drive automatic eviction; PERSIST removes the timer — the basis of cache + session lifecycles.",
  },
];

// Mental-model row (app → structure → atomic op → response).
function MentalRow() {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
      {MENTAL.map((s, i) => (
        <Fragment key={s.title}>
          <div className="flex-1 rounded-xl border border-line bg-surface2/50 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-redis/30 bg-redis/10 text-redis">
              <PillarIcon name={s.icon} className="h-[18px] w-[18px]" />
            </span>
            <div className="mt-2.5 text-sm font-semibold text-fg">{s.title}</div>
            <div className="mt-0.5 font-mono text-[11px] text-faint">{s.sub}</div>
          </div>
          {i < MENTAL.length - 1 && (
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

export function DataStructuresDeepDive({ onBack }: { onBack: () => void }) {
  return (
    <div className="animate-fade-up space-y-9">
      <button onClick={onBack} className="btn btn-ghost !px-3 !py-1.5 text-xs">
        <ArrowLeft className="h-4 w-4" /> Data structures
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
            <PillarIcon name={DS_META.icon} className="h-11 w-11" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">
                {DS_META.name}
              </h1>
              <span className="chip chip-accent">{DS_META.alias}</span>
            </div>
            <p className="mt-2 text-[15px] font-medium text-redis-soft">{DS_META.tagline}</p>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">{DS_META.whatItIs}</p>
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

      {/* practical use cases */}
      <section className="space-y-3">
        <SectionHeader
          eyebrow="Practical use cases"
          title="What banks build on the core structures"
          description="Beyond the cache — the everyday real-time workloads that map directly onto Redis data structures: sessions, rate limits, idempotency, counters, queues, leaderboards and population-scale analytics."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DS_USE_CASES.map((u) => (
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

      {/* how it works — pick the right structure */}
      <section className="space-y-3">
        <SectionHeader
          eyebrow="How it works"
          title="One engine, many engineering choices"
          description="There is no schema to design. You pick the structure that fits the job, and the engine runs the matching atomic command in memory — the same cluster, a different shape per workload."
        />
        <div className="mt-2 space-y-3">
          <MentalRow />

          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-redis/30 bg-redis/10 px-3 py-1 text-[11px] font-semibold text-redis-soft">
              <ChevronDown className="h-3.5 w-3.5" />
              Choosing the structure — the engineering decision
            </span>
          </div>

          <div className="rounded-2xl border border-redis/25 bg-redis/[0.04] p-4">
            <div className="label mb-3 text-redis-soft">If you need to… → reach for</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {CHOICES.map((c) => (
                <div
                  key={c.structure}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface2/50 p-3"
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-redis/30 bg-redis/10 text-redis">
                    <PillarIcon name={c.icon} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12.5px] leading-snug text-muted">{c.need}</div>
                    <div className="mt-0.5 text-sm font-bold tracking-tight text-fg">
                      {c.structure}
                    </div>
                    <div className="font-mono text-[10.5px] text-redis-soft">{c.cmd}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {HOW_NOTES.map((n) => (
              <div key={n.t} className="rounded-lg border border-redis/20 bg-redis/[0.05] px-3 py-2">
                <div className="label text-redis-soft">{n.t}</div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">{n.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* core structures — the feature cards */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="The core data structures"
          title="Each structure, with a banking worked example"
          description="For every type — what it is, the banking use case, a worked example (data → commands → output), what you achieved, and what it would take without it."
        />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {DS_FEATURES.map((f) => (
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
          {(Object.keys(PERSONA_VALUE) as PersonaId[]).map((pid) => (
            <div key={pid} className="card p-4">
              <div className="text-xs font-semibold text-redis">
                {PERSONAS.find((p) => p.id === pid)?.label ?? pid}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{PERSONA_VALUE[pid]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* runnable RedisInsight script */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Run it live"
          title="Try every structure in RedisInsight · Workbench"
          description="Connected to your database on :12000. Paste these in order — each command creates its own keys, so nothing needs seeding. Use the Browser alongside Workbench to watch the keys and their types appear."
        />
        <div className="rounded-2xl border border-redis/25 bg-redis/[0.05] p-5">
          <div className="label mb-1 text-redis-soft">
            RedisInsight · Workbench — connected to localhost:12000
          </div>
          <p className="mb-4 text-[13px] leading-relaxed text-muted">
            A guided tour of the core types — counters, hashes, queues, sets, sorted sets, bitmaps and
            HyperLogLog — finishing with <span className="font-semibold text-fg">TYPE / OBJECT ENCODING</span>{" "}
            and TTLs so you can see the structure and memory behind each key.
          </p>

          <ol className="space-y-2.5">
            {DS_DEMO.map((s, i) => (
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

          <p className="mt-4 text-[12px] leading-relaxed text-faint">
            Tip: run <span className="font-mono text-redis-soft">FLUSHDB</span> on a scratch database first if
            you want a clean slate — these demo keys are safe to delete afterwards.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button onClick={onBack} className="btn btn-ghost">
          Back to Data structures
        </button>
        <span className="text-xs text-faint">
          Concept walkthrough · synthetic banking data · no real PII
        </span>
      </div>
    </div>
  );
}
