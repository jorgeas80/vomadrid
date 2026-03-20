import { redirect, notFound } from "next/navigation";
import { readSheetAsObjects } from "@/lib/sheets";
import { updateScreening } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditScreeningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [screeningsRaw, moviesRaw, cinemasRaw] = await Promise.all([
    readSheetAsObjects("screenings"),
    readSheetAsObjects("movies"),
    readSheetAsObjects("cinemas"),
  ]);

  const s = screeningsRaw.find((r) => r["id"] === id);
  if (!s) notFound();

  const movies = moviesRaw.sort((a, b) =>
    (a["Title"] ?? "").localeCompare(b["Title"] ?? "")
  );
  const cinemas = cinemasRaw.sort((a, b) =>
    (a["Cinema name"] ?? "").localeCompare(b["Cinema name"] ?? "")
  );

  const isActive = ["true", "checked"].includes(s["Is active"]?.toLowerCase());
  // datetime-local requires "YYYY-MM-DDTHH:MM" — strip seconds and timezone
  const dateValue = s["Date"]?.slice(0, 16) ?? "";

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateScreening(id, formData);
    redirect("/admin/screenings");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <a href="/admin/screenings" className="text-sm text-gray-500 hover:underline">
          ← Back to screenings
        </a>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          Edit screening
        </h1>
      </div>

      <form action={handleUpdate} className="space-y-4">
        <div>
          <label htmlFor="movieId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Movie *
          </label>
          <select
            id="movieId"
            name="movieId"
            required
            defaultValue={s["movie_id"]}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {movies.map((m) => (
              <option key={m["id"]} value={m["id"]}>
                {m["Title"]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="cinemaId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cinema *
          </label>
          <select
            id="cinemaId"
            name="cinemaId"
            required
            defaultValue={s["cinema_id"]}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {cinemas.map((c) => (
              <option key={c["id"]} value={c["id"]}>
                {c["Cinema name"]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date &amp; time *
          </label>
          <input
            id="date"
            name="date"
            type="datetime-local"
            required
            defaultValue={dateValue}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="bookingUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Booking URL
          </label>
          <input
            id="bookingUrl"
            name="bookingUrl"
            type="url"
            defaultValue={s["Booking URL"]}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <input
            id="notes"
            name="notes"
            type="text"
            defaultValue={s["Notes"]}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <input type="hidden" name="source" value={s["source"]} />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            defaultChecked={isActive}
            className="h-4 w-4"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
            Active
          </label>
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
