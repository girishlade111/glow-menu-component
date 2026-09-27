# Developer Guide — Glow Menu Component

Everything a developer needs to set up, understand, modify, and ship this project.

---

## 1. Prerequisites

| Tool | Required version | Notes |
|------|------------------|-------|
| Node.js | 18.18+ (20 LTS recommended) | Next.js 15.2.4 requirement |
| pnpm | 8+ | This repo commits `pnpm-lock.yaml`; do not mix with npm/yarn |
| Git | any recent | — |
| A browser | any modern | Chrome/Edge/Firefox/Safari |

Check yours:

```bash
node -v
pnpm -v
```

---

## 2. Setup

```bash
# 1. Clone
git clone https://github.com/girishlade111/glow-menu-component.git
cd glow-menu-component

# 2. Install dependencies
pnpm install

# 3. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the theme toggle and the glowing menu bar centered on the page.

No `.env` file is needed (see `docs/ENVIRONMENT_VARIABLES.md`). No database, no API keys, no extra services.

### Useful commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Dev server with hot reload |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build locally (run `pnpm build` first) |
| `pnpm lint` | ESLint check |

---

## 3. Project Structure

```
glow-menu-component/
├── app/
│   ├── layout.tsx        # Root layout: Inter font, ThemeProvider, <html>/<body>
│   └── page.tsx          # Home page: renders ThemeToggle + MenuBar
├── components/
│   ├── menu-bar.tsx      # ★ The main component — animated glowing nav bar
│   ├── theme-provider.tsx# next-themes wrapper (client component)
│   ├── theme-toggle.tsx  # Sun/Moon switch that flips light/dark
│   └── ui/
│       └── switch.tsx    # shadcn Switch (Radix primitive)
├── lib/
│   └── utils.ts          # cn() class-name helper (clsx + tailwind-merge)
├── styles/
│   └── globals.css       # Tailwind directives + light/dark CSS variables
├── public/               # Static assets (placeholder images only)
├── docs/                 # This documentation set
├── components.json       # shadcn/ui CLI configuration
├── tailwind.config.ts    # Tailwind theme + content paths
├── postcss.config.mjs    # PostCSS → Tailwind pipeline
├── next.config.mjs       # Next.js build behavior
├── tsconfig.json         # TypeScript options + @/* path alias
└── package.json          # Scripts + dependencies
```

**Mental model:** `page.tsx` is a demo stage. The product is `menu-bar.tsx`. Everything else is scaffolding (theme, fonts, CSS tokens).

---

## 4. Anatomy of `MenuBar` (`components/menu-bar.tsx`)

Read this before changing any animation or menu item.

### The data: `menuItems`

```ts
const menuItems: MenuItem[] = [
  { icon: <Home className="h-5 w-5" />, label: "Home", href: "#",
    gradient: "radial-gradient(circle, rgba(59,130,246,0.15) ...)",
    iconColor: "text-blue-500" },
  // … Notifications (orange), Settings (green), Profile (red)
];
```

Each item carries its own **glow gradient** (inline `radial-gradient` style) and an **icon color**. These are per-item, so each menu entry glows in its own color.

### The animation system (Framer Motion variants)

| Variant | Role |
|---------|------|
| `itemVariants` | Front face: `rotateX: 0 → -90`, fades out on hover |
| `backVariants` | Back face: starts at `rotateX: 90` (hidden), flips to `0` on hover |
| `glowVariants` | The radial glow behind the item: fades in and springs to `scale: 2` on hover |
| `navGlowVariants` | A full-width blue→purple→red radial wash behind the whole nav bar, theme-aware (stronger opacity in dark mode) |
| `sharedTransition` | Spring (`stiffness: 100, damping: 20`) shared by both faces so the flip looks like one rigid card |

The trick: two absolutely-stacked `<motion.a>` elements with `transformStyle: "preserve-3d"` and a `600px` perspective on the parent. Hovering flips the front face away (`rotateX: -90`, origin bottom) while the back face rotates in (`rotateX: 90 → 0`, origin top) — a classic 3D card-flip.

### Theme awareness

`const { theme } = useTheme()` from `next-themes` switches the nav-glow opacity between dark (`/30`) and light (`/20`). The item gradients are theme-independent.

### ✅ Fixed: dynamic Tailwind classes (2026-09-27 audit)

```tsx
className={`... group-hover:${item.iconColor} ...`}
```

Tailwind compiles only class names it can find as literal strings. The four resulting classes (`group-hover:text-blue-500/orange-500/green-500/red-500`) are now safelisted in `tailwind.config.ts`, so the per-item icon hover colors render — E2E-verified.

---

## 5. Common Tasks

### Add a menu item

Edit the `menuItems` array in `components/menu-bar.tsx`:

```tsx
import { Home, Settings, Bell, User, Search } from "lucide-react";

