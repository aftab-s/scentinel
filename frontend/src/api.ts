import type { Fragrance, RiskResult, UserProfile } from './types';

const API_BASE = '/api';

export interface FragranceSearchResult {
  brand: string;
  name: string;
  accords: string[];
  notes: {
    top: string[];
    middle: string[];
    base: string[];
  };
  image_url?: string;
}

export interface Currency {
  code: string;
  rate: number;
}

export async function searchFragrance(query: string): Promise<FragranceSearchResult> {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Search failed' }));
    throw new Error(err.detail || 'Fragrance not found');
  }
  
  return res.json();
}

export async function calculateRisk(
  target: Fragrance,
  profile: UserProfile
): Promise<RiskResult> {
  const res = await fetch(`${API_BASE}/calculate-risk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target_perfume: target,
      user_profile: profile,
    }),
  });
  
  if (!res.ok) throw new Error('Risk calculation failed');
  
  return res.json();
}

export async function getCurrencies(): Promise<{ currencies: string[]; rates: Record<string, number> }> {
  const res = await fetch(`${API_BASE}/currencies`);
  if (!res.ok) throw new Error('Failed to fetch currencies');
  return res.json();
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<{ amount: number; currency: string }> {
  const res = await fetch(`${API_BASE}/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, from_currency: from, to_currency: to }),
  });
  
  if (!res.ok) throw new Error('Conversion failed');
  return res.json();
}
