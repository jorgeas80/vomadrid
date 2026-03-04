import Link from "next/link";
import type { Movie } from "@/lib/types";
import { StarRating } from "./StarRating";

function formatNextSession(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow";
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export function MovieCard({ movie, nextSession }: { movie: Movie; nextSession?: string }) {
  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--color-badge)]">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--color-muted)]">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold leading-tight line-clamp-2">{movie.title}</h3>
        {movie.rating > 0 && (
          <div className="mt-1">
            <StarRating rating={movie.rating} />
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-1">
          {movie.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="rounded-full bg-[var(--color-badge)] px-2 py-0.5 text-xs text-[var(--color-badge-text)]"
            >
              {genre}
            </span>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-muted)]">
          {movie.originalLanguage && <span>{movie.originalLanguage}</span>}
          {movie.ageRating && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{movie.ageRating}</span>
            </>
          )}
        </div>
        {nextSession && (
          <p className="mt-2 text-xs font-medium text-[var(--color-accent)]">
            Next: {formatNextSession(nextSession)}
          </p>
        )}
      </div>
    </Link>
  );
}
