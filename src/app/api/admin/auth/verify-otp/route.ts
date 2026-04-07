import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSession,
  getAdminSessionCookieOptions,
  verifyOtpChallenge,
} from "@/lib/admin-auth";

type VerifyOtpBody = {
  challengeId?: string;
  otp?: string;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as VerifyOtpBody;

  const challengeId = body.challengeId?.trim();
  const otp = body.otp?.trim().toUpperCase();

  if (!challengeId || !otp) {
    return NextResponse.json({ error: "challengeId and otp are required." }, { status: 400 });
  }

  if (otp.length !== 8) {
    return NextResponse.json({ error: "OTP must be exactly 8 characters." }, { status: 400 });
  }

  const result = await verifyOtpChallenge(challengeId, otp);

  if (!result.ok) {
    const reasonMessage: Record<string, string> = {
      not_found: "Invalid OTP challenge.",
      used: "OTP challenge already used.",
      expired: "OTP expired. Please login again.",
      too_many_attempts: "Too many invalid attempts. Please login again.",
      invalid: "Invalid OTP code.",
    };

    return NextResponse.json({ error: reasonMessage[result.reason] }, { status: 401 });
  }

  const session = await createAdminSession(result.adminId);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, session.token, getAdminSessionCookieOptions(session.expiresAt));
  return response;
}
