"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Copy } from "lucide-react";
import type { Pillar, UseCase } from "@/lib/types";
import { PERSONAS } from "@/data/ecosystem";
import { PillarIcon } from "./icons";
import { Flow, SectionLabel, Stat, Steps } from "./ui";

function CodeBlock({ lang, content }: { lang: string; content: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#0C2530] px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-dusk30">
          {lang}
        </span>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 text-xs text-dusk30 transition-colors hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-yellow" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto bg-midnight p-4 font-mono text-[12.5px] leading-relaxed text-[#D5E0E3]">
        {content}
      </pre>
    </div>
  );
}

export function UseCasePanel({
  pillar,
  useCase,
  onBack,
}: {
  pillar: Pillar;
  useCase: UseCase;
  onBack: () => void;
}) {
  const personaEntries = useCase.personaValue
    ? (Object.keys(useCase.personaValue) as (keyof typeof useCase.personaValue)[])
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      <button onClick={onBack} className="btn btn-ghost !px-3 !py-1.5 text-xs">
        <ArrowLeft className="h-4 w-4" /> {pillar.name}
      </button>

      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-faint">
          <PillarIcon name={pillar.icon} className="h-4 w-4 text-redis-soft" />
          {pillar.name}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-fg">
            {useCase.name}
          </h1>
          {useCase.flagship && (
            <span className="chip chip-accent">Flagship demo</span>
          )}
        </div>
      </div>

      <section className="space-y-2.5">
        <SectionLabel>Business problem</SectionLabel>
        <div className="rounded-xl border border-line border-l-2 border-l-redis bg-surface2/40 px-4 py-3.5">
          <p className="max-w-3xl text-[15px] leading-relaxed text-fg/90">
            {useCase.problem}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <SectionLabel>Reference architecture</SectionLabel>
        <Flow steps={useCase.architecture} />
      </section>

      {useCase.metrics && useCase.metrics.length > 0 && (
        <section className="space-y-3">
          <SectionLabel>Impact</SectionLabel>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {useCase.metrics.map((m) => (
              <Stat key={m.label} metric={m} />
            ))}
          </div>
        </section>
      )}

      {useCase.demo && useCase.demo.length > 0 && (
        <section className="space-y-3">
          <SectionLabel>Live demo flow</SectionLabel>
          <Steps items={useCase.demo} />
        </section>
      )}

      {personaEntries.length > 0 && (
        <section className="space-y-3">
          <SectionLabel>Value by stakeholder</SectionLabel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {personaEntries.map((pid) => (
              <div key={pid} className="card p-4">
                <div className="text-xs font-semibold text-redis">
                  {PERSONAS.find((p) => p.id === pid)?.label ?? pid}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {useCase.personaValue?.[pid]}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {useCase.code && (
        <section className="space-y-3">
          <SectionLabel>Sample</SectionLabel>
          <CodeBlock lang={useCase.code.lang} content={useCase.code.content} />
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <a
          href="https://redis.io/try-free/"
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary"
        >
          Run it on Redis
        </a>
        <button onClick={onBack} className="btn btn-ghost">
          Back to {pillar.name}
        </button>
        <span className="text-xs text-faint">
          Concept walkthrough · synthetic banking data · no real PII
        </span>
      </div>
    </motion.div>
  );
}
