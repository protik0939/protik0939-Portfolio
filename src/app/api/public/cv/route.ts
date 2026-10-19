import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/public-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const siteConfig = await getSiteConfig();

    return NextResponse.json(
      { cvUrl: siteConfig?.cvUrl ?? null },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=600",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Unable to load the CV right now." }, { status: 500 });
  }
}
