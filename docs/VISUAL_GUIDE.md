# Visual Guide

## 🎨 UI Components Breakdown

### 1. Hero Section
```
┌─────────────────────────────────────────────┐
│                                             │
│         [Animated Mist Blobs]               │
│                                             │
│       BLIND BUY INTELLIGENCE                │
│                                             │
│           Scent-inel                        │
│                                             │
│   The risk engine for fragrance obsessives  │
│           Know before you buy               │
│                                             │
│         ─── • ───                           │
│                                             │
└─────────────────────────────────────────────┘
```

**Features:**
- 3 floating gradient blobs (gold, violet)
- Animated with Framer Motion
- Playfair Display serif title
- Gold gradient text effect

---

### 2. Navbar
```
┌─────────────────────────────────────────────┐
│ [🧪] Scent-inel    BLIND BUY INTELLIGENCE   │
│                    [💰 USD ▼]  [🟢]         │
└─────────────────────────────────────────────┘
```

**Features:**
- Fixed position with blur backdrop
- Currency selector dropdown
- Live status indicator
- Gradient logo icon

---

### 3. Fragrance Vault
```
┌─────────────────────────────────────────────┐
│ [🧪] The Fragrance Vault ──────────────     │
│                                             │
│ [❤️] LOVED (2)                    [+ Add]   │
│ ┌──────┐ ┌──────┐ ┌──────┐                 │
│ │ IMG  │ │ IMG  │ │ IMG  │  ← Scroll →     │
│ │Creed │ │Tom   │ │Dior  │                 │
│ │Avent.│ │Ford  │ │Sauvg.│                 │
│ │Woody │ │Woody │ │Fresh │                 │
│ │$435  │ │$320  │ │$120  │                 │
│ └──────┘ └──────┘ └──────┘                 │
│                                             │
│ [😞] HATED (1)                    [+ Add]   │
│ ┌──────┐                                    │
│ │ IMG  │                                    │
│ │Dior  │                                    │
│ │Sauvg.│                                    │
│ │Fresh │                                    │
│ └──────┘                                    │
└─────────────────────────────────────────────┘
```

**Features:**
- Horizontal scrolling shelves
- Glassmorphism cards
- Hover shimmer effect
- Quick add/remove buttons
- Image thumbnails

---

### 4. Add Fragrance Modal
```
┌─────────────────────────────────────────────┐
│ [✨] Add to Loved                      [×]  │
│                                             │
│ SEARCH FRAGRANCE                            │
│ ┌─────────────────────────────┐            │
│ │ [🔍] e.g. Creed Aventus     │ [Search]   │
│ └─────────────────────────────┘            │
│                                             │
│ ─────────────────────────────────────       │
│                                             │
│        [Product Image]                      │
│                                             │
│ BRAND                                       │
│ Creed                                       │
│                                             │
│ NAME                                        │
│ Aventus                                     │
│                                             │
│ ACCORDS                                     │
│ [Fruity] [Woody] [Smoky] [Musky]           │
│                                             │
│ TOP      MIDDLE     BASE                    │
│ Bergamot Birch      Musk                    │
│ Apple    Patchouli  Oakmoss                 │
│ Pineapple Jasmine   Ambergris               │
│                                             │
│ PRICE (USD) — OPTIONAL                      │
│ ┌─────────────────────────────┐            │
│ │ e.g. 320                    │            │
│ └─────────────────────────────┘            │
│                                             │
│ [     Add to Collection     ]               │
└─────────────────────────────────────────────┘
```

**Features:**
- Auto-search with Fragrantica
- Live preview of details
- Accordion-style notes display
- Smooth animations
- Error handling

---

