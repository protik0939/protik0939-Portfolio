import { NextResponse } from "next/server";
import { sendAdminOtpEmail } from "@/lib/admin-email";
import {
  ADMIN_SESSION_COOKIE_NAME,
  createOtpChallenge,
  getAdminSessionByToken,
  maskEmail,
  validateAdminPassword,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

type RequestBody = {
  currentPassword?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const currentPassword = body.currentPassword ?? "";

  if (!currentPassword) {
    return NextResponse.json({ error: "Current password is required." }, { status: 400 });
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

  const isPasswordValid = await validateAdminPassword(admin.id, currentPassword);
  if (!isPasswordValid) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  const otpChallenge = await createOtpChallenge(admin.id, "PASSWORD_CHANGE");

  try {
    await sendAdminOtpEmail({
      to: admin.email,
      otpCode: otpChallenge.otpCode,
      expiresInMinutes: otpChallenge.expiresInMinutes,
      adminName: admin.fullName,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send OTP.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    challengeId: otpChallenge.challengeId,
    maskedEmail: maskEmail(admin.email),
    expiresAt: otpChallenge.expiresAt.toISOString(),
  });
}
