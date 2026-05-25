---
name: Krama Jawi Heritage
colors:
  surface: '#16130b'
  surface-dim: '#16130b'
  surface-bright: '#3d392f'
  surface-container-lowest: '#110e07'
  surface-container-low: '#1f1b13'
  surface-container: '#231f17'
  surface-container-high: '#2d2a21'
  surface-container-highest: '#38342b'
  on-surface: '#eae1d4'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#eae1d4'
  inverse-on-surface: '#343027'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#c8c6c7'
  on-secondary: '#313031'
  secondary-container: '#4a494a'
  on-secondary-container: '#bab8b9'
  tertiary: '#cfcecf'
  on-tertiary: '#303031'
  tertiary-container: '#b3b2b3'
  on-tertiary-container: '#454546'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e5e2e3'
  secondary-fixed-dim: '#c8c6c7'
  on-secondary-fixed: '#1c1b1c'
  on-secondary-fixed-variant: '#474647'
  tertiary-fixed: '#e4e2e3'
  tertiary-fixed-dim: '#c8c6c7'
  on-tertiary-fixed: '#1b1c1d'
  on-tertiary-fixed-variant: '#464748'
  background: '#16130b'
  on-background: '#eae1d4'
  surface-variant: '#38342b'
  gold-gradient-start: '#D4AF37'
  gold-gradient-mid: '#99907C'
  surface-accent: '#1F1F20'
  outline-muted: '#4D4635'
typography:
  display-hero:
    fontFamily: Great Vibes
    fontSize: 60px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Newsreader
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Bodoni Moda
    fontSize: 10px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.4em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 480px
  edge-margin: 1.5rem
  section-gap: 6rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style
The brand personality is deeply rooted in Javanese heritage—elegant, respectful, and sophisticated. It targets a refined audience, evoking an emotional response of warmth, tradition, and premium exclusivity.

The design style is **Editorial Minimalism mixed with Heritage Accents**. It utilizes high-contrast serif typography and generous whitespace common in luxury editorials, but grounds it with tactile cultural elements like the "Mega Mendung" batik patterns and "Gunungan Wayang" silhouettes. The interface feels like a high-end digital invitation, balancing the weight of tradition with the fluidity of modern motion (subtle pulses and slide-up reveals).

## Colors
The palette is dominated by a luxurious "Heritage Gold" set against an "Obsidian Black" background to create a deep, immersive experience.

- **Primary (Gold):** Used for key accents, headings, and call-to-action elements. It frequently appears as a linear gradient (Gold to Muted Bronze) to simulate a metallic sheen.
- **Secondary (Obsidian):** The foundation of the dark mode interface, providing high contrast for gold and light grey text.
- **Neutral (Slate/Silver):** Used for body text and descriptive labels to ensure legibility without competing with the primary gold.
- **Accents:** Muted bronze and deep charcoal are used for dividers and secondary containers to maintain a subtle hierarchy.

## Typography
The typography system uses a tri-font approach to convey different layers of meaning:
- **Great Vibes (Display):** Reserved for names and the primary "Undangan" title. It is the emotional heart of the design, representing the personal, handwritten touch.
- **Playfair Display (Headlines):** Used for dates and major section headers. It provides the "Editorial" feel and structural authority.
- **Newsreader (Body):** Used for Javanese philosophy and descriptive text. Its high legibility and classic serif look reinforce the literary nature of the content.
- **Bodoni Moda (Labels):** Used for small, uppercase metadata and navigation labels. It adds a fashion-forward, modern luxury finish.

## Layout & Spacing
The layout follows a **Fixed Mobile-First Grid** optimized for a 480px width, centered on larger screens with a deep shadow to mimic a physical card or mobile device. 

- **Vertical Rhythm:** Large gaps (96px+) between major sections (Hero, Event, Footer) are essential to maintain the "minimalist luxury" feel.
- **Safe Areas:** A standard 24px (1.5rem) horizontal padding is used for all text content.
- **Alignment:** Content is primarily center-aligned for the hero and event sections to emphasize symmetry, shifting to right-aligned in the footer for a modern, unexpected finish.

## Elevation & Depth
The system avoids heavy drop shadows for components, instead using **Tonal Layers and Glassmorphism**:
- **Fixed Elements:** The top app bar and bottom navigation use a high-opacity backdrop blur (80-95%) and a subtle top/bottom border in `outline-muted`.
- **Containers:** Content cards (like the event schedule) are defined by slightly lighter surface values (`surface-container-low`) rather than shadows, creating a "flat but layered" look.
- **Imagery:** Hero illustrations (Chibi characters) utilize a soft ambient shadow to lift them off the background without breaking the overall flat editorial aesthetic.

## Shapes
The shape language is primarily **Sharp & Architectural** with selective softness:
- **Buttons:** Use a square or nearly square corner (4px) to maintain a formal, serious tone.
- **Feature Cards:** Use a larger radius (8px to 16px) specifically for the main event containers to make them feel more approachable and distinct from the background.
- **Navigation:** The bottom bar uses a heavily rounded top-edge (24px) to create a "docked" feel that is friendly to thumb interactions.

## Components
- **Primary Buttons:** Rectangular, full-width, utilizing the primary Gold color with `on-primary` (dark) text. They should include a small leading icon for clarity.
- **Event Cards:** A combined container with a vertical divider. Time is displayed in `headline-md`, while titles use `label-caps` with an "active subtle pulse" animation.
- **Navigation Bar:** Iconic representation using `material-symbols-outlined` with a fill state for active items. Labels are extremely small (9px) to keep the focus on the icons.
- **Dividers:** Minimalist 1px lines or small 2px height blocks, often centered or aligned to the dominant text side, using primary gold at 40% opacity.
- **Badges:** Pill-shaped, semi-transparent backgrounds with uppercase gold text, used for section indicators.