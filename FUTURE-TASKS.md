# Redis — Beyond Caching · Future Tasks (Backlog)

> 📌 **Deferred work — captured for later, not to be done now.**
> These are ideas, gaps and polish items surfaced during the Redis Search review.
> Nothing here is committed/scheduled; pick items when you're ready.

Last updated: 2026-06-15

---

## 1. Redis Search — quick accuracy fixes

Small text edits in `src/data/capabilities.ts` (`SEARCH_FEATURES`).

- [ ] **Aggregations card — Delhi AUM.** Output text says `Delhi n=3 · ₹1.34 Cr`, but the live engine computes **₹1.30 Cr** (12,997,000). Now that the live "Group by city" demo shows AUM, the two are visibly inconsistent. → change to `₹1.30 Cr`.
- [ ] **Secondary indexing card — doc count.** Output says `Index live over 16,384 cust:* docs`, but the live index has **16** docs (`num_docs = 16`). `16,384` is actually the Redis Cluster **hash-slot** count, not a doc count. → change to a realistic/illustrative figure (e.g. "16 demo profiles; scales to 100s of millions").

---

## 2. Redis Search — make illustrative cards runnable live

These two feature cards are currently **catalog/illustrative only** (no backing data in the seeded `idx:cust` index).

- [ ] **Multi-value & array fields** → make it live:
  - Reseed `DEMO_CUSTOMERS` with a `tags` array (e.g. `["NRI","HNW","Demat","UPI-active"]`).
  - Add `$.tags[*] AS tags TAG` to the index in `src/lib/redis.ts` and **bump `SEED_VERSION`**.
  - Add a "Has tag" preset to `src/components/SearchPlayground.tsx`.
- [ ] **Hybrid vector search** → make it live:
  - Add an `$.embedding AS VECTOR` field to the seed + index (needs a small embedding source / fixed vectors).
  - Add a vector/KNN preset to the playground.

---

## 3. Redis Search — new feature cards (content gaps)

Engine capabilities not yet represented, in rough priority for a banking audience. Add as new `SEARCH_FEATURES` cards (same shape as existing).

- [ ] **Auto-complete / suggestion dictionary** (`FT.SUGADD` / `FT.SUGGET`) — payee/beneficiary search box, distinct from prefix.
- [ ] **Synonyms** (`FT.SYNUPDATE`) — e.g. `FD`="Fixed Deposit", `a/c`="account".
- [ ] **Spellcheck / "did you mean"** (`FT.SPELLCHECK`).
- [ ] **Highlighting & summarization** (`HIGHLIGHT` / `SUMMARIZE`) — show the matched snippet in transaction-narration search.
- [ ] **Profiling & explainability** (`FT.PROFILE` / `FT.EXPLAIN` / `SLOWLOG`) — for the SRE/DB persona.

---

## 4. Redis Search — Scale & HA section (no big dataset needed)

The biggest content gap for SRE / DB heads ("does this hold at 50M customers and survive a node loss?"). Can be told **without loading lots of data**.

- [ ] Build a self-contained **"Scale & HA"** section in the Search deep-dive:
  - Scatter-gather **architecture diagram**: client → coordinator → N shards, each master + replica (pure SVG/markup, no data).
  - **Measured → projected sizing** table, grounded in live `FT.INFO` (~**1.64 KB/profile** measured today → 1M ≈ 1.6 GB, 10M ≈ 16 GB, 50M ≈ 80 GB). State it's index-only and a linear upper bound.
  - **Resilience strip** (4 tiles): replication + auto-failover · rack/zone awareness · persistence (AOF/snapshot) · Auto Tiering for cost.
  - **Active-Active note**: local index per region, CRDT convergence, and the honest version/feature caveat.
  - **"Prove it live" callout**: `FT.INFO idx:cust` · `rladmin status` · Cluster Manager `https://localhost:8443`.
- [ ] *(Optional — only if a live failover demo is wanted)* The current DB is **single-node, 1 shard, replication & persistence disabled**. Enable replication on `db:1` (data is tiny) for shard-promotion, or stand up a 2-node cluster for true node-loss survival. This is a setup change, not a data change.

---

## 5. Redis Search — visualization / UX polish

- [ ] **Copy buttons** on each feature-card query and each RedisInsight script step (the playground already has copy; the static blocks don't).
- [ ] **Link feature cards → live demo** — clicking a card loads that preset in the playground, tying the static catalog to the interactive demo.
- [x] ~~**Real data-flow diagram** in "How it works": source systems → RDI → Redis index → channels / apps / AI.~~ — done; merged context + engine diagram applied live.
- [ ] **Progressive disclosure** on feature cards — make "Worked example" and "Without Redis Search" collapsible so the page scans faster (7–8 dense cards today).
- [x] ~~**RedisInsight screenshot/GIF** in the "Replace the ELK stack" section.~~ — dropped; RedisInsight runs locally and is shown live during the demo.

---

## 6. Other capability deep-dives (beyond Search)

Only **Search & query** has a full deep-dive today (`rich: true` in `src/data/capabilities.ts`). The other nine blocks fall back to a generic overview.

- [ ] Build rich deep-dives (features → banking use case → worked example → live demo → stakeholder value) for: **Strings/Hashes, Vector, JSON documents, Streams, Pub/Sub, Time series, Probabilistic, Geospatial, Sorted sets.**
  - Use the Search deep-dive (`SearchDeepDive.tsx`) as the template.

---

## 7. Environment / housekeeping (optional)

- [ ] **MCP server credential** — the DB password is stored in plaintext in `~/.cursor/mcp.json` (same `beyondcache` cred as `.env.local` / `CONNECTION-INFO.md`). Fine for local use; revisit if the machine is shared or the folder becomes a git repo.
- [ ] Keep `SEED_VERSION` in `src/lib/redis.ts` bumped whenever `DEMO_CUSTOMERS` changes, so the live instance re-seeds.
