import type { PersonaId } from "@/lib/types";
import type { SearchFeature } from "@/data/capabilities";

// ---------------------------------------------------------------------------
// Specialized capabilities / modules — each gets a full deep-dive built to the
// same pattern as Search & query and Data structures:
//   header → practical use cases → how it works → feature cards (worked
//   examples) → stakeholder value → runnable RedisInsight script.
// Content is data-driven so every module renders through one component.
// ---------------------------------------------------------------------------

export interface ModuleStep {
  icon: string;
  title: string;
  sub: string;
}

export interface ModuleNote {
  t: string;
  b: string;
}

export interface ModuleDemoStep {
  title: string;
  cmd: string;
  desc: string;
}

export interface ModuleSpec {
  id: string;
  meta: {
    name: string;
    alias: string;
    icon: string;
    tagline: string;
    whatItIs: string;
    link: { label: string; href: string };
  };
  useCases: { title: string; detail: string; primitives: string }[];
  how: {
    title: string;
    description: string;
    flow: ModuleStep[];
    notes: ModuleNote[];
  };
  features: SearchFeature[];
  personaValue: Partial<Record<PersonaId, string>>;
  demo: {
    intro: string;
    note?: string;
    steps: ModuleDemoStep[];
  };
}

// ===========================================================================
// JSON documents
// ===========================================================================
const JSON_MODULE: ModuleSpec = {
  id: "json",
  meta: {
    name: "JSON documents",
    alias: "Redis JSON",
    icon: "json",
    tagline: "Nested documents in memory, with atomic path-level operations",
    whatItIs:
      "Redis JSON stores native, nested JSON as a first-class type and lets you read or update any path atomically — no fetch-modify-rewrite of the whole document. Combined with the Query Engine, the same documents become fully indexable and searchable, so one key is both your record and your queryable model.",
    link: {
      label: "redis.io · JSON",
      href: "https://redis.io/docs/latest/develop/data-types/json/",
    },
  },
  useCases: [
    {
      title: "Customer 360 profile",
      detail:
        "One nested document per customer — accounts, products, KYC and flags — read whole or by path, and indexed by the Query Engine for any-field search.",
      primitives: "JSON · Search",
    },
    {
      title: "Loan-application state",
      detail:
        "A loan journey is one evolving document; each stage updates a path atomically without rewriting the whole application.",
      primitives: "JSON",
    },
    {
      title: "KYC / onboarding metadata",
      detail:
        "Documents, verification status and risk attributes kept together and updated field-by-field as checks complete.",
      primitives: "JSON",
    },
    {
      title: "Mandates & standing instructions",
      detail:
        "e-NACH / SI mandates as structured documents with arrays of beneficiaries and limits, partially read at execution time.",
      primitives: "JSON",
    },
  ],
  how: {
    title: "A document model that updates in place",
    description:
      "Store the whole record once, then address any path with JSONPath. Reads project just the fields you need; writes mutate a single path atomically. Point the Query Engine at the same keys and every field becomes indexable.",
    flow: [
      { icon: "Braces", title: "Store the document", sub: "JSON.SET cust:C1001 $ {…}" },
      { icon: "Filter", title: "Address a path", sub: "$.accounts[0].balance" },
      { icon: "Gauge", title: "Atomic path op", sub: "JSON.NUMINCRBY · ARRAPPEND" },
      { icon: "redis-search", title: "Index & query", sub: "FT.CREATE ON JSON" },
    ],
    notes: [
      { t: "No fetch-and-rewrite", b: "Update one path atomically — no read-modify-write of the whole blob, no lost-update races between callers." },
      { t: "Partial reads", b: "Project only the fields a screen needs (JSON.GET path…) instead of shipping the entire document over the wire." },
      { t: "Queryable by design", b: "The same JSON keys are indexed by the Query Engine — store and search one copy, no second document store." },
    ],
  },
  features: [
    {
      id: "json-native",
      name: "Native nested JSON",
      icon: "json",
      what: "Store structured, nested JSON as a real type (not a serialized string) with JSON.SET / JSON.GET addressing any element by JSONPath.",
      usecase:
        "Customer 360 — hold the full profile (identity, accounts, products, KYC) as one document keyed by customer id.",
      pattern: `cust:C1001 → {"name":"Rahul Choubey","segment":"Priority",
            "kyc":{"status":"pending"},"balance":2480000,
            "tags":["NRI","Demat"]}`,
      query: `JSON.SET cust:C1001 $ '{"name":"Rahul Choubey","segment":"Priority","kyc":{"status":"pending"},"balance":2480000,"tags":["NRI","Demat"]}'
JSON.GET cust:C1001 $.name $.segment`,
      output: 'Document stored; the projection returns {"$.name":["Rahul Choubey"],"$.segment":["Priority"]} in sub-ms.',
      outcome:
        "One key models the whole customer with real structure — no JSON string parsing in app code, no column sprawl.",
      without:
        "Serialize a blob into a string (parse on every read) or shred the document across dozens of relational columns and join them back.",
    },
    {
      id: "json-atomic",
      name: "Atomic path updates",
      icon: "Gauge",
      what: "Mutate a single path in place — JSON.NUMINCRBY, JSON.ARRAPPEND, JSON.STRAPPEND, JSON.SET on a sub-path — atomically, without touching the rest of the document.",
      usecase:
        "Available-balance and flags — debit a balance and append an activity tag without rewriting the profile.",
      pattern: `cust:C1001 $.balance = 2480000 · $.tags = ["NRI","Demat"]`,
      query: `JSON.NUMINCRBY cust:C1001 $.balance -5000
JSON.ARRAPPEND  cust:C1001 $.tags '"UPI-active"'
JSON.SET        cust:C1001 $.kyc.status '"verified"'`,
      output:
        "Balance → 2,475,000; tags → [\"NRI\",\"Demat\",\"UPI-active\"]; kyc.status → \"verified\" — each a single atomic op.",
      outcome:
        "Concurrent updates to different paths never clobber each other — correctness without app-side locks.",
      without:
        "Read the whole document, edit in code, write it back — a lost-update race when two requests touch the same record.",
    },
    {
      id: "json-index",
      name: "Indexable with Search",
      icon: "secondary-indexing",
      what: "FT.CREATE … ON JSON builds a secondary index over JSONPath fields, so documents are queryable by full-text, tag, numeric, geo and vector — and stay live as they change.",
      usecase:
        "Make every Customer 360 document searchable by segment, city and balance across the whole base.",
      pattern: "$.segment AS TAG · $.city AS TAG · $.balance AS NUMERIC over cust:* docs.",
      query: `FT.CREATE idx:cust ON JSON PREFIX 1 cust:
  SCHEMA $.segment AS segment TAG
         $.balance AS balance NUMERIC SORTABLE
FT.SEARCH idx:cust "@segment:{Priority} @balance:[2000000 +inf]"`,
      output: "Returns the matching customer documents in <1 ms; new JSON writes are indexed automatically.",
      outcome:
        "Store and query one copy of the data — the document IS the index source, no sync to a separate engine.",
      without:
        "Copy documents into Elasticsearch / a document DB and keep both in sync via CDC; two systems to license and secure.",
    },
    {
      id: "json-partial",
      name: "Partial reads & projection",
      icon: "Filter",
      what: "Fetch only the paths a caller needs with JSON.GET path… or JSON.MGET across keys — minimizing payloads and round-trips.",
      usecase:
        "A balance widget needs only name + balance; a servicing screen needs the accounts array — each reads just its slice.",
      pattern: "cust:C1001 / cust:C1002 documents already stored.",
      query: `JSON.GET  cust:C1001 $.name $.balance
JSON.MGET cust:C1001 cust:C1002 $.segment`,
      output:
        "First call returns just name + balance; JSON.MGET returns the segment of both customers in one round-trip.",
      outcome:
        "Screens pull exactly the fields they render — smaller payloads, fewer calls, lower latency.",
      without:
        "Ship the entire document to the client and discard 90% of it, or maintain bespoke projection endpoints per screen.",
    },
  ],
  personaValue: {
    Dev: "Model real entities as documents and update them by path — no ORM blob juggling, no read-modify-write races.",
    DB: "One queryable document store instead of a relational shred plus a synced search index — fewer systems to own.",
    SA: "Customer 360 and application-state patterns land on infrastructure you already run, indexed by the same engine.",
    SRE: "Atomic path ops and in-memory reads keep latency predictable and remove app-side locking.",
  },
  demo: {
    intro:
      "A guided tour of Redis JSON — store a customer document, update paths atomically, then index and query it. Each command creates its own keys; open the Browser to watch the document change.",
    steps: [
      {
        title: "Store a customer document",
        cmd: `JSON.SET cust:C1001 $ '{"name":"Rahul Choubey","segment":"Priority","city":"Mumbai","balance":2480000,"kyc":{"status":"pending"},"tags":["NRI","Demat"]}'`,
        desc: "One nested JSON document under a single key — identity, balance, nested KYC and a tags array.",
      },
      {
        title: "Project just the fields you need",
        cmd: `JSON.GET cust:C1001 $.name $.balance $.kyc.status`,
        desc: "Read a slice of the document — name, balance and nested kyc.status — instead of the whole blob.",
      },
      {
        title: "Debit the balance atomically",
        cmd: `JSON.NUMINCRBY cust:C1001 $.balance -5000`,
        desc: "Mutate one numeric path in place — no fetch-and-rewrite, no lost-update race.",
      },
      {
        title: "Append a flag and verify KYC",
        cmd: `JSON.ARRAPPEND cust:C1001 $.tags '"UPI-active"'\nJSON.SET cust:C1001 $.kyc.status '"verified"'`,
        desc: "Grow an array and set a nested field atomically — the rest of the document is untouched.",
      },
      {
        title: "Add a second customer",
        cmd: `JSON.SET cust:C1002 $ '{"name":"Anjali Sharma","segment":"Imperia","city":"Delhi","balance":8650000,"kyc":{"status":"verified"},"tags":["HNW"]}'`,
        desc: "A second document so the index and multi-get have something to match.",
      },
      {
        title: "Index the documents",
        cmd: `FT.CREATE idx:cust ON JSON PREFIX 1 cust: SCHEMA $.segment AS segment TAG $.city AS city TAG $.balance AS balance NUMERIC SORTABLE`,
        desc: "Point the Query Engine at the JSON keys — every listed path becomes queryable, live.",
      },
      {
        title: "Query across documents",
        cmd: `FT.SEARCH idx:cust "@segment:{Priority} @balance:[2000000 +inf]"\nJSON.MGET cust:C1001 cust:C1002 $.segment`,
        desc: "Find Priority customers above ₹20L, and fetch one path across many docs in a single call.",
      },
    ],
  },
};

