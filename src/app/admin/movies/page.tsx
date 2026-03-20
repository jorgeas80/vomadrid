import Link from "next/link";
import { readSheetAsObjects } from "@/lib/sheets";
import { deleteMovie } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminMoviesPage() {
  const movies = await readSheetAsObjects("movies");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Movies ({movies.length})
        </h1>
        <Link
          href="/admin/movies/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          + Add movie
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Original title</th>
              <th className="px-4 py-3 text-left">Language</th>
              <th className="px-4 py-3 text-center">Active</th>
              <th className="px-4 py-3 text-center">Sort</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {movies.map((movie) => (
              <tr
                key={movie["id"]}
                className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  {movie["Title"]}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {movie["Original title"]}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {movie["Original language"]}
                </td>
                <td className="px-4 py-3 text-center text-gray-900 dark:text-gray-100">
                  {movie["Is active"]?.toLowerCase() === "true" ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                  {movie["Sort order"]}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/movies/${movie["id"]}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={deleteMovie.bind(null, movie["id"])}>
                      <button type="submit" className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
