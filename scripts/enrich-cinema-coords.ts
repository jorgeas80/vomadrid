#!/usr/bin/env node
/**
 * One-shot script: resolves Google Maps short URLs for each cinema,
 * extracts lat/lng coordinates, and writes them back to Airtable.
 *
 * Run with: npx tsx scripts/enrich-cinema-coords.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TOKEN = process.env.AIRTABLE_API_TOKEN!;
const TABLE = "cinemas";

if (!BASE_ID || !TOKEN) {
  console.error("Missing AIRTABLE_BASE_ID or AIRTABLE_API_TOKEN");
  process.exit(1);
}

async function fetchAllCinemas(): Promise<{ id: string; name: string; googleMapsUrl: string }[]> {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`;
  const records: any[] = [];
  let offset: string | undefined;

  do {
    const fetchUrl = offset ? `${url}?offset=${offset}` : url;
    const res = await fetch(fetchUrl, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    if (!res.ok) throw new Error(`Airtable fetch error (${res.status}): ${await res.text()}`);
    const data = await res.json();
    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  return records
    .filter((r) => r.fields["Google Maps URL"])
    .map((r) => ({
      id: r.id,
      name: r.fields["Cinema name"] ?? r.id,
      googleMapsUrl: r.fields["Google Maps URL"],
    }));
}

async function resolveCoords(shortUrl: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(shortUrl, { redirect: "follow" });
    const finalUrl = res.url;
    const match = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+),/);
    if (!match) return null;
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  } catch {
    return null;
  }
}

async function updateCinema(recordId: string, lat: number, lng: number): Promise<void> {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}/${recordId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: { Latitude: lat, Longitude: lng } }),
  });
  if (!res.ok) throw new Error(`Airtable update error (${res.status}): ${await res.text()}`);
}

async function main() {
  console.log("Fetching cinemas from Airtable...");
  const cinemas = await fetchAllCinemas();
  console.log(`${cinemas.length} cinemas with Google Maps URL found\n`);

  let ok = 0;
  let failed = 0;

  for (const cinema of cinemas) {
    const coords = await resolveCoords(cinema.googleMapsUrl);

    if (!coords) {
      console.log(`  ✗ ${cinema.name} — could not extract coords from ${cinema.googleMapsUrl}`);
      failed++;
      continue;
    }

    await updateCinema(cinema.id, coords.lat, coords.lng);
    console.log(`  ✓ ${cinema.name} → ${coords.lat}, ${coords.lng}`);
    ok++;

    // Airtable rate limit: 5 req/s
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(`\nDone. ${ok} updated, ${failed} failed.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
