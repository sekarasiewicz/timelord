# ChronoTrack

Time tracking app built with Next.js (App Router), TypeScript, Tailwind CSS, NextAuth (GitHub), and Prisma (PostgreSQL).

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- NextAuth (GitHub provider, Prisma Adapter)
- Prisma ORM (PostgreSQL)
- Tailwind CSS

## Prerequisites
- Bun installed (guide uses Bun)
- PostgreSQL database and connection URL
- GitHub OAuth App (Client ID/Secret)

## Environment Variables (export in your shell)
Export these in the terminal before running commands:

```bash
export DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"
export NEXTAUTH_SECRET="replace-with-strong-random"
export NEXTAUTH_URL="http://localhost:3000"
export GITHUB_ID="your_github_oauth_client_id"
export GITHUB_SECRET="your_github_oauth_client_secret"
```

## GitHub OAuth App Setup
1. Go to GitHub Settings → Developer settings → OAuth Apps → New OAuth App.
2. Set:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. After creating the app, copy Client ID and Client Secret and export them as shown above.

## Install, DB, Run (Bun)
```bash
bun install
bunx prisma generate
bunx prisma migrate dev --name init
bun run dev
```

- Build/start:
```bash
bun run build
bun run start
```

## Notes on Auth Protection
- Routes under `/projects` and all `/api/*` are protected by middleware. Unauthenticated users are redirected to `/signin`.
- Server components on dashboard pages also redirect to `/signin` when no session exists.

## Project Structure (key paths)
- `app/(auth)/signin/page.tsx`: GitHub sign-in button
- `app/(dashboard)/projects/page.tsx`: project list (month totals, create link)
- `app/(dashboard)/projects/[projectId]/page.tsx`: project detail (tasks, timer, manual entries)
- `app/api/*`: API route handlers (auth required)
- `lib/auth.ts`: NextAuth config (GitHub provider wired to env vars)
- `lib/db.ts`: Prisma Client
- `prisma/schema.prisma`: data model

## Prisma Tips
- Open Prisma Studio: `bunx prisma studio`
- Create additional migrations as your schema evolves: `bunx prisma migrate dev --name <change>`

## Troubleshooting
- GitHub authorize URL shows `client_id=undefined` or a 404 on GitHub:
  - Ensure `GITHUB_ID` and `GITHUB_SECRET` are exported in the SAME terminal session used to run `bun run dev`.
  - Verify with:
    ```bash
    echo $GITHUB_ID; echo $GITHUB_SECRET
    ```
  - Restart the dev server after exporting.
  - Ensure the GitHub OAuth callback URL is exactly `http://localhost:3000/api/auth/callback/github`.
- Not seeing `/signin` and landing on the dashboard:
  - You might already be signed in. Try a private window or sign out, then revisit.
- Database connection errors:
  - Confirm `DATABASE_URL` is correct and the database is reachable.

## Deployment
- Ensure production environment variables are set in your hosting platform (e.g., Vercel) with the same keys shown above.
- Run Prisma migrations during deploy or via a CI step as appropriate for your workflow.
