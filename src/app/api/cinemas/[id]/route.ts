import { NextResponse } from "next/server";
import { getCinema } from "@/lib/airtable";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cinema = await getCinema(id);
    if (!cinema) {
      return NextResponse.json({ error: "Cinema not found" }, { status: 404 });
    }
    return NextResponse.json(cinema);
  } catch (error) {
    console.error("Failed to fetch cinema:", error);
    return NextResponse.json(
      { error: "Failed to fetch cinema" },
      { status: 500 }
    );
  }
}
