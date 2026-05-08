# UI Redesign Prompt: Scentinel "Organic-Tech" Aesthetic

## 1. Vision & Design Language
**Scentinel** is evolving from a "Noir-Luxe" aesthetic to a **Nothing OS-inspired "Organic-Tech"** design language. The goal is to marry the industrial, minimal, and functional aesthetic of Nothing OS with the soft, ethereal, and organic nature of perfumes and botanical gardens.

### Core Principles:
- **Functional Minimalism**: No unnecessary elements. Every line and pixel serves a purpose.
- **Extreme Glassmorphism**: High backdrop-blur (20px+) on all containers to create a "frosted glass" look that overlays organic backgrounds.
- **Modular Widgets**: The interface should feel like a collection of interactive widgets on a dashboard.
- **Retrofuturism**: Dot-matrix typography combined with ultra-modern sans-serif fonts.

---

## 2. Visual Palette

### Colors:
- **Base**: 
  - Dark Mode: `#000000` (Background), `#1A1A1A` (Card base)
  - Light Mode: `#FFFFFF` (Background), `#F5F5F5` (Card base)
- **Glass**: Translucent white/black with `backdrop-filter: blur(24px)`.
- **Accents**:
  - **Nothing Red**: `#FF0000` (Used sparingly for "High Risk" or critical alerts).
  - **Leaf Green**: `#2E5A27` (For "Safe Buy" and woody/fresh scents).
  - **Petal Pink**: `#E6C7C2` (For floral/oriental scents).
  - **Mist Grey**: `#808080` (For secondary metadata).

### Typography:
- **Logos/Headings**: `Ndot` or `Space Mono` (Dot-matrix feel).
- **Primary Body**: `Inter` (Variable font weight 300-600).
- **Data/Technical**: `JetBrains Mono` (For accord percentages and notes).

---

## 3. UI Components Specification

### A. Global Navigation (Navbar)
- **Style**: A floating glassmorphism pill centered at the top.
- **Logo**: "SCENT-INEL" in dot-matrix font with a red dot at the end.
- **Interaction**: Subtle hover expansion on links; active state indicated by a small red dot below the text.

### B. Hero Section
- **Background**: A "breathing" mesh gradient of soft greens, pinks, and greys.
- **Imagery**: High-resolution macro photography of a perfume bottle or a flower (e.g., a dewy rose) that is slightly blurred and desaturated.
- **Call to Action**: A minimalist search bar with a "dot-matrix" search button.

### C. Fragrance Vault (The Widget Grid)
- **Container**: A rigid grid system (CSS Grid).
- **Cards**: 
  - Large corner radius (32px).
  - 1px border with a subtle gradient (glass edge).
  - Content should be clean: Image on the left (rounded), text on the right.
  - Hover: The "Glyph" effect—a thin border light pulses once when hovered.

### D. Risk Engine & Dashboard
- **Risk Gauge**: Replace the luxury watch-face with a "Nothing-style" progress bar or a circular dot-matrix visualization.
- **Accord Radar**: Use a monochromatic scheme with a single accent color (Green or Pink) based on the dominant accord.
- **Verdict Cards**: Clean, monochrome tiles with "SAFE", "CAUTION", or "AVOID" in bold dot-matrix text.

---

## 4. Botanical & Floral Elements
- **Icons**: Custom Lucide-React icons modified to look like "Nothing" glyphs (simple dots and lines forming floral shapes).
- **Background Textures**: Subtle, animated floral silhouettes that fade in and out like "scent trails."
- **Empty States**: A minimalist dot-matrix illustration of a single wilting or blooming flower.

---

## 5. Motion & Micro-interactions
- **Scent Diffusion**: Transitions between pages should use a soft "fade and blur" effect, mimicking fragrance diffusing in air.
- **Glyph Loading**: When analyzing a fragrance, show a sequence of dots lighting up (mimicking the Nothing Phone back lights).
- **Glass Hover**: When hovering over glass cards, increase the blur and decrease the opacity slightly for a "focus" effect.

---

## 6. CSS / Tailwind Implementation Notes
- Use `backdrop-blur-xl` for all containers.
- Use `rounded-[32px]` for the signature Nothing OS look.
- Use `border-white/10` or `border-black/5` for glass edges.
- Implement a custom font family for `dot-matrix` using a web font like "Ndot".
- Use `framer-motion` for all "diffusion" transitions.
