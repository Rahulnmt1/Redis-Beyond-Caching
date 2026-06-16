import type { LensId, PersonaId } from "@/lib/types";

export interface CapabilityBlock {
  id: string;
  name: string; // name as used in the template slides
  icon: string;
  whatItIs: string; // very short "what it is"
  workloads: string[]; // banking workloads (slide: "20+ data structures")
  capabilities: string[]; // key features / commands (for overview)
  personas: PersonaId[];
  lenses: LensId[];
  inUseToday?: boolean;
  rich?: boolean; // has a full deep-dive page built
}

export interface SearchFeature {
  id: string;
  name: string;
  icon: string;
  what: string; // technically what it does
  usecase: string; // the banking use case (from the deck)
  pattern: string; // the data pattern in the example
  query: string; // the query you run
  output: string; // what comes back
  outcome: string; // what the example achieved
  without: string; // how hard it would be without this capability
}

export interface DemoCustomer {
  id: string;
  name: string;
  segment: "Imperia" | "Priority" | "Preferred" | "Classic";
  city: string;
  product: "Savings" | "Current" | "NRE" | "Loan" | "Demat";
  balance: number;
  risk: number; // 0-100
}

/**
 * The capability ecosystem == the Redis data-model toolkit (slide 3).
 * Strings / Hashes are "in use today"; the rest are where the new
 * banking use cases live.
 */
