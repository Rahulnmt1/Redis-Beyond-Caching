import { Fragment } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronRight, ExternalLink, Layers, X } from "lucide-react";
import { PERSONAS } from "@/data/ecosystem";
import { SEARCH_FEATURES, SEARCH_META, SEARCH_USE_CASES } from "@/data/capabilities";
import type { PersonaId } from "@/lib/types";
import { PillarIcon, RedisLogo } from "./icons";
import { SearchPlayground } from "./SearchPlayground";
import { SectionHeader } from "./ui";

// Engine pipeline — the mechanic that runs *inside* the Redis Enterprise stage.
const STEPS = [
  { icon: "json", title: "Operational data", sub: "JSON / Hash · cust:*" },
  { icon: "secondary-indexing", title: "FT.CREATE index", sub: "text · tag · numeric · vector" },
  { icon: "redis-search", title: "FT.SEARCH / AGGREGATE", sub: "filter · rank · group" },
  { icon: "real-time-analytics", title: "Ranked results", sub: "sub-ms → channels & apps" },
];

// Architecture flow — source systems → RDI → Redis → consumers.
type FlowNode = { name: string; sub: string };
type FlowStage = { icon: string; label: string; hero?: boolean; nodes: FlowNode[] };

const FLOW: FlowStage[] = [
  {
    icon: "Database",
    label: "Systems of record",
    nodes: [
      { name: "Core banking", sub: "accounts · balances" },
      { name: "Payments / UPI", sub: "transactions" },
      { name: "CRM / KYC", sub: "profiles · docs" },
    ],
  },
  {
    icon: "redis-rdi",
    label: "Ingest · keep fresh",
    nodes: [
      { name: "Redis Data Integration", sub: "RDI · change-data-capture" },
      { name: "Sub-second sync", sub: "no nightly batch" },
    ],
  },
  {
    icon: "redis-enterprise",
    label: "Redis Enterprise",
    hero: true,
    nodes: [
      { name: "JSON profiles", sub: "cust:* documents" },
      { name: "Search index", sub: "idx:cust · FT.CREATE" },
      { name: "Query engine", sub: "FT.SEARCH / AGGREGATE" },
    ],
  },
  {
    icon: "Network",
    label: "Consumers",
    nodes: [
      { name: "Mobile / Net banking", sub: "type-ahead · 360" },
      { name: "Contact centre", sub: "agent search" },
      { name: "AI / RAG / agents", sub: "hybrid retrieval" },
    ],
  },
];

const FLOW_ARROWS = ["writes", "RDI streams", "sub-ms"];

const HOW_NOTES = [
  { t: "No ETL lag", b: "RDI keeps the index fresh — a source write is searchable in Redis almost immediately." },
  { t: "One platform", b: "Store, index and query in one place — no separate search cluster to feed and sync." },
  { t: "Sub-ms to every channel", b: "The same index fans out to apps, the contact centre and AI retrieval." },
];

const PERSONA_VALUE: Partial<Record<PersonaId, string>> = {
  SA: "Retire a standalone search cluster — store and query on one platform with one API.",
  DB: "Secondary indexing and JSON query without a second database to license or keep in sync.",
  Dev: "Query with FT.SEARCH instead of ORM gymnastics or a separate search service.",
  SRE: "One fewer stateful system to run, patch and sync — and it stays sub-ms under load.",
};

const ELK_PAINS = [
  "A separate Elasticsearch cluster to size, license, patch and secure",
  "Logstash / Beats pipelines to copy and continuously sync data from the system of record",
  "Refresh-interval lag between a write and it becoming searchable",
  "Kibana is yet another service to run, upgrade and lock down",
];

const REDIS_WINS = [
  "The data already in Redis is the index — no second datastore to operate",
  "No ETL: the index updates the instant a document changes (RDI keeps source data fresh)",
  "Sub-millisecond, in-memory query latency",
  "RedisInsight is the develop, query, browse and profile surface — on :12000",
];

