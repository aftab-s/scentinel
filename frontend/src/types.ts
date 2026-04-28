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
  clones: CloneSuggestion[];  // Changed from single clone to array
  ai_insight?: string;
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
  price: number;
  currency: string;
  reason: string;
}