export const CAPABILITIES: CapabilityBlock[] = [
  {
    id: "strings-hashes",
    name: "Strings / Hashes",
    icon: "strings",
    whatItIs: "Key–value & field maps — the cache you already run.",
    workloads: ["Sessions", "OTP limits", "Balance snapshot"],
    capabilities: ["GET / SET / EXPIRE", "HSET / HGETALL", "INCR counters", "TTL eviction"],
    personas: ["Dev", "SRE"],
    lenses: ["speed", "cost"],
    inUseToday: true,
  },
  {
    id: "search",
    name: "Search & query",
    icon: "redis-search",
    whatItIs: "Secondary indexing with full-text, tag, numeric, geo & vector query.",
    workloads: ["Customer / account search", "Txn search", "AML case lookup", "Beneficiary"],
    capabilities: [
      "FT.CREATE secondary index",
      "Full-text + prefix + fuzzy",
      "Tag & numeric filters",
      "FT.AGGREGATE analytics",
    ],
    personas: ["Dev", "DB", "SA"],
    lenses: ["speed", "scale", "innovation"],
    rich: true,
  },
  {
    id: "vector",
    name: "Vector",
    icon: "redis-vector-database",
    whatItIs: "Vector storage + KNN similarity, hybrid with structured filters.",
    workloads: ["Semantic FAQ & policy search", "Look-alike customers", "Scam match", "RAG"],
    capabilities: ["HNSW / FLAT index", "Hybrid vector + filter", "RedisVL", "Semantic cache"],
    personas: ["Dev", "SA"],
    lenses: ["innovation", "speed", "cost"],
  },
  {
    id: "json",
    name: "JSON documents",
    icon: "json",
    whatItIs: "Native nested JSON with atomic path-level operations.",
    workloads: ["Customer 360", "Loan-application state", "KYC metadata", "Mandates"],
    capabilities: ["JSON.SET / JSON.GET", "Atomic path updates", "Indexable with Search", "Partial reads"],
    personas: ["Dev", "DB"],
    lenses: ["speed", "innovation"],
  },
  {
    id: "streams",
    name: "Streams",
    icon: "redis-stream",
    whatItIs: "Append-only event log with consumer groups.",
    workloads: ["UPI / payment rail", "NEFT-RTGS workflow", "Notify fan-out", "Audit trail"],
    capabilities: ["XADD / XREADGROUP", "Consumer groups", "At-least-once + ACK", "Replay & DLQ"],
    personas: ["Dev", "SA", "SRE"],
    lenses: ["speed", "scale", "resilience"],
  },
  {
    id: "pubsub",
    name: "Pub/Sub",
    icon: "messaging",
    whatItIs: "Real-time fan-out messaging to many subscribers.",
    workloads: ["Live balance push", "Fraud-alert broadcast", "Cache invalidation"],
    capabilities: ["PUBLISH / SUBSCRIBE", "Pattern channels", "Keyspace notifications", "Sharded pub/sub"],
    personas: ["Dev", "SRE"],
    lenses: ["speed", "scale"],
  },
  {
    id: "timeseries",
    name: "Time series",
    icon: "redis-time-series",
    whatItIs: "High-ingest time-stamped metrics with downsampling.",
    workloads: ["FX & rate ticks", "Channel SLA / p99", "ATM cash levels", "API throughput"],
    capabilities: ["TS.ADD / TS.RANGE", "Downsampling rules", "Compaction", "Labels & filters"],
    personas: ["Dev", "SRE", "DB"],
    lenses: ["speed", "scale"],
  },
  {
    id: "probabilistic",
    name: "Probabilistic",
    icon: "probabilistic",
    whatItIs: "Bloom / Cuckoo / CMS / Top-K — tiny-memory set & count sketches.",
    workloads: ["Duplicate-txn check", "Mule / blacklist test", "Unique device & user counts"],
    capabilities: ["BF.ADD / BF.EXISTS", "Cuckoo filter", "Count-Min Sketch", "Top-K"],
    personas: ["Dev", "DB"],
    lenses: ["speed", "cost", "scale"],
  },
  {
    id: "geospatial",
    name: "Geospatial",
    icon: "geospatial",
    whatItIs: "Geo indexing with radius & bounding-box queries.",
    workloads: ["ATM / branch locator", "Geo-fenced offers", "Impossible-travel fraud"],
    capabilities: ["GEOADD / GEOSEARCH", "Radius / box query", "Distance sort", "Geo in Search index"],
    personas: ["Dev", "SA"],
    lenses: ["speed", "innovation"],
  },
  {
    id: "sortedsets",
    name: "Sorted sets",
    icon: "leaderboards",
    whatItIs: "Score-ranked sets for leaderboards, windows & priority.",
    workloads: ["Txn velocity windows", "AML risk ranking", "Collections priority", "Rewards"],
    capabilities: ["ZADD / ZRANGE", "Rank & score queries", "Rolling windows", "ZPOPMIN priority"],
    personas: ["Dev", "DB"],
    lenses: ["speed", "scale"],
  },
];

export const SEARCH_META = {
  name: "Search & query",
  alias: "Redis Query Engine",
  icon: "redis-search",
  tagline: "Turn the data already in Redis into a sub-millisecond search engine",
  whatItIs:
    "The Redis Query Engine builds secondary indexes over your JSON and Hash data and answers rich queries — full-text, tag, numeric, geo and vector — in-memory, at sub-millisecond latency. No separate search cluster to license, sync or secure.",
  link: { label: "redis.io · Search and query", href: "https://redis.io/docs/latest/develop/interact/search-and-query/" },
};

