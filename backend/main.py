from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import json
import asyncio
import re
from groq import Groq

app = FastAPI(title="Scent-inel Risk Engine", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Groq client ──────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Load from .env file if not in environment
if not GROQ_API_KEY:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("GROQ_API_KEY="):
                    GROQ_API_KEY = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break

groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# ── Currency exchange rates (base USD) ───────────────────────────────────────
EXCHANGE_RATES = {
    "USD": 1.0,
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 149.5,
    "CAD": 1.36,
    "AUD": 1.52,
    "INR": 83.2,
    "CHF": 0.90,
}

# ── Models ───────────────────────────────────────────────────────────────────

class SearchRequest(BaseModel):
    query: str

class FragranceDetails(BaseModel):
    brand: str
    name: str
    accords: list[str]
    notes: dict[str, list[str]]
    image_url: Optional[str] = None
    source: Optional[str] = None  # "groq", "web_search", "fallback"

class Fragrance(BaseModel):
    id: str
    brand: str
    name: str
    accords: list[str]
    price: Optional[float] = None
    currency: str = "USD"
    notes: Optional[dict[str, list[str]]] = None

class UserProfile(BaseModel):
    loved: list[Fragrance]
    hated: list[Fragrance]

class RiskRequest(BaseModel):
    user_profile: UserProfile
    target_perfume: Fragrance

class AccordScore(BaseModel):
    accord: str
    targetHas: bool
    loveScore: int
    hateScore: int

class CloneSuggestion(BaseModel):
    brand: str
    name: str
    price: float
    currency: str
    reason: str

class RiskResponse(BaseModel):
    score: int
    verdict: str
    breakdown: list[AccordScore]
    clones: list[CloneSuggestion] = []  # Changed from single clone to list
    ai_insight: Optional[str] = None

class ConvertRequest(BaseModel):
    amount: float
    from_currency: str
    to_currency: str

# ── Tier 1: Groq AI Direct Lookup ────────────────────────────────────────────

# ── Tier 1: Groq AI Direct Lookup ────────────────────────────────────────────

def validate_fragrance_data(brand: str, name: str, accords: list, notes: dict) -> bool:
    """Validate that fragrance data looks reasonable."""
    # Check brand and name are not empty
    if not brand or not name:
        return False
    
    # Check brand/name don't look like placeholders
    placeholders = ["unknown", "n/a", "null", "none", "test", "example"]
    if brand.lower() in placeholders or name.lower() in placeholders:
        return False
    
    # Check accords are valid
    valid_accords = {
        "Woody", "Spicy", "Fresh", "Floral", "Citrus", "Sweet", "Musky", 
        "Earthy", "Smoky", "Leather", "Oriental", "Aquatic", "Gourmand", 
        "Powdery", "Green", "Fruity", "Aromatic", "Amber", "Vanilla", "Oud",
        "Animalic", "Balsamic", "Herbal", "Mineral", "Ozonic", "Resinous"
    }
    
    if accords:
        # Check at least some accords are valid
        valid_count = sum(1 for a in accords if a in valid_accords)
        if valid_count == 0:
            return False
    
    # Check notes structure
    if notes:
        # Notes should have at least one layer with content
        has_notes = (
            (notes.get("top") and len(notes["top"]) > 0) or
            (notes.get("middle") and len(notes["middle"]) > 0) or
            (notes.get("base") and len(notes["base"]) > 0)
        )
        # It's okay if notes are empty, but if present they should be valid
    
    return True


def search_via_groq(query: str) -> Optional[FragranceDetails]:
    """Tier 1: Use Groq LLM to look up fragrance details from its training data."""
    if not groq_client:
        return None

    prompt = f"""You are an expert perfume database with knowledge of thousands of fragrances. 

Query: "{query}"

CRITICAL INSTRUCTIONS:
1. If you recognize this fragrance with HIGH certainty, return accurate details
2. If you're unsure or don't recognize it, set confidence to "low"
3. DO NOT guess or make up details for unknown fragrances
4. Brand and name must match the actual fragrance exactly
5. Notes must be the ACTUAL notes used in this specific fragrance

Respond with ONLY valid JSON (no markdown, no explanation):
{{
  "brand": "Exact Brand Name",
  "name": "Exact Fragrance Name",
  "accords": ["Accord1", "Accord2", "Accord3", "Accord4"],
  "notes": {{
    "top": ["Actual Top Note 1", "Actual Top Note 2", "Actual Top Note 3"],
    "middle": ["Actual Middle Note 1", "Actual Middle Note 2"],
    "base": ["Actual Base Note 1", "Actual Base Note 2", "Actual Base Note 3"]
  }},
  "confidence": "high or low"
}}

Valid accords: Woody, Spicy, Fresh, Floral, Citrus, Sweet, Musky, Earthy, Smoky, Leather, Oriental, Aquatic, Gourmand, Powdery, Green, Fruity, Aromatic, Amber, Vanilla, Oud

Examples of ACTUAL notes: Bergamot, Lemon, Rose, Jasmine, Sandalwood, Cedarwood, Vanilla, Musk, Patchouli, Vetiver, Amber, Oud, Lavender, Pepper, Cardamom

Set confidence to "low" if:
- You don't recognize this fragrance
- The brand/name seems unusual or unfamiliar
- You're making educated guesses"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.05,  # Lower temperature for more accuracy
        )
        raw = response.choices[0].message.content.strip()

        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        data = json.loads(raw)
        
        # Validate the response
        brand = data.get("brand", "").strip()
        name = data.get("name", "").strip()
        accords = data.get("accords", [])
        if not isinstance(accords, list):
            accords = []
        notes = data.get("notes", {})
        if not isinstance(notes, dict):
            notes = {}
        confidence = data.get("confidence", "high").lower()
        
        # Additional validation checks
        if not brand or not name:
            print(f"Invalid response: missing brand or name")
            return None
        
        # Validate the data quality
        if not validate_fragrance_data(brand, name, accords, notes):
            print(f"Data validation failed for '{query}'")
            return None
        
        # If confidence is low, return None to trigger web search
        if confidence == "low":
            print(f"Groq has low confidence for '{query}', triggering web search")
            return None
        
        # Validate notes structure
        if not isinstance(notes, dict):
            notes = {"top": [], "middle": [], "base": []}
        else:
            notes = {
                "top": notes.get("top", [])[:5],
                "middle": notes.get("middle", [])[:5],
                "base": notes.get("base", [])[:5],
            }

        return FragranceDetails(
            brand=brand,
            name=name,
            accords=accords[:8],
            notes=notes,
            image_url=None,
            source="groq",
        )
    except Exception as e:
        print(f"Groq search error: {e}")
        return None


# ── Tier 2: Web Search + AI Extraction ───────────────────────────────────────

async def search_via_web(query: str) -> Optional[FragranceDetails]:
    """Tier 2: Use web search to find fragrance info, then extract with AI."""
    if not groq_client:
        return None
    
    try:
        # Step 1: Web search with very specific instructions
        search_prompt = f"""You are a fragrance expert. Search the web for accurate information about: "{query}"

CRITICAL REQUIREMENTS:
1. Find the EXACT brand name (not a guess)
2. Find the EXACT fragrance name (not a guess)
3. Find the ACTUAL notes used in this perfume (not generic guesses)
4. Find the main accords/families

If you cannot find reliable information, return null for that field.

Respond with ONLY valid JSON (no markdown):
{{
  "brand": "Exact Brand Name or null",
  "name": "Exact Fragrance Name or null",
  "accords": ["Accord1", "Accord2"] or [],
  "notes": {{
    "top": ["Actual Note 1", "Actual Note 2"] or [],
    "middle": ["Actual Note 1"] or [],
    "base": ["Actual Note 1", "Actual Note 2"] or []
  }},
  "description": "Brief description if found",
  "found": true or false
}}

Only return found: true if you found reliable information from fragrance websites, reviews, or official sources."""

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": search_prompt}],
            max_tokens=600,
            temperature=0.1,
        )
        
        raw = response.choices[0].message.content.strip()
        
        # Strip markdown
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()
        
        data = json.loads(raw)
        
        # Check if search was successful
        if not data.get("found", False):
            print(f"Web search found no reliable information for '{query}'")
            return None
        
        # Validate we got meaningful data
        brand = data.get("brand")
        name = data.get("name")
        
        if not brand or not name or brand == "null" or name == "null":
            print(f"Web search returned incomplete data")
            return None
        
        accords = data.get("accords", [])
        if not isinstance(accords, list):
            accords = []
        
        # If we got empty accords, try to infer from description or name
        if not accords or len(accords) == 0:
            description = data.get("description", "")
            infer_prompt = f"""Based on this fragrance information:
Brand: {brand}
Name: {name}
Description: {description if description else "No description"}

Infer 4-6 likely main accords. Respond with ONLY a JSON array:
["Accord1", "Accord2", "Accord3", "Accord4"]

Choose from: Woody, Spicy, Fresh, Floral, Citrus, Sweet, Musky, Earthy, Smoky, Leather, Oriental, Aquatic, Gourmand, Powdery, Green, Fruity, Aromatic, Amber, Vanilla, Oud"""
            
            infer_response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": infer_prompt}],
                max_tokens=100,
                temperature=0.2,
            )
            
            infer_raw = infer_response.choices[0].message.content.strip()
            if infer_raw.startswith("```"):
                infer_raw = infer_raw.split("```")[1]
                if infer_raw.startswith("json"):
                    infer_raw = infer_raw[4:]
            infer_raw = infer_raw.strip()
            
            try:
                inferred_accords = json.loads(infer_raw)
                accords = inferred_accords[:8]
            except:
                accords = ["Fresh", "Floral"]  # Safe default
        
        # Ensure notes structure is valid
        notes = data.get("notes", {})
        if not isinstance(notes, dict):
            notes = {"top": [], "middle": [], "base": []}
        else:
            notes = {
                "top": [n for n in (notes.get("top") or []) if n and n != "null"][:5],
                "middle": [n for n in (notes.get("middle") or []) if n and n != "null"][:5],
                "base": [n for n in (notes.get("base") or []) if n and n != "null"][:5],
            }
        
        return FragranceDetails(
            brand=brand,
            name=name,
            accords=accords[:8],
            notes=notes,
            image_url=data.get("image_url"),
            source="web_search",
        )
        
    except Exception as e:
        print(f"Web search error: {e}")
        return None


# ── Tier 3: Manual Fallback ──────────────────────────────────────────────────

def search_fallback(query: str) -> FragranceDetails:
    """Tier 3: Last-resort fallback - parse brand/name from query and infer basic accords."""
    # Try to intelligently parse brand and name
    parts = query.strip().split(" from ")
    
    if len(parts) == 2:
        # Format: "Love Drunk from BlaBliBlu"
        name = parts[0].strip()
        brand = parts[1].strip()
    else:
        # Format: "Brand Name" - split on first space
        words = query.strip().split(" ", 1)
        brand = words[0] if words else "Unknown"
        name = words[1] if len(words) > 1 else query
    
    # Infer basic accords from name keywords
    name_lower = name.lower()
    accords = []
    
    accord_keywords = {
        "Woody": ["wood", "oud", "cedar", "sandalwood", "vetiver"],
        "Floral": ["rose", "jasmine", "flower", "floral", "bloom", "blossom"],
        "Fresh": ["fresh", "clean", "aqua", "marine", "ocean"],
        "Citrus": ["citrus", "lemon", "bergamot", "orange", "lime"],
        "Sweet": ["sweet", "vanilla", "caramel", "honey", "sugar"],
        "Spicy": ["spice", "spicy", "pepper", "cinnamon", "cardamom"],
        "Fruity": ["fruit", "fruity", "apple", "peach", "berry"],
        "Oriental": ["oriental", "amber", "incense", "exotic"],
        "Musky": ["musk", "musky", "sensual"],
        "Gourmand": ["chocolate", "coffee", "almond", "gourmand"],
    }
    
    for accord, keywords in accord_keywords.items():
        if any(kw in name_lower for kw in keywords):
            accords.append(accord)
    
    # Default accords if none found
    if not accords:
        accords = ["Fresh", "Floral"]
    
    return FragranceDetails(
        brand=brand,
        name=name,
        accords=accords[:8],
        notes={"top": [], "middle": [], "base": []},
        image_url=None,
        source="fallback",
    )


# ── AI insight ────────────────────────────────────────────────────────────────

def get_ai_insight(target: Fragrance, profile: UserProfile, score: int) -> Optional[str]:
    """Generate a personalized blind-buy insight using Groq."""
    if not groq_client:
        return None

    loved_names = [f"{f.brand} {f.name}" for f in profile.loved[:3]]
    hated_names = [f"{f.brand} {f.name}" for f in profile.hated[:3]]

    prompt = f"""You are a luxury fragrance consultant. Based on this profile:

Loved: {', '.join(loved_names) if loved_names else 'None specified'}
Hated: {', '.join(hated_names) if hated_names else 'None specified'}

Target: {target.brand} {target.name}
Accords: {', '.join(target.accords) if target.accords else 'Unknown'}
Risk Score: {score}/100

Write 1-2 sentences of personalized advice about this blind buy. Be concise, sophisticated, and specific. Reference actual notes or accords where relevant. Also include a brief recommendation on the ideal season and occasion to wear it."""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq insight error: {e}")
        return None


# ── Risk calculation ──────────────────────────────────────────────────────────

def calculate_risk_score(
    target: Fragrance, profile: UserProfile
) -> tuple[int, list[AccordScore]]:
    raw_score = 50

    love_counts: dict[str, int] = {}
    hate_counts: dict[str, int] = {}

    for f in profile.loved:
        for a in f.accords:
            love_counts[a] = love_counts.get(a, 0) + 1

    for f in profile.hated:
        for a in f.accords:
            hate_counts[a] = hate_counts.get(a, 0) + 1

    # Brand heritage bonus
    loved_brands = {f.brand.lower() for f in profile.loved}
    if target.brand.lower() in loved_brands:
        raw_score += 5

    # Accord matching
    for accord in target.accords:
        raw_score += 10 * love_counts.get(accord, 0)
        raw_score -= 15 * hate_counts.get(accord, 0)

    score = max(0, min(100, raw_score))

    all_accords = set(love_counts) | set(hate_counts) | set(target.accords)
    breakdown = [
        AccordScore(
            accord=a,
            targetHas=a in target.accords,
            loveScore=love_counts.get(a, 0),
            hateScore=hate_counts.get(a, 0),
        )
        for a in sorted(all_accords)
        if a in target.accords or love_counts.get(a, 0) > 0 or hate_counts.get(a, 0) > 0
    ]

    return score, breakdown


def get_verdict(score: int) -> str:
    if score >= 80:
        return "Signature Material. Pull the trigger."
    elif score >= 50:
        return "Get a decant first. High risk, high reward."
    else:
        return "Stop. Your wallet will thank you later."


CLONE_DB = {
    "woody": [
        {"brand": "Zara", "name": "Vibrant Leather", "price": 18, "reason": "Dry woody base at a fraction of the cost."},
        {"brand": "Armaf", "name": "Niche Oud", "price": 40, "reason": "Dark leather-oud accord, punches above its weight."},
        {"brand": "Lattafa", "name": "Oud Mood", "price": 25, "reason": "Deep earthy oud character for the price."},
    ],
    "spicy": [
        {"brand": "Armaf", "name": "Club de Nuit Intense", "price": 35, "reason": "Legendary spicy-smoky clone."},
        {"brand": "Al Haramain", "name": "L'Aventure", "price": 30, "reason": "Spicy-woody with excellent projection."},
        {"brand": "Rasasi", "name": "Hawas", "price": 28, "reason": "Fresh-spicy aquatic, crowd-pleaser."},
    ],
    "sweet": [
        {"brand": "Dossier", "name": "Ambery Saffron", "price": 29, "reason": "Warm gourmand without the markup."},
        {"brand": "Kayali", "name": "Vanilla 28", "price": 45, "reason": "Rich vanilla gourmand at an accessible price."},
        {"brand": "Zara", "name": "Red Vanilla", "price": 16, "reason": "Sweet vanilla with surprising longevity."},
    ],
    "fresh": [
        {"brand": "Nautica", "name": "Voyage", "price": 22, "reason": "Clean aquatic freshness."},
        {"brand": "Davidoff", "name": "Cool Water", "price": 25, "reason": "Classic fresh aquatic, timeless."},
        {"brand": "Nautica", "name": "Blue", "price": 20, "reason": "Fresh aquatic, a crowd-pleasing safe bet."},
    ],
    "floral": [
        {"brand": "Zara", "name": "Rose Gourmand", "price": 16, "reason": "Soft floral with surprising longevity."},
        {"brand": "Zara", "name": "Orchid", "price": 18, "reason": "Elegant floral at drugstore prices."},
        {"brand": "Ariana Grande", "name": "Cloud", "price": 35, "reason": "Sweet floral gourmand, viral for a reason."},
    ],
    "oriental": [
        {"brand": "Lattafa", "name": "Khamrah", "price": 28, "reason": "Rich oriental depth at an unbeatable price."},
        {"brand": "Rasasi", "name": "La Yuqawam", "price": 32, "reason": "Spicy oriental with leather undertones."},
        {"brand": "Al Haramain", "name": "Amber Oud", "price": 35, "reason": "Classic oriental-oud blend."},
    ],
    "leather": [
        {"brand": "Armaf", "name": "Niche Oud", "price": 40, "reason": "Dark leather-oud accord, punches above its weight."},
        {"brand": "Zara", "name": "Vibrant Leather", "price": 18, "reason": "Dry leather base, excellent value."},
        {"brand": "Montblanc", "name": "Legend", "price": 45, "reason": "Refined leather-fougere, widely available."},
    ],
    "citrus": [
        {"brand": "Prada", "name": "Luna Rossa Carbon", "price": 55, "reason": "Crisp citrus-metallic, widely available on discount."},
        {"brand": "Versace", "name": "Man Eau Fraiche", "price": 35, "reason": "Bright citrus-aquatic, summer staple."},
        {"brand": "Dolce & Gabbana", "name": "Light Blue", "price": 45, "reason": "Zesty citrus, universally loved."},
    ],
    "musky": [
        {"brand": "Zara", "name": "Femme", "price": 14, "reason": "Clean musky base, great longevity."},
        {"brand": "The Body Shop", "name": "White Musk", "price": 20, "reason": "Soft clean musk, iconic."},
        {"brand": "Narciso Rodriguez", "name": "For Her", "price": 60, "reason": "Elegant musk, worth the splurge."},
    ],
    "gourmand": [
        {"brand": "Kayali", "name": "Vanilla 28", "price": 45, "reason": "Rich vanilla gourmand at an accessible price."},
        {"brand": "Prada", "name": "Candy", "price": 55, "reason": "Caramel gourmand, addictive."},
        {"brand": "Ariana Grande", "name": "Cloud", "price": 35, "reason": "Sweet gourmand, viral sensation."},
    ],
    "aquatic": [
        {"brand": "Nautica", "name": "Blue", "price": 20, "reason": "Fresh aquatic, a crowd-pleasing safe bet."},
        {"brand": "Davidoff", "name": "Cool Water", "price": 25, "reason": "The original aquatic, still great."},
        {"brand": "Issey Miyake", "name": "L'Eau d'Issey", "price": 50, "reason": "Refined aquatic-floral."},
    ],
    "earthy": [
        {"brand": "Lattafa", "name": "Oud Mood", "price": 25, "reason": "Deep earthy oud character for the price."},
        {"brand": "Encre Noire", "name": "Lalique", "price": 35, "reason": "Dark vetiver-cypress, unique."},
        {"brand": "Terre d'Hermes", "name": "Hermes", "price": 70, "reason": "Earthy-citrus, worth saving for."},
    ],
    "fruity": [
        {"brand": "Armaf", "name": "Club de Nuit Intense", "price": 35, "reason": "Fruity-smoky powerhouse."},
        {"brand": "Zara", "name": "Apple Juice", "price": 16, "reason": "Fresh fruity, fun and affordable."},
        {"brand": "DKNY", "name": "Be Delicious", "price": 40, "reason": "Crisp apple, iconic bottle."},
    ],
    "aromatic": [
        {"brand": "Paco Rabanne", "name": "Invictus", "price": 50, "reason": "Aromatic-aquatic, sporty."},
        {"brand": "Versace", "name": "Eros", "price": 55, "reason": "Aromatic-mint, clubbing staple."},
        {"brand": "Azzaro", "name": "Wanted", "price": 45, "reason": "Aromatic-spicy, versatile."},
    ],
    "green": [
        {"brand": "Hermes", "name": "Un Jardin", "price": 70, "reason": "Green-fresh, garden vibes."},
        {"brand": "Bvlgari", "name": "Eau Parfumee au The Vert", "price": 50, "reason": "Green tea, minimalist."},
        {"brand": "Zara", "name": "Green Storm", "price": 18, "reason": "Fresh green, budget-friendly."},
    ],
    "powdery": [
        {"brand": "Prada", "name": "Infusion d'Iris", "price": 65, "reason": "Powdery-iris, elegant."},
        {"brand": "Guerlain", "name": "L'Homme Ideal", "price": 60, "reason": "Powdery-almond, sophisticated."},
        {"brand": "Zara", "name": "Iris", "price": 16, "reason": "Soft powdery, surprising quality."},
    ],
    "smoky": [
        {"brand": "Armaf", "name": "Club de Nuit Intense", "price": 35, "reason": "Smoky-fruity, legendary clone."},
        {"brand": "Lalique", "name": "Encre Noire", "price": 35, "reason": "Dark smoky vetiver."},
        {"brand": "Tom Ford", "name": "Ombre Leather", "price": 85, "reason": "Smoky leather, worth it."},
    ],
}

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Scent-inel Risk Engine v2",
        "groq_enabled": groq_client is not None,
        "search_tiers": ["groq_direct", "web_search", "fallback"],
    }

@app.get("/currencies")
def get_currencies():
    return {"currencies": list(EXCHANGE_RATES.keys()), "rates": EXCHANGE_RATES}

@app.post("/convert")
def convert_currency(req: ConvertRequest):
    if req.from_currency not in EXCHANGE_RATES or req.to_currency not in EXCHANGE_RATES:
        raise HTTPException(400, "Invalid currency code")
    usd = req.amount / EXCHANGE_RATES[req.from_currency]
    converted = usd * EXCHANGE_RATES[req.to_currency]
    return {"amount": round(converted, 2), "currency": req.to_currency}

@app.post("/search", response_model=FragranceDetails)
async def search_fragrance(req: SearchRequest):
    """
    Multi-tier fragrance search:
    1. Groq AI direct lookup (fast, works for popular fragrances)
    2. Web search + AI extraction (for obscure/new fragrances)
    3. Manual fallback (parse query string + infer accords)
    """
    if not req.query.strip():
        raise HTTPException(400, "Query cannot be empty")

    print(f"[SEARCH] Query: {req.query}")

    # Tier 1: Groq AI direct lookup
    details = await asyncio.to_thread(search_via_groq, req.query)
    if details:
        print(f"[SEARCH] ✓ Found via Groq (Tier 1)")
        return details

    # Tier 2: Web search + AI extraction
    print(f"[SEARCH] Groq failed, trying web search (Tier 2)...")
    details = await search_via_web(req.query)
    if details:
        print(f"[SEARCH] ✓ Found via web search (Tier 2)")
        return details

    # Tier 3: Manual fallback
    print(f"[SEARCH] Web search failed, using fallback (Tier 3)")
    details = search_fallback(req.query)
    return details

@app.post("/calculate-risk", response_model=RiskResponse)
async def calculate_risk(req: RiskRequest):
    """Calculate blind buy risk with optional AI insight."""
    score, breakdown = calculate_risk_score(req.target_perfume, req.user_profile)
    verdict = get_verdict(score)

    # Clone suggestions - ALWAYS provide 3 options
    clones = []
    
    # Get clones based on dominant accords (up to 3 accords)
    target_accords = [a.lower() for a in (req.target_perfume.accords or [])][:3]
    
    # Collect clones from matching accords
    seen_clones = set()
    for accord in target_accords:
        if accord in CLONE_DB:
            for clone_data in CLONE_DB[accord]:
                clone_key = f"{clone_data['brand']}-{clone_data['name']}"
                if clone_key not in seen_clones:
                    clones.append(CloneSuggestion(**clone_data, currency="USD"))
                    seen_clones.add(clone_key)
                    if len(clones) >= 3:
                        break
        if len(clones) >= 3:
            break
    
    # If we don't have 3 clones yet, add from "fresh" as default
    if len(clones) < 3 and "fresh" in CLONE_DB:
        for clone_data in CLONE_DB["fresh"]:
            clone_key = f"{clone_data['brand']}-{clone_data['name']}"
            if clone_key not in seen_clones:
                clones.append(CloneSuggestion(**clone_data, currency="USD"))
                seen_clones.add(clone_key)
                if len(clones) >= 3:
                    break
    
    # Ensure we always have at least 3 clones
    if len(clones) < 3:
        # Add from any available accord
        for accord, clone_list in CLONE_DB.items():
            if isinstance(clone_list, list):
                for clone_data in clone_list:
                    clone_key = f"{clone_data['brand']}-{clone_data['name']}"
                if clone_key not in seen_clones:
                    clones.append(CloneSuggestion(**clone_data, currency="USD"))
                    seen_clones.add(clone_key)
                    if len(clones) >= 3:
                        break
            if len(clones) >= 3:
                break

    # AI insight
    ai_insight = None
    if groq_client:
        ai_insight = await asyncio.to_thread(
            get_ai_insight, req.target_perfume, req.user_profile, score
        )

    return RiskResponse(
        score=score,
        verdict=verdict,
        breakdown=breakdown,
        clones=clones[:3],  # Ensure exactly 3 clones
        ai_insight=ai_insight,
    )