// ===========================================================================
// Streams
// ===========================================================================
const STREAMS_MODULE: ModuleSpec = {
  id: "streams",
  meta: {
    name: "Streams",
    alias: "Redis Streams",
    icon: "redis-stream",
    tagline: "An append-only event log with consumer groups — payments-grade",
    whatItIs:
      "Redis Streams is an append-only log of events with consumer groups for scalable, at-least-once processing. Producers XADD events; groups of workers read, acknowledge and replay them in order. It gives event-driven payments, workflows and audit trails the ordering and delivery guarantees of a message bus — on the engine you already run.",
    link: {
      label: "redis.io · Streams",
      href: "https://redis.io/docs/latest/develop/data-types/streams/",
    },
  },
  useCases: [
    {
      title: "UPI / payment rail",
      detail:
        "Each payment is an event on a stream; consumer groups settle them in order, exactly-once with idempotency keys, absorbing spikes.",
      primitives: "Streams · String",
    },
    {
      title: "NEFT / RTGS workflow",
      detail:
        "Multi-step settlement modeled as stages on a stream — each worker advances the step and acknowledges, with full replay.",
      primitives: "Streams",
    },
    {
      title: "Notification fan-out",
      detail:
        "Posting events feed a stream that notification workers consume to push SMS / app alerts, scaling out by adding consumers.",
      primitives: "Streams",
    },
    {
      title: "Immutable audit trail",
      detail:
        "Append every business event to a retained stream for a tamper-evident, replayable record for ops and compliance.",
      primitives: "Streams",
    },
  ],
  how: {
    title: "Produce, group-consume, acknowledge, replay",
    description:
      "Producers append events with XADD. A consumer group hands each event to exactly one worker via XREADGROUP; the worker processes and XACKs it. Un-acked events stay pending and can be claimed by another worker — so nothing is lost when a consumer dies.",
    flow: [
      { icon: "Workflow", title: "Producer XADD", sub: "append event to the log" },
      { icon: "Boxes", title: "Consumer group", sub: "XREADGROUP · one per worker" },
      { icon: "Check", title: "Acknowledge", sub: "XACK after processing" },
      { icon: "Activity", title: "Pending & replay", sub: "XPENDING · XAUTOCLAIM" },
    ],
    notes: [
      { t: "At-least-once delivery", b: "Events stay pending until XACKed; a crashed worker's messages are reclaimed and reprocessed — no silent loss." },
      { t: "Ordered & replayable", b: "The log keeps order and history — replay from any id for recovery, back-testing or a new consumer." },
      { t: "Scale by adding consumers", b: "A consumer group spreads load across workers; add consumers to raise throughput without re-partitioning." },
    ],
  },
  features: [
    {
      id: "streams-xadd",
      name: "Append-only event log",
      icon: "redis-stream",
      what: "XADD appends an event with an auto-generated, time-ordered id; XLEN and XRANGE read length and history. Capped retention with MAXLEN / MINID bounds memory.",
      usecase:
        "Ingest every UPI payment as an ordered event the moment it arrives, ready for downstream settlement.",
      pattern: `payments → * { type:UPI, amt:9500, payer:C1001, mcc:6011 }`,
      query: `XADD payments * type UPI amt 9500 payer C1001 mcc 6011
XADD payments * type UPI amt 1200 payer C1006 mcc 5411
XLEN payments`,
      output: "Two time-ordered ids returned (e.g. 1718…-0); XLEN payments → 2. New events always sort after old ones.",
      outcome:
        "A durable, ordered intake for payment events — the backbone of an event-driven rail.",
      without:
        "Stand up and operate Kafka for an in-app pipeline, or poll a DB table as a queue with hot-row contention.",
    },
    {
      id: "streams-groups",
      name: "Consumer groups",
      icon: "Boxes",
      what: "XGROUP CREATE sets up a group; XREADGROUP delivers each new event to exactly one consumer in the group, tracking per-consumer delivery.",
      usecase:
        "A pool of settlement workers shares the payment load — each event processed once, throughput scaling with workers.",
      pattern: "Group settle over stream payments; consumers w1, w2…",
      query: `XGROUP CREATE payments settle 0
XREADGROUP GROUP settle w1 COUNT 10 STREAMS payments >`,
      output: "Worker w1 receives the next batch of unprocessed events; w2 would receive different ones — no double processing.",
      outcome:
        "Horizontal, load-balanced consumption with per-event ownership — add workers to scale, no rebalancing scripts.",
      without:
        "Build distributed work assignment yourself (leases, locks) or run a broker just to share a queue across workers.",
    },
    {
      id: "streams-ack",
      name: "At-least-once + pending",
      icon: "Activity",
      what: "Processed events are XACKed; unacknowledged ones remain in the Pending Entries List. XPENDING inspects them and XAUTOCLAIM reassigns stuck events to a healthy worker.",
      usecase:
        "If a settlement worker crashes mid-payment, another worker reclaims and finishes the event — no payment dropped.",
      pattern: "settle group has delivered ids awaiting XACK.",
      query: `XACK payments settle 1718000000000-0
XPENDING payments settle
XAUTOCLAIM payments settle w2 60000 0 COUNT 10`,
      output:
        "XPENDING shows what's in-flight per consumer; XAUTOCLAIM moves events idle >60 s from a dead worker to w2 for retry.",
      outcome:
        "Delivery guarantees banks need — crashes are recovered, not lost — with a built-in dead-letter pattern.",
      without:
        "Hand-roll retry bookkeeping, visibility timeouts and dead-letter queues on top of a plain queue.",
    },
    {
      id: "streams-replay",
      name: "Replay & retention",
      icon: "ListTree",
      what: "Because the log is retained (bounded by MAXLEN / MINID), you can XRANGE / XREAD from any id to replay history into a new consumer or for investigation.",
      usecase:
        "Re-drive a day's payments into a fixed downstream, or reconstruct an audit timeline for a dispute.",
      pattern: "payments retains recent history (e.g. MAXLEN ~ 1,000,000).",
      query: `XADD payments MAXLEN ~ 1000000 * type UPI amt 500 payer C1009
XRANGE payments - + COUNT 5`,
      output: "Stream stays bounded near 1M entries; XRANGE replays the earliest 5 events in order for inspection or reprocessing.",
      outcome:
        "Ordered history for replay, recovery and audit — memory stays bounded by a retention policy you choose.",
      without:
        "A separate event store or log system for replay/audit, plus glue to keep it consistent with the live queue.",
    },
  ],
  personaValue: {
    Dev: "Event-driven payments and workflows with ordering, idempotency and consumer groups — primitives, not a framework to operate.",
    SA: "An event backbone for payments and notifications without standing up Kafka for in-app use cases.",
    SRE: "At-least-once delivery, pending-entry recovery and Active-Active make the rail resilient and always-on.",
    DB: "An append-only, replayable log co-located with the data it drives — fewer moving parts to reconcile.",
  },
  demo: {
    intro:
      "Build a tiny payments rail in RedisInsight — append events, consume them as a group, acknowledge, and replay. Paste in order; the stream and group are created as you go.",
    steps: [
      {
        title: "Append payment events",
        cmd: `XADD payments * type UPI amt 9500 payer C1001 mcc 6011\nXADD payments * type UPI amt 1200 payer C1006 mcc 5411\nXLEN payments`,
        desc: "Two time-ordered events land on the stream; XLEN confirms the log length.",
      },
      {
        title: "Create a consumer group",
        cmd: `XGROUP CREATE payments settle 0`,
        desc: "The 'settle' group will deliver each event to exactly one worker, starting from the beginning (0).",
      },
      {
        title: "Consume as worker w1",
        cmd: `XREADGROUP GROUP settle w1 COUNT 10 STREAMS payments >`,
        desc: "'>' means 'new, never-delivered events' — w1 picks up the unprocessed batch.",
      },
      {
        title: "Inspect what's pending",
        cmd: `XPENDING payments settle`,
        desc: "Delivered-but-unacknowledged events sit in the Pending Entries List until processed.",
      },
      {
        title: "Acknowledge a processed event",
        cmd: `XACK payments settle 0\nXPENDING payments settle`,
        desc: "Replace 0 with a real id from step 3. After XACK, the pending count drops — proof of at-least-once handling.",
      },
      {
        title: "Reclaim stuck work",
        cmd: `XAUTOCLAIM payments settle w2 60000 0 COUNT 10`,
        desc: "Move events idle more than 60 s from a dead worker to w2 — the dead-letter / recovery pattern.",
      },
      {
        title: "Replay history",
        cmd: `XRANGE payments - + COUNT 5`,
        desc: "Read the earliest events back in order — replay for recovery, audit or a new consumer.",
      },
    ],
  },
};

