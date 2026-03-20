import { redirect } from "next/navigation";
import { readSheetAsObjects } from "@/lib/sheets";
import { createScreening } from "../../actions";

async function handleCreate(formData: FormData) {
  "use server";
  await createScreening(formData);
  redirect("/admin/screenings");
}

export const dynamic = "force-dynamic";

export default async function NewScreeningPage() {
  const [moviesRaw, cinemasRaw] = await Promise.all([
    readSheetAsObjects("movies"),
    readSheetAsObjects("cinemas"),
  ]);

  function isActive(v: string) {
    return v?.toLowerCase() === "true" || v?.toLowerCase() === "checked";
  }

  const movies = moviesRaw
    .filter((m) => isActive(m["Is active"]))
    .sort((a, b) => (a["Title"] ?? "").localeCompare(b["Title"] ?? ""));

  const cinemas = cinemasRaw
    .filter((c) => isActive(c["Is active"]))
    .sort((a, b) => (a["Cinema name"] ?? "").localeCompare(b["Cinema name"] ?? ""));

  const today = new Date().toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <a href="/admin/screenings" className="text-sm text-gray-500 hover:underline">
          ← Back to screenings
        </a>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          Add screening
        </h1>
      </div>

      <form action={handleCreate} className="space-y-4">
        <div>
          <label
            htmlFor="movieId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Movie *
          </label>
          <select
            id="movieId"
            name="movieId"
            required
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— select a movie —</option>
            {movies.map((m) => (
              <option key={m["id"]} value={m["id"]}>
                {m["Title"]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="cinemaId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Cinema *
          </label>
          <select
            id="cinemaId"
            name="cinemaId"
            required
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— select a cinema —</option>
            {cinemas.map((c) => (
              <option key={c["id"]} value={c["id"]}>
                {c["Cinema name"]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Date &amp; time *
          </label>
          <input
            id="date"
            name="date"
            type="datetime-local"
            required
            min={today}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="bookingUrl"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Booking URL
          </label>
          <input
            id="bookingUrl"
            name="bookingUrl"
            type="url"
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Notes
          </label>
          <input
            id="notes"
            name="notes"
            type="text"
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700"
          >
            Save
          </button>
          <a
            href="/admin/screenings"
            className="rounded border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
