"use client";

import { useMemo } from "react";
import posthog from "posthog-js";
import type { Screening } from "@/lib/types";
import { EmptyState } from "./EmptyState";

function trackTicketPurchase(screening: Screening) {
  posthog.capture("ticket_purchased", {
    movie_title: screening.movie?.title,
    movie_id: screening.movieId,
    cinema_name: screening.cinema?.name,
    cinema_chain: screening.cinema?.chain,
    cinema_city: screening.cinema?.city,
    screening_date: screening.date,
    booking_url: screening.bookingUrl,
  });
}

function formatDayHeader(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow";

  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function groupByDay(screenings: Screening[]): Map<string, Screening[]> {
  const groups = new Map<string, Screening[]>();
  for (const s of screenings) {
    const day = s.date.slice(0, 10); // YYYY-MM-DD
    const group = groups.get(day);
    if (group) group.push(s);
    else groups.set(day, [s]);
  }
  return groups;
}

export function ScreeningsList({
  screenings,
  context = "movie",
}: {
  screenings: Screening[];
  context?: "movie" | "cinema";
}) {
  const grouped = useMemo(() => groupByDay(screenings), [screenings]);

  if (screenings.length === 0) {
    return (
      <EmptyState
        title="No screenings available"
        description="Try changing the filters or come back later."
      />
    );
  }

  return (
    <div className="space-y-4">
      {[...grouped.entries()].map(([day, dayScreenings]) => (
        <div key={day} className="overflow-hidden rounded-lg border border-[var(--color-border)]">
          <div className="bg-[var(--color-badge)] px-4 py-2.5">
            <h3 className="text-sm font-semibold text-[var(--color-badge-text)]">
              {formatDayHeader(day)}
            </h3>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {dayScreenings.map((screening) => {
              const timeStr = new Date(screening.date).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={screening.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-card-hover)]"
                >
                  <div className="w-14 flex-shrink-0 text-sm font-medium">
                    {timeStr}
                  </div>
                  {context === "movie" ? (
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="truncate text-sm">{screening.cinema?.name ?? "—"}</span>
                      {screening.cinema?.chain && (
                        <span className="hidden flex-shrink-0 rounded-full bg-[var(--color-badge)] px-2 py-0.5 text-xs font-medium text-[var(--color-badge-text)] sm:inline">
                          {screening.cinema.chain}
                        </span>
                      )}
                      {screening.cinema?.city && (
                        <span className="hidden flex-shrink-0 rounded-full bg-[var(--color-badge)] px-2 py-0.5 text-xs font-medium text-[var(--color-badge-text)] md:inline">
                          {screening.cinema.city}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <span className="truncate text-sm">{screening.movie?.title ?? "—"}</span>
                    </div>
                  )}
                  <div className="flex-shrink-0">
                    {screening.bookingUrl ? (
                      <a
                        href={screening.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackTicketPurchase(screening)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
                      >
                        Buy tickets
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-xs text-[var(--color-muted)]">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