// ===========================================================================
// Pub/Sub
// ===========================================================================
const PUBSUB_MODULE: ModuleSpec = {
  id: "pubsub",
  meta: {
    name: "Pub/Sub",
    alias: "Publish / Subscribe",
    icon: "messaging",
    tagline: "Real-time fan-out to many subscribers, at sub-millisecond latency",
    whatItIs:
      "Redis Pub/Sub delivers messages instantly from publishers to every interested subscriber — a fire-and-forget broadcast bus. It powers live balance pushes, fraud-alert broadcasts and cache invalidation, with pattern channels, keyspace notifications and sharded Pub/Sub for cluster-scale fan-out.",
    link: {
      label: "redis.io · Pub/Sub",
      href: "https://redis.io/docs/latest/develop/interact/pubsub/",
    },
  },
  useCases: [
    {
      title: "Live balance & status push",
      detail:
        "Publish a posting event to a per-customer channel; the app / WebSocket gateway pushes the new balance instantly.",
      primitives: "Pub/Sub",
    },
    {
      title: "Fraud-alert broadcast",
      detail:
        "A fraud decision fans out to every channel that needs it — app, ops console, case system — in one publish.",
      primitives: "Pub/Sub",
    },
    {
      title: "Cache invalidation",
      detail:
        "When the system of record changes, publish an invalidation so every app node drops its stale entry at once.",
      primitives: "Pub/Sub · Keyspace",
    },
    {
      title: "Config & feature-flag push",
      detail:
        "Broadcast a config or kill-switch change so all services react immediately, without polling.",
      primitives: "Pub/Sub",
    },
  ],
  how: {
    title: "Publish once, every subscriber hears it",
    description:
      "Subscribers register interest in channels (or patterns); a publisher sends a message to a channel and the server pushes it to all current subscribers immediately. It's fire-and-forget — no storage, no replay — optimized for the lowest-latency live fan-out. Use Streams when you need persistence and acknowledgement.",
    flow: [
      { icon: "Radio", title: "Subscribe", sub: "SUBSCRIBE alerts:fraud" },
      { icon: "Workflow", title: "Publish", sub: "PUBLISH to the channel" },
      { icon: "Network", title: "Fan-out", sub: "pushed to all subscribers" },
      { icon: "Gauge", title: "Act live", sub: "sub-ms, no polling" },
    ],
    notes: [
      { t: "Fire-and-forget", b: "Lowest-latency live delivery with no storage — if you need durability, ordering and ACKs, reach for Streams instead." },
      { t: "Patterns & keyspace", b: "PSUBSCRIBE matches channel patterns, and keyspace notifications turn data changes into events you can subscribe to." },
      { t: "Sharded Pub/Sub", b: "SSUBSCRIBE / SPUBLISH keep fan-out local to a shard so broadcasting scales on a clustered, Active-Active deployment." },
    ],
  },
  features: [
    {
      id: "pubsub-fanout",
      name: "Channel fan-out",
      icon: "messaging",
      what: "SUBSCRIBE registers interest in a named channel; PUBLISH delivers a message to every current subscriber and returns how many received it.",
      usecase:
        "Push a live balance update to every device session watching a customer's account.",
      pattern: "Channel acct:C1001 — app sessions subscribe per customer.",
      query: `SUBSCRIBE acct:C1001            # in a subscriber tab
PUBLISH   acct:C1001 '{"bal":2475000}'   # in a publisher tab`,
      output: "Every subscriber on acct:C1001 receives the message instantly; PUBLISH returns the subscriber count (e.g. 1).",
      outcome:
        "Instant, server-pushed updates with no polling — the foundation of live, reactive banking UIs.",
      without:
        "Clients poll an endpoint on a timer — stale between polls, wasteful at scale, and slower to react.",
    },
    {
      id: "pubsub-pattern",
      name: "Pattern subscriptions",
      icon: "Filter",
      what: "PSUBSCRIBE subscribes to a glob pattern, so one subscriber receives messages from many channels matching the pattern.",
      usecase:
        "An ops console listens to all fraud alerts (alerts:fraud:*) regardless of region or product.",
      pattern: "Channels alerts:fraud:mum, alerts:fraud:del, …",
      query: `PSUBSCRIBE alerts:fraud:*       # ops console
PUBLISH    alerts:fraud:mum '{"case":"F-7781","score":92}'`,
      output: "The pattern subscriber receives the alert published to alerts:fraud:mum (and any other matching channel).",
      outcome:
        "One subscription spans a whole family of channels — clean topic hierarchies without N explicit subscriptions.",
      without:
        "Track and subscribe to every channel by hand, updating subscriptions whenever a new region/product appears.",
    },
    {
      id: "pubsub-keyspace",
      name: "Keyspace notifications",
      icon: "KeyRound",
      what: "With notify-keyspace-events enabled, Redis publishes events when keys change or expire (e.g. __keyevent@0__:expired), turning data changes into a subscribable stream.",
      usecase:
        "When a cached session or hold expires, react automatically — release the hold, drop the entry, notify the app.",
      pattern: "Enable events, then subscribe to expirations.",
      query: `CONFIG SET notify-keyspace-events KEA
SUBSCRIBE __keyevent@0__:expired
SET hold:txn:88126 1 EX 5      # expires in 5s → event fires`,
      output: "When hold:txn:88126 expires, subscribers receive an 'expired' event carrying the key name — event-driven, no polling.",
      outcome:
        "Data lifecycle becomes event-driven — TTL expiries and writes drive logic automatically.",
      without:
        "Poll for expiry/changes on a timer, or bolt change-tracking onto every write path in the application.",
    },
  ],
  personaValue: {
    Dev: "A one-line broadcast bus for live UIs and cache invalidation — PUBLISH / SUBSCRIBE, no extra infrastructure.",
    SRE: "Sharded Pub/Sub keeps fan-out local to a shard, so live broadcasting scales on clustered, Active-Active deployments.",
    SA: "Event-driven push for balances, alerts and config — reuse the engine you already run instead of a separate broker.",
  },
  demo: {
    intro:
      "Pub/Sub is live fan-out, so SUBSCRIBE blocks while it waits for messages. Open two RedisInsight Workbench tabs (or use the CLI): one to subscribe, one to publish.",
    note: "Run the SUBSCRIBE / PSUBSCRIBE commands in one tab, then PUBLISH from a second tab to see messages arrive.",
    steps: [
      {
        title: "Subscribe to a customer channel",
        cmd: `SUBSCRIBE acct:C1001`,
        desc: "Tab 1 — listen for live updates on one customer's account. This call blocks, waiting for messages.",
      },
      {
        title: "Publish a balance update",
        cmd: `PUBLISH acct:C1001 '{"bal":2475000,"ts":1718000000}'`,
        desc: "Tab 2 — the subscriber in tab 1 receives this instantly; PUBLISH returns the number of receivers.",
      },
      {
        title: "Subscribe to a pattern",
        cmd: `PSUBSCRIBE alerts:fraud:*`,
        desc: "Tab 1 — one subscription covers every regional fraud channel under alerts:fraud:*.",
      },
      {
        title: "Broadcast a fraud alert",
        cmd: `PUBLISH alerts:fraud:mum '{"case":"F-7781","score":92,"action":"hold"}'`,
        desc: "Tab 2 — the pattern subscriber receives the alert published to the Mumbai channel.",
      },
      {
        title: "Enable keyspace notifications",
        cmd: `CONFIG SET notify-keyspace-events KEA`,
        desc: "Turn on keyspace/keyevent events so data changes and expiries become subscribable.",
      },
      {
        title: "React to an expiry",
        cmd: `SUBSCRIBE __keyevent@0__:expired`,
        desc: "Tab 1 — then in tab 2 run: SET hold:txn:88126 1 EX 5. After 5s the expiry event arrives here.",
      },
    ],
  },
};

