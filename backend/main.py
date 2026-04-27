from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import re
import json
import asyncio
import aiohttp
from bs4 import BeautifulSoup
from groq import Groq

app = FastAPI(title="Scent-inel Risk Engine", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq client (set GROQ_API_KEY env var)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Currency exchange rates (base USD)
EXCHANGE_RATES = {
    "USD": 1.0,
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 149.5,
    "CAD": 1.36,
    "AUD": 1.52,
    "INR": 83.2,
}

# ── Models ──────────────────────────────────────────────────────────────────

class SearchRequest(BaseModel):
    query: str  # e.g. "Creed Aventus"

class FragranceDetails(BaseModel):
    brand: str
    name: str
    accords: list[str]
    notes: dict[str, list[str]]  # top, middle, base
    image_url: Optional[str] = None

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
    clone: Optional[CloneSuggestion] = None
    ai_insight: Optional[str] = None

class ConvertRequest(BaseModel):
    amount: float
    from_currency: str
    to_currency: str

# ── Helpers ──────────────────────────────────────────────────────────────────

async def search_fragrantica(query: str) -> Optional[str]:
    """Search Fragrantica and return the first perfume page URL."""
    try:
        search_url = f"https://www.fragrantica.com/search/"
        async with aiohttp.ClientSession() as session:
            async with session.get(
                search_url,
                params={"query": query},
                headers={"User-Agent": "Mozilla/5.0"},
                timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                if resp.status != 200:
                    return None
                html = await resp.text()
                soup = BeautifulSoup(html, "html.parser")
                
                # Find first perfume link
                link = soup.select_one('div.cell.text-left.fr-news-box a[href*="/perfume/"]')
                if link and link.get("href"):
                    return "https://www.fragrantica.com" + link["href"]
                return None
    except Exception as e:
        print(f"Search error: {e}")
        return None

async def scrape_fragrantica_page(url: str) -> Optional[FragranceDetails]:
    """Scrape perfume details from Fragrantica page."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                url,
                headers={"User-Agent": "Mozilla/5.0"},
                timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                if resp.status != 200:
                    return None
                html = await resp.text()
                soup = BeautifulSoup(html, "html.parser")
                
                # Extract brand and name
                title_elem = soup.select_one('h1[itemprop="name"]')
                if not title_elem:
                    return None
                
                title_text = title_elem.get_text(strip=True)
                # Usually format: "Brand Name by Designer"
                parts = title_text.split(" by ")
                name = parts[0].strip()
                brand = parts[1].strip() if len(parts) > 1 else "Unknown"
                
                # Extract accords
                accords = []
                accord_bar = soup.select('div.accord-bar')
                for bar in accord_bar:
                    accord_name = bar.get_text(strip=True)
                    if accord_name:
                        accords.append(accord_name)
                
                # Extract notes (top, middle, base)
                notes_dict = {"top": [], "middle": [], "base": []}
                notes_section = soup.select('div.pyramid')
                if notes_section:
                    pyramid = notes_section[0]
                    
                    # Top notes
                    top_row = pyramid.select('div.cell[style*="top"] img[alt]')
                    notes_dict["top"] = [img["alt"] for img in top_row if img.get("alt")]
                    
                    # Middle notes
                    mid_row = pyramid.select('div.cell[style*="middle"] img[alt]')
                    notes_dict["middle"] = [img["alt"] for img in mid_row if img.get("alt")]
                    
                    # Base notes
                    base_row = pyramid.select('div.cell[style*="base"] img[alt]')
                    notes_dict["base"] = [img["alt"] for img in base_row if img.get("alt")]
                
                # Extract image
                img_elem = soup.select_one('img[itemprop="image"]')
                image_url = img_elem["src"] if img_elem and img_elem.get("src") else None
                
                return FragranceDetails(
                    brand=brand,
                    name=name,
                    accords=accords[:8],  # limit to top 8
                    notes=notes_dict,
                    image_url=image_url,
                )
    except Exception as e:
        print(f"Scrape error: {e}")
        return None

def get_ai_insight(target: Fragrance, profile: UserProfile, score: int) -> Optional[str]:
    """Use Groq to generate personalized insight."""
    if not groq_client:
        return None
    
    try:
        loved_names = [f"{f.brand} {f.name}" for f in profile.loved[:3]]
        hated_names = [f"{f.brand} {f.name}" for f in profile.hated[:3]]
        
        prompt = f"""You are a luxury fragrance consultant. Based on this profile:

Loved: {', '.join(loved_names) if loved_names else 'None'}
Hated: {', '.join(hated_names) if hated_names else 'None'}

Target: {target.brand} {target.name}
Accords: {', '.join(target.accords)}
Risk Score: {score}/100

Provide a 1-2 sentence personalized insight about whether this blind buy makes sense for them. Be concise, sophisticated, and reference specific notes or accords."""

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7,
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq error: {e}")
        return None

def calculate_risk_score(target: Fragrance, profile: UserProfile) -> tuple[int, list[AccordScore]]:
    """Calculate risk score and breakdown."""
    raw_score = 50
    
    love_counts: dict[str, int] = {}
    hate_counts: dict[str, int] = {}
    
    for f in profile.loved:
        for a in f.accords:
            love_counts[a] = love_counts.get(a, 0) + 1
    
    for f in profile.hated:
        for a in f.accords:
            hate_counts[a] = hate_counts.get(a, 0) + 1
    
    # Brand heritage
    loved_brands = {f.brand.lower() for f in profile.loved}
    if target.brand.lower() in loved_brands:
        raw_score += 5
    
    # Accord matching
    for accord in target.accords:
        raw_score += 10 * love_counts.get(accord, 0)
        raw_score -= 15 * hate_counts.get(accord, 0)
    
    score = max(0, min(100, raw_score))
    
    # Breakdown
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
    "woody": {"brand": "Zara", "name": "Vibrant Leather", "price": 18, "reason": "Dry woody base at a fraction of the cost."},
    "spicy": {"brand": "Armaf", "name": "Club de Nuit Intense", "price": 35, "reason": "Legendary spicy-smoky clone."},
    "sweet": {"brand": "Dossier", "name": "Ambery Saffron", "price": 29, "reason": "Warm gourmand without the markup."},
    "fresh": {"brand": "Nautica", "name": "Voyage", "price": 22, "reason": "Clean aquatic freshness."},
    "floral": {"brand": "Zara", "name": "Rose Gourmand", "price": 16, "reason": "Soft floral with longevity."},
    "oriental": {"brand": "Lattafa", "name": "Khamrah", "price": 28, "reason": "Rich oriental depth."},
    "leather": {"brand": "Armaf", "name": "Niche Oud", "price": 40, "reason": "Dark leather-oud accord."},
    "citrus": {"brand": "Prada", "name": "Luna Rossa Carbon", "price": 55, "reason": "Crisp citrus-metallic."},
}

# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "service": "Scent-inel Risk Engine v2"}

@app.get("/currencies")
def get_currencies():
    """Return available currencies and rates."""
    return {"currencies": list(EXCHANGE_RATES.keys()), "rates": EXCHANGE_RATES}

@app.post("/convert")
def convert_currency(req: ConvertRequest):
    """Convert between currencies."""
    if req.from_currency not in EXCHANGE_RATES or req.to_currency not in EXCHANGE_RATES:
        raise HTTPException(400, "Invalid currency")
    
    usd_amount = req.amount / EXCHANGE_RATES[req.from_currency]
    converted = usd_amount * EXCHANGE_RATES[req.to_currency]
    
    return {"amount": round(converted, 2), "currency": req.to_currency}

@app.post("/search", response_model=FragranceDetails)
async def search_fragrance(req: SearchRequest):
    """Search for a fragrance and return details."""
    url = await search_fragrantica(req.query)
    if not url:
        raise HTTPException(404, "Fragrance not found")
    
    details = await scrape_fragrantica_page(url)
    if not details:
        raise HTTPException(500, "Failed to scrape fragrance details")
    
    return details

@app.post("/calculate-risk", response_model=RiskResponse)
async def calculate_risk(req: RiskRequest):
    """Calculate blind buy risk with AI insight."""
    score, breakdown = calculate_risk_score(req.target_perfume, req.user_profile)
    verdict = get_verdict(score)
    
    # Clone suggestion
    clone = None
    target_price_usd = req.target_perfume.price or 0
    if req.target_perfume.currency != "USD":
        target_price_usd = target_price_usd / EXCHANGE_RATES[req.target_perfume.currency]
    
    if score < 70 or target_price_usd > 100:
        dominant = req.target_perfume.accords[0].lower() if req.target_perfume.accords else "fresh"
        clone_data = CLONE_DB.get(dominant, CLONE_DB.get("fresh"))
        if clone_data:
            clone = CloneSuggestion(**clone_data, currency="USD")
    
    # AI insight (async)
    ai_insight = None
    if groq_client:
        ai_insight = await asyncio.to_thread(
            get_ai_insight, req.target_perfume, req.user_profile, score
        )
    
    return RiskResponse(
        score=score,
        verdict=verdict,
        breakdown=breakdown,
        clone=clone,
        ai_insight=ai_insight,
    )
