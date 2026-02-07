import Link from "next/link";

export function Header() {
  return (
    <header className="bg-[var(--color-header-bg)] shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-[var(--color-header-text)]">
          <img src="/logo.png" alt="VO Madrid" className="h-9 w-9 rounded-full bg-white/10 p-0.5" />
          VO Madrid
        </Link>
        <nav className="flex gap-6 text-sm font-medium">
          <Link
            href="/"
            className="text-[var(--color-header-muted)] transition-colors hover:text-[var(--color-header-text)]"
          >
            Movies
          </Link>
          <Link
            href="/cinemas"
            className="text-[var(--color-header-muted)] transition-colors hover:text-[var(--color-header-text)]"
          >
            Cinemas
          </Link>
        </nav>
      </div>
    </header>
  );
}
