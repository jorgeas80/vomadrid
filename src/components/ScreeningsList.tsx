"use client";

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

export function ScreeningsList({
  screenings,
  context = "movie",
}: {
  screenings: Screening[];
  context?: "movie" | "cinema";
}) {
  if (screenings.length === 0) {
    return (
      <EmptyState
        title="No screenings available"
        description="Try changing the filters or come back later."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-badge)]">
          <tr>
            <th className="px-4 py-3 font-medium">Date & time</th>
            {context === "movie" ? (
              <>
                <th className="px-4 py-3 font-medium">Cinema</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Chain</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">City</th>
              </>
            ) : (
              <th className="px-4 py-3 font-medium">Movie</th>
            )}
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {screenings.map((screening) => {
            const dateObj = new Date(screening.date);
            const dateStr = dateObj.toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
            const timeStr = dateObj.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <tr
                key={screening.id}
                className="transition-colors hover:bg-[var(--color-card-hover)]"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{dateStr}</div>
                  <div className="text-[var(--color-muted)]">{timeStr}</div>
                </td>
                {context === "movie" ? (
                  <>
                    <td className="px-4 py-3">{screening.cinema?.name ?? "—"}</td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {screening.cinema?.chain && (
                        <span className="rounded-full bg-[var(--color-badge)] px-2 py-0.5 text-xs font-medium text-[var(--color-badge-text)]">
                          {screening.cinema.chain}
                        </span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {screening.cinema?.city ?? "—"}
                    </td>
                  </>
                ) : (
                  <td className="px-4 py-3">{screening.movie?.title ?? "—"}</td>
                )}
                <td className="px-4 py-3 text-right">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
