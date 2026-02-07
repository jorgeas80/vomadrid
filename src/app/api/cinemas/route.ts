import { NextResponse } from "next/server";
import { getCinemas } from "@/lib/airtable";

export async function GET() {
  try {
    const cinemas = await getCinemas();
    return NextResponse.json(cinemas);
  } catch (error) {
    console.error("Failed to fetch cinemas:", error);
    return NextResponse.json(
      { error: "Failed to fetch cinemas" },
      { status: 500 }
    );
  }
}
