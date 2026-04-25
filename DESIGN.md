---
name: StudyBearer
description: Automating the friction of studying.
colors:
  primary: "#6366f1"
  secondary: "#8b5cf6"
  neutral-bg: "#0a0a0c"
  surface: "#121216"
  muted: "#a1a1aa"
  text: "#ffffff"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: StudyBearer

## 1. Overview

**Creative North Star: "The Tactical Command Center"**

StudyBearer is a cinematic, high-fidelity environment designed to transform the dread of studying into the focus of a tactical mission. The interface is an "infinite void"—a deep, cinematic black that recedes, allowing glowing neon accents to guide the user's attention. It feels like a premium developer tool or a high-end gaming dashboard.

**Key Characteristics:**
- **The Deep Void:** Cinematic black backgrounds (#0a0a0c) for maximum focus.
- **Neon Guidance:** Vibrant Indigo and Violet accents for primary actions and achievements.
- **Tactical Precision:** Sharp edges, monoline icons, and clear data visualization.
- **Glass-Neon Aesthetic:** Subtle glows and translucent surfaces instead of flat borders.

## 2. Colors

The palette is anchored in deep cinematic tones with high-energy neon accents.

### Primary
- **Neon Indigo** (#6366f1): The primary accent. Used for core CTAs, active progress, and primary glows.

### Secondary
- **Violet Arc** (#8b5cf6): Reserved for elite milestones, rank-ups, and secondary accents.

### Neutral
- **Deep Void** (#0a0a0c): The primary canvas. Reduces eye strain and creates an infinite feel.
- **Surface Grey** (#121216): Used for cards and interface containers to create depth.
- **Muted Steel** (#a1a1aa): Secondary text and inactive states.

### Named Rules
**The 10% Neon Rule.** Neon accents are used on ≤10% of the screen. Their impact comes from their rarity against the void.
**The No-Pure-White Rule.** Body text is slightly tinted or lowered in brightness to avoid harsh contrast; pure white is reserved for high-level headers and active highlights.

## 3. Typography

**Display Font:** Inter (Bold, tight tracking)
**Body Font:** Inter (Regular/Medium)

**Character:** Modern, technical, and highly legible. It feels precise and authoritative.

### Hierarchy
- **Display** (700, clamp(2rem, 5vw, 3.5rem), 1.1): Used for hero headlines and major section titles.
- **Title** (600, 1.25rem, 1.4): Used for card titles and sub-sections.
- **Body** (400, 1rem, 1.6): Standard reading text. Max line length ~70ch.
- **Label** (500, 0.75rem, 1.2, uppercase): Used for metadata, rank labels, and overlines.

## 4. Elevation

Depth is conveyed through tonal layering and glow, not traditional shadows.

### Shadow Vocabulary
- **Neon Glow** (`box-shadow: 0 0 20px rgba(99, 102, 241, 0.3)`): Used for active states and high-tier elements.
- **Surface Lift** (`background: #121216`): Subtle elevation through color shift.

### Named Rules
**The Glow-Response Rule.** Elements only glow in response to state (active, hover) or to indicate "the next tactical move."

## 5. Components

### Buttons
- **Shape:** Rounded-xl (12px)
- **Primary:** Neon Indigo background with a subtle glow.
- **Ghost:** Muted Steel border, transitioning to Neon Indigo on hover.

### Cards
- **Style:** Surface Grey background, 16px radius, subtle 1px border (#ffffff12).
- **Active Card:** Features a faint Indigo aura or glow.

### Progress Bars
- **Track:** Deep Void or dark Surface Grey.
- **Fill:** Neon Indigo gradient (Indigo to Violet).

## 6. Do's and Don'ts

### Do:
- **Do** use OKLCH for smooth gradients between Indigo and Violet.
- **Do** keep the background at #0a0a0c.
- **Do** use monoline, sharp iconography.

### Don't:
- **Don't** use "startup white" or flat minimal themes.
- **Don't** use cyan or slate colors (deprecated—transitioning to Indigo/Void).
- **Don't** use border-left "stripes" as accents.
- **Don't** use glassmorphism as a default; reserve it for overlays.
