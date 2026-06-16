"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Loader2, Play } from "lucide-react";
import { DEMO_CUSTOMERS, type DemoCustomer } from "@/data/capabilities";

type Mode = "prefix" | "tag" | "numeric" | "combined" | "fuzzy" | "geo" | "aggregate";

const PRESETS: { id: Mode; label: string; feature: string; usesTerm: boolean }[] = [
  { id: "prefix", label: "Prefix name", feature: "Full-text", usesTerm: true },
  { id: "tag", label: "Priority segment", feature: "Tag filter", usesTerm: false },
  { id: "numeric", label: "High-net-worth ₹1M+", feature: "Numeric range", usesTerm: false },
  { id: "combined", label: "Priority + name + ₹1M+", feature: "Combined", usesTerm: true },
  { id: "fuzzy", label: "Fuzzy (typo-tolerant)", feature: "Fuzzy", usesTerm: true },
  { id: "geo", label: "Near Mumbai ≤150km", feature: "Geo radius", usesTerm: false },
  { id: "aggregate", label: "Group by city", feature: "Aggregation", usesTerm: false },
];

const NEAR_MUMBAI = new Set(["Mumbai", "Pune"]);

interface Row extends DemoCustomer {
  hit?: string;
}
interface Result {
  command: string;
  count: number;
  latencyMs: number;
  rows?: Row[];
  agg?: { city: string; n: number; aum: number }[];
}

function lev(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
  return d[m][n];
}