export const SEARCH_FEATURES: SearchFeature[] = [
  {
    id: "indexing",
    name: "Secondary indexing",
    icon: "secondary-indexing",
    what: "FT.CREATE builds an inverted, numeric, tag, geo and vector index over fields in your JSON or Hash keys — and keeps it live as the data changes.",
    usecase:
      "Customer 360 — make the profile JSON you already store queryable by any attribute, across every customer and channel.",
    pattern: `cust:C1001 → {"name":"Rahul Choubey","segment":"Priority",
            "city":"Mumbai","balance":2480000,"risk":22}`,
    query: `FT.CREATE idx:cust ON JSON PREFIX 1 cust:
  SCHEMA $.segment AS segment TAG
         $.city    AS city    TAG
         $.balance AS balance NUMERIC SORTABLE`,
    output: "Index live over 16,384 cust:* docs — every field now queryable; new writes indexed in <1 ms.",
    outcome:
      "Any field of the data you already hold becomes queryable — instantly, with zero data movement.",
    without:
      "Copy every profile into a separate SQL / Elasticsearch store and keep both in sync via CDC, or SCAN the whole keyspace and filter in app code.",
  },
  {
    id: "fulltext",
    name: "Full-text search",
    icon: "text-search",
    what: "Tokenization, stemming, prefix (rah*) and wildcard matching with BM25-style relevance scoring and result highlighting.",
    usecase:
      "Customer & beneficiary type-ahead — find a customer, payee or transaction narration as the agent types.",
    pattern: "$.name indexed AS name TEXT (tokenized + stemmed) on every cust:* profile.",
    query: `FT.SEARCH idx:cust "@name:rah*" LIMIT 0 5`,
    output: 'Rahul Choubey · C1001 · Mumbai — returned in ~0.5 ms, relevance-ranked, as the agent types "rah".',
    outcome:
      "Sub-ms, relevance-ranked type-ahead across millions of names, with stemming and prefix built in.",
    without:
      "SQL LIKE '%rah%' cannot use an index → a full table scan that slows linearly with growth; no ranking, stemming or prefix relevance.",
  },
  {
    id: "filters",
    name: "Tag & numeric filters",
    icon: "search",
    what: "Exact-match TAG fields and NUMERIC ranges, freely combined with boolean logic in a single query expression.",
    usecase:
      "Pre-approved loan eligibility & HNW targeting — select the exact customer set that qualifies, in real time.",
    pattern: "$.segment AS segment TAG · $.balance / $.risk AS NUMERIC on each profile.",
    query: `FT.SEARCH idx:cust
  "@segment:{Priority} @balance:[2000000 +inf] @risk:[0 30]"`,
    output: "4 hits — Rahul Choubey, Sneha Reddy, Pooja Sharma, Aditya Joshi — the pre-approved set, in <1 ms.",
    outcome:
      "Multi-field eligibility (segment AND balance AND risk) resolved precisely in one sub-ms query.",
    without:
      "Three conditions across fields means a composite SQL query on a synced replica — or pulling candidates into code and filtering by hand.",
  },
  {
    id: "multivalue",
    name: "Multi-value & array fields",
    icon: "Boxes",
    what: "Index a JSON array with a JSONPath like $.tags[*] so every element becomes searchable as a TAG, TEXT or NUMERIC value — one document, many values per field, no flattening.",
    usecase:
      "Customer 360 — a single profile carries many products and attribute flags (NRI, HNW, salaried, UPI-active); find everyone who holds a given product or flag, or any AND / OR combination.",
    pattern: `cust:C1009 → {"name":"Rohan Sharma",
            "tags":["NRI","HNW","Demat","UPI-active"]}`,
    query: `FT.CREATE idx:cust … SCHEMA $.tags[*] AS tags TAG
FT.SEARCH idx:cust "@tags:{HNW} @tags:{Demat}"`,
    output:
      "Every customer whose tags array contains both HNW and Demat — matched on the array itself, in <1 ms.",
    outcome:
      "One profile holds many products / flags and stays fully queryable — exactly the shape real Customer 360 data takes.",
    without:
      "Explode the array into a child table and JOIN, or pack a delimited string and scan with LIKE — neither indexes cleanly and both degrade as holdings grow.",
  },
  {
    id: "fuzzy",
    name: "Fuzzy & phonetic match",
    icon: "recommendation-engine",
    what: "Levenshtein fuzzy matching (%term%) and phonetic matchers tolerate typos, transliteration and spelling variants.",
    usecase:
      "AML / sanctions & PEP screening — match a watch-listed name even when it is misspelled or transliterated.",
    pattern: "Payee / customer $.name indexed AS name TEXT.",
    query: `FT.SEARCH idx:cust "@name:%sharrma%"   # one % = Levenshtein ≤ 1`,
    output: 'Still matches Anjali Sharma, Karan Sharma, Pooja Sharma… despite the typo "Sharrma".',
    outcome:
      "Misspelled and transliterated names still hit the watchlist — far fewer false negatives in screening.",
    without:
      "Exact match silently misses 'Sharrma' vs 'Sharma'; you hand-build n-gram / Soundex tables or license a specialist name-matching engine.",
  },
  {
    id: "aggregations",
    name: "Aggregations",
    icon: "real-time-analytics",
    what: "FT.AGGREGATE pipelines: GROUPBY, REDUCE (COUNT / SUM / AVG), SORTBY and APPLY — analytics computed at query time.",
    usecase:
      "Real-time MIS & exposure dashboards — customers and AUM per city or segment, live, with no nightly batch.",
    pattern: "$.city AS city TAG + $.balance AS balance NUMERIC across all profiles.",
    query: `FT.AGGREGATE idx:cust "*"
  GROUPBY 1 @city
  REDUCE COUNT 0 AS n
  REDUCE SUM 1 @balance AS aum
  SORTBY 2 @aum DESC`,
    output: "Mumbai n=4 · ₹1.89 Cr → Delhi n=3 · ₹1.34 Cr → Bengaluru n=3 · ₹0.88 Cr … computed at query time.",
    outcome:
      "Live operational dashboards — counts, sums and rankings over fresh data in a single call.",
    without:
      "ETL into a warehouse / OLAP cube on a schedule — the numbers are hours stale and need a second system to serve them.",
  },
  {
    id: "geo",
    name: "Geo radius search",
    icon: "geospatial",
    what: "Index a lon/lat GEO field and filter by radius or bounding box (@location:[lon lat r km]) — combinable with any text, tag or numeric filter.",
    usecase:
      "Nearest ATM / branch / agent locator, geo-fenced offers and impossible-travel fraud checks.",
    pattern: '$.location AS location GEO ("lon,lat") on each record.',
    query: `FT.SEARCH idx:cust "@location:[72.8777 19.076 150 km]"`,
    output: "6 customers within 150 km of Mumbai (Mumbai + Pune) — distance-aware, in the same query.",
    outcome:
      "‘Within N km of here’ resolved inside the query — and combinable with any tag / numeric / text filter.",
    without:
      "Load every coordinate and compute Haversine in app code, or stand up and sync a separate PostGIS / geo database.",
  },
  {
    id: "hybrid",
    name: "Hybrid vector search",
    icon: "redis-vector-database",
    what: "Combine vector KNN similarity with TAG / NUMERIC / TEXT pre-filters in one query, so semantics and structure are evaluated together.",
    usecase:
      "Look-alike customer targeting & RAG — semantically similar customers or policy chunks, within a business filter.",
    pattern: "Each profile carries $.embedding AS VECTOR + structured $.segment AS segment TAG.",
    query: `FT.SEARCH idx:cust
  "(@segment:{Priority})=>[KNN 10 @embedding $vec AS score]"
  PARAMS 2 vec <query-vector> SORTBY score DIALECT 2`,
    output: "Top-10 Priority customers most similar to the seed profile — semantic rank + segment filter, one pass.",
    outcome:
      "Similarity and business rules evaluated together — no post-filtering, no cross-system reconciliation.",
    without:
      "Run KNN in a separate vector DB, pull a large candidate set, then filter by segment in another store — two systems, slower and inconsistent.",
  },
];

