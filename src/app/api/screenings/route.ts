import { NextRequest, NextResponse } from "next/server";
import { getScreenings } from "@/lib/airtable";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const filters = {
      movieId: searchParams.get("movieId") ?? undefined,
      cinemaId: searchParams.get("cinemaId") ?? undefined,
      date: searchParams.get("date") ?? undefined,
      chain: searchParams.get("chain") ?? undefined,
    };

    const screenings = await getScreenings(filters);
    return NextResponse.json(screenings);
  } catch (error) {
    console.error("Failed to fetch screenings:", error);
    return NextResponse.json(
      { error: "Failed to fetch screenings" },
      { status: 500 }
    );
  }
}
