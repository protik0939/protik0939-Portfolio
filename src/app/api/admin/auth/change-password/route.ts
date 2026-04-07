import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  getAdminSessionByToken,
  updateAdminPassword,
  verifyOtpChallenge,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

type RequestBody = {
  challengeId?: string;
  otp?: string;
  newPassword?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const challengeId = body.challengeId?.trim();
  const otp = body.otp?.trim().toUpperCase();
  const newPassword = body.newPassword ?? "";

  if (!challengeId || !otp || !newPassword) {
    return NextResponse.json({ error: "challengeId, otp, and newPassword are required." }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${ADMIN_SESSION_COOKIE_NAME}=`))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = await getAdminSessionByToken(token);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const result = await verifyOtpChallenge(challengeId, otp, "PASSWORD_CHANGE");
  if (!result.ok) {
    const reasonMessage: Record<string, string> = {
      not_found: "Invalid OTP challenge.",
      used: "OTP challenge already used.",
      expired: "OTP expired. Request a new OTP.",
      too_many_attempts: "Too many invalid attempts. Request a new OTP.",
      invalid: "Invalid OTP code.",
    };

    return NextResponse.json({ error: reasonMessage[result.reason] }, { status: 401 });
  }

  if (result.adminId !== admin.id) {
    return NextResponse.json({ error: "OTP challenge does not belong to this admin." }, { status: 403 });
  }

  await updateAdminPassword(admin.id, newPassword);

  return NextResponse.json({ ok: true });
}
