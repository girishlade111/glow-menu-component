# Configuration Reference — Glow Menu Component

Every configuration file in this project, what it does, what each setting means, and what to change (and what to leave alone).

---

## 1. `package.json` — Project Definition

| Field | Value | Meaning |
|-------|-------|---------|
| `name` | `my-v0-project` | v0.app default name. Rename this if the repo is published as a package. |
| `version` | `0.1.0` | Semver. Manually bumped — nothing automates it here. |
| `private` | `true` | Prevents accidental `npm publish`. Keep this `true`. |

### Scripts

| Script | Command | What it does |
|--------|---------|--------------|
| `dev` | `next dev` | Starts the development server (Turbopack in Next 15) on `http://localhost:3000` with hot reload. |
| `build` | `next build` | Production build: type-checks, lints (subject to the ignores below), and emits `.next/`. |
| `start` | `next start` | Serves the production build on `http://localhost:3000`. Run `pnpm build` first. |
| `lint` | `next lint` | Runs ESLint via Next.js. Note: `next lint` was removed from Next.js 16, but this project pins Next 15.2.4, so it still works. |

### Dependency Groups (abridged)

- **Framework:** `next@15.2.4`, `react@19`, `react-dom@19`
- **UI primitives:** `@radix-ui/*` (24 packages — dialog, dropdown-menu, toast, tooltip, etc.), `shadcn` configured (see `components.json`)
- **Animation:** `framer-motion@latest`, `embla-carousel-react`, `vaul`
- **Theming:** `next-themes@latest`
- **Icons:** `lucide-react@^0.454.0`
- **Fonts:** `geist@^1.3.1` (plus Inter via `next/font/google` in `app/layout.tsx`)
- **Forms/data:** `react-hook-form`, `@hookform/resolvers`, `zod`, `date-fns`, `input-otp`, `react-day-picker`, `cmdk`
- **Styling:** `tailwindcss@^3.4.17`, `tailwindcss-animate`, `tailwind-merge`, `clsx`, `class-variance-authority`
- **Analytics:** `@vercel/analytics@1.3.1` — **installed but not wired into any page** (see `docs/THIRD_PARTY_INTEGRATIONS.md`)
- **Dev:** `typescript@^5`, `@types/*`, `postcss@^8.5`

Package manager: **pnpm** (a `pnpm-lock.yaml` is committed; there is no `package-lock.json` or `yarn.lock`).

> **Known quirk:** Several dependencies use `latest` (`@emotion/is-prop-valid`, `framer-motion`, `next-themes`). Fresh installs may pull newer versions than the lockfile was tested with. Pinning them is safer for reproducible builds.

---

## 2. `next.config.mjs` — Next.js Runtime Behavior

```js
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}
```

| Setting | Effect | Verdict |
|---------|--------|---------|
| `eslint.ignoreDuringBuilds: true` | ESLint errors never fail a build. | v0 default. Fine for a demo; for a team project, turn this **off** so CI catches lint errors. |
| `typescript.ignoreBuildErrors: true` | Type errors never fail a build. | v0 default. **Risky beyond a demo** — silently ships broken types. Fix types and remove this before treating the repo as production code. |
| `images.unoptimized: true` | Disables Next.js Image Optimization; `next/image` serves the original file as-is. | Deliberate for static export (no image-optimization server on plain static hosts). Keep it if deploying as a static site; remove if deploying on Vercel where image optimization is available. |

No `output: "export"` is set — this builds a standard Next.js app (server-renderable). If you want a purely static export, add `output: "export"` and a compatible route structure.

---

## 3. `tailwind.config.ts` — Design System Tokens

- **`darkMode: ['class']`** — dark theme activates via the `.dark` class on `<html>` (driven by `next-themes`), not the OS media query. This is what makes the manual theme toggle work.
- **`content`** — Tailwind scans `./pages/**`, `./components/**`, `./app/**`, and root files for class names. Anything with a class must live in one of these paths, or Tailwind won't generate its CSS.
- **`theme.extend.colors`** — the entire palette is CSS-variable-driven: `background: 'hsl(var(--background))'`, etc. Actual values live in `styles/globals.css` (`:root` for light, `.dark` for dark). To retheme the whole app, edit the HSL variables in `globals.css` — not the config.
- **`theme.extend.borderRadius`** — `lg/md/sm` derived from `--radius` (`0.5rem`).
- **`theme.extend.keyframes` / `animation`** — accordion open/close animations (used by Radix Accordion).
- **Chart + sidebar tokens** — `--chart-1..5` and `--sidebar-*` variables are registered even though this demo doesn't render charts or a sidebar; harmless leftovers from the shadcn scaffold.

### ⚠️ Important Tailwind limitation used in this codebase

`components/menu-bar.tsx` builds a class with a template literal:

```tsx
className={`... group-hover:${item.iconColor} ...`}
```

