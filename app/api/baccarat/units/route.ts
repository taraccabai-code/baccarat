import { NextResponse } from "next/server";
import { getBaccaratData } from "@/helper/baccarat";

export async function GET() {
  try {
    const data = await getBaccaratData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/baccarat/units:", error);
    return NextResponse.json(
      { error: "Failed to load baccarat data" },
      { status: 500 },
    );
  }
}

