export interface Fragrance {
  id: string;
  brand: string;
  name: string;
  accords: string[];
  price?: number;
  currency?: string;
  notes?: {
    top: string[];
    middle: string[];
    base: string[];
  };
  image_url?: string;
}

export interface UserProfile {
  loved: Fragrance[];
  hated: Fragrance[];
}

export interface RiskResult {
  score: number;
  verdict: string;
  breakdown: AccordScore[];
  clones: CloneSuggestion[];
  ai_insight?: string;
  ai_risk_breakdown?: string;
  ai_layering_suggestion?: string;
}

export interface AccordScore {
  accord: string;
  targetHas: boolean;
  loveScore: number;
  hateScore: number;
}

export interface CloneSuggestion {
  brand: string;
  name: string;
  price?: number | null;
  currency: string;
  reason: string;
  url?: string;
  source?: string;
}
