import { cacheGet, cacheSet } from "./cache";
import type {
  AirtableListResponse,
  AirtableRecord,
  Movie,
  MovieFields,
  Cinema,
  CinemaFields,
  Screening,
  ScreeningFields,
} from "./types";

// --- Config ---

const AIRTABLE_API_TOKEN = process.env.AIRTABLE_API_TOKEN ?? "";
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID ?? "";
const MOVIES_TABLE = process.env.AIRTABLE_MOVIES_TABLE ?? "movies";
const CINEMAS_TABLE = process.env.AIRTABLE_CINEMAS_TABLE ?? "cinemas";
const SCREENINGS_TABLE = process.env.AIRTABLE_SCREENINGS_TABLE ?? "screenings";

const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

// --- Field mapping (single place to change field names) ---

const MOVIE_FIELDS = {
  title: "Title",
  originalTitle: "Original title",
  poster: "Poster",
  synopsis: "Synopsis",
  trailerUrl: "Trailer URL",
  rating: "Rating",
  genres: "Genres",
  runtime: "Runtime",
  ageRating: "Age rating",
  originalLanguage: "Original language",
  isActive: "Is active",
  sortOrder: "Sort order",
} as const;

const CINEMA_FIELDS = {
  name: "Cinema name",
  chain: "Chain",
  address: "Address",
  city: "City",
  url: "URL",
  googleMapsUrl: "Google Maps URL",
  isActive: "Is active",
} as const;

const SCREENING_FIELDS = {
  id: "ID",
  movie: "Movie (linked)",
  cinema: "Cinema (linked)",
  date: "Date",
  bookingUrl: "Booking URL",
  notes: "Notes",
  isActive: "Is active",
} as const;

// --- Generic fetch ---