// ===========================================================================
// Time series
// ===========================================================================
const TIMESERIES_MODULE: ModuleSpec = {
  id: "timeseries",
  meta: {
    name: "Time series",
    alias: "Redis Time Series",
    icon: "redis-time-series",
    tagline: "High-ingest time-stamped metrics with downsampling, built in",
    whatItIs:
      "Redis Time Series stores time-stamped values at high ingest rates with labels, range queries and server-side aggregation. Compaction rules downsample raw points into rollups automatically, so FX ticks, channel latencies and ATM levels are captured raw and served as windows — without a separate metrics database.",
    link: {
      label: "redis.io · Time Series",
      href: "https://redis.io/docs/latest/develop/data-types/timeseries/",
    },
  },
  useCases: [
    {
      title: "FX & interest-rate ticks",
      detail:
        "Capture every rate tick and serve OHLC / averages per minute or hour with server-side aggregation — no client math.",
      primitives: "Time series",
    },
    {
      title: "Channel SLA & p99 latency",
      detail:
        "Record per-request latencies and read back p99 / max per window to watch digital-channel SLAs in real time.",
      primitives: "Time series",
    },
    {
      title: "ATM cash levels",
      detail:
        "Track cash-in-machine over time per ATM with labels, alerting when a downsampled level crosses a threshold.",
      primitives: "Time series",
    },
    {
      title: "API throughput & limits",
      detail:
        "Count calls per second/minute as a series to drive capacity dashboards and rolling rate decisions.",
      primitives: "Time series",
    },
  ],
  how: {
    title: "Add raw points, read aggregated windows",
    description:
      "Create a series with labels, then TS.ADD raw samples at high rate. Query a time range with server-side AGGREGATION (avg, max, p99…) into buckets, and let compaction rules pre-compute rollups so dashboards read cheap downsampled series instead of raw points.",
    flow: [
      { icon: "LineChart", title: "Create series", sub: "TS.CREATE + LABELS" },
      { icon: "Activity", title: "Ingest points", sub: "TS.ADD ts value" },
      { icon: "Sigma", title: "Aggregate", sub: "TS.RANGE … AGGREGATION" },
      { icon: "Filter", title: "Downsample", sub: "TS.CREATERULE rollups" },
    ],
    notes: [
      { t: "Server-side aggregation", b: "Buckets and rollups (avg / min / max / p99) are computed in the engine — the client gets windows, not millions of raw points." },
      { t: "Automatic downsampling", b: "Compaction rules roll raw points into 1-min/1-hour series continuously, capping memory while keeping history useful." },
      { t: "Label filtering", b: "Query many series at once by label (TS.MRANGE FILTER) — e.g. every channel or every ATM in a region." },
    ],
  },
  features: [
    {
      id: "ts-add",
      name: "High-ingest with labels",
      icon: "redis-time-series",
      what: "TS.CREATE defines a series with labels and a duplicate policy; TS.ADD records a value at a timestamp ('*' = now) at high throughput.",
      usecase:
        "Stream USD/INR rate ticks into a labeled series ready for per-window aggregation.",
      pattern: `fx:USDINR  (LABELS pair=USDINR kind=fx)`,
      query: `TS.CREATE fx:USDINR DUPLICATE_POLICY last LABELS pair USDINR kind fx
TS.ADD fx:USDINR * 83.12
TS.ADD fx:USDINR * 83.15`,
      output: "Series created with labels; each TS.ADD returns the stored timestamp. Ingest scales to high tick rates.",
      outcome:
        "Time-stamped metrics captured natively with metadata for later filtering — no schema, no insert-per-row table.",
      without:
        "A wide metrics table with an index on (series, ts) that bloats fast, or a separate TSDB to deploy and sync.",
    },
    {
      id: "ts-range",
      name: "Range + aggregation",
      icon: "Sigma",
      what: "TS.RANGE reads a time window and, with AGGREGATION, buckets it server-side into avg / min / max / sum / and percentile rollups.",
      usecase:
        "Show 1-minute average FX or p99 channel latency without pulling raw points to the client.",
      pattern: "fx:USDINR holds raw ticks across the last hour.",
      query: `TS.RANGE fx:USDINR - + AGGREGATION avg 60000
TS.RANGE fx:USDINR - + AGGREGATION max 60000`,
      output: "Returns one value per 60 000 ms bucket — minute-by-minute average and max — computed in the engine.",
      outcome:
        "Dashboards read compact, pre-bucketed windows — fast charts over high-frequency data, no client-side math.",
      without:
        "Fetch every raw point and aggregate in app code, or maintain materialized rollup tables by hand.",
    },
    {
      id: "ts-rule",
      name: "Downsampling & compaction",
      icon: "Filter",
      what: "TS.CREATERULE continuously rolls a raw series into a coarser destination series (e.g. 1-minute averages), bounding memory while keeping history queryable.",
      usecase:
        "Keep raw ticks short-term but retain 1-minute averages long-term for trend dashboards.",
      pattern: "fx:USDINR (raw) → fx:USDINR:1m (1-min avg).",
      query: `TS.CREATE fx:USDINR:1m LABELS pair USDINR rollup 1m
TS.CREATERULE fx:USDINR fx:USDINR:1m AGGREGATION avg 60000
TS.RANGE fx:USDINR:1m - +`,
      output: "New raw ticks are auto-aggregated into the 1-minute series; reading the rollup is cheap and bounded.",
      outcome:
        "Automatic retention tiers — raw for the short term, rollups for the long term — without batch jobs.",
      without:
        "Cron-driven rollup jobs and retention scripts to downsample and prune a metrics table on a schedule.",
    },
    {
      id: "ts-mrange",
      name: "Multi-series by label",
      icon: "ListTree",
      what: "TS.MRANGE / TS.MGET query many series at once selected by label filters, returning each matching series' window.",
      usecase:
        "Read p99 latency for every digital channel, or cash level for every ATM in a city, in one call.",
      pattern: "Series chan:web:lat, chan:mob:lat … all LABELS kind=latency.",
      query: `TS.ADD chan:web:lat * 42 LABELS kind latency channel web
TS.ADD chan:mob:lat * 55 LABELS kind latency channel mob
TS.MRANGE - + AGGREGATION max 60000 FILTER kind=latency`,
      output: "Returns the max-per-minute window for every series labeled kind=latency — all channels in one query.",
      outcome:
        "Fleet-wide views (all channels, all ATMs) from a single label-filtered query — no per-series fan-out in code.",
      without:
        "Issue and stitch N separate queries, or pre-join everything into a wide table keyed by entity and time.",
    },
  ],
  personaValue: {
    Dev: "Native time-stamped metrics with server-side aggregation — no client-side bucketing or rollup code to maintain.",
    SRE: "p99 / max windows and label-filtered fleet views make channel-SLA and capacity dashboards trivial to build.",
    DB: "High-ingest metrics with automatic downsampling and retention — no metrics table to grow, index and prune.",
  },
  demo: {
    intro:
      "Capture FX ticks and channel latencies, then read aggregated windows and set up automatic downsampling. Paste in order — series are created as you go.",
    steps: [
      {
        title: "Create a labeled FX series",
        cmd: `TS.CREATE fx:USDINR DUPLICATE_POLICY last LABELS pair USDINR kind fx`,
        desc: "Define the series with a duplicate policy and labels for later filtering.",
      },
      {
        title: "Ingest a few ticks",
        cmd: `TS.ADD fx:USDINR * 83.12\nTS.ADD fx:USDINR * 83.15\nTS.ADD fx:USDINR * 83.09`,
        desc: "Record rate ticks at 'now' (*). In production this runs at high frequency.",
      },
      {
        title: "Aggregate into minute buckets",
        cmd: `TS.RANGE fx:USDINR - + AGGREGATION avg 60000`,
        desc: "Server-side average per 60 000 ms bucket — the client gets windows, not raw ticks.",
      },
      {
        title: "Set up automatic downsampling",
        cmd: `TS.CREATE fx:USDINR:1m LABELS pair USDINR rollup 1m\nTS.CREATERULE fx:USDINR fx:USDINR:1m AGGREGATION avg 60000`,
        desc: "New raw ticks now roll into a 1-minute average series automatically — retention tiers, no cron.",
      },
      {
        title: "Record channel latencies",
        cmd: `TS.ADD chan:web:lat * 42 LABELS kind latency channel web\nTS.ADD chan:mob:lat * 55 LABELS kind latency channel mob`,
        desc: "Two latency series, labeled so they can be queried together.",
      },
      {
        title: "Fleet view by label",
        cmd: `TS.MRANGE - + AGGREGATION max 60000 FILTER kind=latency`,
        desc: "Max-per-minute latency for every channel labeled kind=latency, in one call.",
      },
    ],
  },
};

