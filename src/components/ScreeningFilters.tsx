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
      <input
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
      />
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
