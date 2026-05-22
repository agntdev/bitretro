<div align="center">

# ₿ BitRetro

**A minimalist, retro-futuristic Bitcoin live-info site.**

Real-time Bitcoin price and market data wrapped in a 1970s/80s
retro-futurism × glam-disco design language.

[**▶ Live site**](https://agntdev.github.io/bitretro/) ·
[Design system](DESIGN_SYSTEM.md) ·
[Styleguide](styleguide.html)

</div>

---

## ✨ Features

- **Live Bitcoin price** — price, 1h & 24h change, market cap, 24h volume, high/low.
- **On-chain throughput** — transactions per second / minute / hour + latest block height.
- **Auto-refresh** every 30 seconds, with loading shimmer and graceful error states.
- **Retro-futuristic look** — neon glow, CRT scanlines, glitch transitions and a
  **WebGL disco-ball** background (with a pure-CSS fallback).
- **Fully responsive** — 320px phones through 1920px+ displays, touch-friendly.
- **Accessible** — semantic HTML, ARIA live regions, skip link, visible focus,
  full `prefers-reduced-motion` support, WCAG-AA-minded contrast.
- **Privacy-first** — no backend, no tracking by default; optional cookieless analytics.

## 🗂 Project structure

```
index.html              Main page
styleguide.html         Interactive design-system styleguide
404.html                Retro error page
DESIGN_SYSTEM.md        Design-system documentation
css/
  tokens.css            Design tokens (colors, type, spacing, glow, motion)
  fonts.css             Retro Google Fonts
  animations.css        Keyframes + glitch primitives
  components.css        Buttons, pills, cards, panels
  base.css              Reset + document defaults
  layout.css            Header / hero / price board / footer (BEM)
  data.css              Live-data loading & error states
  responsive.css        Breakpoints + flexible grids
  effects.css           Neon glow, scanlines, glitch, disco-ball fallback
js/
  main.js               Page shell behaviour (nav, scrollspy, year)
  price.js              Live Bitcoin/network data (CoinGecko + mempool.space)
  effects.js            WebGL disco-ball + glitch-on-refresh
  analytics.js          Opt-in, privacy-first analytics
docs/
  deploy-pages.yml      GitHub Pages workflow (copy to .github/workflows/)
```

## 🔌 Data sources

| Data | API |
|------|-----|
| Price, market cap, volume, high/low, 1h/24h change | [CoinGecko](https://www.coingecko.com/en/api) |
| Tx throughput & block height | [mempool.space](https://mempool.space/docs/api) |

Both are public, key-less and CORS-enabled — no backend required.

## 🚀 Run locally

It's a static site — no build step. Serve the folder with any static server:

```bash
# Python
python3 -m http.server 8080
# or Node
npx serve .
```

Then open <http://localhost:8080>.

## 📦 Deployment

A ready-to-use GitHub Pages workflow ships at
[`docs/deploy-pages.yml`](docs/deploy-pages.yml). Copy it into place to enable
auto-deploy on every push to `main`:

```bash
mkdir -p .github/workflows
cp docs/deploy-pages.yml .github/workflows/deploy.yml
```

Then set Settings → Pages → Source to **"GitHub Actions"**. A `.nojekyll` file
keeps Pages from reprocessing the assets.

> The workflow lives under `docs/` rather than `.github/workflows/` because
> committing workflow files requires a token with the `workflow` OAuth scope.

## 📈 Analytics (optional)

Tracking is **off by default**. To enable cookieless, GDPR-friendly page-view
analytics, set your domain in `index.html`:

```html
<meta name="bitretro:analytics-domain" content="yourdomain.com" />
```

The loader respects Do-Not-Track / Global-Privacy-Control and never sets cookies.

## ♿ Accessibility & performance notes

- Semantic landmarks, ARIA live regions on data, keyboard skip link, focus-visible rings.
- All motion (scanlines, glow, glitch, disco ball) collapses under `prefers-reduced-motion`.
- WebGL clamps device-pixel-ratio and pauses rendering when the tab is hidden.
- Scripts are `defer`-loaded; fonts use `display=swap`.

## 📄 License

[MIT](LICENSE) © 2026 BitRetro. Market data is informational only and not financial advice.
