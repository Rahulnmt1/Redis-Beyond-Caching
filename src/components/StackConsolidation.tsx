import { ArrowRight, X } from "lucide-react";
import { PillarIcon, RedisLogo } from "./icons";
import { SectionHeader } from "./ui";

const TRADITIONAL: { label: string; sub?: string }[] = [
  { label: "Caching & NoSQL DBs", sub: "Memcached, Mongo" },
  { label: "Search engine", sub: "Elasticsearch" },
  { label: "Streaming / bus", sub: "Kafka" },
  { label: "Vector databases", sub: "Pinecone" },
  { label: "Feature store", sub: "online ML" },
  { label: "AI capabilities", sub: "LLM cache, memory" },
];

const REDIS_CAPS: { icon: string; label: string }[] = [
  { icon: "caching", label: "Cache & NoSQL" },
  { icon: "redis-search", label: "Search" },
  { icon: "redis-stream", label: "Streams" },
  { icon: "redis-vector-database", label: "Vectors" },
  { icon: "feature-store", label: "Feature store" },
  { icon: "redis-rdi", label: "RDI" },
  { icon: "agent-memory", label: "Agent memory" },
  { icon: "redis-langcache", label: "LangCache" },
];

const TCO = [
  { value: "6 → 1", label: "Systems to operate", tone: "redis" },
  { value: "1", label: "Unified API & data model", tone: "yellow" },
  { value: "1", label: "Vendor & support contract", tone: "sky" },
];

export function StackConsolidation() {
  return (
    <section id="consolidation" className="card scroll-mt-24 p-6 sm:p-7">
      <SectionHeader
        eyebrow="Platform consolidation"
        title="The consolidation dividend"
        description="Every system you retire removes licensing, integration glue and an operational failure domain — while teams build against one API and one data model."
      />

      <div className="mt-7 grid grid-cols-1 items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
        <div>
          <div className="label mb-2.5 text-faint">Today · point solutions</div>
          <div className="grid grid-cols-2 gap-2.5">
            {TRADITIONAL.map((t) => (
              <div
                key={t.label}
                className="group relative overflow-hidden rounded-xl border border-line bg-surface2/50 px-3 py-2.5"
              >
                <X className="absolute right-2 top-2 h-3.5 w-3.5 text-redis/50" />
                <div className="text-[13px] font-semibold text-fg/85">
                  {t.label}
                </div>
                {t.sub && (
                  <div className="mt-0.5 text-[11px] text-faint">{t.sub}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-redis/40 bg-redis/10 text-redis shadow-glow">
            <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
          </span>
        </div>

        <div>
          <div className="label mb-2.5 text-faint">With Redis · one platform</div>
          <div
            className="rounded-2xl border border-redis/35 p-5 shadow-glow"
            style={{
              background:
                "radial-gradient(120% 120% at 15% 0%, rgba(255,68,56,0.14), rgba(28,62,75,0.6) 60%)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <RedisLogo size={28} />
              <span className="font-display text-lg font-bold tracking-tight text-fg">
                Redis Enterprise
              </span>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-muted">
              One real-time data platform spanning cache, search, streams,
              vectors and a feature store — plus agent memory and LLM caching
              (Redis Iris) and live data integration (RDI).
            </p>
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {REDIS_CAPS.map((c) => (
                <span
                  key={c.label}
                  className="inline-flex items-center gap-1.5 rounded-md border border-redis/25 bg-redis/10 px-2 py-1 text-[11px] font-medium text-redis-soft"
                >
                  <PillarIcon name={c.icon} className="h-3.5 w-3.5 flex-none" />
                  {c.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TCO.map((s) => (
          <div key={s.label} className="kpi text-center">
            <div
              className={`font-display text-2xl font-bold tracking-tight ${
                s.tone === "yellow"
                  ? "text-yellow"
                  : s.tone === "sky"
                    ? "text-sky"
                    : "text-redis-soft"
              }`}
            >
              {s.value}
            </div>
            <div className="mt-1 text-[12px] text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
