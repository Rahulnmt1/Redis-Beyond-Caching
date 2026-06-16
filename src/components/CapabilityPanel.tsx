import { ArrowLeft, ArrowRight, Hammer } from "lucide-react";
import type { CapabilityBlock } from "@/data/capabilities";
import { PillarIcon } from "./icons";
import { SearchDeepDive } from "./SearchDeepDive";
import { ChipRow, SectionLabel } from "./ui";

export function CapabilityPanel({
  cap,
  onBack,
  onSelect,
}: {
  cap: CapabilityBlock;
  onBack: () => void;
  onSelect: (id: string) => void;
}) {
  if (cap.rich && cap.id === "search") {
    return <SearchDeepDive onBack={onBack} />;
  }

  return (
    <div className="animate-fade-up space-y-7">
      <button onClick={onBack} className="btn btn-ghost !px-3 !py-1.5 text-xs">
        <ArrowLeft className="h-4 w-4" /> Ecosystem
      </button>

      <div
        className="rounded-2xl border border-line p-6"
        style={{
          background:
            "radial-gradient(110% 130% at 0% 0%, rgba(255,68,56,0.1), rgba(28,62,75,0.45) 55%)",
        }}
      >
        <div className="flex items-start gap-4">
          <span
            className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl border border-redis/30 text-redis"
            style={{
              background:
                "radial-gradient(120% 120% at 30% 20%, rgba(255,68,56,0.2), rgba(28,62,75,0.5))",
            }}
          >
            <PillarIcon name={cap.icon} className="h-11 w-11" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl font-bold tracking-tight text-fg">{cap.name}</h1>
              {cap.inUseToday && (
                <span className="chip !border-line2 !bg-midnight !text-muted">
                  In use today
                </span>
              )}
            </div>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
              {cap.whatItIs}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <SectionLabel>Banking workloads</SectionLabel>
          <ChipRow items={cap.workloads} accent />
        </div>
        <div className="space-y-3">
          <SectionLabel>Key capabilities</SectionLabel>
          <ChipRow items={cap.capabilities} />
        </div>
      </div>

      <div className="card flex flex-col gap-4 border-redis/25 bg-redis/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-redis/30 bg-redis/10 text-redis">
            <Hammer className="h-[18px] w-[18px]" />
          </span>
          <div>
            <div className="font-semibold text-fg">Interactive deep-dive in progress</div>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
              We&apos;re detailing every block with features, runnable banking demos
              and diagrams — built out one at a time. <strong className="text-fg/90">Search &amp; query</strong> is
              the first fully-built example.
            </p>
          </div>
        </div>
        <button
          onClick={() => onSelect("search")}
          className="btn btn-primary !py-2 shrink-0"
        >
          See the Search deep-dive
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
