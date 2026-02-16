#!/usr/bin/env node
/**
 * Fetches data from Airtable and saves it as static JSON files.
 * Run with: npm run fetch-data
 */

// Load environment variables from .env file
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Helper function
function formatRuntime(seconds?: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

// Fetch raw data from Airtable (no relation resolving)
async function fetchRawTable(table: string): Promise<any[]> {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_API_TOKEN;

  if (!baseId || !token) {
    throw new Error("Missing Airtable credentials");
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
  let allRecords: any[] = [];
  let offset: string | undefined;

  do {
    const fetchUrl = offset ? `${url}?offset=${offset}` : url;
    const res = await fetch(fetchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Airtable error (${res.status}): ${text}`);
    }

    const data = await res.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset;
  } while (offset);

  return allRecords;
}

async function fetchData() {
  console.log("🔄 Fetching data from Airtable...");

  try {
    // Fetch all tables raw (only 3 API calls total!)
    console.log("Fetching movies...");
    const moviesRaw = await fetchRawTable("movies");
    console.log(`✅ Fetched ${moviesRaw.length} movies`);

    console.log("Fetching cinemas...");
    const cinemasRaw = await fetchRawTable("cinemas");
    console.log(`✅ Fetched ${cinemasRaw.length} cinemas`);

    console.log("Fetching screenings...");
    const screeningsRaw = await fetchRawTable("screenings");
    console.log(`✅ Fetched ${screeningsRaw.length} screenings`);

    // Now map and filter data using the same logic
    const { default: types } = await import("../src/lib/types.js");

    // Map movies
    const movies = moviesRaw
      .filter((r: any) => r.fields["Is active"])
      .map((r: any) => ({
        id: r.id,
        title: r.fields["Title"] ?? "",
        originalTitle: r.fields["Original title"] ?? "",
        poster: r.fields["Poster"] ?? "",
        synopsis: r.fields["Synopsis"] ?? "",
        trailerUrl: r.fields["Trailer URL"] ?? "",
        rating: Math.round(((r.fields["Rating"] ?? 0) / 10) * 5),
        genres: r.fields["Genres"] ?? [],
        runtime: formatRuntime(r.fields["Runtime"]),
        ageRating: r.fields["Age rating"]?.[0] ?? "",
        originalLanguage: r.fields["Original language"] ?? "",
        imdbLink: r.fields["imdb_link"] ?? "",
        isActive: true,
        sortOrder: r.fields["Sort order"] ?? 999,
      }))
      .sort((a: any, b: any) => a.title.localeCompare(b.title));

    // Map cinemas
    const cinemas = cinemasRaw
      .filter((r: any) => r.fields["Is active"])
      .map((r: any) => ({
        id: r.id,
        name: r.fields["Cinema name"] ?? "",
        chain: r.fields["Chain"] ?? "",
        address: r.fields["Address"] ?? "",
        city: r.fields["City"] ?? "",
        url: r.fields["URL"] ?? "",
        googleMapsUrl: r.fields["Google Maps URL"] ?? "",
        isActive: true,
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    // Map screenings and resolve relations in memory
    const movieMap = new Map(movies.map((m: any) => [m.id, m]));
    const cinemaMap = new Map(cinemas.map((c: any) => [c.id, c]));

    const screenings = screeningsRaw
      .filter((r: any) => r.fields["Is active"])
      .map((r: any) => {
        const movieId = r.fields["Movie (linked)"]?.[0] ?? "";
        const cinemaId = r.fields["Cinema (linked)"]?.[0] ?? "";
        return {
          id: r.id,
          screeningId: r.fields["ID"] ?? 0,
          movieId,
          cinemaId,
          date: r.fields["Date"] ?? "",
          bookingUrl: r.fields["Booking URL"] ?? "",
          notes: r.fields["Notes"] ?? "",
          isActive: true,
          movie: movieMap.get(movieId),
          cinema: cinemaMap.get(cinemaId),
        };
      })
      .filter((s: any) => s.date >= new Date().toISOString().split("T")[0])
      .sort((a: any, b: any) => a.date.localeCompare(b.date));

    console.log(`✅ Processed ${movies.length} active movies`);
    console.log(`✅ Processed ${cinemas.length} active cinemas`);
    console.log(`✅ Processed ${screenings.length} active screenings`);

    // Create data directory if it doesn't exist
    const dataDir = join(process.cwd(), "src", "data");
    mkdirSync(dataDir, { recursive: true });

    // Write JSON files
    writeFileSync(
      join(dataDir, "movies.json"),
      JSON.stringify(movies, null, 2)
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