### 5. Risk Engine
```
┌─────────────────────────────────────────────┐
│ [⚡] The Risk Engine ────────────────────    │
│                                             │
│ ┌──────────────┐  ┌─────────────────────┐  │
│ │ SEARCH       │  │                     │  │
│ │              │  │    [Empty State]    │  │
│ │ TARGET       │  │                     │  │
│ │ FRAGRANCE    │  │   Search for a      │  │
│ │              │  │   target fragrance  │  │
│ │ [🔍] Search  │  │   and calculate     │  │
│ │              │  │   your risk         │  │
│ │ [Image]      │  │                     │  │
│ │              │  │                     │  │
│ │ Brand: Creed │  │                     │  │
│ │ Name: Avent. │  │                     │  │
│ │              │  │                     │  │
│ │ ACCORDS      │  │                     │  │
│ │ [Fruity]     │  │                     │  │
│ │ [Woody]      │  │                     │  │
│ │              │  │                     │  │
│ │ PRICE (USD)  │  │                     │  │
│ │ [320]        │  │                     │  │
│ │              │  │                     │  │
│ │ [Calculate]  │  │                     │  │
│ └──────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

### 6. Risk Dashboard (After Calculation)
```
┌─────────────────────────────────────────────┐
│ [✨] SCENT-INEL DASHBOARD                   │
│                                             │
│              ┌─────────┐                    │
│             ╱           ╲                   │
│            │             │                  │
│           │      75%      │                 │
│            │             │                  │
│             ╲           ╱                   │
│              └─────────┘                    │
│           RISK SCORE                        │
│                                             │
│    [⚠️] Proceed with Caution                │
│    "Get a decant first. High risk,         │
│     high reward."                           │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ [✨] AI INSIGHT                          │ │
│ │ Given your love for Aventus' fruity-    │ │
│ │ woody profile, this aligns well...      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ NOTE ALIGNMENT                              │
│        Woody                                │
│       ╱    ╲                                │
│  Fresh      Spicy                           │
│      │      │                               │
│  Sweet ──── Floral                          │
│                                             │
│ [─ Loved] [─ Hated] [─ Target]             │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ [💡] CLONE FINDER — PRO TIP              │ │
│ │ Zara — Vibrant Leather                  │ │
│ │ ~USD 18 · Shares the dry woody base     │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Features:**
- Animated circular gauge
- Color-coded verdict
- AI-generated insight
- Interactive radar chart
- Budget clone suggestion

---

## 🎨 Color Usage

### Primary Colors
```
Obsidian (#0A0A0A)
████████████████████  Background, depth

Champagne Gold (#D4AF37)
████████████████████  Primary accent, loved items

Electric Violet (#7C3AED)
████████████████████  Secondary accent, actions

Muted Slate (#94A3B8)
████████████████████  Text, labels
```

### Gradients
```
Gold Gradient
████████████████████  #D4AF37 → #F0D060

Violet Gradient
████████████████████  #7C3AED → #A78BFA

Glass Effect
████████████████████  rgba(255,255,255,0.03)
                      + backdrop-blur(20px)
```

---

## 🎭 Animation States

### Loading
```
[⚡] Analysing...
     ◐ ← Spinning border
```

### Success
```
[✓] 75% Risk Score
    ↑ Smooth arc fill
```

### Error
```
[×] Fragrance not found
    ↓ Fade out
```

### Hover
```
Card → Scale(1.02) + Shimmer
Button → Gradient shift
```

---

## 📱 Responsive Breakpoints

### Desktop (1024px+)
```
┌─────────────────────────────────────────────┐
│ [Navbar]                                    │
│ [Hero - Full Width]                         │
│ [Vault - Horizontal Scroll]                 │
│ [Engine - 2 Column Grid]                    │
└─────────────────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌───────────────────────────┐
│ [Navbar]                  │
│ [Hero - Centered]         │
│ [Vault - Scroll]          │
│ [Engine - Stacked]        │
└───────────────────────────┘
```

### Mobile (< 768px)
```
┌─────────────┐
│ [Navbar]    │
│ [Hero]      │
│ [Vault]     │
│ [Engine]    │
└─────────────┘
```

---

## 🎯 Interaction Patterns

### Add Fragrance Flow
```
1. Click [+ Add] button
2. Modal opens with search bar
3. Type fragrance name
4. Click [Search]
5. Loading spinner (2-3s)
6. Details auto-populate
7. Optionally add price
8. Click [Add to Collection]
9. Modal closes with fade
10. Card appears with slide-in
```

### Calculate Risk Flow
```
1. Search target fragrance
2. Details auto-populate
3. Optionally add price
4. Click [Calculate Risk]
5. Pulse animation (1-2s)
6. Dashboard fades in
7. Gauge animates (1.2s)
8. Verdict appears (0.8s delay)
9. AI insight loads (1s delay)
10. Radar chart renders (1.2s delay)
11. Clone suggestion (1.4s delay)
```

---

**This visual guide helps understand the UI structure and interaction patterns.**
