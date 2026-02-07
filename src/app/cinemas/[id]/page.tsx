"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import type { Cinema, Screening } from "@/lib/types";
import { ScreeningsList } from "@/components/ScreeningsList";

export default function CinemaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [cinema, setCinema] = useState<Cinema | null>(null);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/cinemas/${id}`).then((r) => {
        if (!r.ok) throw new Error("Cinema not found");
        return r.json();
      }),
      fetch(`/api/screenings?cinemaId=${id}`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch screenings");
        return r.json();
      }),
    ])
      .then(([cinemaData, screeningsData]) => {
        setCinema(cinemaData);
        setScreenings(screeningsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  if (error || !cinema) {
    return (
      <div className="py-20 text-center">
        <p className="text-[var(--color-muted)]">
          {error || "Cinema not found."}
        </p>
        <Link
          href="/cinemas"
          className="mt-4 inline-block text-sm text-[var(--color-primary)] hover:underline"
        >
          Back to cinemas
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/cinemas"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{cinema.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {cinema.chain && (
            <span className="rounded-full bg-[var(--color-badge)] px-3 py-1 text-sm font-medium">
              {cinema.chain}
            </span>
          )}
          {cinema.city && (
            <span className="text-sm text-[var(--color-muted)]">{cinema.city}</span>
          )}
        </div>
        {cinema.address && (
          <p className="mt-2 text-sm text-[var(--color-muted)]">{cinema.address}</p>
        )}
        <div className="mt-3 flex gap-3">
          {cinema.url && (
            <a
              href={cinema.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--color-primary)] hover:underline"
            >
              Website
            </a>
          )}
          {cinema.googleMapsUrl && (
            <a
              href={cinema.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--color-primary)] hover:underline"
            >
              Google Maps
            </a>
          )}
        </div>
      </div>

      <h2 className="mb-3 text-xl font-semibold">Upcoming screenings</h2>
      <ScreeningsList screenings={screenings} />
    </div>
  );
}