async function fetchAirtable<T>(
  table: string,
  params: Record<string, string> = {},
  cacheKey?: string
): Promise<AirtableRecord<T>[]> {
  if (cacheKey) {
    const cached = cacheGet<AirtableRecord<T>[]>(cacheKey);
    if (cached) return cached;
  }

  if (!AIRTABLE_API_TOKEN || !AIRTABLE_BASE_ID) {
    console.warn("Airtable credentials not configured");
    return [];
  }

  const url = new URL(`${BASE_URL}/${encodeURIComponent(table)}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  let allRecords: AirtableRecord<T>[] = [];
  let offset: string | undefined;

  do {
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_TOKEN}`,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Airtable error (${res.status}): ${text}`);
      throw new Error(`Airtable request failed: ${res.status}`);
    }

    const data: AirtableListResponse<T> = await res.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset;
  } while (offset);

  if (cacheKey) {
    cacheSet(cacheKey, allRecords);
  }

  return allRecords;
}

async function fetchAirtableRecord<T>(
  table: string,
  recordId: string,
  cacheKey?: string
): Promise<AirtableRecord<T> | null> {
  if (cacheKey) {
    const cached = cacheGet<AirtableRecord<T>>(cacheKey);
    if (cached) return cached;
  }

  if (!AIRTABLE_API_TOKEN || !AIRTABLE_BASE_ID) {
    console.warn("Airtable credentials not configured");
    return null;
  }

  const url = `${BASE_URL}/${encodeURIComponent(table)}/${recordId}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_TOKEN}`,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    const text = await res.text();
    console.error(`Airtable error (${res.status}): ${text}`);
    throw new Error(`Airtable request failed: ${res.status}`);
  }

  const record: AirtableRecord<T> = await res.json();

  if (cacheKey) {
    cacheSet(cacheKey, record);
  }

  return record;
}

// --- Helpers ---

function formatRuntime(seconds?: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

// --- Mappers ---

function mapMovie(record: AirtableRecord<MovieFields>): Movie {
  const f = record.fields;
  return {
    id: record.id,
    title: f[MOVIE_FIELDS.title] ?? "",
    originalTitle: f[MOVIE_FIELDS.originalTitle] ?? "",
    poster: f[MOVIE_FIELDS.poster] ?? "",
    synopsis: f[MOVIE_FIELDS.synopsis] ?? "",
    trailerUrl: f[MOVIE_FIELDS.trailerUrl] ?? "",
    rating: f[MOVIE_FIELDS.rating] ?? 0,
    genres: f[MOVIE_FIELDS.genres] ?? [],
    runtime: formatRuntime(f[MOVIE_FIELDS.runtime]),
    ageRating: f[MOVIE_FIELDS.ageRating]?.[0] ?? "",
    originalLanguage: f[MOVIE_FIELDS.originalLanguage] ?? "",
    isActive: f[MOVIE_FIELDS.isActive] ?? false,
    sortOrder: f[MOVIE_FIELDS.sortOrder] ?? 999,
  };
}

function mapCinema(record: AirtableRecord<CinemaFields>): Cinema {
  const f = record.fields;
  return {
    id: record.id,
    name: f[CINEMA_FIELDS.name] ?? "",
    chain: f[CINEMA_FIELDS.chain] ?? "",
    address: f[CINEMA_FIELDS.address] ?? "",
    city: f[CINEMA_FIELDS.city] ?? "",
    url: f[CINEMA_FIELDS.url] ?? "",
    googleMapsUrl: f[CINEMA_FIELDS.googleMapsUrl] ?? "",
    isActive: f[CINEMA_FIELDS.isActive] ?? false,
  };
}

function mapScreening(record: AirtableRecord<ScreeningFields>): Screening {
  const f = record.fields;
  return {
    id: record.id,
    screeningId: f[SCREENING_FIELDS.id] ?? 0,
    movieId: f[SCREENING_FIELDS.movie]?.[0] ?? "",
    cinemaId: f[SCREENING_FIELDS.cinema]?.[0] ?? "",
    date: f[SCREENING_FIELDS.date] ?? "",
    bookingUrl: f[SCREENING_FIELDS.bookingUrl] ?? "",
    notes: f[SCREENING_FIELDS.notes] ?? "",
    isActive: f[SCREENING_FIELDS.isActive] ?? false,
  };
}

// --- Public API ---

export async function getMovies(): Promise<Movie[]> {
  const records = await fetchAirtable<MovieFields>(
    MOVIES_TABLE,
    {
      filterByFormula: `{${MOVIE_FIELDS.isActive}} = TRUE()`,
      "sort[0][field]": MOVIE_FIELDS.sortOrder,
      "sort[0][direction]": "asc",
    },
    "movies:active"
  );
  return records.map(mapMovie);
}

export async function getMovie(id: string): Promise<Movie | null> {
  const record = await fetchAirtableRecord<MovieFields>(
    MOVIES_TABLE,
    id,
    `movie:${id}`
  );
  return record ? mapMovie(record) : null;
}

export async function getCinemas(): Promise<Cinema[]> {
  const records = await fetchAirtable<CinemaFields>(
    CINEMAS_TABLE,
    {
      filterByFormula: `{${CINEMA_FIELDS.isActive}} = TRUE()`,
      "sort[0][field]": CINEMA_FIELDS.name,
      "sort[0][direction]": "asc",
    },
    "cinemas:active"
  );
  return records.map(mapCinema);
}

export async function getCinema(id: string): Promise<Cinema | null> {
  const record = await fetchAirtableRecord<CinemaFields>(
    CINEMAS_TABLE,
    id,
    `cinema:${id}`
  );
  return record ? mapCinema(record) : null;
}

export async function getScreenings(filters?: {
  movieId?: string;
  cinemaId?: string;
  date?: string;
  chain?: string;
}): Promise<Screening[]> {
  const formulas: string[] = [
    `{${SCREENING_FIELDS.isActive}} = TRUE()`,
    `IS_AFTER({${SCREENING_FIELDS.date}}, DATEADD(TODAY(), -1, 'days'))`,
  ];

  if (filters?.movieId) {
    formulas.push(`RECORD_ID() != "" `); // We'll filter by movieId after fetch since it's a linked record
  }

  const filterByFormula =
    formulas.length > 1
      ? `AND(${formulas.join(", ")})`
      : formulas[0];

  const cacheKey = `screenings:${JSON.stringify(filters ?? {})}`;

  const records = await fetchAirtable<ScreeningFields>(
    SCREENINGS_TABLE,
    {
      filterByFormula,
      "sort[0][field]": SCREENING_FIELDS.date,
      "sort[0][direction]": "asc",
    },
    cacheKey
  );

  let screenings = records.map(mapScreening);

  // Filter by linked record IDs (can't use filterByFormula for linked record IDs directly)
  if (filters?.movieId) {
    screenings = screenings.filter((s) => s.movieId === filters.movieId);
  }
  if (filters?.cinemaId) {
    screenings = screenings.filter((s) => s.cinemaId === filters.cinemaId);
  }

  // Resolve linked records for remaining screenings
  const movieIds = [...new Set(screenings.map((s) => s.movieId).filter(Boolean))];
  const cinemaIds = [...new Set(screenings.map((s) => s.cinemaId).filter(Boolean))];

  const [movies, cinemas] = await Promise.all([
    Promise.all(movieIds.map((id) => getMovie(id))),
    Promise.all(cinemaIds.map((id) => getCinema(id))),
  ]);

  const movieMap = new Map(movies.filter(Boolean).map((m) => [m!.id, m!]));
  const cinemaMap = new Map(cinemas.filter(Boolean).map((c) => [c!.id, c!]));

  screenings = screenings.map((s) => ({
    ...s,
    movie: movieMap.get(s.movieId),
    cinema: cinemaMap.get(s.cinemaId),
  }));

  // Filter by chain (requires resolved cinema)
  if (filters?.chain) {
    screenings = screenings.filter(
      (s) => s.cinema?.chain === filters.chain
    );
  }

  // Filter by date (date string comparison, YYYY-MM-DD)
  if (filters?.date) {
    screenings = screenings.filter((s) => s.date.startsWith(filters.date!));
  }

  return screenings;
}
