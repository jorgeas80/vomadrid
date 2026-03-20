"use server";

import { revalidatePath } from "next/cache";
import {
  appendRow,
  findRowIndex,
  updateRow,
  deleteRow,
  readSheetAsObjects,
} from "@/lib/sheets";

/**
 * Converts a datetime-local value ("YYYY-MM-DDTHH:MM") to a full ISO 8601 string
 * with the Europe/Madrid offset ("+01:00" or "+02:00" depending on DST).
 * Prefixes with "'" so Google Sheets stores it as plain text instead of a date.
 */
function toMadridISOText(localDT: string): string {
  if (!localDT) return localDT;
  const withSeconds = localDT.length === 16 ? localDT + ":00" : localDT;
  // Parse as UTC to get a Date we can query for the Madrid offset at that moment
  const d = new Date(withSeconds + "Z");
  const tzName =
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      timeZoneName: "longOffset",
    })
      .formatToParts(d)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT+01:00";
  const offset = tzName.replace("GMT", ""); // "+01:00" or "+02:00"
  // Leading apostrophe tells Google Sheets to treat the cell as plain text
  return "'" + withSeconds + offset;
}

// --- Movies ---

export async function createMovie(formData: FormData) {
  const existing = await readSheetAsObjects("movies");
  const id = `mov_${(existing.length + 1).toString().padStart(3, "0")}`;
  // Column order: id | Title | Original title | Title_ES | Poster | Synopsis | Trailer URL |
  //               Rating | Genres | Runtime | Age rating | Original language |
  //               imdb_link | filmaffinity_link | Is active | Sort order
  const row = [
    id,
    formData.get("title") as string,
    formData.get("originalTitle") as string,
    formData.get("titleEs") as string,
    formData.get("poster") as string,
    formData.get("synopsis") as string,
    formData.get("trailerUrl") as string,
    formData.get("rating") as string,
    formData.get("genres") as string,
    formData.get("runtime") as string,
    formData.get("ageRating") as string,
    formData.get("originalLanguage") as string,
    formData.get("imdbLink") as string,
    formData.get("filmaffinityLink") as string,
    formData.get("isActive") === "on" ? "TRUE" : "FALSE",
    formData.get("sortOrder") as string,
  ];
  await appendRow("movies", row);
  revalidatePath("/admin/movies");
}

export async function updateMovie(id: string, formData: FormData) {
  const rowIndex = await findRowIndex("movies", id);
  // Column order: id | Title | Original title | Title_ES | Poster | Synopsis | Trailer URL |
  //               Rating | Genres | Runtime | Age rating | Original language |
  //               imdb_link | filmaffinity_link | Is active | Sort order
  const row = [
    id,
    formData.get("title") as string,
    formData.get("originalTitle") as string,
    formData.get("titleEs") as string,
    formData.get("poster") as string,
    formData.get("synopsis") as string,
    formData.get("trailerUrl") as string,
    formData.get("rating") as string,
    formData.get("genres") as string,
    formData.get("runtime") as string,
    formData.get("ageRating") as string,
    formData.get("originalLanguage") as string,
    formData.get("imdbLink") as string,
    formData.get("filmaffinityLink") as string,
    formData.get("isActive") === "on" ? "TRUE" : "FALSE",
    formData.get("sortOrder") as string,
  ];
  await updateRow("movies", rowIndex, row);
  revalidatePath("/admin/movies");
}

export async function deleteMovie(id: string) {
  const rowIndex = await findRowIndex("movies", id);
  await deleteRow("movies", rowIndex);
  revalidatePath("/admin/movies");
}

// --- Cinemas ---

export async function createCinema(formData: FormData) {
  const id = crypto.randomUUID();
  const row = [
    id,
    formData.get("cinemaName") as string,
    formData.get("chain") as string,
    formData.get("address") as string,
    formData.get("city") as string,
    formData.get("url") as string,
    formData.get("googleMapsUrl") as string,
    formData.get("latitude") as string,
    formData.get("longitude") as string,
    formData.get("isActive") === "on" ? "true" : "false",
  ];
  await appendRow("cinemas", row);
  revalidatePath("/admin/cinemas");
}

export async function updateCinema(id: string, formData: FormData) {
  const rowIndex = await findRowIndex("cinemas", id);
  const row = [
    id,
    formData.get("cinemaName") as string,
    formData.get("chain") as string,
    formData.get("address") as string,
    formData.get("city") as string,
    formData.get("url") as string,
    formData.get("googleMapsUrl") as string,
    formData.get("latitude") as string,
    formData.get("longitude") as string,
    formData.get("isActive") === "on" ? "true" : "false",
  ];
  await updateRow("cinemas", rowIndex, row);
  revalidatePath("/admin/cinemas");
}

export async function deleteCinema(id: string) {
  const rowIndex = await findRowIndex("cinemas", id);
  await deleteRow("cinemas", rowIndex);
  revalidatePath("/admin/cinemas");
}

// --- Screenings ---

export async function createScreening(formData: FormData) {
  const id = crypto.randomUUID();
  const row = [
    id,
    formData.get("movieId") as string,
    formData.get("cinemaId") as string,
    toMadridISOText(formData.get("date") as string),
    formData.get("bookingUrl") as string,
    formData.get("notes") as string,
    "true",
    "manual",
  ];
  await appendRow("screenings", row);
  revalidatePath("/admin/screenings");
}

export async function updateScreening(id: string, formData: FormData) {
  const rowIndex = await findRowIndex("screenings", id);
  const row = [
    id,
    formData.get("movieId") as string,
    formData.get("cinemaId") as string,
    toMadridISOText(formData.get("date") as string),
    formData.get("bookingUrl") as string,
    formData.get("notes") as string,
    formData.get("isActive") === "on" ? "TRUE" : "FALSE",
    formData.get("source") as string,
  ];
  await updateRow("screenings", rowIndex, row);
  revalidatePath("/admin/screenings");
}

export async function deleteScreening(id: string) {
  const rowIndex = await findRowIndex("screenings", id);
  await deleteRow("screenings", rowIndex);
  revalidatePath("/admin/screenings");
}
