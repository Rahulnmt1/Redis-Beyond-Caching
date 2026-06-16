import { createClient, type RedisClientType } from "redis";
import { DEMO_CUSTOMERS } from "@/data/capabilities";

export type SearchMode =
  | "prefix"
  | "tag"
  | "numeric"
  | "combined"
  | "fuzzy"
  | "geo"
  | "aggregate";

export interface SearchRow {
  id: string;
  name: string;
  segment: string;
  city: string;
  product: string;
  balance: number;
  risk: number;
}

export interface SearchResult {
  source: "live";
  command: string;
  count: number;
  latencyMs: number;
  rows?: SearchRow[];
  agg?: { city: string; n: number; aum: number }[];
}

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6380";
const INDEX = "idx:cust";
const PREFIX = "cust:";
// Bump when DEMO_CUSTOMERS changes so the live instance re-seeds the docs.
const SEED_VERSION = "2";
const VERSION_KEY = "demo:seed_version";

// Approximate city centroids (lon, lat) for the GEO field.
const CITY_COORDS: Record<string, [number, number]> = {
  Mumbai: [72.8777, 19.076],
  Delhi: [77.209, 28.6139],
  Bengaluru: [77.5946, 12.9716],
  Pune: [73.8567, 18.5204],
  Chennai: [80.2707, 13.0827],
  Hyderabad: [78.4867, 17.385],
};

// Mumbai centroid + radius used by the geo demo.
export const GEO_CENTER = { city: "Mumbai", lon: 72.8777, lat: 19.076, radiusKm: 150 };

type GlobalWithRedis = typeof globalThis & {
  __redisClient?: RedisClientType;
  __redisReady?: Promise<void>;
};
const g = globalThis as GlobalWithRedis;

async function getClient(): Promise<RedisClientType> {
  if (g.__redisClient?.isOpen) return g.__redisClient;
  const client: RedisClientType = createClient({ url: REDIS_URL });
  client.on("error", () => {
    /* swallow; surfaced on command */
  });
  await client.connect();
  g.__redisClient = client;
  return client;
}

/** Seed synthetic customers as JSON and create the index (idempotent). */
async function ensureSeed(client: RedisClientType): Promise<void> {
  if (!g.__redisReady) {
    g.__redisReady = (async () => {
      const ver = await client.sendCommand(["GET", VERSION_KEY]);
      if (String(ver ?? "") !== SEED_VERSION) {
        for (const c of DEMO_CUSTOMERS) {
          const [lon, lat] = CITY_COORDS[c.city] ?? [72.8777, 19.076];
          const doc = { ...c, location: `${lon},${lat}` };
          await client.sendCommand([
            "JSON.SET",
            `${PREFIX}${c.id}`,
            "$",
            JSON.stringify(doc),
          ]);
        }
        await client.sendCommand(["SET", VERSION_KEY, SEED_VERSION]);
      }
      try {
        await client.sendCommand(["FT.INFO", INDEX]);
      } catch {
        await client.sendCommand([
          "FT.CREATE", INDEX, "ON", "JSON", "PREFIX", "1", PREFIX, "SCHEMA",
          "$.id", "AS", "id", "TAG",
          "$.name", "AS", "name", "TEXT", "SORTABLE",
          "$.segment", "AS", "segment", "TAG",
          "$.city", "AS", "city", "TAG",
          "$.product", "AS", "product", "TAG",
          "$.balance", "AS", "balance", "NUMERIC", "SORTABLE",
          "$.risk", "AS", "risk", "NUMERIC", "SORTABLE",
          "$.location", "AS", "location", "GEO",
        ]);
      }
    })().catch((e) => {
      g.__redisReady = undefined;
      throw e;
    });
  }
  return g.__redisReady;
}

