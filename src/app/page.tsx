"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Movie } from "@/lib/types";
import { MovieGrid } from "@/components/MovieGrid";
import { MovieFilters } from "@/components/MovieFilters";

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [ageRating, setAgeRating] = useState("");

  useEffect(() => {
    fetch("/api/movies")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(setMovies)
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
    return movies.filter((m) => {
      if (
        debouncedSearch &&
        !m.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
        return false;
      if (genre && !m.genres.includes(genre)) return false;
      if (language && m.originalLanguage !== language) return false;
      if (ageRating && m.ageRating !== ageRating) return false;
      return true;
    });
  }, [movies, debouncedSearch, genre, language, ageRating]);

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
        <p className="text-[var(--color-muted)]">Error al cargar películas.</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Cartelera</h1>
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
      <MovieGrid movies={filtered} />
    </>
  );
}
