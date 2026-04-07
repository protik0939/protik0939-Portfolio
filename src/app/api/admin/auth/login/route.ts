import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { sendAdminOtpEmail } from "@/lib/admin-email";
import { createOtpChallenge, getSingletonAdmin, maskEmail, verifyCaptcha } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type LoginBody = {
  email?: string;
  password?: string;
  captchaAnswer?: string;
  captchaToken?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody;

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const captchaAnswer = body.captchaAnswer ?? "";
  const captchaToken = body.captchaToken ?? "";

  if (!email || !password || !captchaAnswer || !captchaToken) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const captchaOk = verifyCaptcha(captchaToken, captchaAnswer);
  if (!captchaOk) {
    return NextResponse.json({ error: "Captcha verification failed." }, { status: 400 });
  }

  const admin = await getSingletonAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin account is not initialized." }, { status: 404 });
  }

  if (!admin.isActive) {
    return NextResponse.json({ error: "Admin account is disabled." }, { status: 403 });
  }

  const isSameEmail = email === admin.email.toLowerCase();
  const isPasswordValid = isSameEmail ? await bcrypt.compare(password, admin.passwordHash) : false;

  if (!isSameEmail || !isPasswordValid) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ error: "Invalid login credentials." }, { status: 401 });
  }

  const otpChallenge = await createOtpChallenge(admin.id);

  try {
    await sendAdminOtpEmail({
      to: admin.email,
      otpCode: otpChallenge.otpCode,
      expiresInMinutes: otpChallenge.expiresInMinutes,
      adminName: admin.fullName,
    });
  } catch (error) {
    await prisma.adminLoginOtp.update({
      where: { id: otpChallenge.challengeId },
      data: {
        usedAt: new Date(),
      },
    });

    const message = error instanceof Error ? error.message : "Failed to send OTP email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  return NextResponse.json({
    requiresOtp: true,
    challengeId: otpChallenge.challengeId,
    maskedEmail: maskEmail(admin.email),
    expiresAt: otpChallenge.expiresAt.toISOString(),
  });
}
