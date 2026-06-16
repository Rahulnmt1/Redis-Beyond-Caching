import { MATURITY } from "@/data/ecosystem";

export function MaturityStrip() {
  const last = MATURITY.length - 1;
  return (
    <div className="overflow-x-auto pb-1">
      <div className="relative min-w-[640px] px-2">
        {/* progress rail */}
        <div className="pointer-events-none absolute left-[10%] right-[10%] top-[19px] h-[3px] rounded-full bg-gradient-to-r from-redis via-line2 to-yellow opacity-70" />
        <ol className="relative grid grid-cols-5 gap-3">
          {MATURITY.map((m, i) => {
            const isStart = i === 0;
            const isEnd = i === last;
            const badge = isStart
              ? "border-redis/70 bg-surface text-redis ring-4 ring-redis/10"
              : isEnd
                ? "border-transparent bg-yellow text-midnight ring-4 ring-yellow/15"
                : "border-line2 bg-surface2 text-muted";
            return (
              <li key={m.stage} className="flex flex-col items-center px-1 text-center">
                <span
                  className={`flex h-[38px] w-[38px] items-center justify-center rounded-full border text-xs font-bold ${badge}`}
                >
                  {m.stage}
                </span>
                <div className="mt-2.5 text-[13px] font-semibold text-fg">
                  {m.label}
                </div>
                <div className="mt-0.5 text-[11px] leading-snug text-muted">
                  {m.note}
                </div>
                {isStart && (
                  <span className="mt-1.5 inline-flex rounded-full bg-redis/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-redis-soft">
                    You are here
                  </span>
                )}
                {isEnd && (
                  <span className="mt-1.5 inline-flex rounded-full bg-yellow/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-yellow">
                    Destination
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
