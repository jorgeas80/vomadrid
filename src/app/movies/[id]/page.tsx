"use client";

import { useState, useEffect, useMemo, useCallback, use } from "react";
import Link from "next/link";
import type { Movie, Screening } from "@/lib/types";
import { StarRating } from "@/components/StarRating";
import { ScreeningsList } from "@/components/ScreeningsList";
import { ScreeningFilters } from "@/components/ScreeningFilters";

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [cinemaId, setCinemaId] = useState("");
  const [chain, setChain] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/movies/${id}`).then((r) => {
        if (!r.ok) throw new Error("Movie not found");
        return r.json();
      }),
      fetch(`/api/screenings?movieId=${id}`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch screenings");
        return r.json();
      }),
    ])
      .then(([movieData, screeningsData]) => {
        setMovie(movieData);
        setScreenings(screeningsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Extract unique cinemas and chains from screenings
  const cinemas = useMemo(() => {
    const map = new Map<string, string>();
    screenings.forEach((s) => {
      if (s.cinema) map.set(s.cinema.id, s.cinema.name);
    });
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [screenings]);

  const chains = useMemo(() => {
    return [
      ...new Set(
        screenings.map((s) => s.cinema?.chain).filter(Boolean) as string[]
      ),
    ].sort();
  }, [screenings]);

  // Client-side filtering for screenings
  const filtered = useMemo(() => {
    return screenings.filter((s) => {
      if (date && !s.date.startsWith(date)) return false;
      if (cinemaId && s.cinemaId !== cinemaId) return false;
      if (chain && s.cinema?.chain !== chain) return false;
      return true;
    });
  }, [screenings, date, cinemaId, chain]);

  const handleDateChange = useCallback((v: string) => setDate(v), []);
  const handleCinemaChange = useCallback((v: string) => setCinemaId(v), []);
  const handleChainChange = useCallback((v: string) => setChain(v), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="py-20 text-center">
        <p className="text-[var(--color-muted)]">
          {error || "Movie not found."}
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-[var(--color-primary)] hover:underline"
        >
          Back to movies
        </Link>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(movie.trailerUrl);

  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Movie header */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Poster */}
        <div className="w-full flex-shrink-0 md:w-64">
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full rounded-lg shadow-md"
            />
          ) : (
            <div className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-[var(--color-badge)] text-[var(--color-muted)]">
              No poster
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{movie.title}</h1>
          {movie.originalTitle && movie.originalTitle !== movie.title && (
            <p className="mt-1 text-lg text-[var(--color-muted)]">
              {movie.originalTitle}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {movie.rating > 0 && <StarRating rating={movie.rating} />}
            {movie.runtime && (
              <span className="text-sm text-[var(--color-muted)]">
                {movie.runtime}
              </span>
            )}
            {movie.originalLanguage && (
              <span className="rounded-full bg-[var(--color-badge)] px-2 py-0.5 text-xs font-medium text-[var(--color-badge-text)]">
                {movie.originalLanguage}
              </span>
            )}
            {movie.ageRating && (
              <span className="rounded-full bg-[var(--color-badge)] px-2 py-0.5 text-xs font-medium text-[var(--color-badge-text)]">
                {movie.ageRating}
              </span>
            )}
          </div>

          {movie.genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {movie.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-[var(--color-badge)] px-2 py-0.5 text-xs text-[var(--color-badge-text)]"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {movie.imdbLink && (
            <a
              href={movie.imdbLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              View on IMDb
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          {movie.synopsis && (
            <p className="mt-4 leading-relaxed text-[var(--color-muted)]">
              {movie.synopsis}
            </p>
          )}
        </div>
      </div>

      {/* Trailer */}
      {embedUrl && (
        <div className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">Trailer</h2>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <iframe
              src={embedUrl}
              title="Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      )}

      {/* Screenings */}
      <div className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Screenings</h2>
        <ScreeningFilters
          date={date}
          cinemaId={cinemaId}
          chain={chain}
          cinemas={cinemas}
          chains={chains}
          onDateChange={handleDateChange}
          onCinemaChange={handleCinemaChange}
          onChainChange={handleChainChange}
        />
        <ScreeningsList screenings={filtered} />
      </div>
    </div>
  );
}