/**
 * Practical banking use cases for Redis Search, drawn from the
 * "Redis — Banking, Beyond Caching" deck (use-case slides 8–46).
 */
export const SEARCH_USE_CASES: { title: string; detail: string; primitives: string }[] = [
  {
    title: "Real-time Customer 360",
    detail:
      "One indexed JSON profile queried across every channel — cross-customer lookups run in Redis and offload ~70% of core reads.",
    primitives: "JSON · Search · RDI",
  },
  {
    title: "AML, sanctions & PEP screening",
    detail:
      "Screen payee, remitter, country and entities in real time — before a payment completes.",
    primitives: "Search",
  },
  {
    title: "Transaction & invoice search",
    detail: "Find any corporate transaction or invoice instantly, across millions of records.",
    primitives: "Search",
  },
  {
    title: "Loan application & document search",
    detail: "Credit and ops teams locate any loan application or document in milliseconds.",
    primitives: "Search",
  },
  {
    title: "E-statement metadata index",
    detail: "Find statements by month, account and tax year, and open the latest statement list instantly.",
    primitives: "Search · JSON",
  },
  {
    title: "Pre-approved loan eligibility",
    detail: "Surface an instant pre-approved offer in-app by querying eligibility features in place.",
    primitives: "Feature store · Search",
  },
  {
    title: "Policy & FAQ semantic search",
    detail:
      "Contact-centre agents and self-service find the right answer in plain language (hybrid text + vector).",
    primitives: "Vector · Search",
  },
  {
    title: "Searchable notes & RAG",
    detail: "Hybrid vector + filter retrieval grounds GenAI answers on approved bank content.",
    primitives: "Vector · Search",
  },
];

