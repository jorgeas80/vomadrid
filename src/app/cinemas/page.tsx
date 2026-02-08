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
  const [city, setCity] = useState("");
  const [chain, setChain] = useState("");

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

  const cities = useMemo(
    () => [...new Set(cinemas.map((c) => c.city).filter(Boolean))].sort(),
    [cinemas]
  );
  const chains = useMemo(
    () => [...new Set(cinemas.map((c) => c.chain).filter(Boolean))].sort(),
    [cinemas]
  );

  const filtered = useMemo(() => {
    return cinemas.filter((c) => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.chain.toLowerCase().includes(q) &&
          !c.city.toLowerCase().includes(q)
        )
          return false;
      }
      if (city && c.city !== city) return false;
      if (chain && c.chain !== chain) return false;
      return true;
    });
  }, [cinemas, debouncedSearch, city, chain]);

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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search cinemas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">All chains</option>
            {chains.map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
        </div>
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
