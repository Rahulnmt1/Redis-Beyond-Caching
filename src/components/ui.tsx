import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { Metric } from "@/lib/types";

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="label">{children}</div>;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <span className={`eyebrow mb-3 ${align === "center" ? "" : ""}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-redis" />
          {eyebrow}
        </span>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-fg sm:text-[28px]">
        {title}
      </h2>
      {description && (
        <p className="mt-2.5 text-[15px] leading-relaxed text-muted">
          {description}
        </p>
      )}
    </div>
  );
}

export function Stat({ metric }: { metric: Metric }) {
  const tone = metric.tone ?? "neutral";
  const color =
    tone === "success"
      ? "text-yellow"
      : tone === "info"
        ? "text-sky"
        : tone === "warn"
          ? "text-redis-soft"
          : "text-fg";
  const bar =
    tone === "success"
      ? "bg-yellow"
      : tone === "info"
        ? "bg-sky"
        : tone === "warn"
          ? "bg-redis"
          : "bg-faint";
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface2/60 px-4 py-3.5">
      <span className={`absolute left-0 top-0 h-full w-1 ${bar} opacity-80`} />
      <div className={`text-2xl font-semibold leading-none tracking-tight ${color}`}>
        {metric.value}
      </div>
      <div className="mt-1.5 text-xs leading-snug text-muted">{metric.label}</div>
    </div>
  );
}

export function Flow({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="rounded-lg border border-line2 bg-surface2 px-3 py-1.5 text-[13px] font-medium text-fg/90">
            {s}
          </span>
          {i < steps.length - 1 && (
            <ChevronRight className="h-4 w-4 flex-none text-redis/70" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}

export function Steps({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border border-redis/40 bg-redis/10 text-[11px] font-bold text-redis-soft">
            {i + 1}
          </span>
          <span className="text-sm leading-relaxed text-muted">{it}</span>
        </li>
      ))}
    </ol>
  );
}

export function ChipRow({ items, accent }: { items: string[]; accent?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((c) => (
        <span key={c} className={`chip ${accent ? "chip-accent" : ""}`}>
          {c}
        </span>
      ))}
    </div>
  );
}