function inr(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function inrCr(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return "₹" + n.toLocaleString("en-IN");
}

function cleanTerm(term: string) {
  return term.trim().toLowerCase().replace(/[^a-z0-9]/g, "") || "sharma";
}

function buildCommand(mode: Mode, term: string) {
  const t = cleanTerm(term);
  if (mode === "aggregate")
    return `FT.AGGREGATE idx:cust "*"\n  GROUPBY 1 @city\n  REDUCE COUNT 0 AS customers\n  REDUCE SUM 1 @balance AS aum\n  SORTBY 2 @aum DESC`;
  const q =
    mode === "prefix"
      ? `@name:${t}*`
      : mode === "tag"
        ? `@segment:{Priority}`
        : mode === "numeric"
          ? `@balance:[1000000 +inf]`
          : mode === "combined"
            ? `@segment:{Priority} @name:${t}* @balance:[1000000 +inf]`
            : mode === "fuzzy"
              ? `@name:%${t}%`
              : `@location:[72.8777 19.076 150 km]`;
  const sort = mode === "numeric" ? " SORTBY balance DESC" : "";
  return `FT.SEARCH idx:cust "${q}"${sort} LIMIT 0 50 DIALECT 2`;
}

function computeHit(mode: Mode, term: string, name: string): string | undefined {
  if (!["prefix", "combined", "fuzzy"].includes(mode)) return undefined;
  const t = cleanTerm(term);
  const toks = name.toLowerCase().split(" ");
  if (mode === "fuzzy")
    return toks.find((tok) => tok.includes(t) || lev(tok, t) <= (t.length >= 6 ? 2 : 1));
  return toks.find((tok) => tok.startsWith(t));
}

/** Local fallback used only when the live Redis endpoint is unreachable. */
function runSim(mode: Mode, term: string): { rows?: Row[]; agg?: { city: string; n: number; aum: number }[]; count: number } {
  const t = cleanTerm(term);
  if (mode === "aggregate") {
    const map = new Map<string, { n: number; aum: number }>();
    DEMO_CUSTOMERS.forEach((c) => {
      const cur = map.get(c.city) ?? { n: 0, aum: 0 };
      map.set(c.city, { n: cur.n + 1, aum: cur.aum + c.balance });
    });
    const agg = [...map.entries()]
      .map(([city, v]) => ({ city, n: v.n, aum: v.aum }))
      .sort((a, b) => b.aum - a.aum);
    return { agg, count: agg.reduce((s, a) => s + a.n, 0) };
  }
  let rows: Row[] = DEMO_CUSTOMERS.filter((c) => {
    const toks = c.name.toLowerCase().split(" ");
    switch (mode) {
      case "tag":
        return c.segment === "Priority";
      case "numeric":
        return c.balance >= 1_000_000;
      case "geo":
        return NEAR_MUMBAI.has(c.city);
      case "prefix":
        return toks.some((tok) => tok.startsWith(t));
      case "combined":
        return c.segment === "Priority" && c.balance >= 1_000_000 && toks.some((tok) => tok.startsWith(t));
      case "fuzzy":
        return toks.some((tok) => tok.includes(t) || lev(tok, t) <= (t.length >= 6 ? 2 : 1));
      default:
        return false;
    }
  });
  if (mode === "numeric") rows = [...rows].sort((a, b) => b.balance - a.balance);
  return { rows, count: rows.length };
}

function RiskChip({ risk }: { risk: number }) {
  const tone =
    risk < 35 ? "bg-yellow/15 text-yellow" : risk < 65 ? "bg-sky/15 text-sky" : "bg-redis/15 text-redis-soft";
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${tone}`}>
      {risk}
    </span>
  );
}

function Name({ name, hit }: { name: string; hit?: string }) {
  if (!hit) return <span>{name}</span>;
  const parts = name.split(" ");
  return (
    <span>
      {parts.map((tok, i) => (
        <span key={i} className={tok.toLowerCase() === hit ? "rounded bg-redis/20 px-0.5 font-semibold text-redis-soft" : ""}>
          {tok}
          {i < parts.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

export function SearchPlayground() {
  const [mode, setMode] = useState<Mode>("prefix");
  const [term, setTerm] = useState("Sharma");
  const [nonce, setNonce] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"live" | "simulated">("live");
  const [res, setRes] = useState<Result | null>(null);
  const reqId = useRef(0);

  const active = PRESETS.find((p) => p.id === mode)!;

  useEffect(() => {
    const id = ++reqId.current;
    const ctrl = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const r = await fetch("/api/search", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mode, term }),
          signal: ctrl.signal,
        });
        if (!r.ok) throw new Error("offline");
        const data = (await r.json()) as Result;
        if (id !== reqId.current) return;
        setRes(data);
        setSource("live");
      } catch {
        if (id !== reqId.current) return;
        const sim = runSim(mode, term);
        setRes({ command: buildCommand(mode, term), ...sim, latencyMs: +(1.6 + sim.count * 0.14).toFixed(1) });
        setSource("simulated");
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, 220);
    return () => {
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [mode, term, nonce]);

  const command = res?.command ?? buildCommand(mode, term);
  const rows = useMemo(
    () => (res?.rows ?? []).map((r) => ({ ...r, hit: computeHit(mode, term, r.name) })),
    [res, mode, term],
  );
  const agg = res?.agg;
  const maxAum = agg ? Math.max(...agg.map((a) => a.aum), 1) : 1;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface2/40">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface2/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-redis/30 bg-redis/10 text-redis">
            <Play className="h-3.5 w-3.5" />
          </span>
          <div className="text-sm font-semibold text-fg">Run it — live customer search</div>
        </div>
        {source === "live" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow/30 bg-yellow/10 px-2.5 py-1 text-[11px] font-semibold text-yellow">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-yellow" />
            </span>
            Live · Redis Query Engine
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line2 bg-surface3 px-2.5 py-1 text-[11px] font-medium text-faint">
            Simulated · start Redis for live
          </span>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div className="rounded-lg border border-line bg-midnight/60 px-3 py-2 font-mono text-[11px] text-dusk30">
          idx:cust · index over <span className="text-sky">cust:*</span> (JSON) ·{" "}
          <span className="text-redis-soft">name</span> text ·{" "}
          <span className="text-redis-soft">segment/city/product</span> tag ·{" "}
          <span className="text-redis-soft">balance/risk</span> numeric ·{" "}
          <span className="text-redis-soft">location</span> geo
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setMode(p.id);
                setNonce((n) => n + 1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                mode === p.id
                  ? "bg-redis text-white shadow-[0_10px_24px_-12px_rgba(255,68,56,0.8)]"
                  : "border border-line2 bg-surface2 text-muted hover:text-fg"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-faint">Name term</label>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            disabled={!active.usesTerm}
            placeholder="e.g. Sharma"
            className="w-44 rounded-lg border border-line2 bg-surface px-3 py-1.5 text-sm text-fg outline-none transition-colors focus:border-redis/50 disabled:opacity-40"
          />
          <button onClick={() => setNonce((n) => n + 1)} className="btn btn-primary !px-4 !py-1.5 text-xs">
            <Play className="h-3.5 w-3.5" /> Run query
          </button>
          {!active.usesTerm && <span className="text-[11px] text-faint">(this query doesn&apos;t use the name term)</span>}
        </div>

        <div className="relative overflow-hidden rounded-xl border border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#0C2530] px-4 py-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-dusk30">redis · {active.feature}</span>
            <button onClick={copy} className="inline-flex items-center gap-1.5 text-xs text-dusk30 transition-colors hover:text-white">
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-yellow" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto bg-midnight p-4 font-mono text-[12.5px] leading-relaxed text-[#D5E0E3]">{command}</pre>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-xs">
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-redis" />
                <span className="text-muted">executing…</span>
              </>
            ) : (
              <>
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-yellow" />
                <span className="font-semibold text-fg">{res?.count ?? 0}</span>
                <span className="text-muted">{agg ? "customers" : "results"}</span>
                <span className="text-faint">· {res?.latencyMs ?? 0} ms</span>
              </>
            )}
          </div>

          <div key={`${mode}-${term}-${nonce}`} className={loading ? "opacity-50" : "animate-fade-up"}>
            {agg ? (
              <div className="space-y-2.5 rounded-xl border border-line bg-surface/50 p-4">
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-faint">
                  <span className="w-24 flex-none">City</span>
                  <span className="flex-1">AUM (bar) · ranked</span>
                  <span className="w-10 flex-none text-right">Cust.</span>
                  <span className="w-20 flex-none text-right">AUM</span>
                </div>
                {agg.map((a) => (
                  <div key={a.city} className="flex items-center gap-3">
                    <span className="w-24 flex-none text-xs font-medium text-muted">{a.city}</span>
                    <div className="h-5 flex-1 overflow-hidden rounded bg-surface3/60">
                      <div className="h-full rounded bg-gradient-to-r from-redis to-redis-soft" style={{ width: `${(a.aum / maxAum) * 100}%` }} />
                    </div>
                    <span className="w-10 flex-none text-right text-xs font-semibold text-fg">{a.n}</span>
                    <span className="w-20 flex-none text-right text-xs font-semibold text-yellow">{inrCr(a.aum)}</span>
                  </div>
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="rounded-xl border border-line bg-surface/50 px-4 py-8 text-center text-sm text-faint">
                No matches — try another term or preset.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-surface2/60 text-[11px] uppercase tracking-wider text-faint">
                      <th className="px-3 py-2 font-semibold">Customer</th>
                      <th className="px-3 py-2 font-semibold">Segment</th>
                      <th className="px-3 py-2 font-semibold">City</th>
                      <th className="px-3 py-2 font-semibold">Product</th>
                      <th className="px-3 py-2 text-right font-semibold">Balance</th>
                      <th className="px-3 py-2 text-right font-semibold">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="border-b border-line/60 last:border-0 hover:bg-surface2/40">
                        <td className="px-3 py-2">
                          <div className="font-medium text-fg">
                            <Name name={r.name} hit={r.hit} />
                          </div>
                          <div className="font-mono text-[11px] text-faint">{r.id}</div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="rounded-md border border-line2 bg-surface2 px-2 py-0.5 text-[11px] text-muted">{r.segment}</span>
                        </td>
                        <td className="px-3 py-2 text-muted">{r.city}</td>
                        <td className="px-3 py-2 text-muted">{r.product}</td>
                        <td className="px-3 py-2 text-right font-medium text-fg">{inr(r.balance)}</td>
                        <td className="px-3 py-2 text-right">
                          <RiskChip risk={r.risk} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