// ===========================================================================
// Geospatial
// ===========================================================================
const GEOSPATIAL_MODULE: ModuleSpec = {
  id: "geospatial",
  meta: {
    name: "Geospatial",
    alias: "Redis Geospatial",
    icon: "geospatial",
    tagline: "Location indexing with radius and bounding-box queries",
    whatItIs:
      "Redis Geospatial indexes longitude/latitude points and answers 'what's near here?' with radius and bounding-box queries, distance calculation and sorting — in-memory and sub-millisecond. The same geo fields can live inside a Query Engine index, combinable with text, tag and numeric filters.",
    link: {
      label: "redis.io · Geospatial",
      href: "https://redis.io/docs/latest/develop/data-types/geospatial/",
    },
  },
  useCases: [
    {
      title: "ATM / branch / agent locator",
      detail:
        "Find the nearest ATMs, branches or business-correspondent agents to a customer, sorted by distance, in one query.",
      primitives: "Geospatial",
    },
    {
      title: "Geo-fenced offers",
      detail:
        "Trigger merchant or branch offers when a customer is within a radius of a location — evaluated in real time.",
      primitives: "Geospatial",
    },
    {
      title: "Impossible-travel fraud",
      detail:
        "Compare the distance and time between two transactions to flag physically impossible travel between locations.",
      primitives: "Geospatial",
    },
    {
      title: "Branch coverage & planning",
      detail:
        "Query points within a bounding box to analyze service coverage and white-space for a region.",
      primitives: "Geospatial · Search",
    },
  ],
  how: {
    title: "Add points, ask what's near, sort by distance",
    description:
      "GEOADD stores members at lon/lat (encoded as a sorted set under the hood). GEOSEARCH finds members within a radius or box of a point or another member, optionally returning distance and coordinates and sorting nearest-first. Put the geo field in a Search index to combine 'near here' with business filters.",
    flow: [
      { icon: "MapPin", title: "Index points", sub: "GEOADD lon lat name" },
      { icon: "Search", title: "Search area", sub: "GEOSEARCH radius / box" },
      { icon: "Sigma", title: "Distance & sort", sub: "WITHDIST · ASC" },
      { icon: "redis-search", title: "Combine filters", sub: "geo in a Search index" },
    ],
    notes: [
      { t: "Radius or box", b: "GEOSEARCH supports FROMLONLAT / FROMMEMBER with BYRADIUS or BYBOX — 'within 5 km' or 'within this rectangle'." },
      { t: "Distance-aware", b: "Return and sort by distance (WITHDIST, ASC) so the nearest result is first — no Haversine in app code." },
      { t: "Hybrid with Search", b: "A GEO field inside a Query Engine index combines 'near here' with tag/numeric/text filters in one query." },
    ],
  },
  features: [
    {
      id: "geo-add",
      name: "Geo indexing",
      icon: "geospatial",
      what: "GEOADD stores members with longitude/latitude; GEOPOS and GEODIST read back coordinates and the distance between two members.",
      usecase:
        "Index every ATM with its coordinates so the network is queryable by location.",
      pattern: `atms → { atm:MUM01@(72.8777,19.0760), atm:MUM02@(72.83,19.11) }`,
      query: `GEOADD atms 72.8777 19.0760 atm:MUM01
GEOADD atms 72.8300 19.1100 atm:MUM02
GEODIST atms atm:MUM01 atm:MUM02 km`,
      output: "Two ATMs indexed; GEODIST returns the straight-line distance between them in km (e.g. ~5.4).",
      outcome:
        "A live, queryable location index for the ATM/branch network — coordinates and distances on demand.",
      without:
        "Store lat/long in columns and compute Haversine in code, or deploy and sync a separate PostGIS database.",
    },
    {
      id: "geo-radius",
      name: "Radius & box search",
      icon: "Search",
      what: "GEOSEARCH finds members within a radius (BYRADIUS) or rectangle (BYBOX) of a point or member, with WITHDIST and ASC for nearest-first results.",
      usecase:
        "Show the nearest ATMs within 5 km of the customer's current location, closest first.",
      pattern: "atms index populated with the ATM network.",
      query: `GEOSEARCH atms FROMLONLAT 72.88 19.07 BYRADIUS 5 km ASC WITHDIST
GEOSEARCH atms FROMMEMBER atm:MUM01 BYBOX 10 10 km ASC`,
      output: "Returns ATMs within 5 km ordered by distance (with km), and those within a 10×10 km box around atm:MUM01.",
      outcome:
        "‘What's near here’ answered in the query — distance-sorted — for locators and geo-fencing.",
      without:
        "Pull all points and filter/sort by computed distance in app code on every request — slow as the set grows.",
    },
    {
      id: "geo-hybrid",
      name: "Geo inside Search",
      icon: "redis-search",
      what: "Index a lon/lat as a GEO field in a Query Engine index so a location filter (@loc:[lon lat r km]) combines with tag, numeric and text conditions in one query.",
      usecase:
        "Find open, cash-enabled ATMs within 5 km — location AND attributes evaluated together.",
      pattern: "atm docs as JSON with $.loc AS GEO, $.status AS TAG, $.cash AS NUMERIC.",
      query: `FT.SEARCH idx:atm
  "@status:{open} @cash:[1 +inf] @loc:[72.88 19.07 5 km]"`,
      output: "Returns only ATMs that are open, hold cash, AND fall within 5 km — one query, no post-filtering.",
      outcome:
        "Location and business rules resolved together — the locator respects availability, not just proximity.",
      without:
        "Geo-filter in one system and attribute-filter in another, then reconcile the two candidate sets in code.",
    },
  ],
  personaValue: {
    Dev: "‘Nearest / within radius’ as a single command, distance-sorted — no Haversine math or geo library to wire in.",
    SA: "Locator, geo-fencing and impossible-travel patterns on the engine you already run — and combinable with Search.",
    DB: "Geo indexing co-located with the rest of the data — no separate spatial database to license and keep in sync.",
  },
  demo: {
    intro:
      "Index a small ATM network and run proximity queries, then combine geo with business filters. Paste in order — the geo set is built as you go.",
    steps: [
      {
        title: "Index ATM locations",
        cmd: `GEOADD atms 72.8777 19.0760 atm:MUM01\nGEOADD atms 72.8300 19.1100 atm:MUM02\nGEOADD atms 73.8567 18.5204 atm:PUN01`,
        desc: "Three ATMs in Mumbai and Pune, each stored at its longitude/latitude.",
      },
      {
        title: "Distance between two ATMs",
        cmd: `GEODIST atms atm:MUM01 atm:MUM02 km`,
        desc: "Straight-line distance in km — no client-side trigonometry.",
      },
      {
        title: "Nearest within 5 km",
        cmd: `GEOSEARCH atms FROMLONLAT 72.88 19.07 BYRADIUS 5 km ASC WITHDIST`,
        desc: "ATMs within 5 km of a point, nearest first, with the distance returned.",
      },
      {
        title: "Within a bounding box",
        cmd: `GEOSEARCH atms FROMMEMBER atm:MUM01 BYBOX 20 20 km ASC`,
        desc: "Everything inside a 20×20 km box centered on atm:MUM01.",
      },
      {
        title: "Read back coordinates",
        cmd: `GEOPOS atms atm:PUN01`,
        desc: "Confirm the stored lon/lat of a member.",
      },
    ],
  },
};

