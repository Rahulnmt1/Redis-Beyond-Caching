import type { Lens, MaturityStage, Persona, Pillar } from "@/lib/types";

export const PERSONAS: Persona[] = [
  {
    id: "SA",
    label: "Solution Architect",
    short: "Architect",
    blurb:
      "Stack consolidation, reference architectures, integration patterns and total cost of ownership.",
  },
  {
    id: "SRE",
    label: "Platform & SRE",
    short: "Platform / SRE",
    blurb:
      "99.999% uptime, Active-Active, automatic failover, Kubernetes / GitOps and predictable latency.",
  },
  {
    id: "DB",
    label: "Database",
    short: "Database",
    blurb:
      "Durability, RDI sync with the system of record, multi-model consolidation, compliance and cost.",
  },
  {
    id: "Dev",
    label: "Developer",
    short: "Developer",
    blurb:
      "Sub-millisecond APIs, rich client libraries, RedisVL, less glue code and faster delivery.",
  },
];

export const LENSES: Lens[] = [
  { id: "speed", label: "Speed" },
  { id: "scale", label: "Scale" },
  { id: "resilience", label: "Resilience" },
  { id: "cost", label: "Cost / TCO" },
  { id: "risk", label: "Risk & Compliance" },
  { id: "innovation", label: "Innovation" },
];

export const MATURITY: MaturityStage[] = [
  {
    stage: "L0",
    label: "Cache-aside",
    icon: "Gauge",
    tone: "redis",
    flag: "You are here",
    headline: "Speed up reads",
    detail: "Cache in front of the core DB; sessions & tokens.",
    chips: ["Cache", "Sessions"],
  },
  {
    stage: "L1",
    label: "Multi-model",
    icon: "Layers",
    tone: "mid",
    headline: "Retire point solutions",
    detail: "JSON, Search & Time Series on the same engine.",
    chips: ["JSON", "Search", "TS"],
  },
  {
    stage: "L2",
    label: "Real-time platform",
    icon: "Activity",
    tone: "mid",
    headline: "Go event-driven",
    detail: "Streams for payments + RDI sync from the core.",
    chips: ["Streams", "RDI"],
  },
  {
    stage: "L3",
    label: "AI-native",
    icon: "Sparkles",
    tone: "mid",
    headline: "Vectors & agents",
    detail: "Vector search, feature store & Redis Iris.",
    chips: ["Vectors", "Iris"],
  },
  {
    stage: "L4",
    label: "Globally resilient",
    icon: "Globe",
    tone: "yellow",
    flag: "Destination",
    headline: "Always-on",
    detail: "Active-Active multi-region + DR, K8s-native.",
    chips: ["Active-Active", "DR"],
  },
];

