import {
  Activity,
  Bot,
  Boxes,
  Braces,
  Cable,
  Database,
  Filter,
  Gauge,
  Globe,
  KeyRound,
  Layers,
  LineChart,
  ListOrdered,
  ListTree,
  MapPin,
  Network,
  Radio,
  Search,
  ShieldCheck,
  Sigma,
  Sparkles,
  SpellCheck,
  TextSearch,
  Workflow,
} from "lucide-react";
import type { ComponentType } from "react";

type IconProps = { className?: string; size?: number; strokeWidth?: number };

const MAP: Record<string, ComponentType<IconProps>> = {
  // pillars / generic
  Gauge,
  Layers,
  Sparkles,
  Bot,
  Cable,
  Activity,
  Globe,
  ShieldCheck,
  Database,
  // data-model toolkit
  KeyRound,
  ListOrdered,
  Braces,
  Workflow,
  Radio,
  Search,
  Boxes,
  LineChart,
  Network,
  MapPin,
  // search features
  ListTree,
  TextSearch,
  Filter,
  SpellCheck,
  Sigma,
};

/**
 * Official Redis component logos, extracted from the brand template
 * (dark-mode icon library, slides 74–77). Keyed by slug.
 */
const LOGO: Record<string, string> = {
  // data-model toolkit
  strings: "/logos/strings.png",
  "redis-search": "/logos/redis-search.png",
  "redis-vector-database": "/logos/redis-vector-database.png",
  json: "/logos/json.png",
  "redis-stream": "/logos/redis-stream.png",
  messaging: "/logos/messaging.png",
  "redis-time-series": "/logos/redis-time-series.png",
  probabilistic: "/logos/probabilistic.png",
  geospatial: "/logos/geospatial.png",
  leaderboards: "/logos/leaderboards.png",
  // other Redis components (for future blocks / sections)
  "redis-rdi": "/logos/redis-rdi.png",
  "redis-iris": "/logos/redis-iris.png",
  "redis-enterprise": "/logos/redis-enterprise.png",
  "redis-enterprise-cluster": "/logos/redis-enterprise-cluster.png",
  "redis-database": "/logos/redis-database.png",
  "redis-flex": "/logos/redis-flex.png",
  "redis-node": "/logos/redis-node.png",
  "redis-shard": "/logos/redis-shard.png",
  "redis-stack": "/logos/redis-stack.png",
  "redis-software": "/logos/redis-software.png",
  "redis-vector-sets": "/logos/redis-vector-sets.png",
  "redis-real-time-indexing": "/logos/redis-real-time-indexing.png",
  "redis-for-ai": "/logos/redis-for-ai.png",
  "redis-cloud": "/logos/redis-cloud.png",
  "redis-high-speed-transactions": "/logos/redis-high-speed-transactions.png",
  // search-feature generals
  "secondary-indexing": "/logos/secondary-indexing.png",
  "text-search": "/logos/text-search.png",
  "real-time-analytics": "/logos/real-time-analytics.png",
  search: "/logos/search.png",
  // capability pills
  caching: "/logos/caching.png",
  "feature-store": "/logos/feature-store.png",
  "recommendation-engine": "/logos/recommendation-engine.png",
  "agent-memory": "/logos/agent-memory.png",
  "redis-langcache": "/logos/redis-langcache.png",
};

export function PillarIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const logo = LOGO[name];
  if (logo) {
    // Official brand PNG (transparent, white/red on dark). Color classes are
    // ignored; size classes (h-/w-) drive the box, object-contain keeps ratio.
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={logo}
        alt=""
        aria-hidden
        draggable={false}
        className={`${className ?? ""} object-contain`}
      />
    );
  }
  const Icon = MAP[name] ?? Database;
  return <Icon className={className} strokeWidth={1.6} />;
}

/**
 * Official Redis logomark (brand-red "bolt" R), extracted from the brand
 * template (slide 78). Square box, object-contain keeps the glyph centered.
 */
export function RedisLogo({
  size = 32,
  className,
  variant = "red",
}: {
  size?: number;
  className?: string;
  variant?: "red" | "white";
}) {
  const src = variant === "white" ? "/logos/redis-mark-white.png" : "/logos/redis-mark.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Redis"
      draggable={false}
      width={size}
      height={size}
      className={`${className ?? ""} object-contain`}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Official Redis wordmark (cursive logotype) from the brand template (slide 78).
 * Width follows the ~3.18:1 aspect ratio of the source asset.
 */
export function RedisWordmark({
  height = 22,
  className,
  variant = "white",
}: {
  height?: number;
  className?: string;
  variant?: "red" | "white";
}) {
  const src =
    variant === "red" ? "/logos/redis-wordmark-red.png" : "/logos/redis-wordmark-white.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Redis"
      draggable={false}
      height={height}
      className={`${className ?? ""} object-contain`}
      style={{ height, width: "auto" }}
    />
  );
}

export function BrandMark({
  size = 34,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return <RedisLogo size={size} className={className} />;
}
