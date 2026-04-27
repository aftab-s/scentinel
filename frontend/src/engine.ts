import type { Fragrance, UserProfile, RiskResult, AccordScore, Accord } from './types';

const ALL_ACCORDS: Accord[] = [
  'Woody', 'Spicy', 'Sweet', 'Fresh', 'Floral', 'Citrus',
  'Aquatic', 'Gourmand', 'Musky', 'Earthy', 'Smoky', 'Powdery',
  'Leather', 'Oriental', 'Green', 'Fruity',
];

const CLONE_DB: Record<string, { brand: string; name: string; price: number; reason: string }> = {
  Woody: { brand: 'Zara', name: 'Vibrant Leather', price: 18, reason: 'Shares the dry woody base at a fraction of the cost.' },
  Spicy: { brand: 'Armaf', name: 'Club de Nuit Intense', price: 35, reason: 'Legendary spicy-smoky clone territory.' },
  Sweet: { brand: 'Dossier', name: 'Ambery Saffron', price: 29, reason: 'Warm sweet gourmand without the designer markup.' },
  Fresh: { brand: 'Nautica', name: 'Voyage', price: 22, reason: 'Clean aquatic freshness, universally loved.' },
  Floral: { brand: 'Zara', name: 'Rose Gourmand', price: 16, reason: 'Soft floral with surprising longevity.' },
  Oriental: { brand: 'Lattafa', name: 'Khamrah', price: 28, reason: 'Rich oriental depth at an unbeatable price.' },
  Leather: { brand: 'Armaf', name: 'Niche Oud', price: 40, reason: 'Dark leather-oud accord, punches above its weight.' },
  Citrus: { brand: 'Prada', name: 'Luna Rossa Carbon', price: 55, reason: 'Crisp citrus-metallic, widely available on discount.' },
};

export function calculateRisk(target: Fragrance, profile: UserProfile): RiskResult {
  let rawScore = 50; // neutral baseline

  // Collect love/hate accord frequencies
  const loveAccordCount: Partial<Record<Accord, number>> = {};
  const hateAccordCount: Partial<Record<Accord, number>> = {};

  for (const f of profile.loved) {
    for (const a of f.accords) {
      loveAccordCount[a] = (loveAccordCount[a] ?? 0) + 1;
    }
  }
  for (const f of profile.hated) {
    for (const a of f.accords) {
      hateAccordCount[a] = (hateAccordCount[a] ?? 0) + 1;
    }
  }

  // Brand heritage bonus
  const lovedBrands = profile.loved.map(f => f.brand.toLowerCase());
  if (lovedBrands.includes(target.brand.toLowerCase())) {
    rawScore += 5;
  }

  // Note matching
  for (const accord of target.accords) {
    if (loveAccordCount[accord]) rawScore += 10 * (loveAccordCount[accord] ?? 0);
    if (hateAccordCount[accord]) rawScore -= 15 * (hateAccordCount[accord] ?? 0);
  }

  // Clamp to 0–100
  const score = Math.min(100, Math.max(0, rawScore));

  // Verdict
  let verdict: string;
  if (score >= 80) {
    verdict = 'Signature Material. Pull the trigger.';
  } else if (score >= 50) {
    verdict = 'Get a decant first. High risk, high reward.';
  } else {
    verdict = 'Stop. Your wallet will thank you later.';
  }

  // Breakdown for radar
  const breakdown: AccordScore[] = ALL_ACCORDS.map(accord => ({
    accord,
    targetHas: target.accords.includes(accord),
    loveScore: loveAccordCount[accord] ?? 0,
    hateScore: hateAccordCount[accord] ?? 0,
  })).filter(a => a.targetHas || a.loveScore > 0 || a.hateScore > 0);

  // Clone suggestion
  let clone = undefined;
  if (score < 70 || (target.price ?? 0) > 100) {
    const dominantAccord = target.accords[0];
    clone = CLONE_DB[dominantAccord] ?? CLONE_DB['Fresh'];
  }

  return { score, verdict, breakdown, clone };
}
