import Link from "next/link";
import { readSheetAsObjects } from "@/lib/sheets";
import { deleteCinema } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminCinemasPage() {
  const cinemas = await readSheetAsObjects("cinemas");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Cinemas ({cinemas.length})
        </h1>
        <Link
          href="/admin/cinemas/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          + Add cinema
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Chain</th>
              <th className="px-4 py-3 text-left">City</th>
              <th className="px-4 py-3 text-center">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {cinemas.map((cinema) => (
              <tr
                key={cinema["id"]}
                className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  {cinema["Cinema name"]}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {cinema["Chain"]}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {cinema["City"]}
                </td>
                <td className="px-4 py-3 text-center text-gray-900 dark:text-gray-100">
                  {cinema["Is active"]?.toLowerCase() === "true" ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/cinemas/${cinema["id"]}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={deleteCinema.bind(null, cinema["id"])}>
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
