import Link from "next/link";
import type { Cinema } from "@/lib/types";

export function CinemaCard({ cinema }: { cinema: Cinema }) {
  return (
    <Link
      href={`/cinemas/${cinema.id}`}
      className="flex items-start gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex-1">
        <h3 className="font-semibold">{cinema.name}</h3>
        <div className="mt-1 flex items-center gap-2 text-sm text-[var(--color-muted)]">
          {cinema.chain && (
            <span className="rounded-full bg-[var(--color-badge)] px-2 py-0.5 text-xs font-medium">
              {cinema.chain}
            </span>
          )}
          {cinema.city && <span>{cinema.city}</span>}
        </div>
        {cinema.address && (
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {cinema.address}
          </p>
        )}
      </div>
    </Link>
  );
}
