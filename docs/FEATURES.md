# Scent-inel Features

## 🎯 Core Features

### 1. Auto-Fragrance Discovery
**No manual data entry required**

- **Smart Search**: Type fragrance name (e.g., "Creed Aventus")
- **Auto-Scraping**: Fetches from Fragrantica:
  - Brand & name
  - Main accords (Woody, Spicy, Fresh, etc.)
  - Top/middle/base notes
  - Product image
- **Instant Preview**: See all details before adding

### 2. AI-Powered Insights
**Groq AI (Llama 3.3 70B) Integration**

- **Personalized Analysis**: Considers your entire profile
- **Contextual Recommendations**: References specific notes and accords
- **Natural Language**: Sophisticated, concise advice
- **Example Output**: 
  > "Given your love for Aventus' fruity-woody profile and aversion to Sauvage's fresh spice, Oud Wood's deep woody-earthy base aligns well with your preferences. The shared smoky undertones make this a calculated risk worth taking."

### 3. Multi-Currency Support
**8 Major Currencies**

- USD, EUR, GBP, JPY, CAD, AUD, INR, and more
- **Live Conversion**: Accurate price comparisons
- **Persistent Selection**: Currency choice saved across sessions
- **Clone Pricing**: Budget alternatives shown in your currency

### 4. Risk Calculation Engine
**Mathematically Sound Scoring**

**Algorithm:**
```
Base Score: 50 (neutral)
+ 10 points per matching loved accord
- 15 points per matching hated accord
+ 5 points if you love the brand
= Final Score (0-100)
```

**Verdicts:**
- **80-100**: "Signature Material. Pull the trigger."
- **50-79**: "Get a decant first. High risk, high reward."
- **0-49**: "Stop. Your wallet will thank you later."

### 5. Visual Dashboard
**Luxury Watch-Face Gauge**

- **Animated Arc**: Smooth fill animation
- **Color-Coded**: Green (safe) → Gold (caution) → Red (danger)
- **Tick Marks**: 0, 25, 50, 75, 100 indicators
- **Glow Effect**: Dynamic shadow based on score

### 6. Accord Radar Chart
**Interactive Visualization**

- **3 Layers**:
  - **Gold**: Your loved accords
  - **Red**: Your hated accords
  - **Violet**: Target fragrance accords
- **Overlap Analysis**: See alignment at a glance
- **Tooltip**: Hover for exact values

### 7. Clone Finder
**Budget-Friendly Alternatives**

**Triggers:**
- Risk score < 70
- Target price > $100

**Database Includes:**
- Zara Vibrant Leather ($18) — Woody
- Armaf Club de Nuit Intense ($35) — Spicy
- Dossier Ambery Saffron ($29) — Sweet
- Nautica Voyage ($22) — Fresh
- And more...

### 8. Fragrance Vault
**Your Personal Collection**

- **Two Shelves**: Loved & Hated
- **Horizontal Scroll**: Smooth card carousel
- **Glassmorphism Cards**: Premium aesthetic
- **Quick Actions**: Add/remove with animations
- **Image Display**: Visual recognition

---

## 🎨 Design Features

### Visual Effects
- **Mist Animations**: Floating gradient blobs
- **Glassmorphism**: Blurred backgrounds with transparency
- **Pulse Rings**: Gold ring animation during calculation
- **Shimmer Hover**: Subtle gradient sweep on cards
- **Smooth Transitions**: Framer Motion throughout

### Typography
- **Playfair Display**: Elegant serif for headings
- **JetBrains Mono**: Technical monospace for data
- **Letter Spacing**: Carefully tuned for luxury feel

### Color System
- **Primary**: Deep Obsidian (#0A0A0A)
- **Accent 1**: Champagne Gold (#D4AF37)
- **Accent 2**: Electric Violet (#7C3AED)
- **Text**: Muted Slate (#94A3B8)

### Micro-Interactions
- **Card Hover**: Scale + shimmer
- **Button States**: Gradient shifts
- **Loading States**: Spinning borders
- **Exit Animations**: Smoke effect for hated fragrances

---

## 🔧 Technical Features

### Frontend
- **React 19**: Latest features
- **TypeScript**: Full type safety
- **Vite 8**: Lightning-fast HMR
- **Tailwind CSS v4**: Utility-first styling
- **Framer Motion**: 60fps animations
- **Recharts**: Data visualization

### Backend
- **FastAPI**: Modern Python API
- **Async/Await**: Non-blocking I/O
- **BeautifulSoup4**: HTML parsing
- **aiohttp**: Async HTTP client
- **Groq SDK**: AI inference
- **CORS**: Cross-origin support

### Performance
- **Code Splitting**: Lazy loading
- **Image Optimization**: WebP support
- **Caching**: API response caching
- **Debouncing**: Search input optimization

---

## 🚀 Future Enhancements

### Planned Features
- [ ] User accounts & cloud sync
- [ ] Social sharing (risk scores)
- [ ] Fragrance recommendations
- [ ] Price tracking & alerts
- [ ] Community ratings
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Batch import from Fragrantica profile

### API Improvements
- [ ] More fragrance databases (Basenotes, Parfumo)
- [ ] Price comparison across retailers
- [ ] Seasonal recommendations
- [ ] Occasion-based suggestions

---

## 📊 Use Cases

### 1. Blind Buy Decision
**Scenario**: Considering a $300 niche fragrance you've never smelled

**Solution**: 
1. Add your current favorites to Loved
2. Add fragrances you dislike to Hated
3. Search the target fragrance
4. Get risk score + AI insight
5. Make informed decision

### 2. Collection Building
**Scenario**: Want to diversify your collection

**Solution**:
1. Build comprehensive vault
2. Test multiple targets
3. Compare risk scores
4. Prioritize safe bets

### 3. Gift Shopping
**Scenario**: Buying fragrance for someone else

**Solution**:
1. Add their known favorites
2. Add their dislikes
3. Search gift options
4. Choose highest-scoring match

### 4. Budget Optimization
**Scenario**: Want designer quality at clone prices

**Solution**:
1. Search expensive target
2. Review Clone Finder suggestions
3. Compare accords
4. Save hundreds of dollars

---

**Built for fragrance enthusiasts who value data-driven decisions.**
