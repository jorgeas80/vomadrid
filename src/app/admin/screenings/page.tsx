import Link from "next/link";
import { readSheetAsObjects } from "@/lib/sheets";
import { deleteScreening } from "../actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type SortCol = "date" | "movie" | "cinema" | "notes" | "source" | "active";
type SortDir = "asc" | "desc";

function isActiveVal(v: string) {
  return ["true", "checked"].includes(v?.toLowerCase());
}

export default async function AdminScreeningsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const filterMovieId = sp.movieId ?? "";
  const filterCinemaId = sp.cinemaId ?? "";
  const filterSource = sp.source ?? "";
  const showPast = sp.past === "1";
  const noMovie = sp.noMovie === "1";
  const noCinema = sp.noCinema === "1";
  const sortCol = (sp.sort ?? "date") as SortCol;
  const sortDir = (sp.dir ?? "asc") as SortDir;
  const page = Math.max(1, parseInt(sp.page ?? "1"));

  const [screeningsRaw, moviesRaw, cinemasRaw] = await Promise.all([
    readSheetAsObjects("screenings"),
    readSheetAsObjects("movies"),
    readSheetAsObjects("cinemas"),
  ]);

  const movieMap = new Map(moviesRaw.map((m) => [m["id"], m["Title"]]));
  const cinemaMap = new Map(cinemasRaw.map((c) => [c["id"], c["Cinema name"]]));

  const today = new Date().toISOString().split("T")[0];

  const sources = [...new Set(screeningsRaw.map((s) => s["source"]).filter(Boolean))].sort();

  const filtered = screeningsRaw.filter((s) => {
    if (filterMovieId && s["movie_id"] !== filterMovieId) return false;
    if (filterCinemaId && s["cinema_id"] !== filterCinemaId) return false;
    if (filterSource && s["source"] !== filterSource) return false;
    if (!showPast && s["Date"] < today) return false;
    if (noMovie && movieMap.has(s["movie_id"])) return false;
    if (noCinema && cinemaMap.has(s["cinema_id"])) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let va = "";
    let vb = "";
    if (sortCol === "date") { va = a["Date"]; vb = b["Date"]; }
    else if (sortCol === "movie") { va = movieMap.get(a["movie_id"]) ?? ""; vb = movieMap.get(b["movie_id"]) ?? ""; }
    else if (sortCol === "cinema") { va = cinemaMap.get(a["cinema_id"]) ?? ""; vb = cinemaMap.get(b["cinema_id"]) ?? ""; }
    else if (sortCol === "notes") { va = a["Notes"]; vb = b["Notes"]; }
    else if (sortCol === "source") { va = a["source"]; vb = b["source"]; }
    else if (sortCol === "active") { va = a["Is active"]; vb = b["Is active"]; }
    const cmp = va.localeCompare(vb);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const movies = moviesRaw.sort((a, b) => (a["Title"] ?? "").localeCompare(b["Title"] ?? ""));
  const cinemas = cinemasRaw.sort((a, b) => (a["Cinema name"] ?? "").localeCompare(b["Cinema name"] ?? ""));

  // URL helpers
  function buildParams(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    if (filterMovieId) params.set("movieId", filterMovieId);
    if (filterCinemaId) params.set("cinemaId", filterCinemaId);
    if (filterSource) params.set("source", filterSource);
    if (showPast) params.set("past", "1");
    if (noMovie) params.set("noMovie", "1");
    if (noCinema) params.set("noCinema", "1");
    params.set("sort", sortCol);
    params.set("dir", sortDir);
    params.set("page", "1");
    for (const [k, v] of Object.entries(overrides)) {
      if (v === "") params.delete(k);
      else params.set(k, v);
    }
    return `/admin/screenings?${params}`;
  }

  function sortUrl(col: SortCol) {
    const newDir = sortCol === col && sortDir === "asc" ? "desc" : "asc";
    return buildParams({ sort: col, dir: newDir, page: "1" });
  }

  function pageUrl(p: number) {
    return buildParams({ page: String(p) });
  }

  function sortIndicator(col: SortCol) {
    if (sortCol !== col) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Screenings ({total})
        </h1>
        <Link
          href="/admin/screenings/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          + Add screening
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-4 items-end">
        <input type="hidden" name="sort" value={sortCol} />
        <input type="hidden" name="dir" value={sortDir} />

        <div>
          <label className="block text-xs text-gray-500 mb-1">Movie</label>
          <select
            name="movieId"
            defaultValue={filterMovieId}
            className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-white"
          >
            <option value="">All movies</option>
            {movies.map((m) => (
              <option key={m["id"]} value={m["id"]}>{m["Title"]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Cinema</label>
          <select
            name="cinemaId"
            defaultValue={filterCinemaId}
            className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-white"
          >
            <option value="">All cinemas</option>
            {cinemas.map((c) => (
              <option key={c["id"]} value={c["id"]}>{c["Cinema name"]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Source</label>
          <select
            name="source"
            defaultValue={filterSource}
            className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-white"
          >
            <option value="">All sources</option>
            {sources.map((src) => (
              <option key={src} value={src}>{src}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" name="past" value="1" defaultChecked={showPast} className="h-4 w-4" />
            Include past
          </label>
          <label className="flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-400">
            <input type="checkbox" name="noMovie" value="1" defaultChecked={noMovie} className="h-4 w-4" />
            No movie linked
          </label>
          <label className="flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-400">
            <input type="checkbox" name="noCinema" value="1" defaultChecked={noCinema} className="h-4 w-4" />
            No cinema linked
          </label>
        </div>

        <div className="flex gap-2 items-center">
          <button
            type="submit"
            className="rounded border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Filter
          </button>
          <a href="/admin/screenings" className="text-sm text-gray-500 hover:underline">
            Clear
          </a>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">
                <a href={sortUrl("date")} className="hover:text-gray-900 dark:hover:text-white">
                  Date{sortIndicator("date")}
                </a>
              </th>
              <th className="px-4 py-3 text-left">
                <a href={sortUrl("movie")} className="hover:text-gray-900 dark:hover:text-white">
                  Movie{sortIndicator("movie")}
                </a>
              </th>
              <th className="px-4 py-3 text-left">
                <a href={sortUrl("cinema")} className="hover:text-gray-900 dark:hover:text-white">
                  Cinema{sortIndicator("cinema")}
                </a>
              </th>
              <th className="px-4 py-3 text-left">
                <a href={sortUrl("notes")} className="hover:text-gray-900 dark:hover:text-white">
                  Notes{sortIndicator("notes")}
                </a>
              </th>
              <th className="px-4 py-3 text-left">
                <a href={sortUrl("source")} className="hover:text-gray-900 dark:hover:text-white">
                  Source{sortIndicator("source")}
                </a>
              </th>
              <th className="px-4 py-3 text-center">
                <a href={sortUrl("active")} className="hover:text-gray-900 dark:hover:text-white">
                  Active{sortIndicator("active")}
                </a>
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginated.map((s) => {
              const missingMovie = !movieMap.has(s["movie_id"]);
              const missingCinema = !cinemaMap.has(s["cinema_id"]);
              return (
                <tr
                  key={s["id"]}
                  className={`bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    s["Date"] < today ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                    {s["Date"]?.slice(0, 16).replace("T", " ")}
                  </td>
                  <td className={`px-4 py-3 ${missingMovie ? "text-orange-500 font-medium" : "text-gray-700 dark:text-gray-300"}`}>
                    {movieMap.get(s["movie_id"]) ?? `⚠ ${s["movie_id"] || "(empty)"}`}
                  </td>
                  <td className={`px-4 py-3 ${missingCinema ? "text-orange-500 font-medium" : "text-gray-700 dark:text-gray-300"}`}>
                    {cinemaMap.get(s["cinema_id"]) ?? `⚠ ${s["cinema_id"] || "(empty)"}`}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {s["Notes"]}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {s["source"]}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-900 dark:text-gray-100">
                    {isActiveVal(s["Is active"]) ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3">
                    {s["id"] ? (
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/screenings/${s["id"]}/edit`} className="text-blue-600 hover:underline">
                          Edit
                        </Link>
                        <form action={deleteScreening.bind(null, s["id"])}>
                          <button type="submit" className="text-red-600 hover:underline">
                            Delete
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-orange-500 text-xs" title="This row has no ID and cannot be edited or deleted from here. Fix it directly in Google Sheets.">
                        ⚠ No ID
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Page {page} of {totalPages} ({total} results)</span>
          <div className="flex gap-2">
            {page > 1 && (
              <a href={pageUrl(page - 1)} className="rounded border border-gray-300 dark:border-gray-600 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                ← Prev
              </a>
            )}
            {page < totalPages && (
              <a href={pageUrl(page + 1)} className="rounded border border-gray-300 dark:border-gray-600 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                Next →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
