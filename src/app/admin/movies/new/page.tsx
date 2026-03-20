import { redirect } from "next/navigation";
import { createMovie } from "../../actions";

async function handleCreate(formData: FormData) {
  "use server";
  await createMovie(formData);
  redirect("/admin/movies");
}

export default function NewMoviePage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <a href="/admin/movies" className="text-sm text-gray-500 hover:underline">
          ← Back to movies
        </a>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          Add movie
        </h1>
      </div>

      <form action={handleCreate} className="space-y-4">
        <Field label="Title *" name="title" required />
        <Field label="Original title" name="originalTitle" />
        <Field label="Spanish title" name="titleEs" />
        <Field label="Poster URL" name="poster" type="url" />
        <Field label="Trailer URL" name="trailerUrl" type="url" />
        <Textarea label="Synopsis" name="synopsis" />
        <Field label="Rating (0–10)" name="rating" type="number" />
        <Field label="Genres (comma-separated)" name="genres" />
        <Field label="Runtime (e.g. 1:45)" name="runtime" />
        <Field label="Age rating" name="ageRating" />
        <Field label="Original language" name="originalLanguage" />
        <Field label="IMDb link" name="imdbLink" type="url" />
        <Field label="Filmaffinity link" name="filmaffinityLink" type="url" />
        <Field label="Sort order" name="sortOrder" type="number" defaultValue="999" />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            defaultChecked
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

function Textarea({ label, name }: { label: string; name: string }) {
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
        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
