from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import json
import asyncio
import re
import time
import html
from urllib.parse import quote_plus, urlparse, parse_qs, unquote
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
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
    price: Optional[float] = None
    currency: str
    reason: str
    url: Optional[str] = None
    source: Optional[str] = None

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


# ── Tier 2: Real web search + scraping + optional AI extraction ──────────────

SEARCH_CACHE: dict[str, tuple[float, FragranceDetails]] = {}
CLONE_CACHE: dict[str, tuple[float, list[CloneSuggestion]]] = {}
CACHE_TTL_SECONDS = 60 * 60 * 24
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36"
)
FRAGRANCE_SOURCES = [
    "fragrantica.com",
    "parfumo.com",
    "basenotes.com",
    "perfumemaster.com",
    "wikiparfum.com",
    "official",
]
VALID_ACCORDS = {
    "Woody", "Spicy", "Fresh", "Floral", "Citrus", "Sweet", "Musky",
    "Earthy", "Smoky", "Leather", "Oriental", "Aquatic", "Gourmand",
    "Powdery", "Green", "Fruity", "Aromatic", "Amber", "Vanilla", "Oud",
    "Animalic", "Balsamic", "Herbal", "Mineral", "Ozonic", "Resinous"
}


def _cache_get(cache: dict, key: str):
    cached = cache.get(key.lower().strip())
    if cached and time.time() - cached[0] < CACHE_TTL_SECONDS:
        return cached[1]
    return None


def _cache_set(cache: dict, key: str, value):
    cache[key.lower().strip()] = (time.time(), value)


def _fetch_url(url: str, timeout: int = 8) -> str:
    req = Request(url, headers={"User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9"})
    with urlopen(req, timeout=timeout) as res:
        content_type = res.headers.get("content-type", "")
        if "text" not in content_type and "html" not in content_type and "json" not in content_type:
            return ""
        return res.read(900_000).decode("utf-8", errors="ignore")


async def fetch_url(url: str, timeout: int = 8) -> str:
    try:
        return await asyncio.to_thread(_fetch_url, url, timeout)
    except (URLError, HTTPError, TimeoutError, ValueError, OSError) as e:
        print(f"[WEB] Fetch failed for {url}: {e}")
        return ""


def _strip_tags(raw_html: str) -> str:
    raw_html = re.sub(r"(?is)<(script|style|noscript).*?</\1>", " ", raw_html)
    text = re.sub(r"(?s)<[^>]+>", " ", raw_html)
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def _extract_meta(raw_html: str, url: str) -> dict:
    title = ""
    title_match = re.search(r"(?is)<title[^>]*>(.*?)</title>", raw_html)
    if title_match:
        title = html.unescape(re.sub(r"\s+", " ", title_match.group(1))).strip()

    description = ""
    desc_match = re.search(
        r'(?is)<meta[^>]+(?:name|property)=["\'](?:description|og:description)["\'][^>]+content=["\'](.*?)["\']',
        raw_html,
    )
    if desc_match:
        description = html.unescape(desc_match.group(1)).strip()

    image_url = None
    image_match = re.search(r'(?is)<meta[^>]+property=["\']og:image["\'][^>]+content=["\'](.*?)["\']', raw_html)
    if image_match:
        image_url = html.unescape(image_match.group(1)).strip()

    return {"url": url, "title": title, "description": description, "image_url": image_url}


def _duckduckgo_links(raw_html: str) -> list[dict[str, str]]:
    hits: list[dict[str, str]] = []
    for match in re.finditer(r'(?is)<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)</a>', raw_html):
        href = html.unescape(match.group(1))
        parsed = urlparse(href)
        if "duckduckgo.com" in parsed.netloc and "uddg" in parse_qs(parsed.query):
            href = unquote(parse_qs(parsed.query)["uddg"][0])
        title = _strip_tags(match.group(2))
        if href.startswith("http") and title:
            hits.append({"title": title, "url": href})
    return hits


async def web_search(query: str, max_results: int = 6) -> list[dict[str, str]]:
    url = f"https://duckduckgo.com/html/?q={quote_plus(query)}"
    raw = await fetch_url(url)
    hits = _duckduckgo_links(raw)
    seen = set()
    unique_hits = []
    for hit in hits:
        if hit["url"] not in seen:
            unique_hits.append(hit)
            seen.add(hit["url"])
        if len(unique_hits) >= max_results:
            break
    return unique_hits