{
  icon: <Search className="h-5 w-5" />,
  label: "Search",
  href: "/search",
  gradient: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(147,51,234,0.06) 50%, rgba(126,34,206,0) 100%)",
  iconColor: "text-purple-500",
},
```

Rules: keep the gradient shape `rgba(COLOR,0.15) 0% → rgba(COLOR,0.06) 50% → transparent 100%` for visual consistency; use any Lucide icon; point `href` at a real route instead of `"#"`.

### Change the glow colors

Each item's glow is the inline `gradient` string in `menuItems`. The bar-wide wash is the `navGlowVariants` div — edit the `via-*` Tailwind classes there.

### Retheme the app (light/dark palette)

Don't touch components. Edit the HSL variables in `styles/globals.css`:

- `:root` → light theme
- `.dark` → dark theme

Every `bg-background`, `text-foreground`, `border-border`, etc. follows automatically. `tailwind.config.ts` maps the class names to these variables — see `docs/CONFIGURATION.md` §3 and §7.

### Change animation feel

Tune `sharedTransition` (spring stiffness/damping) for the flip speed, `glowVariants.hover.transition` for the glow bloom. Higher `stiffness` = snappier; higher `damping` = less overshoot.

### Add a new shadcn component

1. Run `pnpm dlx shadcn@latest add <component>` (e.g. `dialog`, `dropdown-menu` — their Radix packages are already installed).
2. Import from `@/components/ui/<component>`.

(The stale `css` path that used to break this was fixed in the 2026-09-27 audit.)

### Change the default theme

In `app/layout.tsx`: `<ThemeProvider attribute="class" defaultTheme="light" disableSystemTheme>` — set `defaultTheme="dark"` for dark-first. Remove `disableSystemTheme` (both here and in `theme-provider.tsx`) to respect the OS preference.

---

## 6. Theming Architecture (How Dark Mode Works)

```
theme-toggle.tsx  →  setTheme("dark" | "light")
        ↓
next-themes  →  toggles .dark class on <html>
        ↓
tailwind.config.ts (darkMode: 'class')  +  styles/globals.css (.dark vars)
        ↓
menu-bar.tsx reads useTheme() for the glow-intensity switch
```

Three layers cooperate: the state manager (`next-themes`), the class hook (Tailwind `dark:` variants — currently unused in components, but available), and the CSS-variable swap (`:root` ↔ `.dark`). The menu bar itself mostly relies on the variable swap; it only reads `theme` directly for glow opacity.

---

## 7. Build & Deploy

```bash
pnpm build   # type-check + production bundle → .next/
pnpm start   # serve it at http://localhost:3000
```

**Deploy to Vercel (recommended):** import the GitHub repo in the Vercel dashboard, accept the Next.js preset, deploy. No env vars needed. Every push redeploys.

**Deploy as static files:** add `output: "export"` to `next.config.mjs`, run `pnpm build`, and host the `out/` directory on Cloudflare Pages, Netlify, or GitHub Pages. (`images.unoptimized: true` is already set, which static export requires.)

> Note: `next.config.mjs` currently ignores ESLint and TypeScript build errors (v0 defaults). Before treating this as production code, fix any reported errors and remove those two ignores — see `docs/CONFIGURATION.md` §2.

---

## 8. Code Conventions

- **Path alias:** always import with `@/` (`@/components/menu-bar`), never relative `../../` paths.
- **Client components:** any file using hooks, browser APIs, or Framer Motion interaction props starts with `"use client"`. Server Components are the default elsewhere.
- **Styling:** Tailwind utilities + `cn()` from `@/lib/utils` for conditional classes. Raw CSS only in `styles/globals.css`.
- **Icons:** Lucide only (`lucide-react`), sized via `className="h-5 w-5"`-style classes.
- **No emojis in UI**, no hardcoded colors outside the CSS-variable system (the per-item glow gradients are the deliberate exception).

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `pnpm dev` port conflict | Something already on :3000 | `pnpm dev -- -p 3001` |
| Styles look unstyled | Tailwind `content` paths miss your file | File must be under `app/`, `components/`, `pages/`, or repo root |
| Dark toggle does nothing | `.dark` class not applied | Check `ThemeProvider` wraps the app in `layout.tsx` with `attribute="class"` |
| Icon hover color never changes | Was a dynamic Tailwind class (fixed 2026-09-27 — safelisted in `tailwind.config.ts`) | — |
| `shadcn add` creates `app/globals.css` | Was a stale `css` path in `components.json` (fixed 2026-09-27) | — |
| Build passes but types are wrong | `ignoreBuildErrors: true` | Run `pnpm tsc --noEmit` manually to see real errors |
| Hydration warning in console | Theme class mismatch SSR vs client | `suppressHydrationWarning` is already on `<html>`; expected and harmless |