const KIBANA_MAP: { task: string; elk: string; redis: string }[] = [
  { task: "Create index & field mapping", elk: "PUT /index + mappings JSON", redis: "FT.CREATE … SCHEMA  (Workbench)" },
  { task: "Browse & inspect documents", elk: "Kibana · Discover", redis: "RedisInsight · Browser (JSON view)" },
  { task: "Run ad-hoc queries", elk: "Kibana · Dev Tools (_search DSL)", redis: "RedisInsight · Workbench (FT.SEARCH)" },
  { task: "Inspect index schema & stats", elk: "Index Management · _stats", redis: "FT.INFO idx:cust" },
  { task: "Aggregations & analytics", elk: "Aggregation DSL + Kibana viz", redis: "FT.AGGREGATE  GROUPBY / REDUCE" },
  { task: "Full-text + structured filter", elk: "bool / must / filter JSON", redis: "@name:term @balance:[min max]" },
  { task: "Vector / semantic search", elk: "kNN plugin (bolt-on)", redis: "KNN inside the same hybrid query" },
  { task: "Profile slow queries", elk: "Kibana Profiler / slow log", redis: "RedisInsight Profiler + SLOWLOG" },
  { task: "Cluster management", elk: "separate ES ops tooling", redis: "Redis Enterprise Cluster Manager :8443" },
];

// A runnable RedisInsight Workbench script, ordered like a Kibana demo.
const INSIGHT_DEMO: { title: string; kibana: string; cmd: string; desc: string }[] = [
  {
    title: "List the search indexes",
    kibana: "GET _cat/indices",
    cmd: "FT._LIST",
    desc: "Show every search index in the database — here, idx:cust.",
  },
  {
    title: "Inspect the index schema & stats",
    kibana: "GET /idx/_mapping · _stats",
    cmd: "FT.INFO idx:cust",
    desc: "Field types (TEXT / TAG / NUMERIC / GEO), document count and memory — the mapping, without a separate screen.",
  },
  {
    title: "Open a document",
    kibana: "Discover · GET /idx/_doc/C1001",
    cmd: "JSON.GET cust:C1001",
    desc: "Inspect the raw JSON profile exactly as stored — native JSON, not a flattened _source.",
  },
  {
    title: "Match all — list everything",
    kibana: "GET _search { match_all }",
    cmd: 'FT.SEARCH idx:cust "*" LIMIT 0 10',
    desc: "Return the first 10 customers — the equivalent of an empty Discover view.",
  },
  {
    title: "Full-text / type-ahead",
    kibana: "match_phrase_prefix",
    cmd: 'FT.SEARCH idx:cust "@name:rah*" LIMIT 0 5',
    desc: "Prefix + relevance ranking as you type ‘rah’ — returns Rahul Choubey.",
  },
  {
    title: "Bool filter — tag + numeric range",
    kibana: "bool { filter, range }",
    cmd: 'FT.SEARCH idx:cust "@segment:{Priority} @balance:[2000000 +inf] @risk:[0 30]" DIALECT 2',
    desc: "Pre-approved set: Priority AND balance ≥ ₹20L AND risk ≤ 30 — in one expression.",
  },
  {
    title: "Fuzzy match",
    kibana: "match { fuzziness: AUTO }",
    cmd: 'FT.SEARCH idx:cust "@name:%sharrma%" DIALECT 2',
    desc: "Typo-tolerant screening — ‘Sharrma’ still matches the Sharma names.",
  },
  {
    title: "Aggregation — terms + sum",
    kibana: "aggs { terms + sum }",
    cmd: `FT.AGGREGATE idx:cust "*"
  GROUPBY 1 @city
  REDUCE COUNT 0 AS n
  REDUCE SUM 1 @balance AS aum
  SORTBY 2 @aum DESC`,
    desc: "Customers and AUM per city, ranked — a Kibana terms + sum aggregation, computed live.",
  },
  {
    title: "Geo distance",
    kibana: "geo_distance query",
    cmd: 'FT.SEARCH idx:cust "@location:[72.8777 19.076 150 km]" DIALECT 2',
    desc: "Everything within 150 km of Mumbai — a geo filter inside the same query.",
  },
  {
    title: "Sort + select fields",
    kibana: "sort + _source",
    cmd: 'FT.SEARCH idx:cust "@segment:{Priority}" SORTBY balance DESC RETURN 3 name city balance LIMIT 0 5 DIALECT 2',
    desc: "Top Priority customers by balance, returning only the fields you need.",
  },
];

const SCHEMA: { path: string; alias: string; type: "TEXT" | "TAG" | "NUMERIC" | "GEO" }[] = [
  { path: "$.name", alias: "name", type: "TEXT" },
  { path: "$.segment", alias: "segment", type: "TAG" },
  { path: "$.city", alias: "city", type: "TAG" },
  { path: "$.product", alias: "product", type: "TAG" },
  { path: "$.balance", alias: "balance", type: "NUMERIC" },
  { path: "$.risk", alias: "risk", type: "NUMERIC" },
  { path: "$.location", alias: "location", type: "GEO" },
];

