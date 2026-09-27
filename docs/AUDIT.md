# Code Audit Report — Glow Menu Component

**Date:** 2026-09-27
**Auditor:** Muse (automated) + Playwright/Chromium E2E
**Scope:** full repository — manual review, terminal checks (`tsc`, ESLint, `next build`), production-server browser tests.

## Method

| Layer | What was done |
|-------|---------------|
| Traditional (manual) | Read every source file: `menu-bar.tsx`, `theme-provider.tsx`, `theme-toggle.tsx`, `ui/switch.tsx`, `lib/utils.ts`, `layout.tsx`, `page.tsx`, all config files |
| Terminal | `pnpm install`, `tsc --noEmit`, ESLint 9 (`eslint-config-next` via FlatCompat), `next build` |
| Server-based | `next start` (production build) + Playwright/Chromium: 10 scripted checks incl. hover-flip physics, theme toggle, mobile 390px, console-error watch |

## Findings & Fixes

### 1. TypeScript errors in `menu-bar.tsx` — FIXED
`tsc --noEmit` reported 4 errors: untyped Framer Motion variant objects (`ease: [0.4,0,0.2,1]` inferred as `number[]`, `type: "spring"` inferred as `string`) were not assignable to `Variants`/`Transition`. These were invisible before because `next.config.mjs` sets `typescript.ignoreBuildErrors: true`.
**Fix:** annotated `itemVariants`, `backVariants`, `glowVariants`, `navGlowVariants` as `Variants` and `sharedTransition` as `Transition` (imported as types from `framer-motion`). `tsc` is now clean.

### 2. Invalid `disableSystemTheme` prop — FIXED
`app/layout.tsx` and `components/theme-provider.tsx` passed `disableSystemTheme` to `next-themes`' `ThemeProvider`. **That prop does not exist** in next-themes 0.4.6 (valid props include `enableSystem`, `disableTransitionOnChange`) — it was silently ignored, and `tsc` flagged it. The intended behavior (no OS-theme following) is preserved via the real prop.
**Fix:** replaced with `enableSystem={false}` in `layout.tsx`; removed from the wrapper's hardcoded props (still forwarded via `...props`).

### 3. Dead dynamic Tailwind classes — FIXED
`group-hover:${item.iconColor}` was constructed via template literal, so Tailwind never generated `group-hover:text-blue-500` etc. The per-item icon hover color silently did nothing.
**Fix:** added the four classes to `safelist` in `tailwind.config.ts`. E2E verified: hovered Home icon computes to `rgb(59, 130, 246)`.

### 4. Vulnerable Next.js 15.2.4 — FIXED
15.2.4 is affected by CVE-2025-55182 (React2Shell, CVSS 10.0 RCE), CVE-2025-66478, CVE-2025-55184/67779. Patched per advisory to the minimal safe version on the 15.2 line.
**Fix:** `next` bumped to **15.2.8** (`@next/swc-*` stay at 15.2.5 per upstream pin). `pnpm build` green.

### 5. Mobile 390px horizontal overflow (71px) — FIXED
The 4-item labeled bar measured 461px wide on a 390px viewport. Found via Playwright element-geometry scan.
**Fix:** labels now `hidden sm:inline` (icon-only nav on mobile), item padding `px-3 sm:px-4`. Re-tested: 0px overflow.

### 6. Missing favicon (404) — FIXED
No favicon existed; browsers 404'd on `/favicon.ico` (caught by the console-error watcher).
**Fix:** added `app/icon.svg` (glow-mark) and `app/favicon.ico` (multi-size ICO generated from the mark). Both return 200.

### 7. Unwired `@vercel/analytics` dependency — FIXED
Installed but never imported anywhere (dead weight + supply-chain surface).
**Fix:** removed via `pnpm remove @vercel/analytics`. (To re-enable later: `pnpm add @vercel/analytics` + `<Analytics />` in `layout.tsx`.)

### 8. No ESLint setup — FIXED
`pnpm lint` (`next lint`) had no config and dropped into an interactive prompt. Added ESLint 9 + `eslint-config-next@15.2.8` via `@eslint/eslintrc` FlatCompat (`eslint.config.mjs`). This surfaced one real issue:
**Fix:** `tailwind.config.ts` used `require('tailwindcss-animate')` → converted to ESM `import`. ESLint now clean.

### 9. Stale `components.json` CSS path — FIXED
`"css": "app/globals.css"` pointed at a non-existent file (real file: `styles/globals.css`). Would have broken `shadcn add`. Corrected.

### 10. Minor cleanups — FIXED
- `package.json` name `my-v0-project` → `glow-menu-component`.
- Unused `index` variable in `menuItems.map`.
- Ambiguous Tailwind class `ease-[cubic-bezier(0.34,1.56,0.64,1)]` (build warning) → arbitrary property `[transition-timing-function:...]` in `theme-toggle.tsx`. Build warning gone.

## Test Results (production server, Chromium)

| # | Check | Result |
|---|-------|--------|
| 1 | Menu items render (Home, Notifications, Settings, Profile) | PASS |
| 2 | Default theme is light | PASS |
| 3 | Toggle switches to dark (`.dark` on `<html>`) | PASS |
| 4 | Toggle switches back to light | PASS |
| 5 | Hover flips front face away (opacity → ~0) | PASS |
| 6 | Hover icon color applies (blue `rgb(59,130,246)`) | PASS |
| 7 | Unhover restores front face (opacity → ~1) | PASS |
| 8 | All four items hover cleanly | PASS |
| 9 | Mobile 390px: zero horizontal overflow | PASS |
| 10 | Zero page/console errors across the session | PASS |

**10/10 passed.** Screenshots: `/tmp/e2e-glow/{hover,dark,mobile}.png` (ephemeral).

## Remaining Non-Blocking Notes

- `next.config.mjs` still sets `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors` (v0 defaults). With tsc + ESLint now clean, these can be removed so CI fails loudly on regressions. Left in place as a deliberate minimal-change decision — remove when this is treated as production code.
- 23 of 24 `@radix-ui/*` packages are installed but unused (v0 scaffold). Harmless; prune with `pnpm remove` if a lean install is wanted.
- `framer-motion` and `next-themes` are pinned to `latest` — fresh installs may resolve newer majors. Consider pinning.
- No `LICENSE` file; no active-route highlighting; keyboard `aria-current` not set (see README roadmap).
