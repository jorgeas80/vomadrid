# VO Madrid

Browse movies in original version (VO) playing in Madrid cinemas and buy tickets online.

## Architecture

- **Next.js 15** (App Router) with TypeScript
- **Tailwind CSS v4** for styling
- **Static JSON data** from Airtable (fetched at build time)
- **PostHog** for analytics (optional)
- **Docker** multi-stage build for deployment

Data is fetched from Airtable once and stored as static JSON files. This eliminates runtime API calls, improves performance, and removes the need for Airtable credentials in production.

### Key files

| Path | Purpose |
|---|---|
| `src/lib/airtable.ts` | Data loader (static JSON by default, Airtable API fallback) |
| `src/lib/types.ts` | TypeScript interfaces for all data models |
| `src/data/` | Static JSON files (movies, cinemas, screenings) |
| `scripts/fetch-static-data.ts` | Script to fetch and update data from Airtable |
| `src/app/api/` | API route handlers (movies, screenings, cinemas) |
| `src/app/` | Pages: home (movie grid), movie detail, cinemas list, cinema detail |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally (development)

The project includes static JSON data, so you can run it immediately:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Update data from Airtable (optional)

To fetch fresh data from Airtable, you need to set up environment variables first:

```bash
cp .env.example .env
```

Then add your Airtable credentials:
- `AIRTABLE_API_TOKEN` — Your Airtable personal access token
- `AIRTABLE_BASE_ID` — The Airtable base ID (starts with `app`)

Fetch and update the static data:

```bash
npm run fetch-data
```

This will update `src/data/*.json` files.

### 4. Build for production

```bash
npm run build  # Fetches fresh data + builds
npm start
```

### 5. Environment variables

**Optional PostHog analytics:**
- `NEXT_PUBLIC_POSTHOG_KEY` — PostHog API key
- `NEXT_PUBLIC_POSTHOG_HOST` — PostHog host (default: `https://us.i.posthog.com`)

**Optional Airtable configuration:**
- `USE_STATIC_DATA` — Use static JSON files (default: `true`)
- `AIRTABLE_CINEMAS_TABLE` — Table name override (default: `cinemas`)
- `AIRTABLE_MOVIES_TABLE` — Table name override (default: `movies`)
- `AIRTABLE_SCREENINGS_TABLE` — Table name override (default: `screenings`)

### 6. Docker

```bash
docker build -t vomadrid .
docker run -p 3000:3000 vomadrid
```

Note: Docker build uses static JSON data, no Airtable credentials needed.

## Updating data

When you make changes in Airtable and want to update the static data:

```bash
npm run fetch-data           # Fetch fresh data from Airtable
git add src/data/            # Stage the updated JSON files
git commit -m "Update static data"
git push                     # Deploy will use the new data
```

The fetch script makes only 3 API calls to Airtable (one per table) and resolves all relationships in memory, avoiding rate limits.

## Git setup

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:YOUR_USER/vomadrid.git
git push -u origin main
```
