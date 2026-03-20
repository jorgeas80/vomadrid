import { redirect, notFound } from "next/navigation";
import { readSheetAsObjects } from "@/lib/sheets";
import { updateMovie } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movies = await readSheetAsObjects("movies");
  const movie = movies.find((m) => m["id"] === id);

  if (!movie) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateMovie(id, formData);
    redirect("/admin/movies");
  }

  const isActive = ["true", "checked"].includes(movie["Is active"]?.toLowerCase());

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <a href="/admin/movies" className="text-sm text-gray-500 hover:underline">
          ← Back to movies
        </a>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          Edit movie
        </h1>
      </div>

      <form action={handleUpdate} className="space-y-4">
        <Field label="Title *" name="title" required defaultValue={movie["Title"]} />
        <Field label="Original title" name="originalTitle" defaultValue={movie["Original title"]} />
        <Field label="Spanish title" name="titleEs" defaultValue={movie["Title_ES"]} />
        <Field label="Poster URL" name="poster" type="url" defaultValue={movie["Poster"]} />
        <Field label="Trailer URL" name="trailerUrl" type="url" defaultValue={movie["Trailer URL"]} />
        <Textarea label="Synopsis" name="synopsis" defaultValue={movie["Synopsis"]} />
        <Field label="Rating (0–10)" name="rating" type="number" defaultValue={movie["Rating"]} />
        <Field label="Genres (comma-separated)" name="genres" defaultValue={movie["Genres"]} />
        <Field label="Runtime (seconds)" name="runtime" type="number" defaultValue={movie["Runtime"]} />
        <Field label="Age rating" name="ageRating" defaultValue={movie["Age rating"]} />
        <Field label="Original language" name="originalLanguage" defaultValue={movie["Original language"]} />
        <Field label="IMDb link" name="imdbLink" type="url" defaultValue={movie["imdb_link"]} />
        <Field label="Filmaffinity link" name="filmaffinityLink" type="url" defaultValue={movie["filmaffinity_link"]} />
        <Field label="Sort order" name="sortOrder" type="number" defaultValue={movie["Sort order"]} />

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
            href="/admin/movies"
            className="rounded border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Textarea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={4}
        defaultValue={defaultValue}
        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
