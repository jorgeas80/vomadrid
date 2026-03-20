import { redirect } from "next/navigation";
import { createCinema } from "../../actions";

async function handleCreate(formData: FormData) {
  "use server";
  await createCinema(formData);
  redirect("/admin/cinemas");
}

export default function NewCinemaPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <a href="/admin/cinemas" className="text-sm text-gray-500 hover:underline">
          ← Back to cinemas
        </a>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          Add cinema
        </h1>
      </div>

      <form action={handleCreate} className="space-y-4">
        <Field label="Cinema name *" name="cinemaName" required />
        <Field label="Chain" name="chain" />
        <Field label="Address" name="address" />
        <Field label="City" name="city" defaultValue="Madrid" />
        <Field label="Website URL" name="url" type="url" />
        <Field label="Google Maps URL" name="googleMapsUrl" type="url" />
        <Field label="Latitude" name="latitude" type="number" />
        <Field label="Longitude" name="longitude" type="number" />

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
            href="/admin/cinemas"
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