// ===========================================================================
// Probabilistic
// ===========================================================================
const PROBABILISTIC_MODULE: ModuleSpec = {
  id: "probabilistic",
  meta: {
    name: "Probabilistic",
    alias: "Redis Bloom & sketches",
    icon: "probabilistic",
    tagline: "Set membership and frequency at scale, in tiny fixed memory",
    whatItIs:
      "Probabilistic data structures answer 'have I seen this?' and 'how often / what's trending?' over huge streams using a tiny, fixed amount of memory — trading a controllable error rate for orders-of-magnitude savings. Bloom and Cuckoo filters test membership; Count-Min Sketch estimates frequency; Top-K tracks heavy hitters.",
    link: {
      label: "redis.io · Probabilistic",
      href: "https://redis.io/docs/latest/develop/data-types/probabilistic/",
    },
  },
  useCases: [
    {
      title: "Duplicate-transaction check",
      detail:
        "Test whether a transaction / request id has been seen before in O(1) and a few MB, dropping replays at the edge.",
      primitives: "Bloom / Cuckoo",
    },
    {
      title: "Mule / blacklist screening",
      detail:
        "Check accounts, devices or cards against a very large blacklist instantly, with a tiny memory footprint.",
      primitives: "Bloom / Cuckoo",
    },
    {
      title: "Unique counts at scale",
      detail:
        "Estimate unique payers, devices or daily-active users across billions of events without storing every id.",
      primitives: "HyperLogLog",
    },
    {
      title: "Trending / heavy hitters",
      detail:
        "Track the most frequent merchants, MCC codes or APIs (Top-K) and approximate frequencies (Count-Min) live.",
      primitives: "Top-K · Count-Min",
    },
  ],
  how: {
    title: "Trade a tiny error for huge memory savings",
    description:
      "Instead of storing every element, these structures keep a compact sketch. A Bloom/Cuckoo filter can say 'definitely not seen' or 'probably seen' within a configured error rate; Count-Min estimates a count; Top-K keeps the current heavy hitters. You size the error you can tolerate and get constant, tiny memory in return.",
    flow: [
      { icon: "Filter", title: "Reserve a sketch", sub: "BF.RESERVE error capacity" },
      { icon: "Workflow", title: "Add items", sub: "BF.ADD · CMS.INCRBY · TOPK.ADD" },
      { icon: "Search", title: "Query", sub: "EXISTS · QUERY · LIST" },
      { icon: "Gauge", title: "Tiny, fixed memory", sub: "MB, not GB" },
    ],
    notes: [
      { t: "No false negatives (Bloom)", b: "A Bloom filter never says 'not seen' for something it has seen — only a small, bounded false-positive rate the other way." },
      { t: "Cuckoo can delete", b: "Cuckoo filters support deletion and counting, useful when membership changes (e.g. removing an id from a set)." },
      { t: "Frequency & top-K", b: "Count-Min Sketch estimates per-item frequency and Top-K tracks the current heavy hitters — both in fixed memory." },
    ],
  },
  features: [
    {
      id: "prob-bloom",
      name: "Bloom filter",
      icon: "probabilistic",
      what: "BF.RESERVE creates a filter at a target error rate and capacity; BF.ADD records membership and BF.EXISTS tests it — 'definitely no' or 'probably yes' in O(1).",
      usecase:
        "Drop duplicate UPI requests: has this transaction id already been processed?",
      pattern: `seen:txn  (error 0.001, capacity 1,000,000)`,
      query: `BF.RESERVE seen:txn 0.001 1000000
BF.ADD     seen:txn txn:88123
BF.EXISTS  seen:txn txn:88123
BF.EXISTS  seen:txn txn:00000`,
      output: "BF.ADD → 1 (new); EXISTS txn:88123 → 1 (probably seen); EXISTS txn:00000 → 0 (definitely not). ~1.8 MB at this size.",
      outcome:
        "Replay/duplicate detection over millions of ids in a few MB — instant, at the edge, before the core is touched.",
      without:
        "Keep a growing set of every id (gigabytes) or hit the database for an existence check on every single request.",
    },
    {
      id: "prob-cuckoo",
      name: "Cuckoo filter (deletable)",
      icon: "Filter",
      what: "Like a Bloom filter but supports deletion and counting — CF.ADD / CF.EXISTS / CF.DEL — for membership sets that change over time.",
      usecase:
        "Maintain a live mule-account blacklist where entries are added and also removed when cleared.",
      pattern: `blacklist:acct  (cuckoo filter)`,
      query: `CF.RESERVE blacklist:acct 1000000
CF.ADD     blacklist:acct C9999
CF.EXISTS  blacklist:acct C9999
CF.DEL     blacklist:acct C9999`,
      output: "Account flagged then cleared: EXISTS → 1 after ADD, → 0 after DEL — membership that can change, in tiny memory.",
      outcome:
        "A space-efficient membership set you can update both ways — fits dynamic blacklists and allow-lists.",
      without:
        "A full set/table of entries plus deletion logic, or a Bloom filter you must rebuild whenever something is removed.",
    },
    {
      id: "prob-cms",
      name: "Count-Min Sketch",
      icon: "Sigma",
      what: "CMS.INITBYPROB sizes a sketch by error/probability; CMS.INCRBY adds counts and CMS.QUERY estimates the frequency of an item — in fixed memory regardless of stream size.",
      usecase:
        "Approximate how many times a merchant or MCC appears in the live transaction stream for hot-spot detection.",
      pattern: `freq:mcc  (Count-Min sketch)`,
      query: `CMS.INITBYPROB freq:mcc 0.001 0.01
CMS.INCRBY freq:mcc 6011 5 5411 3
CMS.QUERY  freq:mcc 6011 5411`,
      output: "Estimated counts returned for MCC 6011 and 5411 (≈5 and ≈3) — frequency over an unbounded stream in fixed memory.",
      outcome:
        "Per-item frequency at stream scale without a counter per key — bounded memory, bounded error.",
      without:
        "A hash/counter per distinct item (unbounded memory) or windowed GROUP BY counts in a warehouse, batch and stale.",
    },
    {
      id: "prob-topk",
      name: "Top-K heavy hitters",
      icon: "real-time-analytics",
      what: "TOPK.RESERVE tracks the K most frequent items; TOPK.ADD feeds the stream and TOPK.LIST returns the current leaders — ideal for 'what's trending now'.",
      usecase:
        "Surface the top merchants / APIs / MCCs by volume in real time for monitoring and anomaly spotting.",
      pattern: `topk:mcc  (K = 5)`,
      query: `TOPK.RESERVE topk:mcc 5
TOPK.ADD     topk:mcc 6011 6011 5411 6011 5814
TOPK.LIST    topk:mcc`,
      output: "TOPK.LIST returns the current heavy hitters (6011 leading) — the live leaderboard of the stream.",
      outcome:
        "A live top-N over a high-volume stream in fixed memory — trending merchants/APIs without a full sort.",
      without:
        "Count everything then ORDER BY … LIMIT on each refresh, or maintain a sorted set of every distinct item.",
    },
  ],
  personaValue: {
    Dev: "Membership, frequency and top-N answered with one command and a few MB — no giant sets or per-item counters to manage.",
    DB: "Offload duplicate/blacklist checks and unique counts from the core into tiny sketches with a tunable error budget.",
    SA: "Fraud and analytics patterns (dedupe, blacklist, trending) run inline at stream scale, not as stale batch jobs.",
  },
  demo: {
    intro:
      "Try each probabilistic structure — a Bloom dedupe, a deletable Cuckoo blacklist, a Count-Min frequency sketch and a Top-K leaderboard. Paste in order; each creates its own key.",
    note: "BF.* / CF.* / CMS.* / TOPK.* are provided by the probabilistic module bundled with Redis (Redis Stack / Redis 8).",
    steps: [
      {
        title: "Reserve a Bloom filter",
        cmd: `BF.RESERVE seen:txn 0.001 1000000`,
        desc: "A filter sized for 1M ids at a 0.1% false-positive rate — a few MB total.",
      },
      {
        title: "Dedupe a transaction id",
        cmd: `BF.ADD seen:txn txn:88123\nBF.EXISTS seen:txn txn:88123\nBF.EXISTS seen:txn txn:00000`,
        desc: "ADD records it; EXISTS returns 1 (probably seen) for the known id and 0 (definitely not) for an unseen one.",
      },
      {
        title: "Deletable blacklist (Cuckoo)",
        cmd: `CF.RESERVE blacklist:acct 1000000\nCF.ADD blacklist:acct C9999\nCF.EXISTS blacklist:acct C9999\nCF.DEL blacklist:acct C9999`,
        desc: "Flag then clear an account — Cuckoo supports deletion, unlike a plain Bloom filter.",
      },
      {
        title: "Frequency with Count-Min",
        cmd: `CMS.INITBYPROB freq:mcc 0.001 0.01\nCMS.INCRBY freq:mcc 6011 5 5411 3\nCMS.QUERY freq:mcc 6011 5411`,
        desc: "Estimate how often each MCC appears in the stream — fixed memory, bounded error.",
      },
      {
        title: "Top-K heavy hitters",
        cmd: `TOPK.RESERVE topk:mcc 5\nTOPK.ADD topk:mcc 6011 6011 5411 6011 5814\nTOPK.LIST topk:mcc`,
        desc: "Track and list the most frequent MCCs live — a trending leaderboard in fixed memory.",
      },
      {
        title: "Unique counts (HyperLogLog)",
        cmd: `PFADD uniq:payers C1001 C1006 C1001\nPFCOUNT uniq:payers`,
        desc: "Count distinct payers within ~0.81% error in a fixed 12 KB — duplicates collapse automatically.",
      },
    ],
  },
};

