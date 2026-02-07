"use client";

import { useCallback } from "react";

interface MovieFiltersProps {
  search: string;
  genre: string;
  language: string;
  ageRating: string;
  genres: string[];
  languages: string[];
  ageRatings: string[];
  onSearchChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onAgeRatingChange: (value: string) => void;
}

export function MovieFilters({
  search,
  genre,
  language,
  ageRating,
  genres,
  languages,
  ageRatings,
  onSearchChange,
  onGenreChange,
  onLanguageChange,
  onAgeRatingChange,
}: MovieFiltersProps) {
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={handleSearch}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          value={genre}
          onChange={(e) => onGenreChange(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        >
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        >
          <option value="">All languages</option>
          {languages.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          value={ageRating}
          onChange={(e) => onAgeRatingChange(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        >
          <option value="">Age rating</option>
          {ageRatings.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