def _rank_source(hit: dict[str, str]) -> int:
    url = hit.get("url", "").lower()
    title = hit.get("title", "").lower()
    rank = 0
    for idx, source in enumerate(FRAGRANCE_SOURCES):
        if source in url or source in title:
            rank += 20 - idx
    if any(word in title for word in ["perfume", "fragrance", "cologne", "notes", "accords"]):
        rank += 5
    return rank


def _normalize_list(value, limit: int = 8) -> list[str]:
    if not isinstance(value, list):
        return []
    cleaned = []
    for item in value:
        if not item:
            continue
        item = str(item).strip().strip(".,;:")
        if item and item.lower() not in {"null", "none", "unknown", "n/a"} and item not in cleaned:
            cleaned.append(item)
        if len(cleaned) >= limit:
            break
    return cleaned


def _normalize_notes(notes) -> dict[str, list[str]]:
    if not isinstance(notes, dict):
        return {"top": [], "middle": [], "base": []}
    return {
        "top": _normalize_list(notes.get("top") or notes.get("top_notes"), 8),
        "middle": _normalize_list(notes.get("middle") or notes.get("heart") or notes.get("heart_notes"), 8),
        "base": _normalize_list(notes.get("base") or notes.get("base_notes"), 8),
    }


def _parse_price(value) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    match = re.search(r"\d+(?:\.\d+)?", str(value))
    return float(match.group(0)) if match else None


def _details_from_data(data: dict, source: str) -> Optional[FragranceDetails]:
    if not data or not data.get("found", True):
        return None
    brand = str(data.get("brand") or "").strip()
    name = str(data.get("name") or "").strip()
    accords = [a.title() for a in _normalize_list(data.get("accords"), 8)]
    accords = [a for a in accords if a in VALID_ACCORDS]
    notes = _normalize_notes(data.get("notes"))
    if not brand or not name:
        return None
    if not accords:
        accords = infer_accords_from_notes(notes, f"{brand} {name} {data.get('description', '')}")
    if not validate_fragrance_data(brand, name, accords, notes):
        return None
    return FragranceDetails(
        brand=brand,
        name=name,
        accords=accords[:8],
        notes=notes,
        image_url=data.get("image_url"),
        source=source,
    )


def infer_accords_from_notes(notes: dict[str, list[str]], text: str = "") -> list[str]:
    haystack = " ".join(notes.get("top", []) + notes.get("middle", []) + notes.get("base", []) + [text]).lower()
    accord_keywords = {
        "Woody": ["wood", "cedar", "sandalwood", "vetiver", "guaiac"],
        "Oud": ["oud", "agarwood"],
        "Floral": ["rose", "jasmine", "iris", "violet", "tuberose", "flower", "ylang"],
        "Fresh": ["fresh", "clean", "linen"],
        "Citrus": ["bergamot", "lemon", "orange", "grapefruit", "lime", "mandarin", "citron"],
        "Sweet": ["vanilla", "tonka", "caramel", "honey", "sugar", "praline"],
        "Spicy": ["pepper", "cinnamon", "cardamom", "clove", "saffron", "nutmeg"],
        "Fruity": ["apple", "peach", "pear", "berry", "plum", "pineapple", "fruit"],
        "Amber": ["amber", "labdanum", "benzoin"],
        "Musky": ["musk", "ambroxan"],
        "Gourmand": ["coffee", "chocolate", "almond", "cacao", "milk"],
        "Leather": ["leather", "suede"],
        "Smoky": ["smoke", "incense", "birch", "tobacco"],
        "Green": ["green", "galbanum", "grass", "fig leaf", "mint"],
        "Aquatic": ["marine", "sea", "water", "aquatic", "calone"],
        "Powdery": ["powder", "orris", "heliotrope"],
        "Aromatic": ["lavender", "sage", "rosemary", "basil", "thyme"],
        "Earthy": ["patchouli", "moss", "soil", "earth"],
    }
    accords = [accord for accord, keys in accord_keywords.items() if any(key in haystack for key in keys)]
    return accords[:8] or ["Fresh"]


