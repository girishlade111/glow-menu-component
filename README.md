# Glow Menu Component

An animated navigation menu bar with a 3D card-flip hover effect and per-item radial glow — built with Next.js, Framer Motion, Tailwind CSS, and shadcn/ui.

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-latest-FF0080?style=for-the-badge&logo=framer)
![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=for-the-badge&logo=pnpm)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Quickstart](#quickstart)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Customization](#customization)
- [Configuration & Environment](#configuration--environment)
- [Third-Party Integrations](#third-party-integrations)
- [Build & Deployment](#build--deployment)
- [Documentation](#documentation)
- [Known Issues](#known-issues)
- [Roadmap Ideas](#roadmap-ideas)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)

---

## Overview

**Glow Menu Component** is a polished, animated navigation bar where each menu item flips in 3D on hover while a colored radial glow blooms behind it. A full-width gradient wash sweeps across the bar itself, with intensity that adapts to the active theme.

It started life as a [v0.app](https://v0.app)-generated project and is structured as a drop-in component (`components/menu-bar.tsx`) plus a minimal demo page. There is no backend, no database, and no API — it is pure UI, which makes it easy to lift the component into any Next.js + Tailwind project.

---

## Features

- **3D card-flip on hover** — each menu item rotates on the X axis (`rotateX: -90°`) revealing a back face, driven by Framer Motion spring physics with a `600px` perspective.
- **Per-item radial glow** — every item carries its own glow color (blue, orange, green, red) that fades in and springs to 2× scale behind the item on hover.
- **Bar-wide gradient wash** — a blue → purple → red radial glow sweeps across the entire nav container on hover, automatically dimmer in light mode and stronger in dark mode.
- **Light / dark theme toggle** — manual Sun/Moon switch powered by `next-themes` (class-based dark mode, system theme disabled by default).
- **CSS-variable design system** — the full palette lives as HSL variables in `styles/globals.css`; retheming means editing variables, not components.
- **Glassmorphism container** — `backdrop-blur`, translucent gradient background, subtle border.
- **Accessible primitives** — theme toggle built on Radix Switch via shadcn/ui; `aria-label` on the toggle.
- **Zero-config deployment** — no environment variables, no secrets, no backend; deploys to Vercel (or any static host) as-is.

---

## Demo

Run it locally:

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000). Hover any menu item to see the flip + glow. Flip the Sun/Moon switch to compare the glow intensity in light vs. dark mode.

---

## Tech Stack

| Layer | Technology | Version | Role |
|-------|-----------|---------|------|
| Framework | Next.js (App Router) | 15.2.8 | Routing, SSR, build |
| UI library | React | 19 | Component model |
| Language | TypeScript | 5 (strict) | Type safety |
| Styling | Tailwind CSS | 3.4.17 | Utility-first CSS |
| Animation | Framer Motion | latest | Flip + glow physics |
| Theming | next-themes | latest | `.dark` class management |
| Components | shadcn/ui + Radix UI | various | Switch primitive, `cn()` helper |
| Icons | Lucide | 0.454.0 | Menu + toggle icons |
| Fonts | Inter (`next/font`) + Geist vars | — | Typography |
| Package manager | pnpm | 8+ | Installs / lockfile |
| Hosting | Vercel | — | Original deployment target |
| Generation | v0.app | — | Original scaffold + sync |

Only a fraction of the installed Radix packages are used by the current pages — the rest are scaffold leftovers ready for future components. See [docs/THIRD_PARTY_INTEGRATIONS.md](docs/THIRD_PARTY_INTEGRATIONS.md) for the full inventory.

---

## Quickstart

**Prerequisites:** Node.js 18.18+ (20 LTS recommended), pnpm 8+.

```bash
# Clone
git clone https://github.com/girishlade111/glow-menu-component.git
cd glow-menu-component

# Install
pnpm install

# Develop
pnpm dev        # http://localhost:3000

# Production build + serve
pnpm build
pnpm start

# Lint
pnpm lint
```

No `.env` file. No setup wizard. No external services.

---

## Project Structure

```
glow-menu-component/
├── app/
│   ├── layout.tsx            # Root layout: Inter font + ThemeProvider
│   └── page.tsx              # Demo page: ThemeToggle + MenuBar
├── components/
│   ├── menu-bar.tsx          # ★ The component — flip + glow nav bar
│   ├── theme-provider.tsx    # next-themes wrapper
│   ├── theme-toggle.tsx      # Sun/Moon switch
│   └── ui/
│       └── switch.tsx        # shadcn Switch (Radix)
├── lib/
│   └── utils.ts              # cn() class merger
├── styles/
│   └── globals.css           # Tailwind + light/dark CSS variables
├── public/                   # Placeholder images
├── docs/
│   ├── ENVIRONMENT_VARIABLES.md
│   ├── CONFIGURATION.md
│   ├── THIRD_PARTY_INTEGRATIONS.md
│   └── DEVELOPER_GUIDE.md
├── components.json           # shadcn/ui CLI config
├── tailwind.config.ts        # Tailwind theme tokens
├── postcss.config.mjs        # CSS pipeline
├── next.config.mjs           # Next.js build options
├── tsconfig.json             # TS options + @/* alias
└── package.json              # Scripts + dependencies
```

---

## How It Works

### The 3D flip

Each menu item renders **two stacked links**: a front face and a back face, both with `transform-style: preserve-3d`, inside a parent with `perspective: 600px`. On hover:

- front face: `rotateX: 0 → -90°`, opacity → 0 (rotates away around its bottom edge)
- back face: `rotateX: 90° → 0`, opacity → 1 (rotates in around its top edge)

Both share one spring transition (`stiffness: 100, damping: 20`), so the flip reads as a single rigid card turning over.

### The glow

Two layers, both Framer Motion variants:

1. **Item glow** — a `div` with an inline `radial-gradient` (unique per item) that fades in and springs from `scale: 0.8 → 2` behind the hovered item.
2. **Nav glow** — an absolutely-positioned blue/purple/red radial wash across the whole bar that fades in on any hover, with opacity tuned per theme (`useTheme()` switches `/20` light vs `/30` dark).

### Theming

`theme-toggle.tsx` calls `setTheme()` from `next-themes` → toggles the `.dark` class on `<html>` → Tailwind (`darkMode: 'class'`) and the `:root`/`.dark` HSL variables in `styles/globals.css` swap the palette. Full flow documented in [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) §6.

---

## Customization

### Add a menu item

```tsx
// components/menu-bar.tsx — add to the menuItems array
import { Search } from "lucide-react";

{
  icon: <Search className="h-5 w-5" />,
  label: "Search",
  href: "/search",
  gradient: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(147,51,234,0.06) 50%, rgba(126,34,206,0) 100%)",
  iconColor: "text-purple-500",
},
```

Keep the gradient stops at `0.15 → 0.06 → transparent` for a consistent look.

### Retheme

Edit the HSL triplets in `styles/globals.css` (`:root` = light, `.dark` = dark). Every `bg-background`, `text-foreground`, `border-border` class follows automatically.

### Tune the animation

- Flip speed/feel → `sharedTransition` (spring `stiffness`/`damping`) in `menu-bar.tsx`
- Glow bloom → `glowVariants.hover.transition`
- Default theme → `defaultTheme` in `app/layout.tsx` (`"light"` today)

More recipes (new shadcn components, static export, OS-theme support) live in the [Developer Guide](docs/DEVELOPER_GUIDE.md) §5.

---

## Configuration & Environment

- **Environment variables:** none required, none present. Full reference (loading order, `NEXT_PUBLIC_` rules, Vercel dashboard setup for future vars): [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)
- **Every config file explained** (`next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `components.json`, `.gitignore`, `package.json` scripts): [docs/CONFIGURATION.md](docs/CONFIGURATION.md)

> Heads-up: `next.config.mjs` currently sets `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors` (v0 defaults). Fine for a demo — remove them once this is treated as production code.

---

## Third-Party Integrations

| Integration | Status |
|-------------|--------|
| v0.app (generation + git sync) | ✅ Configured |
| Vercel (hosting + deploys) | ✅ Configured |
| Vercel Analytics | ❌ Removed (was installed but never wired — see [audit](docs/AUDIT.md) §7) |
| Framer Motion, next-themes, Lucide, Radix/shadcn | ✅ Used in code |

Details, caveats, and the add-an-integration playbook: [docs/THIRD_PARTY_INTEGRATIONS.md](docs/THIRD_PARTY_INTEGRATIONS.md)

---

## Build & Deployment

**Live:** [https://glow-menu-component.pages.dev](https://glow-menu-component.pages.dev) (Cloudflare Pages)

```bash
pnpm build    # static export → out/
pnpm start    # serve production locally
```

The repo ships with `output: "export"` in `next.config.mjs`, so `pnpm build` emits a fully static site in `out/` — deployable to Cloudflare Pages, Netlify, or GitHub Pages as-is. Zero env vars needed.

**Vercel (alternative):** import the repo → accept the Next.js preset → deploy. (Static export also works on Vercel.)

---

## Documentation

| Document | Covers |
|----------|--------|
| [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) | `.env` conventions, loading order, `NEXT_PUBLIC_` rules, Vercel env setup |
| [docs/CONFIGURATION.md](docs/CONFIGURATION.md) | Every config file, setting-by-setting, with verdicts |
| [docs/THIRD_PARTY_INTEGRATIONS.md](docs/THIRD_PARTY_INTEGRATIONS.md) | v0, Vercel, Analytics, library inventory, integration playbook |
| [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) | Setup, architecture, common tasks, theming flow, troubleshooting |
| [docs/AUDIT.md](docs/AUDIT.md) | 2026-09-27 full audit: 10 findings fixed, 10/10 E2E results |

---

## Known Issues

All previously known issues were fixed in the [2026-09-27 audit](docs/AUDIT.md):

1. ✅ **Dynamic Tailwind class** — `group-hover:${item.iconColor}` now works via `safelist` in `tailwind.config.ts` (E2E-verified: hovered icon renders `rgb(59,130,246)`).
2. ✅ **`components.json` CSS path** — corrected to `styles/globals.css`.
3. ⚠️ **Build ignores type/lint errors** — `next.config.mjs` still sets `ignoreDuringBuilds`/`ignoreBuildErrors` (v0 defaults). `tsc` and ESLint are clean today, so these can be removed to make CI fail loudly.

---

## Roadmap Ideas

- [ ] ~~Fix the dynamic-class issue and restore per-item icon hover colors~~ ✅ fixed (2026-09-27 audit)
- [ ] ~~Wire up `@vercel/analytics` (or remove it)~~ ✅ removed (2026-09-27 audit)
- [ ] Active-route highlighting (`usePathname` → persistent glow on the current page)
- [ ] Keyboard navigation + `aria-current` for a11y
- [ ] Mobile variant (bottom tab bar with the same glow language)
- [ ] Extract `MenuBar` as a standalone publishable package with props API (`items`, `glowIntensity`, `flipDuration`)
- [ ] Pin `latest`-tagged dependencies for reproducible installs

---

## Contributing

1. Fork the repo and create a branch: `git checkout -b feat/my-change`
2. `pnpm install` → make your change → `pnpm dev` to verify visually
3. Run `pnpm build` and `pnpm lint`; fix what they report (note the config currently silences some errors — check manually with `pnpm tsc --noEmit`)
4. Open a pull request with a clear description and, for visual changes, a screenshot or GIF

---

## License

No license file is declared in this repository. All rights reserved by default — add a `LICENSE` (MIT recommended for a UI component) if you want others to reuse this code freely.

---

## Credits

Built by **Girish Lade** — [ladestack.in](https://ladestack.in)

Original scaffold generated with [v0.app](https://v0.app) by Vercel.
