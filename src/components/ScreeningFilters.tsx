"use client";

interface ScreeningFiltersProps {
  date: string;
  cinemaId: string;
  chain: string;
  cinemas: { id: string; name: string }[];
  chains: string[];
  onDateChange: (value: string) => void;
  onCinemaChange: (value: string) => void;
  onChainChange: (value: string) => void;
}

export function ScreeningFilters({
  date,
  cinemaId,
  chain,
  cinemas,
  chains,
  onDateChange,
  onCinemaChange,
  onChainChange,
}: ScreeningFiltersProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative">
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 pr-8 text-sm outline-none focus:border-[var(--color-primary)]"
        />
        {date && (
          <button
            type="button"
            onClick={() => onDateChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            aria-label="Clear date"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <select
        value={cinemaId}
        onChange={(e) => onCinemaChange(e.target.value)}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
      >
        <option value="">All cinemas</option>
        {cinemas.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        value={chain}
        onChange={(e) => onChainChange(e.target.value)}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
      >
        <option value="">All chains</option>
        {chains.map((ch) => (
          <option key={ch} value={ch}>
            {ch}
          </option>
        ))}
      </select>
    </div>
  );
}
