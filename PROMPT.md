You are a senior full-stack engineer. Build a production-ready web app that reads data from Airtable and lets users browse movies and buy cinema tickets.

This project is called "vomadrid".

## Goal
Create a clean, modern website that allows users to:
1) Browse movies currently in theaters
2) Click a movie to see all available screenings
3) Buy tickets for a specific screening via an external booking URL

The app must be deployable to any cloud provider and stored in a GitHub repository.

---

## Data source: Airtable (REAL SCHEMA)

I have one Airtable Base with 3 tables and the following fields.

### Table: cinemas
Fields:
- Cinema name (string)
- Chain (single select, examples: Cinesa, Yelmo, Kinépolis, Independent, Public (state))
- Address (string)
- City (single select)
- URL (string, cinema website)
- Google Maps URL (string)
- is active (boolean)
- screenings (linked record to screenings)

### Table: movies
Fields:
- Title (string)
- Original title (string)
- Poster (URL string)
- Synopsis (long text)
- Trailer URL (string, YouTube)
- Rating (number, 1–5 stars)
- Genres (multi-select)
- Runtime (duration, hh:mm)
- Age rating (single select, e.g. 7+, 12+, 16+, 18+)
- Original language (single select)
- is active (boolean)
- Sort order (number)

### Table: screenings
Fields:
- ID (number)
- Movie (linked record → movies)
- Cinema (linked record → cinemas)
- Date (date with time)
- Booking URL (string)
- Notes (long text)
- is active (boolean)

Relationships:
- screenings.Movie → movies
- screenings.Cinema → cinemas

Use Linked Records. Do NOT flatten relationships.

---

## Required environment variables
- AIRTABLE_API_TOKEN
- AIRTABLE_BASE_ID

Optional overrides:
- AIRTABLE_CINEMAS_TABLE=cinemas
- AIRTABLE_MOVIES_TABLE=movies
- AIRTABLE_SCREENINGS_TABLE=screenings

---

## UX Requirements

### Home / Movies page (/)
- Grid of movies showing:
  - Poster
  - Title
  - Rating (stars)
  - Genres
  - Original language
  - Age rating
- Search by movie Title (case-insensitive, debounced)
- Filter by:
  - Genre (multi-select)
  - Original language
  - Age rating
- Only show movies where is active = true
- Clicking a movie navigates to /movies/:id

### Movie detail page (/movies/:id)
- Movie header:
  - Poster
  - Title + Original title
  - Synopsis
  - Trailer embed (YouTube)
  - Metadata (runtime, language, age rating, rating)
- Screenings list showing:
  - Date + time
  - Cinema name
  - Cinema chain
  - City
  - "Buy tickets" button → Booking URL (open in new tab)
- Filters on screenings:
  - Date (single date picker)
  - Cinema (dropdown)
  - Chain (dropdown)
- Only show screenings where:
  - is active = true
  - Date >= today
- Default sort: Date ascending

### Cinemas page (/cinemas)
- List cinemas where is active = true
- Show:
  - Cinema name
  - Chain
  - City
- Cinema detail page:
  - Cinema info
  - Upcoming screenings at that cinema

---

## Technical constraints

- Use TypeScript.
- Do NOT expose Airtable API token in the browser.
- Implement a backend layer that fetches from Airtable.
- Add simple in-memory caching (TTL 60s) for list endpoints.
- Graceful empty states and error handling.

---

## Stack
Choose ONE and implement fully:
- Next.js (App Router) + Route Handlers + Tailwind CSS

---

## Architecture requirements

- Central Airtable client with:
  - field mapping config (single place to change field names)
- API routes:
  - GET /api/movies
  - GET /api/movies/:id
  - GET /api/screenings?movieId=&date=&cinemaId=&chain=
  - GET /api/cinemas
- Server-side filtering (not client-side overfetching)

---

## Deliverables

1) Brief explanation of architecture decisions
2) Complete GitHub-ready repository including:
   - package.json
   - README.md (setup + env + run instructions)
   - .env.example
   - Dockerfile
   - Source code
3) Commands to:
   - run locally
   - build for production
   - run with Docker
   - initialize git repo and push to GitHub

Output the FULL repository as a file tree.
Each file must be in its own code block.

Do NOT ask follow-up questions unless absolutely necessary.
If something is ambiguous, make a reasonable assumption and document it.

