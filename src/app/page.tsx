"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Movie } from "@/lib/types";
import { MovieGrid } from "@/components/MovieGrid";
import { MovieFilters } from "@/components/MovieFilters";

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [nextSessionMap, setNextSessionMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [ageRating, setAgeRating] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week">("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/movies").then((res) => { if (!res.ok) throw new Error("Failed to fetch"); return res.json(); }),
      fetch("/api/screenings").then((res) => { if (!res.ok) throw new Error("Failed to fetch"); return res.json(); }),
    ])
      .then(([moviesData, screeningsData]) => {
        setMovies(moviesData);
        const map = new Map<string, string>();
        for (const s of screeningsData) {
          if (!map.has(s.movieId) || s.date < map.get(s.movieId)!) {
            map.set(s.movieId, s.date);
          }
        }
        setNextSessionMap(map);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Extract unique filter options
  const genres = useMemo(
    () => [...new Set(movies.flatMap((m) => m.genres))].sort(),
    [movies]
  );
  const languages = useMemo(
    () => [...new Set(movies.map((m) => m.originalLanguage).filter(Boolean))].sort(),
    [movies]
  );
  const ageRatings = useMemo(
    () => [...new Set(movies.map((m) => m.ageRating).filter(Boolean))].sort(),
    [movies]
  );

  // Filter movies
  const filtered = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const toDate = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
    const todayStr = today.toISOString().split("T")[0];

    return movies.filter((m) => {
      if (debouncedSearch && !m.title.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      if (genre && !m.genres.includes(genre)) return false;
      if (language && m.originalLanguage !== language) return false;
      if (ageRating && m.ageRating !== ageRating) return false;
      if (dateFilter !== "all") {
        const next = nextSessionMap.get(m.id);
        if (!next) return false;
        if (dateFilter === "today" && next !== todayStr) return false;
        if (dateFilter === "week" && toDate(next) >= weekEnd) return false;
      }
      return true;
    });
  }, [movies, debouncedSearch, genre, language, ageRating, dateFilter, nextSessionMap]);

  const handleSearchChange = useCallback((v: string) => setSearch(v), []);
  const handleGenreChange = useCallback((v: string) => setGenre(v), []);
  const handleLanguageChange = useCallback((v: string) => setLanguage(v), []);
  const handleAgeRatingChange = useCallback((v: string) => setAgeRating(v), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-[var(--color-muted)]">Failed to load movies.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Now showing</h1>
          <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden text-sm font-medium">
            {(["all", "today", "week"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-3 py-1.5 transition-colors ${dateFilter === f ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-card)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]"}`}
              >
                {f === "all" ? "All" : f === "today" ? "Today" : "This week"}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Find movies in original version (VO) playing in cinemas across Madrid and buy tickets online.
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Sessions are updated daily — if you only see a few dates, check back tomorrow for new availability.
        </p>
      </div>
      <MovieFilters
        search={search}
        genre={genre}
        language={language}
        ageRating={ageRating}
        genres={genres}
        languages={languages}
        ageRatings={ageRatings}
        onSearchChange={handleSearchChange}
        onGenreChange={handleGenreChange}
        onLanguageChange={handleLanguageChange}
        onAgeRatingChange={handleAgeRatingChange}
      />
      <MovieGrid movies={filtered} nextSessionMap={nextSessionMap} />
    </>
  );
}
