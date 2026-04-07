import { NextResponse } from "next/server";
import { createCaptchaChallenge } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  const challenge = createCaptchaChallenge();
  return NextResponse.json(challenge);
}