function typeTone(t: string) {
  return t === "TEXT"
    ? "bg-sky/15 text-sky"
    : t === "TAG"
      ? "bg-yellow/15 text-yellow"
      : t === "GEO"
        ? "bg-purple/15 text-purple"
        : "bg-redis/15 text-redis-soft";
}

const DOC_JSON = `{
  "name": "Rahul Choubey",
  "segment": "Priority",
  "city": "Mumbai",
  "product": "Savings",
  "balance": 2480000,
  "risk": 22,
  "location": "72.8777,19.076"
}`;

const FT_CREATE = `FT.CREATE idx:cust
  ON JSON  PREFIX 1 cust:
  SCHEMA
    $.name      AS name      TEXT SORTABLE
    $.segment   AS segment   TAG
    $.city      AS city      TAG
    $.product   AS product   TAG
    $.balance   AS balance   NUMERIC SORTABLE
    $.risk      AS risk      NUMERIC SORTABLE
    $.location  AS location  GEO`;

// Architecture flow row: source systems → RDI → Redis → consumers.
function StageRow() {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
      {FLOW.map((st, i) => (
        <Fragment key={st.label}>
          <div
            className={`flex-1 rounded-xl border p-4 ${
              st.hero ? "border-redis/40 shadow-glow" : "border-line bg-surface2/50"
            }`}
            style={
              st.hero
                ? {
                    background:
                      "radial-gradient(120% 120% at 20% 0%, rgba(255,68,56,0.12), rgba(28,62,75,0.5) 60%)",
                  }
                : undefined
            }
          >
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-redis/30 bg-redis/10 text-redis">
                <PillarIcon name={st.icon} className="h-[17px] w-[17px]" />
              </span>
              <div className={`label ${st.hero ? "text-redis-soft" : "text-faint"}`}>{st.label}</div>
            </div>
            <div className="mt-3 space-y-1.5">
              {st.nodes.map((n) => (
                <div key={n.name} className="rounded-lg border border-line bg-surface/60 px-2.5 py-1.5">
                  <div className="text-[12.5px] font-semibold text-fg">{n.name}</div>
                  <div className="font-mono text-[10.5px] text-faint">{n.sub}</div>
                </div>
              ))}
            </div>
          </div>
          {i < FLOW.length - 1 && (
            <div className="flex flex-col items-center justify-center gap-1 text-redis/70">
              <ChevronRight className="hidden h-5 w-5 lg:block" />
              <ChevronDown className="h-5 w-5 lg:hidden" />
              <span className="font-mono text-[9px] uppercase tracking-wide text-faint">
                {FLOW_ARROWS[i]}
              </span>
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}

// Engine pipeline row (the FT.CREATE → FT.SEARCH/AGGREGATE → ranked steps).
function EngineRow() {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
      {STEPS.map((s, i) => (
        <Fragment key={s.title}>
          <div className="flex-1 rounded-xl border border-line bg-surface2/50 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-redis/30 bg-redis/10 text-redis">
              <PillarIcon name={s.icon} className="h-[18px] w-[18px]" />
            </span>
            <div className="mt-2.5 text-sm font-semibold text-fg">{s.title}</div>
            <div className="mt-0.5 font-mono text-[11px] text-faint">{s.sub}</div>
          </div>
          {i < STEPS.length - 1 && (
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

export function SearchDeepDive({ onBack }: { onBack: () => void }) {
  return (
    <div className="animate-fade-up space-y-9">
      <button onClick={onBack} className="btn btn-ghost !px-3 !py-1.5 text-xs">
        <ArrowLeft className="h-4 w-4" /> Ecosystem
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
            <PillarIcon name={SEARCH_META.icon} className="h-11 w-11" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">
                {SEARCH_META.name}
              </h1>
              <span className="chip chip-accent">{SEARCH_META.alias}</span>
            </div>
            <p className="mt-2 text-[15px] font-medium text-redis-soft">
              {SEARCH_META.tagline}
            </p>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
              {SEARCH_META.whatItIs}
            </p>
            <a
              href={SEARCH_META.link.href}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-redis hover:underline"
            >
              {SEARCH_META.link.label}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* practical use cases (from the banking deck) */}
      <section className="space-y-3">
        <SectionHeader
          eyebrow="Practical use cases"
          title="Where banks put Redis Search to work"
          description="Beyond the theory — search patterns drawn from real banking journeys: Customer 360, AML screening, lending, corporate banking, contact centre and AI retrieval."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SEARCH_USE_CASES.map((u) => (
            <div key={u.title} className="tile flex flex-col p-4">
              <div className="text-sm font-bold leading-snug tracking-tight text-fg">
                {u.title}
              </div>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted">
                {u.detail}
              </p>
              <div className="mt-3 inline-flex w-fit rounded-md border border-redis/20 bg-redis/[0.07] px-2 py-0.5 font-mono text-[10.5px] font-semibold text-redis-soft">
                {u.primitives}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* how it works — architecture flow + the engine pipeline inside Redis */}
      <section className="space-y-3">
        <SectionHeader
          eyebrow="How it works"
          title="From systems of record to every channel"
          description="Source data flows in via RDI and becomes a live index inside Redis — and the query engine (FT.CREATE → FT.SEARCH / AGGREGATE) turns it into ranked answers for every channel."
        />
        <div className="mt-2 space-y-3">
          <StageRow />

          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-redis/30 bg-redis/10 px-3 py-1 text-[11px] font-semibold text-redis-soft">
              <ChevronDown className="h-3.5 w-3.5" />
              Inside the Redis Enterprise stage — the query engine
            </span>
          </div>

          <div className="rounded-2xl border border-redis/25 bg-redis/[0.04] p-4">
            <div className="label mb-3 text-redis-soft">Query engine pipeline</div>
            <EngineRow />
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

      {/* index anatomy */}
      <section className="space-y-3">
        <SectionHeader
          eyebrow="Anatomy of the index"
          title="One FT.CREATE turns your documents into a queryable index"
          description="The same JSON you already store for Customer 360 becomes the search index — each field mapped to a type the engine can filter, sort and rank on."
        />
        <div className="grid items-stretch gap-3 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.15fr)_auto_minmax(0,1fr)]">
          {/* 1 · the document you already store */}
          <div className="rounded-xl border border-line bg-surface2/50 p-4">
            <div className="label mb-2 text-faint">1 · Document · JSON · cust:C1001</div>
            <pre className="overflow-x-auto rounded-lg border border-white/10 bg-midnight p-3 font-mono text-[11.5px] leading-relaxed text-[#D5E0E3]">
              {DOC_JSON}
            </pre>
          </div>

          <div className="flex items-center justify-center text-redis/70">
            <ChevronRight className="hidden h-6 w-6 xl:block" />
            <ChevronDown className="h-6 w-6 xl:hidden" />
          </div>

          {/* 2 · the actual FT.CREATE command */}
          <div className="rounded-xl border border-redis/30 bg-redis/[0.06] p-4">
            <div className="label mb-2 text-redis-soft">2 · Create the index · FT.CREATE</div>
            <pre className="overflow-x-auto rounded-lg border border-white/10 bg-midnight p-3 font-mono text-[11.5px] leading-relaxed text-[#D5E0E3]">
              {FT_CREATE}
            </pre>
            <p className="mt-2.5 text-[12px] leading-relaxed text-muted">
              One command, run once. Redis indexes every matching{" "}
              <span className="font-mono text-redis-soft">cust:*</span> document
              and keeps the index live as the data changes.
            </p>
          </div>

          <div className="flex items-center justify-center text-redis/70">
            <ChevronRight className="hidden h-6 w-6 xl:block" />
            <ChevronDown className="h-6 w-6 xl:hidden" />
          </div>

          {/* 3 · the resulting queryable index */}
          <div className="rounded-xl border border-redis/25 bg-redis/[0.04] p-4">
            <div className="label mb-2 text-redis-soft">3 · Index · idx:cust</div>
            <div className="space-y-1.5">
              {SCHEMA.map((s) => (
                <div
                  key={s.alias}
                  className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface/60 px-3 py-1.5"
                >
                  <span className="truncate font-mono text-[12px] text-fg">
                    {s.path} <span className="text-faint">AS</span> {s.alias}
                  </span>
                  <span className={`flex-none rounded-md px-1.5 py-0.5 text-[10px] font-bold ${typeTone(s.type)}`}>
                    {s.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Features & capabilities"
          title="What Redis Search gives you"
          description="Each capability — what it does, the banking use case, a worked example (data → query → output), what you achieved, and what it would take without Redis Search."
        />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {SEARCH_FEATURES.map((f) => (
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

              {/* worked example: data pattern → query → output */}
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
                    Query
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
                    <span className="label text-faint">Without Redis Search</span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{f.without}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* live demo */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Live demo"
          title="Run a real query in front of the customer"
          description="Pick a query, change the name term, and watch Redis Search filter, rank and aggregate synthetic banking data in real time."
        />
        <SearchPlayground />
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
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {PERSONA_VALUE[pid]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* positioning · replace Elasticsearch + Kibana */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Replace the ELK stack"
          title="Redis Search + RedisInsight = Elasticsearch + Kibana, consolidated"
          description="The data already lives in Redis, so it is also your search engine — no separate cluster to feed and keep in sync. RedisInsight (running locally, connected to your database on :12000) is the Kibana-style surface to query, browse, inspect indexes and profile."
        />

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="flex flex-col rounded-2xl border border-line bg-surface2/40 p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl border border-line2 bg-surface3 text-muted">
                <Layers className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <div>
                <div className="font-display text-base font-bold text-fg">Elasticsearch + Kibana</div>
                <div className="text-[11px] text-faint">search cluster · Logstash / Beats ingest · Kibana UI</div>
              </div>
            </div>
            <ul className="mt-3.5 space-y-2">
              {ELK_PAINS.map((p) => (
                <li key={p} className="flex gap-2 text-[13px] leading-relaxed text-muted">
                  <X className="mt-[3px] h-3.5 w-3.5 flex-none text-redis/70" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="flex flex-col rounded-2xl border border-redis/30 p-5 shadow-glow"
            style={{
              background:
                "radial-gradient(120% 120% at 15% 0%, rgba(255,68,56,0.14), rgba(28,62,75,0.55) 60%)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <RedisLogo size={32} />
              <div>
                <div className="font-display text-base font-bold text-fg">
                  Redis Query Engine + RedisInsight
                </div>
                <div className="text-[11px] text-redis-soft">one platform · live index · sub-ms</div>
              </div>
            </div>
            <ul className="mt-3.5 space-y-2">
              {REDIS_WINS.map((w) => (
                <li key={w} className="flex gap-2 text-[13px] leading-relaxed text-fg/90">
                  <Check className="mt-[3px] h-3.5 w-3.5 flex-none text-yellow" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface2/60 text-[11px] uppercase tracking-wider text-faint">
                <th className="px-4 py-2.5 font-semibold">What you want to do</th>
                <th className="px-4 py-2.5 font-semibold">Elasticsearch + Kibana</th>
                <th className="px-4 py-2.5 font-semibold text-redis-soft">Redis Search + RedisInsight</th>
              </tr>
            </thead>
            <tbody>
              {KIBANA_MAP.map((r) => (
                <tr key={r.task} className="border-b border-line/60 last:border-0 hover:bg-surface2/40">
                  <td className="px-4 py-2.5 font-medium text-fg">{r.task}</td>
                  <td className="px-4 py-2.5 text-muted">{r.elk}</td>
                  <td className="px-4 py-2.5 font-mono text-[12.5px] text-redis-soft">{r.redis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-redis/25 bg-redis/[0.05] p-5">
          <div className="label mb-1 text-redis-soft">
            Run this in RedisInsight · Workbench — connected to localhost:12000
          </div>
          <p className="mb-4 text-[13px] leading-relaxed text-muted">
            Paste these into <span className="font-semibold text-fg">Workbench</span> in order — it mirrors a
            Kibana <span className="font-semibold text-fg">Dev Tools + Discover</span> walkthrough, but every
            step runs on Redis itself. Use the <span className="font-semibold text-fg">Browser</span> alongside
            it to click through the <span className="font-mono text-redis-soft">cust:*</span> JSON.
          </p>

          <ol className="space-y-2.5">
            {INSIGHT_DEMO.map((s, i) => (
              <li key={s.title} className="rounded-xl border border-line bg-surface2/40 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-redis/15 text-[10px] font-bold text-redis-soft">
                      {i + 1}
                    </span>
                    <span className="text-[13px] font-semibold text-fg">{s.title}</span>
                  </div>
                  <span className="rounded-md border border-line bg-surface3 px-2 py-0.5 font-mono text-[10px] text-faint">
                    Kibana: {s.kibana}
                  </span>
                </div>
                <pre className="mt-2 overflow-x-auto rounded-lg border border-white/10 bg-midnight px-3 py-2 font-mono text-[11.5px] leading-relaxed text-[#D5E0E3]">
                  {s.cmd}
                </pre>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{s.desc}</p>
              </li>
            ))}
          </ol>

          <p className="mt-4 text-[12px] leading-relaxed text-faint">
            For Kibana-style operational dashboards, point Grafana at the same database. RedisInsight
            covers develop, query, browse, index inspection and profiling.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button onClick={onBack} className="btn btn-ghost">
          Back to ecosystem
        </button>
        <span className="text-xs text-faint">
          Concept walkthrough · synthetic banking data · no real PII
        </span>
      </div>
    </div>
  );
}