**Tailwind cannot see dynamically constructed class names.** `group-hover:text-blue-500` (and orange/green/red) are never generated into the CSS — the `group-hover:${...}` segment is dead code. The static `text-foreground` next to it is what actually renders. If per-item hover icon colors are wanted, add the four classes to Tailwind's `safelist` in `tailwind.config.ts`:

```ts
safelist: [
  'group-hover:text-blue-500',
  'group-hover:text-orange-500',
  'group-hover:text-green-500',
  'group-hover:text-red-500',
],
```

or map each item to a complete static class string.

---

## 4. `postcss.config.mjs` — CSS Pipeline

```js
export default {
  plugins: {
    tailwindcss: {},
  },
}
```

Single plugin: Tailwind CSS processing (with `autoprefixer` pulled in as a package dependency). No custom PostCSS plugins, no nesting plugin, no CSS minifier config here (Next handles minification at build).

---

## 5. `tsconfig.json` — TypeScript Compiler Options

| Option | Value | Meaning |
|--------|-------|---------|
| `strict` | `true` | Full strict mode (strict null checks, no implicit any, etc.). |
| `target` | `ES6` | Downlevel target. |
| `jsx` | `preserve` | TSX is left as-is for Next.js to transform. |
| `module` / `moduleResolution` | `esnext` / `bundler` | Modern bundler resolution; supports `package.json` `exports`. |
| `paths: { "@/*": ["./*"] }` | — | The `@/` alias maps to the repo root, so `@/components/menu-bar` resolves to `components/menu-bar.tsx`. Used in every import. |
| `skipLibCheck` | `true` | Skips type-checking `node_modules` `.d.ts` files — faster builds, standard practice. |
| `noEmit` | `true` | Type-check only; Next.js handles emitting. |
| `incremental` | `true` | Faster repeat type-checks via a `.tsbuildinfo` cache (gitignored). |
| `plugins: [{ name: "next" }]` | — | Next.js TS plugin for editor/CLI integration. |
| `include` | `next-env.d.ts`, `**/*.ts(x)`, `.next/types` | — |
| `exclude` | `node_modules` | — |

Note: `strict: true` here is aspirational rather than enforced — `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so type errors don't block builds. See the verdict in section 2.

---

## 6. `components.json` — shadcn/ui Registry Configuration

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- **Purpose:** tells the `shadcn` CLI where to install new components and how to style them.
- **`style: default`, `baseColor: neutral`, `cssVariables: true`** — components are installed in the neutral palette using CSS variables (matching `styles/globals.css`).
- **`rsc: true`** — installed components assume React Server Components compatibility.
- **`iconLibrary: lucide`** — new components use Lucide icons.
- **⚠️ Stale path:** `"css": "app/globals.css"` points to a file that **does not exist**. The real stylesheet is `styles/globals.css` (imported in `app/layout.tsx`). If you run `shadcn add`, update this path first or the CLI will create a duplicate `app/globals.css`.

---

## 7. `styles/globals.css` — Theme Variables

The single source of truth for the design tokens:

- `@tailwind base/components/utilities` directives, plus a `.text-balance` utility.
- `:root` block — light-theme HSL values for `--background`, `--foreground`, `--primary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`, `--chart-1..5`, `--sidebar-*`.
- `.dark` block — the dark-theme overrides.
- `next-themes` toggles the `.dark` class on `<html>`; Tailwind's `darkMode: 'class'` and these variables do the rest.

To change the brand palette, edit the HSL triplets here — every `bg-background`, `text-muted-foreground`, `border-border` class in the app follows automatically.

---

## 8. `.gitignore` — What Never Gets Committed

| Entry | Covers |
|-------|--------|
| `/node_modules` | Installed dependencies (pnpm store) |
| `/.next/`, `/out/`, `/build` | Build output |
| `npm-debug.log*`, `yarn-debug.log*`, `yarn-error.log*`, `.pnpm-debug.log*` | Package-manager debug logs |
| `.env*` | **All** env files (see `docs/ENVIRONMENT_VARIABLES.md`) |
| `.vercel` | Vercel CLI local state |
| `*.tsbuildinfo`, `next-env.d.ts` | TypeScript build artifacts |

---

## Quick-Edit Map

| I want to… | Edit this |
|------------|-----------|
| Change colors / radius / theme | `styles/globals.css` |
| Add a Tailwind plugin or safelist | `tailwind.config.ts` |
| Change build behavior / image handling | `next.config.mjs` |
| Change the `@/` alias or strictness | `tsconfig.json` |
| Install more shadcn components | `components.json` (fix `css` path first) + `pnpm dlx shadcn@latest add <component>` |
| Add env variables | `.env.local` + `docs/ENVIRONMENT_VARIABLES.md` checklist |
| Add/change npm scripts | `package.json` |
