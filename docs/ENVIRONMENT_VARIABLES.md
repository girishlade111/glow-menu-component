# Environment Variables (.env) — Glow Menu Component

## Current State

**This project uses zero environment variables.** There are no `.env`, `.env.local`, `.env.development`, or `.env.production` files in the repository, and the code never reads `process.env` anywhere.

That is intentional: this is a fully client-side UI demo. There is no backend, no API keys, no database, no analytics wired up, and no third-party service that requires secrets.

## How `.env` Is Handled in This Project

`.gitignore` excludes all env files:

```gitignore
# env files
.env*
```

This means if you create a `.env.local` for local testing, it will never be committed. This is the correct behavior — secrets must never go into git.

## Next.js `.env` Loading Order (Reference)

If you ever add environment variables (for example, an analytics key or a backend URL), Next.js loads them in this order. Later files override earlier ones:

| Order | File | Committed to git? | Used for |
|-------|------|-------------------|----------|
| 1 | `.env` | Yes | Defaults shared across environments |
| 2 | `.env.local` | **No** | Local secrets, overrides everything |
| 3 | `.env.development` / `.env.production` | Yes | Per-environment defaults |
| 4 | `.env.development.local` / `.env.production.local` | **No** | Per-environment local secrets |

Rules that apply the moment you add any `.env` file:

1. **Server-only vs. client exposure.** Plain `FOO=bar` is visible only in server code (Route Handlers, Server Components, middleware). To expose a variable to client components, prefix it with `NEXT_PUBLIC_`, e.g. `NEXT_PUBLIC_SITE_URL=https://example.com`. Client-side code cannot read non-prefixed variables — this is a hard Next.js boundary, not a convention.
2. **Restart after changes.** `.env` files are loaded once at server start. After adding or editing a variable, restart `pnpm dev`.
3. **Build-time inlining.** `NEXT_PUBLIC_*` values are inlined into the JavaScript bundle at build time. Changing one requires a rebuild — it cannot be changed at runtime for a static export.

## Recommended `.env.example` (For Future Use)

If this project ever gains integrations (analytics ID, form endpoint, CMS), add a checked-in `.env.example` that documents every variable without real values:

```bash
# Copy to .env.local and fill in real values (never commit .env.local)
# Site URL used for SEO metadata / Open Graph tags
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Copy pattern for new developers:

```bash
cp .env.example .env.local
```

## Vercel Deployment — Where Env Vars Live

Because `.env*` files are gitignored, **production environment variables are not set in this repo**. They are set in the Vercel project dashboard:

1. Open the project in the [Vercel dashboard](https://vercel.com).
2. Go to **Settings → Environment Variables**.
3. Add the variable, choose the environments (Production / Preview / Development), save.
4. Redeploy for the change to take effect.

This applies to the v0.app-synced deployment of this project — any variable the deployed app needs must be added there, not in the repo.

## Checklist Before Adding Your First Env Variable

- [ ] Name it in UPPER_SNAKE_CASE.
- [ ] Prefix with `NEXT_PUBLIC_` only if client components need it; otherwise keep it server-only.
- [ ] Document it in `.env.example` (no real values).
- [ ] Add a fallback in code if the variable is optional (e.g. `process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"`).
- [ ] Never log a secret value; never interpolate secrets into client-rendered HTML.
- [ ] Confirm `.gitignore` still covers `.env*` before committing.

## Quick Reference — Reading Env Vars in This Codebase

```tsx
// Server component / route handler — any variable
const apiKey = process.env.API_KEY;

// Client component — ONLY NEXT_PUBLIC_* variables work here
"use client";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
```
