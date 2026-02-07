import type { Movie } from "@/lib/types";
import { MovieCard } from "./MovieCard";
import { EmptyState } from "./EmptyState";

export function MovieGrid({ movies }: { movies: Movie[] }) {
  if (movies.length === 0) {
    return (
      <EmptyState
        title="No se encontraron películas"
        description="Prueba a cambiar los filtros o vuelve más tarde."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
