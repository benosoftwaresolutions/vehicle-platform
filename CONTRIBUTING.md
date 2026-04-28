# Contributing to Fyca

## Branching strategy

```
main       → production (fyca.co.uk) — protected, no direct pushes
staging    → preview deployments — merges from feature branches
feature/*  → individual features, PR against staging
hotfix/*   → urgent production fixes only, PR directly to main
```

## Workflow

1. Branch off `staging` for new features:
   ```
   git checkout staging && git pull
   git checkout -b feature/my-feature
   ```

2. Open a PR from your branch into `staging`. Every PR gets an automatic Vercel preview URL with its own database.

3. Once reviewed and merged into `staging`, verify it works on the preview environment.

4. Raise a PR from `staging` into `main` to deploy to production.

## Branch protection (GitHub)

`main` is protected. Go to **Settings → Branches → Add rule**, set pattern to `main`, and enable:

- Require a pull request before merging
- Require at least 1 approval
- Do not allow bypassing the above settings

## Environment variables

See `.env.example` for all required variables. Local dev uses `.env.local`. Preview and production variables are set in the Vercel dashboard per-environment — never commit credentials.

## Database

Each environment uses a separate Neon database:

| Environment | Database         |
|-------------|-----------------|
| Local dev   | `fyca_dev`      |
| Preview     | `fyca_preview`  |
| Production  | `fyca_production` |

Never point preview or dev at the production database.

## Seed data

To populate a local or preview database with test data:

```bash
npm run seed          # Add seed data (safe to run multiple times)
npm run seed:reset    # Wipe and reseed from scratch
```

The seed script refuses to run against production.

## Schema changes

```bash
npx prisma db push    # Push schema changes to dev/preview DB
npx prisma generate   # Regenerate the Prisma client after schema changes
```

Restart the dev server after running `prisma generate`.