export const PILLARS: Pillar[] = [
  {
    id: "caching-plus",
    name: "Caching++",
    tagline: "The familiar cache, supercharged",
    icon: "Gauge",
    why: "Start from what banks already trust, then add client-side caching and auto-tiering (Flex) to push more data in at lower cost.",
    replaces: ["Memcached", "Bespoke session stores"],
    capabilities: [
      "Client-side caching",
      "Redis Flex (RAM + SSD)",
      "TTL & eviction",
      "Atomic counters",
    ],
    lenses: ["speed", "cost"],
    personas: ["Dev", "SRE"],
    useCases: [
      {
        id: "session-store",
        name: "Distributed session & token store",
        problem:
          "Sticky sessions and JWT / OAuth token state must be shared across stateless app nodes and regions without hitting the core database.",
        architecture: [
          "App nodes",
          "Redis (session:* / token:*)",
          "TTL expiry",
          "Active-Active (multi-region)",
        ],
        metrics: [
          { value: "<1 ms", label: "Session lookup", tone: "success" },
          { value: "0", label: "DB hits for auth" },
        ],
        personaValue: {
          Dev: "Drop-in session layer with no DB round-trips.",
          SRE: "Stateless app tier that scales horizontally.",
        },
      },
      {
        id: "hot-reference",
        name: "Hot reference data with Flex",
        problem:
          "Large reference datasets (BIN ranges, IFSC / SWIFT, product catalogs) are read constantly but only partly hot.",
        architecture: [
          "Reference data load (RIOT)",
          "Redis Flex: hot in RAM, warm on SSD",
          "Sub-ms reads",
        ],
        metrics: [
          { value: "~70%", label: "Infra cost vs all-RAM", tone: "success" },
          { value: "10k", label: "ops/sec/core (Flex)" },
        ],
        personaValue: {
          DB: "Large datasets at a fraction of the RAM cost.",
          SA: "Same Redis API, no application changes.",
        },
      },
    ],
  },
  {
    id: "multimodel",
    name: "Multi-model data",
    tagline: "One engine: JSON, Search, Time Series",
    icon: "Layers",
    why: "Query and index data inside Redis instead of bolting on a separate search engine or document store.",
    replaces: ["Elasticsearch", "Separate document DB", "Standalone metrics store"],
    capabilities: [
      "JSON documents",
      "Redis Query Engine (Search)",
      "Time Series",
      "Probabilistic (Bloom / CMS / Top-K)",
    ],
    lenses: ["speed", "scale", "innovation"],
    personas: ["Dev", "DB", "SA"],
    useCases: [
      {
        id: "customer-360-search",
        name: "Customer 360 profile & search",
        flagship: true,
        problem:
          "Relationship managers need a sub-second, unified customer view (accounts, products, KYC, interactions) with rich filtering, but data is scattered across systems and slow to join.",
        architecture: [
          "Profiles stored as JSON (cust:{id})",
          "FT.CREATE secondary index on JSON fields",
          "FT.SEARCH: full-text + tag + numeric filters",
          "Sub-ms response to the RM app",
        ],
        demo: [
          "Load 100k synthetic customer JSON profiles (seeded with RIOT).",
          "Create a search index over name, PAN (tag), segment and balance.",
          "Live-search 'priority customers named Sharma with balance > 1M' in <5 ms.",
          "Open Redis Insight to show the index and JSON docs updating.",
        ],
        metrics: [
          { value: "<5 ms", label: "360 lookup (p99)", tone: "success" },
          { value: "1", label: "System (was 3+)", tone: "info" },
          { value: "100k+", label: "Profiles indexed" },
        ],
        personaValue: {
          SA: "Retire a separate search cluster; one platform for store + query.",
          DB: "Secondary indexing and JSON without a second database to license.",
          Dev: "Query with FT.SEARCH; no ORM gymnastics or join services.",
        },
        code: {
          lang: "redis",
          content: `FT.CREATE idx:cust ON JSON PREFIX 1 cust: SCHEMA
  $.name     AS name    TEXT
  $.pan      AS pan     TAG
  $.segment  AS segment TAG
  $.balance  AS balance NUMERIC

FT.SEARCH idx:cust
  "@segment:{priority} @name:Sharma* @balance:[1000000 +inf]"
  DIALECT 2`,
        },
      },
      {
        id: "aml-screening",
        name: "AML / sanctions screening",
        problem:
          "Every transaction party must be screened against sanctions / PEP lists with fuzzy name matching, in real time, without slowing payments.",
        architecture: [
          "Watchlists indexed (Search + tags)",
          "Fuzzy + phonetic name match",
          "Vector similarity for aliases",
          "Real-time decision",
        ],
        metrics: [
          { value: "<10 ms", label: "Screening latency", tone: "success" },
          { value: "24x7", label: "Inline with payments" },
        ],
        personaValue: {
          DB: "Auditable, indexed watchlists held in-platform.",
          SA: "Screening as a low-latency service, not a batch job.",
        },
      },
      {
        id: "limits-exposure",
        name: "Real-time limits & exposure",
        problem:
          "Trading and card systems need rolling-window limit and exposure checks computed continuously, not end-of-day.",
        architecture: [
          "TS.ADD per account / desk",
          "TS.RANGE rolling windows",
          "Atomic counters for limits",
          "Block / allow decision",
        ],
        metrics: [
          { value: "real-time", label: "Limit checks", tone: "success" },
          { value: "ms", label: "Window aggregation" },
        ],
        personaValue: {
          Dev: "Time Series + counters replace custom windowing code.",
          SRE: "Predictable latency under burst load.",
        },
      },
    ],
  },
  {
    id: "vector-ai",
    name: "Vector search & GenAI",
    tagline: "AI-native banking, served at sub-ms",
    icon: "Sparkles",
    why: "Redis is a vector database, an online feature store and a semantic cache — the real-time backbone for fraud ML and GenAI.",
    replaces: ["Standalone vector DB", "Separate online feature store"],
    capabilities: [
      "Vector search (HNSW / FLAT)",
      "RedisVL",
      "Semantic caching / LangCache",
      "Hybrid search",
      "Feature store",
    ],
    lenses: ["innovation", "speed", "cost"],
    personas: ["Dev", "SA"],
    useCases: [
      {
        id: "genai-copilot",
        name: "GenAI RM / support copilot (RAG)",
        flagship: true,
        problem:
          "Staff and customers ask natural-language questions over policies, products and account context. LLM calls are slow and expensive, and answers must be grounded to avoid hallucination.",
        architecture: [
          "Embed bank docs -> store vectors in Redis",
          "RedisVL VectorQuery retrieves top-k context (RAG)",
          "LLM answers grounded on retrieved context",
          "LangCache semantically caches answers",
        ],
        demo: [
          "Index synthetic policy / product docs as embeddings via RedisVL.",
          "Ask 'What is the penalty for early FD withdrawal for NRE accounts?'",
          "Show the grounded answer plus the retrieved source chunks.",
          "Ask a paraphrase and show LangCache returning instantly with cost saved.",
        ],
        metrics: [
          { value: "~15x", label: "Faster on cache hit", tone: "success" },
          { value: "up to 70%", label: "LLM cost saved", tone: "success" },
          { value: "<20 ms", label: "Vector retrieval" },
        ],
        personaValue: {
          SA: "One platform for vectors, cache and session — fewer AI moving parts.",
          Dev: "RedisVL gives a clean Python API for RAG; ship in days.",
          DB: "Grounding data and embeddings co-located and governed.",
        },
        code: {
          lang: "python",
          content: `from redisvl.index import SearchIndex
from redisvl.query import VectorQuery

q = VectorQuery(
    vector=embed("early FD withdrawal penalty NRE"),
    vector_field_name="embedding",
    return_fields=["text", "source"],
    num_results=5,
)
context = index.query(q)   # top-k grounded chunks, <20 ms`,
        },
      },
      {
        id: "fraud-detection",
        name: "Real-time fraud detection",
        flagship: true,
        problem:
          "Card / UPI fraud must be caught in the authorization window (tens of ms). Models need fresh features and similarity to known fraud patterns — too slow against a traditional database.",
        architecture: [
          "Transactions ingested via Streams (XADD)",
          "Time Series: velocity & spend windows",
          "Bloom / Cuckoo: seen-device / dedup checks",
          "Vector similarity to known fraud vectors",
          "Online feature lookup -> model score (sub-ms)",
        ],
        demo: [
          "Stream synthetic card transactions through a consumer group.",
          "Compute velocity (TS.RANGE) and check device with BF.EXISTS.",
          "Run vector similarity vs. known fraud embeddings.",
          "Flag a suspicious burst live and visualize it in Redis Insight.",
        ],
        metrics: [
          { value: "<30 ms", label: "Decision in auth window", tone: "success" },
          { value: "sub-ms", label: "Feature lookup", tone: "success" },
          { value: "5+", label: "Capabilities, 1 engine", tone: "info" },
        ],
        personaValue: {
          SA: "Fraud pipeline (stream + features + vectors) on one platform.",
          SRE: "Predictable low latency keeps authorization SLAs safe.",
          Dev: "No stitching Kafka + a feature store + a vector DB.",
        },
        code: {
          lang: "redis",
          content: `XADD txn:stream * card 4111... amt 9500 mcc 6011 geo IN

# scoring consumer (per event)
TS.RANGE spend:{card} - + AGGREGATION sum 3600000   # 1h velocity
BF.EXISTS devices:{card} {deviceId}                  # known device?
# + vector similarity vs known-fraud index -> risk score`,
        },
      },
      {
        id: "semantic-cache",
        name: "Semantic caching (LangCache)",
        problem:
          "Repeated, paraphrased LLM queries (support FAQs, policy lookups) re-incur full model cost and latency.",
        architecture: [
          "Embed query",
          "Vector match against cached Q/A",
          "Return cached answer on semantic hit",
          "Bypass the LLM",
        ],
        metrics: [
          { value: "up to 70%", label: "Cost reduction", tone: "success" },
          { value: "10-15x", label: "Latency win", tone: "success" },
        ],
        personaValue: {
          Dev: "A few lines to wrap any LLM call.",
          SA: "Direct, measurable GenAI cost control.",
        },
      },
    ],
  },
  {
    id: "redis-iris",
    name: "Redis Iris",
    tagline: "Real-time context engine for AI agents",
    icon: "Bot",
    tag: "New",
    link: { label: "Learn more at redis.io/iris", href: "https://redis.io/iris/" },
    why: "Agents fail on stale, fragmented data. Redis Iris unifies fresh operational context, agent memory, retrieval and LLM caching so banking agents act on up-to-the-instant truth — inside the agent's latency budget.",
    replaces: [
      "Bespoke agent-memory stores",
      "Stale nightly data exports",
      "Disconnected RAG stacks",
    ],
    capabilities: [
      "Context Retriever",
      "Agent Memory",
      "RDI (fresh context)",
      "LangCache",
      "Search",
    ],
    lenses: ["innovation", "speed", "cost"],
    personas: ["Dev", "SA", "DB"],
    useCases: [
      {
        id: "agentic-assistant",
        name: "Agentic banking assistant",
        flagship: true,
        problem:
          "Customers and RMs want an autonomous assistant that remembers context across sessions and channels and acts on current account state — not a stateless chatbot that forgets and hallucinates.",
        architecture: [
          "Redis Agent Memory: working + long-term memory",
          "Context Retriever: navigate customers, accounts, txns",
          "RDI keeps operational state fresh",
          "LangCache trims repeat LLM cost",
        ],
        demo: [
          "Start a servicing conversation; the agent recalls prior interactions from memory.",
          "Agent navigates the customer's accounts and recent transactions via Context Retriever.",
          "Update a balance in the core DB; RDI refreshes the context the agent sees instantly.",
          "Repeat a common question; LangCache answers within the latency budget.",
        ],
        metrics: [
          { value: "<250 ms", label: "P95 context retrieval", tone: "success" },
          { value: "cross-session", label: "Durable agent memory", tone: "info" },
          { value: "fresh", label: "Operational context" },
        ],
        personaValue: {
          SA: "One context engine (memory + retrieval + RDI + cache) instead of a stitched stack.",
          Dev: "Agent memory and retrieval through Redis APIs; far less plumbing.",
          DB: "Agents read fresh, governed data synced from the system of record.",
        },
        code: {
          lang: "python",
          content: `from redis_agent_memory import AgentMemory

mem = AgentMemory(redis_url, agent_id="rm-copilot")
mem.add(session_id, role="user", content=msg)               # working memory
facts = mem.recall(user_id, query="fd preferences")         # long-term recall
ctx = retriever.navigate("customer", id, ["accounts", "txns"])  # Context Retriever`,
        },
      },
      {
        id: "fraud-investigation-agent",
        name: "Fraud investigation copilot",
        problem:
          "Analysts spend hours pivoting across tools to investigate alerts. An agent should navigate related entities and recall prior cases instantly.",
        architecture: [
          "Context Retriever over customer / device / txn graph",
          "Agent Memory recalls similar past cases",
          "Vector similarity to known fraud",
          "Grounded summary for the analyst",
        ],
        metrics: [
          {
            value: "minutes → seconds",
            label: "Investigation time",
            tone: "success",
          },
          { value: "grounded", label: "On live entities" },
        ],
        personaValue: {
          SA: "Agentic investigation on one real-time platform.",
          Dev: "Entity navigation without bespoke joins across tools.",
        },
      },
      {
        id: "iris-langcache",
        name: "Token optimization (LangCache)",
        problem:
          "High-volume assistant traffic re-asks semantically similar questions, inflating LLM spend and latency.",
        architecture: [
          "Embed the incoming prompt",
          "Semantic match against cached responses",
          "Serve the trusted cached answer",
          "Bypass the LLM on a hit",
        ],
        metrics: [
          { value: "up to 70%", label: "Token cost saved", tone: "success" },
          { value: "10-15x", label: "Faster on hit", tone: "success" },
        ],
        personaValue: {
          SA: "Measurable GenAI cost control across every agent.",
          Dev: "Wrap any LLM call with a few lines.",
        },
      },
    ],
  },
  {
    id: "data-integration",
    name: "Data integration (RDI & RIOT)",
    tagline: "Sync with the system of record, live",
    icon: "Cable",
    why: "RDI streams change data from core banking systems into Redis in near real time; RIOT loads, migrates and replicates data. This is the bridge from caching to a real-time data layer.",
    replaces: ["Bespoke ETL / CDC scripts", "Nightly batch sync jobs"],
    capabilities: [
      "RDI (CDC pipelines)",
      "RIOT import / export",
      "Live replication",
      "Write-behind / read-through",
    ],
    lenses: ["speed", "cost", "innovation"],
    personas: ["DB", "SA"],
    useCases: [
      {
        id: "rdi-customer-360",
        name: "Customer 360 via RDI (CDC)",
        flagship: true,
        problem:
          "The core banking system (Oracle / Db2) is the source of truth but can't serve sub-ms, high-concurrency reads for digital channels. Teams resort to brittle nightly syncs that are stale by morning.",
        architecture: [
          "RDI captures changes (CDC) from core banking DB",
          "Transforms rows -> Redis JSON / Hash",
          "Redis serves digital channels at sub-ms",
          "Source DB stays the system of record",
        ],
        demo: [
          "Run a containerized Postgres 'core banking' DB + RDI pipeline.",
          "UPDATE a customer's address in Postgres.",
          "Watch it appear in Redis JSON in under a second (no app change).",
          "Query the 360 view from Redis at sub-ms while load runs.",
        ],
        metrics: [
          { value: "<1 s", label: "Source -> Redis sync", tone: "success" },
          { value: "<1 ms", label: "Channel read latency", tone: "success" },
          { value: "0", label: "App changes needed", tone: "info" },
        ],
        personaValue: {
          DB: "Offload reads from the core; keep Oracle / Db2 authoritative.",
          SA: "Event-driven sync pattern instead of fragile batch ETL.",
          SRE: "Protect the core from digital traffic spikes.",
        },
        code: {
          lang: "yaml",
          content: `# rdi pipeline (config.yaml)
sources:
  core-banking:
    type: cdc            # Debezium-based change data capture
    connection: oracle-core
targets:
  redis:
    data-type: json      # land each row as a JSON document
    key: "cust:{{ id }}"`,
        },
      },
      {
        id: "write-behind",
        name: "Write-behind to system of record",
        problem:
          "Apps need fast writes but the core DB can't absorb peak write rates synchronously.",
        architecture: [
          "App writes to Redis (fast)",
          "RDI / streams buffer changes",
          "Async write-behind to core DB",
          "Eventual consistency",
        ],
        metrics: [
          { value: "absorb", label: "Peak write bursts", tone: "success" },
          { value: "async", label: "Core DB protected" },
        ],
        personaValue: {
          SA: "Classic write-behind pattern, productized.",
          DB: "Smooths write load on the core.",
        },
      },
      {
        id: "riot-migration",
        name: "Zero-downtime migration (RIOT)",
        problem:
          "Banks need to move off ElastiCache / OSS Redis / Memorystore without an outage or risky big-bang cutover.",
        architecture: [
          "RIOT replicate source -> target",
          "Live sync keeps target current",
          "Validate",
          "Cut over endpoint",
        ],
        metrics: [
          { value: "live", label: "Replication", tone: "success" },
          { value: "minimal", label: "Downtime" },
        ],
        personaValue: {
          SRE: "Controlled, observable cutover.",
          DB: "Verify data parity before the switch.",
        },
      },
    ],
  },
  {
    id: "streams-events",
    name: "Streams & events",
    tagline: "Real-time event backbone",
    icon: "Activity",
    why: "Streams with consumer groups give exactly-once-style processing for payments and event-driven services — a lightweight alternative to a separate message bus.",
    replaces: ["Kafka (for many in-app cases)", "Custom queues"],
    capabilities: [
      "Streams + consumer groups",
      "Pub/Sub",
      "Atomic counters / idempotency",
      "Keyspace notifications",
    ],
    lenses: ["speed", "scale", "resilience"],
    personas: ["Dev", "SA", "SRE"],
    useCases: [
      {
        id: "instant-payments",
        name: "Instant payments processing",
        flagship: true,
        problem:
          "UPI / IMPS / RTP demand high-throughput, idempotent, ordered processing with strict latency SLAs and no double-posting — even during spikes.",
        architecture: [
          "Payment events -> Streams (XADD)",
          "Consumer groups process in order, at-least-once",
          "Idempotency key (SET NX) prevents double-post",
          "Atomic balance update + ledger event",
          "Active-Active for always-on across regions",
        ],
        demo: [
          "Fire a burst of synthetic UPI payments into a stream.",
          "Consumer group posts each exactly once with idempotency keys.",
          "Replay a duplicate and show it is safely ignored.",
          "Show throughput and per-event latency live.",
        ],
        metrics: [
          { value: "100k+", label: "Payments/sec", tone: "success" },
          { value: "exactly once", label: "Posting semantics", tone: "info" },
          { value: "<5 ms", label: "Per-event latency", tone: "success" },
        ],
        personaValue: {
          SA: "Event-driven payments without standing up Kafka.",
          SRE: "Consumer groups + Active-Active = resilient, always-on.",
          Dev: "Idempotency and ordering with primitives, not frameworks.",
        },
        code: {
          lang: "redis",
          content: `# idempotent debit + ledger
SET pay:{txnId} PENDING NX EX 60        # claim once
INCRBYFLOAT acct:{id}:bal -9500
XADD ledger * txnId {txnId} acct {id} amt -9500 status POSTED
XACK payments grp {msgId}`,
        },
      },
      {
        id: "txn-alerts",
        name: "Real-time transaction alerts",
        problem:
          "Customers expect instant debit / credit and fraud alerts the moment a transaction posts.",
        architecture: [
          "Posting event -> Pub/Sub / Stream",
          "Notification service subscribes",
          "Push to app / SMS",
          "Sub-second delivery",
        ],
        metrics: [
          { value: "sub-second", label: "Alert delivery", tone: "success" },
          { value: "fan-out", label: "Many subscribers" },
        ],
        personaValue: {
          Dev: "Pub/Sub fan-out with no extra infrastructure.",
          SA: "Event-driven by default.",
        },
      },
    ],
  },
  {
    id: "global-resilience",
    name: "Global resilience",
    tagline: "Always-on, multi-region, K8s-native",
    icon: "Globe",
    why: "Active-Active geo-distribution, automatic failover and the Kubernetes operator deliver banking-grade availability and data residency.",
    replaces: ["Complex DIY multi-region setups", "Manual failover runbooks"],
    capabilities: [
      "Active-Active (CRDT)",
      "Auto-failover + replica HA",
      "K8s operator + GitOps",
      "Rolling upgrades",
      "Rack-zone awareness",
    ],
    lenses: ["resilience", "scale", "risk"],
    personas: ["SRE", "SA", "DB"],
    useCases: [
      {
        id: "active-active",
        name: "Always-on multi-region banking",
        flagship: true,
        problem:
          "Digital banking must stay up during a regional outage and serve users from the nearest geography with local latency — while staying consistent.",
        architecture: [
          "Active-Active database spans regions (e.g. Mumbai + Singapore)",
          "Multi-primary: write to any region",
          "CRDTs auto-resolve conflicts",
          "Region failure -> traffic shifts, no data loss",
        ],
        demo: [
          "Create an Active-Active DB across two clusters.",
          "Write to both regions concurrently.",
          "Show CRDT conflict resolution converging.",
          "Kill a region; the app keeps serving from the other.",
        ],
        metrics: [
          { value: "99.999%", label: "Uptime SLA", tone: "success" },
          { value: "<1 ms", label: "Local region latency", tone: "success" },
          { value: "0", label: "Manual failover steps", tone: "info" },
        ],
        personaValue: {
          SRE: "Automatic geo-failover; no 2 a.m. runbook.",
          SA: "Active-Active reference architecture out of the box.",
          DB: "Strong eventual consistency with conflict-free types.",
        },
        code: {
          lang: "bash",
          content: `crdb-cli crdb create --name payments --memory-size 10gb \\
  --instance fqdn=cluster-mumbai.bank.internal \\
  --instance fqdn=cluster-singapore.bank.internal`,
        },
      },
      {
        id: "k8s-ops",
        name: "Kubernetes-native operations",
        problem:
          "Platform teams want Redis managed declaratively with GitOps, not click-ops.",
        architecture: [
          "Redis Enterprise operator",
          "CRDs: REC / REDB",
          "GitOps reconcile",
          "Rolling upgrades",
        ],
        metrics: [
          { value: "declarative", label: "GitOps managed", tone: "success" },
          { value: "0-downtime", label: "Upgrades" },
        ],
        personaValue: {
          SRE: "Self-healing, declarative clusters.",
          SA: "Fits CNCF-conformant platforms.",
        },
      },
      {
        id: "dr-residency",
        name: "DR & data residency",
        problem:
          "Regulators require in-country data and tested disaster recovery with clear RTO / RPO.",
        architecture: [
          "Geo-placement of clusters",
          "Backups + cluster recovery",
          "Active-Active DR",
          "Rack-zone awareness",
        ],
        metrics: [
          { value: "RTO/RPO", label: "Met with AA", tone: "success" },
          { value: "in-region", label: "Data residency" },
        ],
        personaValue: {
          DB: "Backups, recovery and residency controls.",
          SRE: "Tested DR, not hope-based.",
        },
      },
    ],
  },
  {
    id: "enterprise-security",
    name: "Enterprise & security",
    tagline: "Compliance-ready by design",
    icon: "ShieldCheck",
    why: "RBAC, LDAP, encryption and audit make Redis fit banking compliance (RBI, PCI-DSS, GDPR), backed by deep observability and 24/7 support.",
    replaces: ["Ad-hoc access scripts", "Blind-spot monitoring"],
    capabilities: [
      "RBAC + users / roles",
      "LDAP + SSO / SAML + MFA",
      "TLS + internode + at-rest encryption",
      "Audit events",
      "Prometheus / Grafana",
    ],
    lenses: ["risk", "resilience"],
    personas: ["DB", "SRE", "SA"],
    useCases: [
      {
        id: "compliance-audit",
        name: "Compliance & audit (RBI / PCI / GDPR)",
        problem:
          "Every access and change to sensitive data must be controlled, encrypted and auditable for regulators.",
        architecture: [
          "RBAC roles per app / team",
          "Encryption in transit + at rest",
          "Audit events captured",
          "Mapped to controls",
        ],
        metrics: [
          { value: "end-to-end", label: "Encryption", tone: "success" },
          { value: "auditable", label: "Access events" },
        ],
        personaValue: {
          DB: "Demonstrable controls for audits.",
          SA: "Compliance mapped to capabilities.",
        },
      },
      {
        id: "rbac-ldap",
        name: "RBAC + LDAP + encryption",
        problem:
          "Access must integrate with enterprise identity and enforce least privilege.",
        architecture: [
          "LDAP / SSO integration",
          "Fine-grained RBAC",
          "Per-database ACLs",
          "TLS everywhere",
        ],
        metrics: [
          { value: "least-priv", label: "Access model", tone: "success" },
          { value: "SSO", label: "Identity integrated" },
        ],
        personaValue: {
          SRE: "Central identity, fewer secrets.",
          DB: "Granular, role-based data access.",
        },
      },
    ],
  },
];
