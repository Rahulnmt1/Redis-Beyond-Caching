import { Fragment } from "react";
import { ArrowRight } from "lucide-react";
import { MATURITY } from "@/data/ecosystem";
import { PillarIcon } from "@/components/icons";
import type { MaturityStage } from "@/lib/types";

function StageCard({ s }: { s: MaturityStage }) {
  const accent =
    s.tone === "redis"
      ? {
          card: "border-redis/40",
          badge: "border-redis/40 bg-redis/15 text-redis-soft",
          head: "text-redis-soft",
        }
      : s.tone === "yellow"
        ? {
            card: "border-yellow/40",
            badge: "border-yellow/40 bg-yellow/15 text-yellow",
            head: "text-yellow",
          }
        : {
            card: "border-line2",
            badge: "border-line2 bg-surface3 text-muted",
            head: "text-fg/70",
          };
  return (
    <div
      className={`relative flex min-w-[150px] flex-1 flex-col rounded-xl border ${accent.card} bg-surface2/50 p-3.5`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold ${accent.badge}`}
        >
          {s.stage}
        </span>
        <PillarIcon name={s.icon} className="h-4 w-4 text-faint" />
      </div>
      <div className="mt-2.5 text-[13px] font-bold text-fg">{s.label}</div>
      <div className={`text-[11px] font-semibold ${accent.head}`}>{s.headline}</div>
      <p className="mt-1 text-[11px] leading-snug text-muted">{s.detail}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {s.chips.map((c) => (
          <span
            key={c}
            className="rounded border border-line2 bg-surface2/70 px-1.5 py-0.5 text-[10px] font-medium text-muted"
          >
            {c}
          </span>
        ))}
      </div>
      {s.flag && (
        <span
          className={`mt-2 inline-flex w-fit rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
            s.tone === "yellow"
              ? "bg-yellow/15 text-yellow"
              : "bg-redis/15 text-redis-soft"
          }`}
        >
          {s.flag}
        </span>
      )}
    </div>
  );
}

export function MaturityStrip() {
  return (
    <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
      {MATURITY.map((s, i) => (
        <Fragment key={s.stage}>
          <StageCard s={s} />
          {i < MATURITY.length - 1 && (
            <div className="flex flex-none items-center">
              <ArrowRight className="h-4 w-4 text-faint" />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
