// --- Airtable raw types ---

export interface AirtableRecord<T> {
  id: string;
  createdTime: string;
  fields: T;
}

export interface AirtableListResponse<T> {
  records: AirtableRecord<T>[];
  offset?: string;
}

// --- Airtable field types (raw from API) ---

export interface MovieFields {
  Title?: string;
  "Original title"?: string;
  Poster?: string;
  Synopsis?: string;
  "Trailer URL"?: string;
  Rating?: number;
  Genres?: string[];
  Runtime?: number; // seconds
  "Age rating"?: string[];
  "Original language"?: string;
  "Is active"?: boolean;
  "Sort order"?: number;
  imdb_link?: string;
  screenings?: string[]; // linked record IDs
}

export interface CinemaFields {
  "Cinema name"?: string;
  Chain?: string;
  Address?: string;
  City?: string;
  URL?: string;
  "Google Maps URL"?: string;
  "Is active"?: boolean;
  screenings?: string[]; // linked record IDs
}

export interface ScreeningFields {
  ID?: number;
  "Movie (linked)"?: string[]; // linked record IDs
  "Cinema (linked)"?: string[]; // linked record IDs
  Date?: string;
  "Booking URL"?: string;
  Notes?: string;
  "Is active"?: boolean;
}

// --- App-level types (normalized) ---

export interface Movie {
  id: string;
  title: string;
  originalTitle: string;
  poster: string;
  synopsis: string;
  trailerUrl: string;
  rating: number;
  genres: string[];
  runtime: string;
  ageRating: string;
  originalLanguage: string;
  imdbLink: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Cinema {
  id: string;
  name: string;
  chain: string;
  address: string;
  city: string;
  url: string;
  googleMapsUrl: string;
  isActive: boolean;
}

export interface Screening {
  id: string;
  screeningId: number;
  movieId: string;
  cinemaId: string;
  date: string;
  bookingUrl: string;
  notes: string;
  isActive: boolean;
  // Resolved from linked records
  movie?: Movie;
  cinema?: Cinema;
}