/** Synthetic banking customers for the runnable demo (no real PII). */
export const DEMO_CUSTOMERS: DemoCustomer[] = [
  { id: "C1001", name: "Rahul Choubey", segment: "Priority", city: "Mumbai", product: "Savings", balance: 2480000, risk: 22 },
  { id: "C1002", name: "Anjali Sharma", segment: "Imperia", city: "Delhi", product: "NRE", balance: 8650000, risk: 14 },
  { id: "C1003", name: "Vikram Sharma", segment: "Classic", city: "Pune", product: "Current", balance: 156000, risk: 61 },
  { id: "C1004", name: "Priya Menon", segment: "Priority", city: "Bengaluru", product: "Savings", balance: 1340000, risk: 18 },
  { id: "C1005", name: "Arjun Nair", segment: "Preferred", city: "Chennai", product: "Loan", balance: 92000, risk: 73 },
  { id: "C1006", name: "Sneha Reddy", segment: "Priority", city: "Hyderabad", product: "Demat", balance: 3120000, risk: 9 },
  { id: "C1007", name: "Karan Sharma", segment: "Priority", city: "Mumbai", product: "Current", balance: 1875000, risk: 27 },
  { id: "C1008", name: "Neha Gupta", segment: "Classic", city: "Delhi", product: "Savings", balance: 47000, risk: 55 },
  { id: "C1009", name: "Rohan Sharma", segment: "Imperia", city: "Mumbai", product: "Savings", balance: 12500000, risk: 7 },
  { id: "C1010", name: "Divya Iyer", segment: "Preferred", city: "Bengaluru", product: "NRE", balance: 760000, risk: 33 },
  { id: "C1011", name: "Amit Verma", segment: "Classic", city: "Pune", product: "Loan", balance: 210000, risk: 68 },
  { id: "C1012", name: "Pooja Sharma", segment: "Priority", city: "Delhi", product: "Savings", balance: 4300000, risk: 16 },
  { id: "C1013", name: "Sanjay Rao", segment: "Preferred", city: "Chennai", product: "Current", balance: 540000, risk: 41 },
  { id: "C1014", name: "Meera Sharma", segment: "Classic", city: "Hyderabad", product: "Savings", balance: 98000, risk: 59 },
  { id: "C1015", name: "Aditya Joshi", segment: "Priority", city: "Mumbai", product: "Demat", balance: 2025000, risk: 21 },
  { id: "C1016", name: "Kavya Sarma", segment: "Imperia", city: "Bengaluru", product: "NRE", balance: 6700000, risk: 11 },
];
