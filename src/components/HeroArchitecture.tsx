import type { ComponentType } from "react";
import {
  Building2,
  Bot,
  CreditCard,
  Globe,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { PillarIcon, RedisLogo } from "./icons";

type IconProps = { className?: string; strokeWidth?: number };

function Node({
  icon: Icon,
  label,
  accent,
}: {
  icon: ComponentType<IconProps>;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center ${
        accent
          ? "border-redis/30 bg-redis/[0.08]"
          : "border-line bg-surface2/55"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
          accent
            ? "border-redis/40 bg-redis/12 text-redis"
            : "border-line2 bg-surface3 text-muted"
        }`}
      >
        <Icon className="h-4 w-4" strokeWidth={1.7} />
      </span>
      <span className="text-[11px] font-medium leading-tight text-fg/85">
        {label}
      </span>
    </div>
  );
}

function FlowDown({ label }: { label: string }) {
  return (
    <div className="relative flex h-9 items-center justify-center">
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <line
          x1="50%"
          y1="0"
          x2="50%"
          y2="100%"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="2"
        />
        <line
          x1="50%"
          y1="0"
          x2="50%"
          y2="100%"
          stroke="#FF4438"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="1 7"
          className="animate-flow-dash"
        />
      </svg>
      <span className="relative rounded-full border border-line2 bg-surface px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
        {label}
      </span>
    </div>
  );
}

const CAPS: { icon: string; label: string }[] = [
  { icon: "caching", label: "Cache" },
  { icon: "redis-search", label: "JSON + Search" },
  { icon: "redis-stream", label: "Streams" },
  { icon: "redis-vector-database", label: "Vectors" },
  { icon: "redis-time-series", label: "Time Series" },
  { icon: "feature-store", label: "Feature store" },
];

export function HeroArchitecture() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/70 p-5 shadow-card">
      <div
        className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(85%_80%_at_70%_0%,#000,transparent)]"
        aria-hidden
      />
      <div className="relative">
        <div className="label mb-2 text-center text-faint">Systems of record</div>
        <div className="grid grid-cols-3 gap-2">
          <Node icon={Building2} label="Core banking" />
          <Node icon={CreditCard} label="Payments switch" />
          <Node icon={Users} label="CRM & KYC" />
        </div>

        <FlowDown label="RDI · live CDC" />

        <div
          className="relative rounded-2xl border border-redis/35 p-3.5 shadow-glow"
          style={{
            background:
              "radial-gradient(120% 120% at 12% 0%, rgba(255,68,56,0.16), rgba(28,62,75,0.55) 62%)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RedisLogo size={24} />
              <div className="leading-tight">
                <div className="font-display text-[15px] font-bold text-fg">
                  Redis
                </div>
                <div className="text-[10px] text-muted">
                  real-time data platform
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-redis/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-redis-soft">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-redis" />
              live
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {CAPS.map((c) => (
              <span
                key={c.label}
                className="flex items-center justify-center gap-1.5 rounded-md border border-redis/20 bg-redis/10 px-2 py-1 text-center text-[10.5px] font-medium text-redis-soft"
              >
                <PillarIcon name={c.icon} className="h-3.5 w-3.5 flex-none" />
                {c.label}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5 border-t border-line pt-2.5 text-[10px] font-medium text-muted">
            <Globe className="h-3.5 w-3.5 text-sky" strokeWidth={1.7} />
            Active-Active · multi-region
          </div>
        </div>

        <FlowDown label="sub-ms reads" />

        <div className="grid grid-cols-3 gap-2">
          <Node icon={Smartphone} label="Digital channels" />
          <Node icon={ShieldCheck} label="Fraud decisioning" />
          <Node icon={Bot} label="GenAI agents · Iris" accent />
        </div>
        <div className="label mt-2 text-center text-faint">
          Real-time experiences
        </div>
      </div>
    </div>
  );
}
