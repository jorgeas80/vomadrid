"use client";

import { useState, useEffect, useMemo } from "react";
import type { Cinema } from "@/lib/types";
import { CinemaCard } from "@/components/CinemaCard";
import { EmptyState } from "@/components/EmptyState";

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    fetch("/api/cinemas")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(setCinemas)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return cinemas;
    const q = debouncedSearch.toLowerCase();
    return cinemas.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.chain.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [cinemas, debouncedSearch]);

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
        <p className="text-[var(--color-muted)]">Failed to load cinemas.</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Cinemas</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search cinemas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No cinemas found"
          description="Try a different search or come back later."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cinema) => (
            <CinemaCard key={cinema.id} cinema={cinema} />
          ))}
        </div>
      )}
    </>
  );
}