def heuristic_extract(query: str, source_docs: list[dict]) -> Optional[FragranceDetails]:
    merged_text = " ".join(
        f"{doc.get('title', '')}. {doc.get('description', '')}. {doc.get('text', '')[:5000]}"
        for doc in source_docs
    )
    notes = {"top": [], "middle": [], "base": []}
    patterns = {
        "top": r"top notes? (?:are|:|include)? ([^.]+)",
        "middle": r"(?:middle|heart) notes? (?:are|:|include)? ([^.]+)",
        "base": r"base notes? (?:are|:|include)? ([^.]+)",
    }
    for layer, pattern in patterns.items():
        match = re.search(pattern, merged_text, re.I)
        if match:
            notes[layer] = _normalize_list(re.split(r",| and |;", match.group(1)), 8)

    best = source_docs[0] if source_docs else {}
    title = re.sub(r"\s*[-|].*$", "", best.get("title", "")).strip()
    title = re.sub(r"\b(perfume|fragrance|cologne|reviews?|notes?)\b", "", title, flags=re.I).strip(" -|")
    words = title.split()
    fallback = search_fallback(query)
    brand = fallback.brand
    name = fallback.name
    if len(words) >= 2:
        brand = words[0]
        name = " ".join(words[1:])
    accords = infer_accords_from_notes(notes, merged_text)
    return FragranceDetails(
        brand=brand,
        name=name,
        accords=accords,
        notes=notes,
        image_url=best.get("image_url"),
        source="web_scrape",
    )


def extract_fragrance_with_groq(query: str, source_docs: list[dict]) -> Optional[FragranceDetails]:
    if not groq_client or not source_docs:
        return None
    evidence = []
    for doc in source_docs[:4]:
        evidence.append({
            "url": doc.get("url"),
            "title": doc.get("title"),
            "description": doc.get("description"),
            "text": doc.get("text", "")[:5000],
        })
    prompt = f"""Extract fragrance data from these live web search/scrape results for query: "{query}".

Use only the supplied evidence. Do not invent notes, accords, brand, or name.
If evidence is insufficient, set found to false.

Evidence JSON:
{json.dumps(evidence, ensure_ascii=False)}

Return ONLY valid JSON:
{{
  "found": true,
  "brand": "Exact brand",
  "name": "Exact fragrance name",
  "accords": ["Woody", "Amber"],
  "notes": {{"top": [], "middle": [], "base": []}},
  "image_url": "https://... or null"
}}"""
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=700,
            temperature=0,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return _details_from_data(json.loads(raw.strip()), "web_search")
    except Exception as e:
        print(f"[WEB] Groq extraction failed: {e}")
        return None


async def search_via_web(query: str) -> Optional[FragranceDetails]:
    """Tier 2: Run real free web search, scrape likely fragrance pages, then extract."""
    cached = _cache_get(SEARCH_CACHE, query)
    if cached:
        return cached

    try:
        search_query = f'{query} perfume fragrance notes accords'
        hits = await web_search(search_query, max_results=8)
        hits = sorted(hits, key=_rank_source, reverse=True)[:5]
        if not hits:
            return None

        pages = await asyncio.gather(*(fetch_url(hit["url"]) for hit in hits[:4]))
        source_docs = []
        for hit, raw in zip(hits, pages):
            meta = _extract_meta(raw, hit["url"]) if raw else {"url": hit["url"], "title": hit["title"], "description": ""}
            meta["title"] = meta.get("title") or hit["title"]
            meta["text"] = _strip_tags(raw)[:12000] if raw else hit["title"]
            source_docs.append(meta)

        details = extract_fragrance_with_groq(query, source_docs) or heuristic_extract(query, source_docs)
        if details:
            _cache_set(SEARCH_CACHE, query, details)
        return details
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


def _clone_from_hit(hit: dict[str, str], target: Fragrance) -> Optional[CloneSuggestion]:
    title = re.sub(r"\s*[-|].*$", "", hit.get("title", "")).strip()
    title = re.sub(r"\b(best|top|clone|clones|dupe|dupes|alternative|alternatives|perfume|fragrance|cologne|for)\b", "", title, flags=re.I)
    title = re.sub(r"\s+", " ", title).strip(" :,-")
    if not title or target.name.lower() in title.lower():
        return None
    words = title.split()
    brand = words[0] if words else "Alternative"
    name = " ".join(words[1:]) if len(words) > 1 else title
    return CloneSuggestion(
        brand=brand,
        name=name,
        currency="USD",
        reason=f"Live web result surfaced as a budget clone or alternative for {target.brand} {target.name}.",
        url=hit.get("url"),
        source=urlparse(hit.get("url", "")).netloc,
    )


