# How Search Works in Scent-inel

## 🔍 Search Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ USER TYPES "Creed Aventus" IN SEARCH BAR                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                                │
│ - AddFragranceModal.tsx sends POST /api/search                  │
│ - Body: { "query": "Creed Aventus" }                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ VITE PROXY (vite.config.ts)                                     │
│ - Intercepts /api/* requests                                    │
│ - Rewrites to http://localhost:8000/*                           │
│ - Forwards to backend                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND (FastAPI - main.py)                                     │
│ POST /search endpoint receives request                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ PRIMARY: search_via_groq()                                       │
│                                                                  │
│ 1. Constructs prompt:                                           │
│    "Return fragrance details for: Creed Aventus"                │
│    "Respond with ONLY valid JSON"                               │
│                                                                  │
│ 2. Sends to Groq API:                                           │
│    - Model: llama-3.3-70b-versatile                             │
│    - Max tokens: 400                                            │
│    - Temperature: 0.1 (deterministic)                           │
│                                                                  │
│ 3. Groq's LLM returns JSON:                                     │
│    {                                                            │
│      "brand": "Creed",                                          │
│      "name": "Aventus",                                         │
│      "accords": ["Fruity", "Fresh", "Woody", ...],             │
│      "notes": {                                                 │
│        "top": ["Bergamot", "Blackcurrant", ...],               │
│        "middle": ["Juniper", "Birch", ...],                    │
│        "base": ["Vanilla", "Musk", ...]                        │
│      }                                                          │
│    }                                                            │
│                                                                  │
│ 4. Parse JSON and return FragranceDetails                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼ (if Groq fails or no API key)
┌─────────────────────────────────────────────────────────────────┐
│ FALLBACK: search_fallback()                                      │
│                                                                  │
│ 1. Parse query string: "Creed Aventus"                          │
│ 2. Split on first space:                                        │
│    - brand = "Creed"                                            │
│    - name = "Aventus"                                           │
│ 3. Return with empty notes/accords                              │
│                                                                  │
│ (User can still add it, but without accord/note details)        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND RESPONSE                                                │
│ Returns FragranceDetails as JSON                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ VITE PROXY                                                      │
│ - Receives response from backend                                │
│ - Forwards to frontend                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                                │
│ - api.ts searchFragrance() receives response                    │
│ - AddFragranceModal displays:                                   │
│   - Brand: Creed                                                │
│   - Name: Aventus                                               │
│   - Accords: [Fruity, Fresh, Woody, ...]                       │
│   - Notes: Top/Middle/Base breakdown                            │
│   - Product image (if available)                                │
│                                                                  │
│ - User can now:                                                 │
│   - Add optional price                                          │
│   - Click "Add to Collection"                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Source Breakdown

### **Primary Source: Groq AI (Llama 3.3 70B)**

**What it is:**
- Large Language Model trained on vast internet data
- Has knowledge of thousands of fragrances
- Can reason about fragrance characteristics

**How it works:**
1. You search "Creed Aventus"
2. We send a prompt asking for fragrance details
3. Groq's LLM uses its training data to generate accurate JSON
4. Returns brand, name, accords, and notes

**Advantages:**
- ✅ No web scraping needed
- ✅ Handles typos and variations ("Aventus" vs "aventus")
- ✅ Works for obscure fragrances
- ✅ Fast (< 2 seconds typically)
- ✅ Accurate for well-known fragrances

**Limitations:**
- ❌ Requires GROQ_API_KEY environment variable
- ❌ May hallucinate for very obscure fragrances
- ❌ No product images (we set image_url to null)
- ❌ Rate limited (free tier: ~30 requests/minute)

**Example Groq Response:**
```json
{
  "brand": "Creed",
  "name": "Aventus",
  "accords": ["Fruity", "Fresh", "Woody", "Musk", "Amber", "Gourmand"],
  "notes": {
    "top": ["Bergamot", "Blackcurrant", "Apple", "Pineapple"],
    "middle": ["Juniper Berries", "Birch", "Patchouli", "Rose"],
    "base": ["Vanilla", "Musk", "Oakmoss", "Amber"]
  }
}
```

---

### **Fallback Source: Query String Parsing**

**What it is:**
- Simple text parsing of the search query
- No external API calls

**How it works:**
1. If Groq fails or no API key set
2. Split query on first space
3. First word = brand, rest = name
4. Return with empty accords/notes

**Example:**
- Input: "Tom Ford Oud Wood"
- Output: brand="Tom", name="Ford Oud Wood"
- Accords: [] (empty)
- Notes: empty

**Advantages:**
- ✅ Works without API key
- ✅ Instant (no network call)
- ✅ Never fails

**Limitations:**
- ❌ No fragrance details
- ❌ Poor parsing for multi-word brands
- ❌ User still needs to manually add accords

---

## 🔑 API Key Setup

### Required for Full Functionality

**Get a free Groq API key:**
1. Go to https://console.groq.com
2. Sign up (free)
3. Create an API key
4. Set environment variable:

**Windows:**
```cmd
set GROQ_API_KEY=your_key_here
```

**macOS/Linux:**
```bash
export GROQ_API_KEY="your_key_here"
```

**Or create backend/.env:**
```env
GROQ_API_KEY=your_key_here
```

### Without API Key

- Search still works (uses fallback)
- No fragrance details auto-fetched
- No AI insights on risk calculation
- User must manually enter accords

---

## 🔄 Request/Response Flow

### Frontend → Backend

**File:** `frontend/src/api.ts`

```typescript
export async function searchFragrance(query: string): Promise<FragranceSearchResult> {
  const res = await fetch(`/api/search`, {
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
```

**What happens:**
1. Frontend calls `searchFragrance("Creed Aventus")`
2. Sends POST to `/api/search`
3. Vite proxy rewrites to `http://localhost:8000/search`
4. Backend receives request

---

### Backend Processing

**File:** `backend/main.py`

```python
@app.post("/search", response_model=FragranceDetails)
async def search_fragrance(req: SearchRequest):
    """Search for a fragrance using Groq AI knowledge base."""
    if not req.query.strip():
        raise HTTPException(400, "Query cannot be empty")

    # Primary: Groq AI lookup
    details = await asyncio.to_thread(search_via_groq, req.query)

    # Fallback: parse query string
    if not details:
        details = search_fallback(req.query)

    # If we got nothing useful, raise 404
    if not details.brand and not details.name:
        raise HTTPException(404, "Fragrance not found")

    return details
```

**What happens:**
1. Receives `{ "query": "Creed Aventus" }`
2. Tries `search_via_groq()` first
3. If that fails, tries `search_fallback()`
4. Returns `FragranceDetails` JSON

---

### Backend → Groq API

**File:** `backend/main.py` (search_via_groq function)

```python
def search_via_groq(query: str) -> Optional[FragranceDetails]:
    """Use Groq LLM to look up fragrance details."""
    if not groq_client:
        return None

    prompt = f"""You are a fragrance database. Return details for: "{query}"
    
Respond with ONLY valid JSON:
{{
  "brand": "Brand Name",
  "name": "Fragrance Name",
  "accords": ["Accord1", "Accord2"],
  "notes": {{
    "top": ["Note1", "Note2"],
    "middle": ["Note1", "Note2"],
    "base": ["Note1", "Note2"]
  }}
}}"""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400,
        temperature=0.1,
    )
    
    raw = response.choices[0].message.content.strip()
    data = json.loads(raw)
    
    return FragranceDetails(
        brand=data.get("brand", "Unknown"),
        name=data.get("name", query),
        accords=data.get("accords", [])[:8],
        notes=data.get("notes", {"top": [], "middle": [], "base": []}),
        image_url=None,
    )
```

**What happens:**
1. Constructs a prompt asking for fragrance details
2. Sends to Groq API with llama-3.3-70b-versatile model
3. Groq returns JSON string
4. Parse JSON and return as FragranceDetails

---

## 🌐 Network Path

```
Browser (localhost:5173)
    ↓
    POST /api/search
    ↓
Vite Dev Server (localhost:5173)
    ↓ (proxy rule)
    ↓
FastAPI Backend (localhost:8000)
    ↓
    Groq API (api.groq.com)
    ↓
    Llama 3.3 70B Model
    ↓
    Returns JSON
    ↓
FastAPI Backend
    ↓
Vite Dev Server
    ↓
Browser
    ↓
React Component displays results
```

---

## 📝 Example: Complete Search Lifecycle

### User Action
```
User types: "Dior Sauvage"
User clicks: [Search]
```

### Frontend (React)
```typescript
// AddFragranceModal.tsx
const handleSearch = async () => {
  setSearching(true);
  try {
    const result = await searchFragrance("Dior Sauvage");
    setBrand(result.brand);           // "Dior"
    setName(result.name);             // "Sauvage"
    setAccords(result.accords);       // ["Fresh", "Woody", "Citrus", ...]
    setNotes(result.notes);           // { top: [...], middle: [...], base: [...] }
  } catch (err) {
    setError(err.message);
  } finally {
    setSearching(false);
  }
};
```

### Network Request
```
POST /api/search HTTP/1.1
Host: localhost:5173
Content-Type: application/json

{"query": "Dior Sauvage"}
```

### Vite Proxy Intercepts
```
Rewrites to: http://localhost:8000/search
Forwards request to backend
```

### Backend Processing
```python
# Receives SearchRequest(query="Dior Sauvage")

# Calls search_via_groq("Dior Sauvage")
# Constructs prompt and sends to Groq

# Groq responds with:
{
  "brand": "Dior",
  "name": "Sauvage",
  "accords": ["Fresh", "Woody", "Citrus", "Earthy", "Spicy"],
  "notes": {
    "top": ["Bergamot", "Sichuan Pepper"],
    "middle": ["Lavender", "Ambrox"],
    "base": ["Vetiver", "Patchouli", "Cedarwood"]
  }
}

# Returns as FragranceDetails JSON
```

### Network Response
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "brand": "Dior",
  "name": "Sauvage",
  "accords": ["Fresh", "Woody", "Citrus", "Earthy", "Spicy"],
  "notes": {
    "top": ["Bergamot", "Sichuan Pepper"],
    "middle": ["Lavender", "Ambrox"],
    "base": ["Vetiver", "Patchouli", "Cedarwood"]
  },
  "image_url": null
}
```

### Frontend Display
```
Modal shows:
- Brand: Dior
- Name: Sauvage
- Accords: [Fresh] [Woody] [Citrus] [Earthy] [Spicy]
- Top Notes: Bergamot, Sichuan Pepper
- Middle Notes: Lavender, Ambrox
- Base Notes: Vetiver, Patchouli, Cedarwood
- [Add to Collection] button
```

---

## 🎯 Summary

| Aspect | Details |
|--------|---------|
| **Primary Data Source** | Groq AI (Llama 3.3 70B LLM) |
| **Fallback Source** | Query string parsing |
| **API Endpoint** | POST /api/search |
| **Request Format** | `{ "query": "Brand Name" }` |
| **Response Format** | FragranceDetails JSON |
| **Speed** | ~1-2 seconds (Groq) or instant (fallback) |
| **Accuracy** | High for well-known fragrances |
| **Requires API Key** | Yes (Groq) |
| **Images** | Not included (set to null) |
| **Accords** | Up to 8 main accords |
| **Notes** | Top, middle, base breakdown |

---

**The key insight:** We're using AI as a knowledge base instead of scraping websites. This is faster, more reliable, and handles edge cases better.