function esc(term: string): string {
  const t = (term || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return t || "sharma";
}

function buildQuery(mode: SearchMode, term: string): { query: string; sortByBalance?: boolean } {
  const t = esc(term);
  switch (mode) {
    case "prefix":
      return { query: `@name:${t}*` };
    case "tag":
      return { query: `@segment:{Priority}` };
    case "numeric":
      return { query: `@balance:[1000000 +inf]`, sortByBalance: true };
    case "combined":
      return { query: `@segment:{Priority} @name:${t}* @balance:[1000000 +inf]` };
    case "fuzzy":
      return { query: `@name:%${t}%` };
    case "geo":
      return { query: `@location:[${GEO_CENTER.lon} ${GEO_CENTER.lat} ${GEO_CENTER.radiusKm} km]` };
    default:
      return { query: "*" };
  }
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

type FtDoc = { id?: string; extra_attributes?: Record<string, string> };
type FtReply = { total_results?: number; results?: FtDoc[] };

function mapRow(a: Record<string, string>, key?: string): SearchRow {
  return {
    id: a.id ?? (key ? key.replace(/^cust:/, "") : ""),
    name: a.name ?? "",
    segment: a.segment ?? "",
    city: a.city ?? "",
    product: a.product ?? "",
    balance: Number(a.balance) || 0,
    risk: Number(a.risk) || 0,
  };
}

function isFtReply(v: unknown): v is FtReply {
  return !!v && typeof v === "object" && !Array.isArray(v) && Array.isArray((v as FtReply).results);
}

function parseSearch(reply: unknown): { total: number; rows: SearchRow[] } {
  // node-redis v6 structured object
  if (isFtReply(reply)) {
    const rows = (reply.results ?? []).map((r) => mapRow(r.extra_attributes ?? {}, r.id));
    return { total: Number(reply.total_results ?? rows.length) || 0, rows };
  }
  // RESP2 array fallback: [total, key, [f,v,...], ...]
  const arr = asArray(reply);
  const rows: SearchRow[] = [];
  for (let i = 1; i + 1 < arr.length; i += 2) {
    const fields = asArray(arr[i + 1]).map(String);
    const obj: Record<string, string> = {};
    for (let j = 0; j < fields.length; j += 2) obj[fields[j]] = fields[j + 1];
    rows.push(mapRow(obj, String(arr[i])));
  }
  return { total: Number(arr[0]) || 0, rows };
}

function parseAgg(reply: unknown): { city: string; n: number; aum: number }[] {
  if (isFtReply(reply)) {
    return (reply.results ?? [])
      .map((r) => ({
        city: r.extra_attributes?.city ?? "",
        n: Number(r.extra_attributes?.customers) || 0,
        aum: Number(r.extra_attributes?.aum) || 0,
      }))
      .filter((x) => x.city);
  }
  const arr = asArray(reply);
  const out: { city: string; n: number; aum: number }[] = [];
  for (let i = 1; i < arr.length; i++) {
    const fields = asArray(arr[i]).map(String);
    const obj: Record<string, string> = {};
    for (let j = 0; j < fields.length; j += 2) obj[fields[j]] = fields[j + 1];
    if (obj.city) out.push({ city: obj.city, n: Number(obj.customers) || 0, aum: Number(obj.aum) || 0 });
  }
  return out;
}

export function displayCommand(mode: SearchMode, term: string): string {
  if (mode === "aggregate") {
    return `FT.AGGREGATE ${INDEX} "*"\n  GROUPBY 1 @city\n  REDUCE COUNT 0 AS customers\n  REDUCE SUM 1 @balance AS aum\n  SORTBY 2 @aum DESC`;
  }
  const { query, sortByBalance } = buildQuery(mode, term);
  const sort = sortByBalance ? ` SORTBY balance DESC` : "";
  return `FT.SEARCH ${INDEX} "${query}"${sort} LIMIT 0 50 DIALECT 2`;
}

export async function searchCustomers(mode: SearchMode, term: string): Promise<SearchResult> {
  const client = await getClient();
  await ensureSeed(client);

  const start = performance.now();
  const command = displayCommand(mode, term);

  if (mode === "aggregate") {
    const reply = await client.sendCommand([
      "FT.AGGREGATE", INDEX, "*",
      "GROUPBY", "1", "@city",
      "REDUCE", "COUNT", "0", "AS", "customers",
      "REDUCE", "SUM", "1", "@balance", "AS", "aum",
      "SORTBY", "2", "@aum", "DESC",
    ]);
    const agg = parseAgg(reply);
    const latencyMs = Math.max(0.1, +(performance.now() - start).toFixed(1));
    return { source: "live", command, count: agg.reduce((s, a) => s + a.n, 0), latencyMs, agg };
  }

  const { query, sortByBalance } = buildQuery(mode, term);
  const args = ["FT.SEARCH", INDEX, query];
  if (sortByBalance) args.push("SORTBY", "balance", "DESC");
  args.push("LIMIT", "0", "50");
  args.push("RETURN", "7", "id", "name", "segment", "city", "product", "balance", "risk");
  args.push("DIALECT", "2");

  const { total, rows } = parseSearch(await client.sendCommand(args));
  const latencyMs = Math.max(0.1, +(performance.now() - start).toFixed(1));
  return { source: "live", command, count: total, latencyMs, rows };
}
