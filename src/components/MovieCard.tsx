import Link from "next/link";
import type { Movie } from "@/lib/types";
import { StarRating } from "./StarRating";

export function MovieCard({ movie }: { movie: Movie }) {
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
              className="rounded-full bg-[var(--color-badge)] px-2 py-0.5 text-xs text-[var(--color-muted)]"
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
      </div>
    </Link>
  );
}
