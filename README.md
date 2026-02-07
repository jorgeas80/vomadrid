# VO Madrid

Browse movies in original version (VO) playing in Madrid cinemas and buy tickets online.

## Architecture

- **Next.js 15** (App Router) with TypeScript
- **Tailwind CSS v4** for styling
- **Airtable REST API** as the data backend (no SDK — direct fetch calls)
- **In-memory cache** with 60s TTL for list endpoints
- **Docker** multi-stage build for deployment

The Airtable API token is never exposed to the browser. Client pages fetch data from Next.js API routes, which call Airtable server-side.

### Key files

| Path | Purpose |
|---|---|
| `src/lib/airtable.ts` | Central Airtable client with field mapping, caching, and query functions |
| `src/lib/cache.ts` | Simple in-memory Map-based cache with TTL |
| `src/lib/types.ts` | TypeScript interfaces for all data models |
| `src/app/api/` | API route handlers (movies, screenings, cinemas) |
| `src/app/` | Pages: home (movie grid), movie detail, cinemas list, cinema detail |

## Setup

### 1. Environment variables

Copy the example env file and fill in your Airtable credentials:

```bash
cp .env.example .env
```

Required variables:
- `AIRTABLE_API_TOKEN` — Your Airtable personal access token
- `AIRTABLE_BASE_ID` — The Airtable base ID (starts with `app`)

Optional table name overrides:
- `AIRTABLE_CINEMAS_TABLE` (default: `cinemas`)
- `AIRTABLE_MOVIES_TABLE` (default: `movies`)
- `AIRTABLE_SCREENINGS_TABLE` (default: `screenings`)

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally (development)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm start
```

### 5. Docker

```bash
docker build -t vomadrid .
docker run -p 3000:3000 --env-file .env vomadrid
```

## Git setup

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:YOUR_USER/vomadrid.git
git push -u origin main
```
