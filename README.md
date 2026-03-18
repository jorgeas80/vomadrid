# VO Madrid

Browse movies in original version (VO) playing in Madrid cinemas and buy tickets online.

## Architecture

- **Next.js 15** (App Router) with TypeScript
- **Tailwind CSS v4** for styling
- **Static JSON data** from Google Sheets (fetched at build time)
- **PostHog** for analytics (optional)
- **Docker** multi-stage build for deployment

Data is fetched from Google Sheets once and stored as static JSON files. This eliminates runtime API calls, improves performance, and removes the need for credentials in production.

### Key files

| Path | Purpose |
|---|---|
| `scripts/fetch-static-data.ts` | Script to fetch and update data from Google Sheets |
| `src/lib/types.ts` | TypeScript interfaces for all data models |
| `src/data/` | Static JSON files (movies, cinemas, screenings) |
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

### 3. Update data from Google Sheets (optional)

To fetch fresh data, set up environment variables first:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

| Variable | Description |
|----------|-------------|
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Spreadsheet ID from the URL (`/d/{ID}/edit`) |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Service account JSON key, on a single line |

Then fetch and update the static data:

```bash
npm run fetch-data
```

This updates `src/data/*.json` and downloads poster images to `public/posters/`.

### 4. Build for production

```bash
npm run build  # Fetches fresh data + builds
npm start
```

### 5. Environment variables

**Required for data fetching:**
- `GOOGLE_SHEETS_SPREADSHEET_ID` — Spreadsheet ID
- `GOOGLE_SERVICE_ACCOUNT_KEY` — Service account JSON key (single line)

**Optional PostHog analytics:**
- `NEXT_PUBLIC_POSTHOG_KEY` — PostHog API key
- `NEXT_PUBLIC_POSTHOG_HOST` — PostHog host (default: `https://us.i.posthog.com`)

### 6. Docker

```bash
docker build -t vomadrid .
docker run -p 3000:3000 vomadrid
```

Note: Docker build fetches fresh data at build time — credentials must be available as build args or environment variables.

## Updating data

When the spreadsheet is updated and you want to regenerate the static files:

```bash
npm run fetch-data   # Fetch fresh data from Google Sheets
git add src/data/ public/posters/
git commit -m "Update static data"
git push             # Deploy will use the new data
```
