"use server";

import { revalidatePath } from "next/cache";
import {
  appendRow,
  findRowIndex,
  updateRow,
  deleteRow,
} from "@/lib/sheets";

// --- Movies ---

export async function createMovie(formData: FormData) {
  const id = crypto.randomUUID();
  const row = [
    id,
    formData.get("title") as string,
    formData.get("originalTitle") as string,
    formData.get("poster") as string,
    formData.get("synopsis") as string,
    formData.get("trailerUrl") as string,
    formData.get("rating") as string,
    formData.get("genres") as string,
    formData.get("runtime") as string,
    formData.get("ageRating") as string,
    formData.get("originalLanguage") as string,
    formData.get("isActive") === "on" ? "true" : "false",
    formData.get("sortOrder") as string,
    formData.get("imdbLink") as string,
    formData.get("filmaffinityLink") as string,
    formData.get("titleEs") as string,
  ];
  await appendRow("movies", row);
  revalidatePath("/admin/movies");
}

export async function updateMovie(id: string, formData: FormData) {
  const rowIndex = await findRowIndex("movies", id);
  const row = [
    id,
    formData.get("title") as string,
    formData.get("originalTitle") as string,
    formData.get("poster") as string,
    formData.get("synopsis") as string,
    formData.get("trailerUrl") as string,
    formData.get("rating") as string,
    formData.get("genres") as string,
    formData.get("runtime") as string,
    formData.get("ageRating") as string,
    formData.get("originalLanguage") as string,
    formData.get("isActive") === "on" ? "true" : "false",
    formData.get("sortOrder") as string,
    formData.get("imdbLink") as string,
    formData.get("filmaffinityLink") as string,
    formData.get("titleEs") as string,
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
    formData.get("date") as string,
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
    formData.get("date") as string,
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