def extract_clones_with_groq(target: Fragrance, hits: list[dict[str, str]]) -> list[CloneSuggestion]:
    if not groq_client or not hits:
        return []
    prompt = f"""From these live web search results, pick up to 3 budget-friendly clone, dupe, or alternative fragrances for {target.brand} {target.name}.

Use only the provided search results. Prefer product/review pages with concrete fragrance names and URLs. Do not invent products.

Search results:
{json.dumps(hits[:8], ensure_ascii=False)}

Return ONLY valid JSON:
[
  {{"brand": "Brand", "name": "Fragrance", "price": 29.99, "currency": "USD", "reason": "Why it is relevant", "url": "https://..."}}
]
If price is unknown, use null."""
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=650,
            temperature=0,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw.strip())
        clones = []
        for item in data if isinstance(data, list) else []:
            url = item.get("url")
            if not url:
                continue
            clones.append(CloneSuggestion(
                brand=str(item.get("brand") or "Alternative").strip(),
                name=str(item.get("name") or "Budget Alternative").strip(),
                price=_parse_price(item.get("price")),
                currency=str(item.get("currency") or "USD").strip(),
                reason=str(item.get("reason") or "Found through live clone search.").strip(),
                url=url,
                source=urlparse(url).netloc,
            ))
        return clones[:3]
    except Exception as e:
        print(f"[CLONES] Groq extraction failed: {e}")
        return []


async def find_budget_clones(target: Fragrance) -> list[CloneSuggestion]:
    cache_key = f"{target.brand} {target.name}"
    cached = _cache_get(CLONE_CACHE, cache_key)
    if cached:
        return cached

    query = f'"{target.brand} {target.name}" perfume clone dupe alternative budget'
    hits = await web_search(query, max_results=10)
    hits = [
        hit for hit in hits
        if any(word in hit["title"].lower() for word in ["clone", "dupe", "alternative", "similar", "inspired"])
    ] or hits

    clones = extract_clones_with_groq(target, hits)
    if len(clones) < 3:
        seen_urls = {clone.url for clone in clones}
        for hit in hits:
            if hit["url"] in seen_urls:
                continue
            clone = _clone_from_hit(hit, target)
            if clone:
                clones.append(clone)
                seen_urls.add(hit["url"])
            if len(clones) >= 3:
                break

    _cache_set(CLONE_CACHE, cache_key, clones[:3])
    return clones[:3]

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Scent-inel Risk Engine v2",
        "groq_enabled": groq_client is not None,
        "search_tiers": ["web_search_scrape", "groq_direct", "fallback"],
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
    1. Real web search + simple scraping + optional AI extraction
    2. Groq direct lookup if live sources are unavailable
    3. Manual fallback (parse query string + infer accords)
    """
    if not req.query.strip():
        raise HTTPException(400, "Query cannot be empty")

    print(f"[SEARCH] Query: {req.query}")

    # Tier 1: Web search + scraping
    print(f"[SEARCH] Trying live web search/scrape (Tier 1)...")
    details = await search_via_web(req.query)
    if details:
        print(f"[SEARCH] ✓ Found via web search/scrape (Tier 1)")
        return details

    # Tier 2: Groq AI direct lookup
    details = await asyncio.to_thread(search_via_groq, req.query)
    if details:
        print(f"[SEARCH] ✓ Found via Groq (Tier 2)")
        return details

    # Tier 3: Manual fallback
    print(f"[SEARCH] Live and AI lookup failed, using fallback (Tier 3)")
    details = search_fallback(req.query)
    return details

@app.post("/calculate-risk", response_model=RiskResponse)
async def calculate_risk(req: RiskRequest):
    """Calculate blind buy risk with optional AI insight."""
    score, breakdown = calculate_risk_score(req.target_perfume, req.user_profile)
    verdict = get_verdict(score)

    clones = await find_budget_clones(req.target_perfume)

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
