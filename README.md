# Otter Verify

Product concept prototype (repository name: vvyiii), built with [Next.js](https://nextjs.org) + [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com).

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000> to view it.

## Tech stack

- **Next.js** (App Router, TypeScript)
- **Tailwind CSS v4**
- **shadcn/ui** — component source lives in `components/ui/`. Installed: button, card, input, label, badge, dialog, dropdown-menu, select, textarea, tabs, avatar, separator, switch, checkbox, tooltip, skeleton

To add more components:

```bash
npx shadcn@latest add <component-name>
```

See <https://ui.shadcn.com/docs/components> for the full list.

## Project structure

```
app/            Pages (App Router)
components/ui/  shadcn/ui component source
lib/            Utility functions
public/         Static assets
```

## Deployment (Data Console + Cloudflare Workers)

The project is configured for static export (`output: 'export'` in `next.config.ts`): `npm run build` first generates static files into `out/`, then validates with `wrangler deploy --dry-run`. The Worker config is in `wrangler.toml` (assets-only, serving `out/`).

The app deploys from the company `user-content` repository:

- Repository path: `cloudflare-apps/yi.wu/otter-verify`
- Data Console application: slug `otter-verify`, Worker `internal-otter-verify`, access policy **Internal all**
- Any merge to `master` that changes files under this path triggers an automatic redeploy

To publish an update:

1. Get the latest code: repository page → **Code** → **Download ZIP** → unzip (or `git pull` in a local clone — exclude `.git`, `node_modules`, `out`, `.next` when copying)
2. In `user-content` on GitHub, open `cloudflare-apps/yi.wu/otter-verify/` → **Add file** → **Upload files**
3. Drag in all project files and commit to a new branch
4. Open a pull request and merge it into `master`
5. Watch the build and find the App URL in Data Console → Applications → Otter Verify

## Notes

- Never commit `.env` files, API keys, or other credentials (`.gitignore` blocks common patterns)
- Never commit exports of real business data (CSV / JSON dumps); use fake data in the prototype
- Everything pushed to GitHub must be written in English
