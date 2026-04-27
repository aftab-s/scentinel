Role
You are an expert Full-Stack Engineer and UI/UX Designer specializing in luxury lifestyle applications. Your goal is to build a high-fidelity web application that calculates the "Blind Buy Risk" of perfumes based on a user's existing collection and preferences.

Tech Stack
Frontend: React (Vite), Tailwind CSS, Framer Motion (for "liquid" animations).

Backend: Python (FastAPI).

Icons/Visuals: Lucide-React + Glassmorphism effects.

Design Philosophy: "Noir-Luxe & Funky"
Color Palette: - Primary: Deep Obsidian (#0A0A0A) and Champagne Gold (#D4AF37).

Accents: Electric Violet (for the "Funky" edge) and Muted Slate.

Atmosphere: Glassmorphism, blurred background gradients that mimic "sprayed mist," and high-contrast serif typography (Playfair Display) paired with clean mono fonts (JetBrains Mono) for technical data.

Feel: It should feel like a premium concierge app mixed with a Grafana dashboard.

Core Features & Components
1. The "Fragrance Vault" (User Profile)
Input: Users add perfumes they Love and Hate.

Data Points: Brand, Name, Main Accords (e.g., Woody, Spicy, Sweet).

UI: A horizontal scrolling "Shelf" with glass cards.

2. The "Risk Engine" (The Calculator)
Input: A search bar to enter a "Target Fragrance."

Logic: - Compare Target Notes vs. Love/Hate Notes.

Weighted Scoring: - +10 for matching "Love" notes.

-15 for matching "Hate" notes.

+5 for matching brand heritage if the user loves the house.

Output: A Risk Percentage (0-100%).

3. The "Scent-inel" Dashboard (UI Highlight)
The Gauge: A custom-styled circular progress bar that looks like a perfume bottle cap or a luxury watch face.

The Verdict: Dynamic text based on score:

80%+: "Signature Material. Pull the trigger."

50-70%: "Get a decant first. High risk, high reward."

<40%: "Stop. Your wallet will thank you later."

Note Breakdown: A "Radar Chart" showing how the target perfume aligns with the user's "Safe Zones."

4. "Clone Finder" (The Budget Feature)
A small "Pro-tip" section that suggests a highly-rated, budget-friendly alternative if the risk is high or the price is steep.

Implementation Instructions
Step 1: Frontend Structure
Create a Hero section with a "Mist" animation (Tailwind arbitrary values + Framer Motion).

Build a CollectionGrid component using glassmorphism: bg-white/5 backdrop-blur-md border border-white/10.

Step 2: Backend Logic (FastAPI)
Define a Fragrance model.

Implement a POST /calculate-risk endpoint that accepts user_profile and target_perfume.

Include a mock database (or JSON file) of common perfume notes and their categories (e.g., Bergamot = Fresh, Oud = Woody).

Step 3: Interaction Design
The "Pulse" Effect: When the calculator is "thinking," show a pulsing gold ring around the search button.

Micro-interactions: When a user adds a "Hate" note, the card should have a subtle "smoke" exit animation.

Final Goal
The user should feel like they are using a tool designed by a Software Engineer who spends too much time at high-end fragrance counters. It must be mathematically sound yet visually intoxicating.