export type PersonaId = "SA" | "SRE" | "DB" | "Dev";
export type LensId =
  | "speed"
  | "scale"
  | "resilience"
  | "cost"
  | "risk"
  | "innovation";
export type Tone = "success" | "info" | "warn" | "neutral";

export interface Persona {
  id: PersonaId;
  label: string;
  short: string;
  blurb: string;
}

export interface Lens {
  id: LensId;
  label: string;
}

export interface MaturityStage {
  stage: string;
  label: string;
  note: string;
}

export interface Metric {
  value: string;
  label: string;
  tone?: Tone;
}

export interface UseCase {
  id: string;
  name: string;
  flagship?: boolean;
  problem: string;
  architecture: string[];
  demo?: string[];
  metrics?: Metric[];
  personaValue?: Partial<Record<PersonaId, string>>;
  code?: { lang: string; content: string };
}

export interface Pillar {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  why: string;
  replaces: string[];
  capabilities: string[];
  lenses: LensId[];
  personas: PersonaId[];
  useCases: UseCase[];
  tag?: string;
  link?: { label: string; href: string };
}
