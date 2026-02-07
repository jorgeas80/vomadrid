"use client";

import { useState, useEffect } from "react";
import type { Cinema } from "@/lib/types";
import { CinemaCard } from "@/components/CinemaCard";
import { EmptyState } from "@/components/EmptyState";

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      {cinemas.length === 0 ? (
        <EmptyState
          title="No cinemas found"
          description="Come back later."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cinemas.map((cinema) => (
            <CinemaCard key={cinema.id} cinema={cinema} />
          ))}
        </div>
      )}
    </>
  );
}