// ===========================================================================
// Vector
// ===========================================================================
const VECTOR_MODULE: ModuleSpec = {
  id: "vector",
  meta: {
    name: "Vector",
    alias: "Redis Vector search",
    icon: "redis-vector-database",
    tagline: "Similarity search and RAG, on the same real-time engine",
    whatItIs:
      "Redis stores embeddings as a VECTOR field and runs k-nearest-neighbor similarity search over them, with HNSW or FLAT indexes and hybrid pre-filtering by tag/numeric/text. It's the vector database, semantic cache and online feature store behind fraud ML and GenAI — co-located with the operational data, at sub-millisecond latency.",
    link: {
      label: "redis.io · Vectors",
      href: "https://redis.io/docs/latest/develop/interact/search-and-query/advanced-concepts/vectors/",
    },
  },
  useCases: [
    {
      title: "Policy & FAQ semantic search",
      detail:
        "Embed bank policies and FAQs; answer plain-language questions by similarity, grounding GenAI on approved content (RAG).",
      primitives: "Vector · Search",
    },
    {
      title: "Look-alike customer targeting",
      detail:
        "Find customers semantically similar to a seed profile, within a business segment, for next-best-action.",
      primitives: "Vector · Search",
    },
    {
      title: "Scam / fraud similarity",
      detail:
        "Match a transaction or message against known-fraud embeddings to catch variants that rules miss.",
      primitives: "Vector",
    },
    {
      title: "Semantic cache (LangCache)",
      detail:
        "Serve a cached answer when a new prompt is semantically close to a previous one — cut LLM latency and cost.",
      primitives: "Vector",
    },
  ],
  how: {
    title: "Embed, index, search by similarity — with filters",
    description:
      "An embedding model turns text/images into vectors. Store each vector on a JSON or Hash key, build a VECTOR index (HNSW for speed at scale, FLAT for exactness), then run KNN to find the nearest vectors to a query — optionally pre-filtered by tag/numeric so similarity respects business rules.",
    flow: [
      { icon: "Sparkles", title: "Embed", sub: "model → vector" },
      { icon: "redis-vector-database", title: "Index", sub: "VECTOR HNSW / FLAT" },
      { icon: "Search", title: "KNN search", sub: "nearest by distance" },
      { icon: "Filter", title: "Hybrid filter", sub: "tag/numeric => KNN" },
    ],
    notes: [
      { t: "HNSW or FLAT", b: "FLAT is exact (small sets); HNSW is approximate and fast at scale — pick per index by latency vs recall needs." },
      { t: "Hybrid in one pass", b: "Pre-filter by tag/numeric, then KNN within the matches — semantics and business rules evaluated together." },
      { t: "RedisVL", b: "The RedisVL Python library builds the index, manages embeddings and runs VectorQuery/semantic-cache with a clean API." },
    ],
  },
  features: [
    {
      id: "vec-index",
      name: "Vector index",
      icon: "redis-vector-database",
      what: "Declare a VECTOR field (HNSW or FLAT) with a distance metric and dimension in an FT.CREATE index over JSON/Hash keys storing the embeddings.",
      usecase:
        "Index embeddings of policy/FAQ chunks so they can be retrieved by meaning.",
      pattern: `doc:* → { text, embedding:<float32[768]> }`,
      query: `FT.CREATE idx:doc ON HASH PREFIX 1 doc:
  SCHEMA text TEXT
         embedding VECTOR HNSW 6 TYPE FLOAT32
           DIM 768 DISTANCE_METRIC COSINE`,
      output: "An HNSW vector index over doc:* — embeddings are now searchable by cosine similarity.",
      outcome:
        "A vector database on the same engine as the operational data — one system to run, secure and scale.",
      without:
        "Stand up a separate vector DB and sync embeddings and metadata between it and your system of record.",
    },
    {
      id: "vec-knn",
      name: "KNN similarity search",
      icon: "Search",
      what: "Run a k-nearest-neighbor query to return the documents whose vectors are closest to a query vector, ordered by distance/score.",
      usecase:
        "Retrieve the top policy chunks most relevant to a customer's natural-language question (RAG context).",
      pattern: "idx:doc holds embedded policy chunks.",
      query: `FT.SEARCH idx:doc
  "*=>[KNN 5 @embedding $vec AS score]"
  PARAMS 2 vec <query-vector> SORTBY score DIALECT 2`,
      output: "Top-5 nearest chunks with a similarity score — the grounded context passed to the LLM, in <20 ms.",
      outcome:
        "Meaning-based retrieval over your own approved content — the heart of grounded, low-hallucination GenAI.",
      without:
        "Keyword search that misses paraphrases, or a separate ANN service to call and reconcile per request.",
    },
    {
      id: "vec-hybrid",
      name: "Hybrid vector + filter",
      icon: "Filter",
      what: "Combine a tag/numeric/text pre-filter with KNN in one query, so similarity is computed only within the rows that satisfy the business rule.",
      usecase:
        "Find look-alike customers most similar to a seed — but only within the Priority segment.",
      pattern: "cust docs carry $.embedding VECTOR + $.segment TAG.",
      query: `FT.SEARCH idx:cust
  "(@segment:{Priority})=>[KNN 10 @embedding $vec AS score]"
  PARAMS 2 vec <seed-vector> SORTBY score DIALECT 2`,
      output: "Top-10 Priority customers nearest the seed profile — semantic rank and segment filter in a single pass.",
      outcome:
        "Similarity and business rules resolved together — no large candidate pull and post-filter across systems.",
      without:
        "KNN in a vector DB, then filter by segment in another store — two hops, slower and inconsistent.",
    },
  ],
  personaValue: {
    Dev: "RedisVL gives a clean Python API for indexing, KNN and semantic caching — ship RAG and similarity features in days.",
    SA: "One platform for vectors, cache, session and features — fewer AI moving parts to integrate and govern.",
    DB: "Embeddings and grounding data co-located and access-controlled with the operational data — no second store to sync.",
  },
  demo: {
    intro:
      "Vectors come from an embedding model, so the cleanest way to run this end-to-end is RedisVL (Python). The FT.CREATE index and KNN query below are exactly what Redis executes; the index is real RedisInsight, the embeddings are produced by your model.",
    note: "Embeddings are generated by a model (e.g. via RedisVL), not typed by hand — DIM/metric must match your model's output.",
    steps: [
      {
        title: "Create a vector index",
        cmd: `FT.CREATE idx:doc ON HASH PREFIX 1 doc: SCHEMA text TEXT embedding VECTOR HNSW 6 TYPE FLOAT32 DIM 768 DISTANCE_METRIC COSINE`,
        desc: "An HNSW index over doc:* with a 768-dim cosine vector field — runs as-is in RedisInsight.",
      },
      {
        title: "Index documents with RedisVL",
        cmd: `# Python (RedisVL)\nfrom redisvl.index import SearchIndex\nindex = SearchIndex.from_yaml("doc_schema.yaml")\nindex.connect("redis://localhost:12000")\nindex.load(records)   # each record: {text, embedding}`,
        desc: "RedisVL writes each chunk's text + embedding into doc:* keys against your database on :12000.",
      },
      {
        title: "KNN query (raw Redis)",
        cmd: `FT.SEARCH idx:doc "*=>[KNN 5 @embedding $vec AS score]" PARAMS 2 vec <query-vector> SORTBY score DIALECT 2`,
        desc: "The exact similarity query — return the 5 nearest chunks. $vec is the query embedding as bytes.",
      },
      {
        title: "KNN query with RedisVL",
        cmd: `# Python (RedisVL)\nfrom redisvl.query import VectorQuery\nq = VectorQuery(vector=embed("early FD withdrawal penalty"),\n  vector_field_name="embedding", return_fields=["text"], num_results=5)\nresults = index.query(q)`,
        desc: "RedisVL embeds the question and runs the KNN for you — the top-5 grounded chunks for RAG.",
      },
      {
        title: "Hybrid: filter then KNN",
        cmd: `FT.SEARCH idx:cust "(@segment:{Priority})=>[KNN 10 @embedding $vec AS score]" PARAMS 2 vec <seed-vector> SORTBY score DIALECT 2`,
        desc: "Similarity within a business filter — look-alike customers inside the Priority segment, one pass.",
      },
    ],
  },
};

export const MODULES: Record<string, ModuleSpec> = {
  json: JSON_MODULE,
  streams: STREAMS_MODULE,
  pubsub: PUBSUB_MODULE,
  timeseries: TIMESERIES_MODULE,
  geospatial: GEOSPATIAL_MODULE,
  probabilistic: PROBABILISTIC_MODULE,
  vector: VECTOR_MODULE,
};
