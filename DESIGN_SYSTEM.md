# BitRetro — Design System

> Retro-futurism × glam-disco. Deep-space backdrops, neon signage, chrome
> highlights and Bitcoin gold. This document is the human-readable companion to
> the machine-readable design tokens in [`css/tokens.css`](css/tokens.css).

A live, interactive version of everything below is in
[`styleguide.html`](styleguide.html) — open it in a browser to see the palette,
type scale, glow effects and components rendered.

---

## 1. Design principles

1. **Minimalist core, maximalist accents.** Generous negative space on
   deep-space backgrounds; neon and glow reserved for what matters (the price).
2. **Light is the brand.** Color comes from emitted light — neon glows, not flat
   fills. Use the `--glow-*` tokens rather than inventing new shadows.
3. **Coherence through tokens.** Never hard-code a color, size or font. Read from
   the CSS custom properties so the whole site moves together.
4. **Motion with restraint.** Effects evoke CRTs and disco, but every animation
   honours `prefers-reduced-motion`.

---

## 2. Color palette

### Neon
| Token | Hex | Use |
|---|---|---|
| `--color-neon-magenta` | `#ff2d95` | Primary accent, price-down |
| `--color-neon-pink` | `#ff4fd8` | Secondary accent |
| `--color-neon-cyan` | `#05d9e8` | Links, focus, data labels |
| `--color-neon-purple` | `#b026ff` | Disco accent, gradients |
| `--color-neon-green` | `#39ff14` | Price-up, success |
| `--color-neon-orange` | `#ff6b35` | Warm accent |

### Brand / Bitcoin
| Token | Hex | Use |
|---|---|---|
| `--color-bitcoin` | `#f7931a` | Canonical Bitcoin orange |
| `--color-gold` | `#ffd700` | Disco gold, highlights |

### Deep-space surfaces
`--color-bg-900` `#07010f` → `--color-bg-500` `#2a1158`, darkest (page) to
lightest (hover). Text ink runs `--color-ink` → `--color-ink-faint`.

### Gradients
`--grad-sunset`, `--grad-vapor`, `--grad-chrome`, `--grad-disco` (conic),
`--grad-space` (radial page background).

---

## 3. Typography

| Role | Token | Family |
|---|---|---|
| Display | `--font-display` | Audiowide |
| Heading | `--font-heading` | Orbitron |
| Body | `--font-body` | Chakra Petch |
| Data / mono | `--font-mono` | Share Tech Mono |
| CRT | `--font-crt` | VT323 |
| Pixel | `--font-pixel` | Press Start 2P |

Fonts load via [`css/fonts.css`](css/fonts.css) with `display=swap`.

**Fluid scale** (`clamp()`, scales mobile → desktop): `--fs-2xs` … `--fs-3xl`,
plus `--fs-hero`. Line heights `--lh-tight|snug|base`, letter-spacing
`--ls-tight|normal|wide|mega`.

---

## 4. Spacing, radii, layout

- **Spacing** — 4px base scale `--space-1` (4px) … `--space-10` (128px).
- **Radii** — `--radius-sm` (4px) … `--radius-xl` (28px), `--radius-pill`.
- **Layout** — `--container-max` 1240px, fluid `--container-pad`, `--header-h`.

---

## 5. Elevation & neon glow

Plain depth shadows: `--shadow-1`, `--shadow-2`, `--shadow-panel`.

Neon halos (use as `text-shadow` **or** `box-shadow`):
`--glow-cyan`, `--glow-magenta`, `--glow-purple`, `--glow-gold`, `--glow-green`,
`--glow-soft`.

```css
.price { color: var(--color-gold); text-shadow: var(--glow-gold); }
```

---

## 6. Motion

Easings `--ease-out|in-out|back`; durations `--dur-fast|med|slow`.
Reusable keyframes & helper classes live in
[`css/animations.css`](css/animations.css):

| Class | Effect |
|---|---|
| `.anim-pulse` | Neon breathing |
| `.anim-flicker` | Neon-tube flicker |
| `.anim-float` | Gentle float |
| `.anim-spin` | Slow rotation (disco) |
| `.anim-blink` | CRT cursor / live dot |
| `.text-gradient` | Animated vapor gradient text |
| `.glitch` | RGB-split glitch text (needs `data-text`) |
| `.glitch-burst` | One-shot glitch (e.g. on data refresh) |

```html
<h1 class="glitch" data-text="BITRETRO">BITRETRO</h1>
```

All motion is disabled under `@media (prefers-reduced-motion: reduce)`.

---

## 7. Component templates

Reference markup + classes are demonstrated in
[`styleguide.html`](styleguide.html). Core components: neon **buttons**
(primary / ghost), **stat cards** (label + value + delta), **pills/badges**,
**panels**, and the **glitch heading**. Components are styled with BEM-friendly
class names so they slot directly into the site layout built in T02.

---

## 8. On Figma

The task lists "Figma design files" as a deliverable. Since BitRetro is a
code-first, frontend-only project, the design system is delivered as **living
code** — design tokens (`css/tokens.css`) plus an interactive, rendered
styleguide (`styleguide.html`) — which is directly consumable by the build and
stays in sync with production. This is the authoritative source of truth in
place of static Figma exports.
