---
name: Aeterna Editorial
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c7c6c6'
  on-secondary: '#2f3031'
  secondary-container: '#464747'
  on-secondary-container: '#b5b5b5'
  tertiary: '#ffffff'
  on-tertiary: '#313030'
  tertiary-container: '#e5e2e1'
  on-tertiary-container: '#656464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Cinzel
    fontSize: 80px
    fontWeight: '400'
    lineHeight: 90px
    letterSpacing: 0.05em
  display-lg-mobile:
    fontFamily: Cinzel
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: 0.05em
  headline-lg:
    fontFamily: Cinzel
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: 0.1em
  headline-md:
    fontFamily: Cinzel
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: 0.15em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '300'
    lineHeight: 32px
    letterSpacing: 0.02em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.2em
  quote:
    fontFamily: Cinzel
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 44px
spacing:
  section-gap: 160px
  element-gap: 32px
  margin-desktop: 80px
  margin-mobile: 24px
  gutter: 24px
  max-width: 1200px
---

## Brand & Style

The design system is a manifestation of **Minimalist Luxury**, designed to transform the digital wedding invitation into a high-end editorial experience. It targets a sophisticated audience that values understated elegance, exclusivity, and the timelessness of a boutique fashion magazine.

The emotional response is one of reverence and quiet confidence. By utilizing a "Void-Space" philosophy—where the deep black background acts as a physical stage—the UI recedes to allow high-resolution photography and razor-sharp typography to take center stage. The style is **Minimalist with a High-Contrast Editorial lean**, favoring deliberate composition over decorative elements. It avoids all trends of "app-like" interfaces in favor of a cinematic, immersive storytelling flow.

## Colors

The palette is strictly monochromatic to maintain an atmosphere of formal prestige.

- **Background (#0A0A0A):** A "True Black" variant that provides infinite depth, ensuring that imagery appears to float within the viewport.
- **Primary Text (#FFFFFF):** High-contrast white for maximum legibility and a crisp, expensive feel. Used for all primary headings and active states.
- **Secondary Text (#8C8C8C):** A muted slate grey used for metadata, labels, and supplementary information to establish a clear visual hierarchy.
- **Accent/Surface (#1A1A1A):** A subtle elevation color used for interactive containers or separators, keeping the contrast low and the focus on the content.

## Typography

Typography is the cornerstone of this design system. We utilize **Cinzel**, a typeface inspired by classical Roman inscriptions, for all display and headline roles to evoke history and formality. **Inter** is utilized for body text and functional labels, providing a clean, modernist counterpoint that ensures effortless readability.

Key principles:
- **Generous Leading:** Body text uses wide line heights (1.6x - 1.8x) to create an airy, unhurried reading experience.
- **Extreme Letter Spacing:** Headlines and labels use expanded tracking to signal luxury and precision.
- **Visual Hierarchy:** Use `display-lg` for names and key dates only. Use `label-caps` for section headers (e.g., "THE VENUE", "RSVP").

## Layout & Spacing

This design system employs a **Fixed Centered Grid** for desktop and a **Fluid Single Column** for mobile. The layout is inspired by luxury print magazines, utilizing asymmetrical placements and large negative spaces.

- **Breakpoints:** Mobile (<768px), Tablet (768px-1024px), Desktop (>1024px).
- **Vertical Rhythm:** Sections are separated by massive vertical gaps (`section-gap`) to allow the user to focus on one "moment" at a time.
- **Asymmetry:** Content should not always be centered. Align text to the left or right of images to create a dynamic, editorial feel. 
- **Image Treatment:** Use full-bleed imagery or large containers with significant padding to frame the photography like art in a gallery.

## Elevation & Depth

To maintain the minimalist aesthetic, this design system avoids traditional drop shadows and blurs. Depth is achieved through **Tonal Layering** and **Line Work**.

- **Flat Surfaces:** Interactive elements exist on the same plane as the background or on a slightly elevated surface (`#1A1A1A`).
- **Hairline Borders:** Use 1px borders in `#FFFFFF` with 20% opacity to define sections or form inputs. This creates structure without adding visual bulk.
- **Parallax:** Subtle vertical parallax on background images provides a sense of physical depth as the user scrolls, simulating the turning of heavy paper pages.

## Shapes

The shape language is strictly **Sharp (0px)**. 

Every element—from buttons and input fields to image containers—uses 90-degree corners. This rigidity reinforces the formal, architectural nature of the brand. Circular elements are permitted only for specific decorative icons (e.g., a "scroll" indicator) or if the photography itself contains organic shapes, providing a contrast to the UI's strict geometry.

## Components

### Buttons
Primary buttons are outlined (ghost style) or solid white with black text. They must use `label-caps` typography. The hover state should involve a color inversion (e.g., white background transitions to transparent with a white border).

### Input Fields (RSVP)
Inputs consist of a single bottom border (1px, `#8C8C8C`). When focused, the border transitions to `#FFFFFF`. Labels stay above the input in `label-caps` at a smaller scale.

### Cards
Cards are used sparingly for "Events" or "Registry" items. They should have no background and no shadow, defined only by a 1px hairline border or simple vertical spacing.

### Image Gallery
Use a masonry or "Lookbook" style layout. Images should vary in aspect ratio (2:3 and 4:5) to mimic a magazine spread. Captions use `body-md` in `secondary-text`.

### Navigation
A minimal, persistent header. Use a simple text-based "Menu" or "RSVP" button in the corners. The navigation should feel like a folio header, not a traditional website nav-bar.