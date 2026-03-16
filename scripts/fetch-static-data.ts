#!/usr/bin/env node
/**
 * Fetches data from Google Sheets and saves it as static JSON files.
 * Run with: npm run fetch-data
 */

// Load environment variables from .env file
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import { writeFileSync, mkdirSync } from "fs";
import { join, extname } from "path";
import { GoogleAuth } from "google-auth-library";

// Helper function
function formatRuntime(seconds?: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

// Download a poster image to public/posters/ and return the local path
async function downloadPoster(
  url: string,
  movieId: string,
  postersDir: string
): Promise<string> {
  try {
    const ext = extname(new URL(url).pathname) || ".jpg";
    const filename = `${movieId}${ext}`;
    const filePath = join(postersDir, filename);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(filePath, buffer);

    return `/posters/${filename}`;
  } catch (error) {
    console.warn(`  ⚠️  Failed to download poster for ${movieId}: ${error}`);
    return url; // fallback to original URL
  }
}

// --- Google Sheets client (read-only) ---

let cachedToken: { token: string; expiry: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiry - 60_000) {
    return cachedToken.token;
  }

  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_KEY env var");

  const credentials = JSON.parse(keyJson);
  const auth = new GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const client = await auth.getClient();
  const tokenResponse = await (client as any).getAccessToken();
  if (!tokenResponse.token) throw new Error("Failed to obtain access token");

  cachedToken = {
    token: tokenResponse.token,
    expiry: Date.now() + 3_600_000,
  };

  return cachedToken.token;
}

async function readSheetAsObjects(tab: string): Promise<Record<string, string>[]> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID env var");

  const token = await getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tab)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets read error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const rows: string[][] = data.values ?? [];

  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i]] = row[i] ?? "";
    }
    return obj;
  });
}

// --- Main fetch logic ---

async function fetchData() {
  console.log("🔄 Fetching data from Google Sheets...");

  try {
    // Fetch all tabs (3 API calls)
    console.log("Fetching movies...");
    const moviesRaw = await readSheetAsObjects("movies");
    console.log(`✅ Fetched ${moviesRaw.length} movies`);

    console.log("Fetching cinemas...");
    const cinemasRaw = await readSheetAsObjects("cinemas");
    console.log(`✅ Fetched ${cinemasRaw.length} cinemas`);

    console.log("Fetching screenings...");
    const screeningsRaw = await readSheetAsObjects("screenings");
    console.log(`✅ Fetched ${screeningsRaw.length} screenings`);

    // Map movies
    const movies = moviesRaw
      .filter((r) => r["Is active"]?.toLowerCase() === "true")
      .map((r) => ({
        id: r["id"],
        title: r["Title"] ?? "",
        originalTitle: r["Original title"] ?? "",
        poster: r["Poster"] ?? "",
        synopsis: r["Synopsis"] ?? "",
        trailerUrl: r["Trailer URL"] ?? "",
        rating: Math.round(((parseFloat(r["Rating"] ?? "0") / 10) * 5)),
        genres: r["Genres"]
          ? r["Genres"].split(",").map((s: string) => s.trim()).filter(Boolean)
          : [],
        runtime: formatRuntime(r["Runtime"] ? parseInt(r["Runtime"]) : undefined),
        ageRating: r["Age rating"] ?? "",
        originalLanguage: r["Original language"] ?? "",
        imdbLink: r["imdb_link"] ?? "",
        filmaffinityLink: r["filmaffinity_link"] ?? "",
        isActive: true,
        sortOrder: r["Sort order"] ? parseInt(r["Sort order"]) : 999,
      }))
      .sort((a, b) => a.title.localeCompare(b.title));

    // Map cinemas
    const cinemas = cinemasRaw
      .filter((r) => r["Is active"]?.toLowerCase() === "true")
      .map((r) => ({
        id: r["id"],
        name: r["Cinema name"] ?? "",
        chain: r["Chain"] ?? "",
        address: r["Address"] ?? "",
        city: r["City"] ?? "",
        url: r["URL"] ?? "",
        googleMapsUrl: r["Google Maps URL"] ?? "",
        lat: r["Latitude"] ? parseFloat(r["Latitude"]) : undefined,
        lng: r["Longitude"] ? parseFloat(r["Longitude"]) : undefined,
        isActive: true,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Map screenings and resolve relations in memory
    const movieMap = new Map(movies.map((m) => [m.id, m]));
    const cinemaMap = new Map(cinemas.map((c) => [c.id, c]));

    const screenings = screeningsRaw
      .filter((r) => r["Is active"]?.toLowerCase() === "true")
      .map((r) => {
        const movieId = r["movie_id"] ?? "";
        const cinemaId = r["cinema_id"] ?? "";
        return {
          id: r["id"],
          movieId,
          cinemaId,
          date: r["Date"] ?? "",
          bookingUrl: r["Booking URL"] ?? "",
          notes: r["Notes"] ?? "",
          isActive: true,
          movie: movieMap.get(movieId),
          cinema: cinemaMap.get(cinemaId),
        };
      })
      .filter((s) => s.date >= new Date().toISOString().split("T")[0])
      .sort((a, b) => a.date.localeCompare(b.date));

    // Only keep movies that have at least one active screening
    const movieIdsWithScreenings = new Set(screenings.map((s) => s.movieId));
    const moviesWithScreenings = movies.filter((m) => movieIdsWithScreenings.has(m.id));
    const moviesDropped = movies.length - moviesWithScreenings.length;

    if (moviesDropped > 0) {
      const droppedTitles = movies
        .filter((m) => !movieIdsWithScreenings.has(m.id))
        .map((m) => `  - ${m.title}`);
      console.log(`⚠️  ${moviesDropped} movies excluded (no active future screenings):`);
      droppedTitles.forEach((t) => console.log(t));
    }
    console.log(`✅ Processed ${moviesWithScreenings.length} active movies with screenings`);
    console.log(`✅ Processed ${cinemas.length} active cinemas`);
    console.log(`✅ Processed ${screenings.length} active screenings`);

    // Create directories if they don't exist
    const dataDir = join(process.cwd(), "src", "data");
    const postersDir = join(process.cwd(), "public", "posters");
    mkdirSync(dataDir, { recursive: true });
    mkdirSync(postersDir, { recursive: true });

    // Download poster images locally
    console.log("📷 Downloading posters...");
    for (const movie of moviesWithScreenings) {
      if (movie.poster) {
        console.log(`  📷 ${movie.title}`);
        movie.poster = await downloadPoster(movie.poster, movie.id, postersDir);
      }
    }
    console.log(`✅ Posters downloaded`);

    // Write JSON files
    writeFileSync(
      join(dataDir, "movies.json"),
      JSON.stringify(moviesWithScreenings, null, 2)
    );
    writeFileSync(
      join(dataDir, "cinemas.json"),
      JSON.stringify(cinemas, null, 2)
    );
    writeFileSync(
      join(dataDir, "screenings.json"),
      JSON.stringify(screenings, null, 2)
    );

    console.log("💾 Static data saved to src/data/");
    console.log("✨ Done!");
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    process.exit(1);
  }
}

fetchData();
