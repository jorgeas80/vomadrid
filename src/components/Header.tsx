import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight">
          VO Madrid
        </Link>
        <nav className="flex gap-6 text-sm font-medium">
          <Link
            href="/"
            className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
          >
            Películas
          </Link>
          <Link
            href="/cinemas"
            className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
          >
            Cines
          </Link>
        </nav>
      </div>
    </header>
  );
}
