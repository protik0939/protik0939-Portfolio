import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { OtpPurpose } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const CAPTCHA_TTL_SECONDS = 180;
const OTP_TTL_MINUTES = 10;
const OTP_LENGTH = 8;
const OTP_MAX_ATTEMPTS = 5;
const SESSION_TTL_HOURS = 24;

export const ADMIN_SESSION_COOKIE_NAME = "admin_session";

type CaptchaPayload = {
  nonce: string;
  expiresAt: number;
  answerHash: string;
};

export type CaptchaChallenge = {
  captchaText: string;
  captchaToken: string;
  expiresInSeconds: number;
};

export type VerifyOtpResult =
  | { ok: true; adminId: string }
  | { ok: false; reason: "not_found" | "expired" | "used" | "too_many_attempts" | "invalid" };

function getAdminAuthSecret() {
  const secret = process.env.ADMIN_AUTH_SECRET;

  if (secret && secret.length >= 24) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "dev-only-admin-auth-secret-change-this";
  }

  throw new Error("ADMIN_AUTH_SECRET must be set and at least 24 characters long.");
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hmac(value: string) {
  return crypto.createHmac("sha256", getAdminAuthSecret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function randomFromCharset(length: number, charset: string) {
  const bytes = crypto.randomBytes(length);
  let value = "";

  for (let index = 0; index < length; index += 1) {
    value += charset[bytes[index] % charset.length];
  }

  return value;
}

function createCaptchaToken(payload: CaptchaPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = hmac(body);
  return `${body}.${signature}`;
}

function parseCaptchaToken(token: string): CaptchaPayload | null {
  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expectedSignature = hmac(body);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as CaptchaPayload;
    if (!payload.nonce || !payload.expiresAt || !payload.answerHash) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function hashCaptchaAnswer(nonce: string, answer: string) {
  return sha256(`${nonce}:${answer.toLowerCase().trim()}:${getAdminAuthSecret()}`);
}

function hashSessionToken(token: string) {
  return sha256(`admin-session:${token}:${getAdminAuthSecret()}`);
}

function generateOtpCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const all = `${letters}${digits}`;

  let otp = "";
  do {
    otp = randomFromCharset(OTP_LENGTH, all);
  } while (!/[A-Z]/.test(otp) || !/\d/.test(otp));

  return otp;
}

export function createCaptchaChallenge(): CaptchaChallenge {
  const captchaRaw = randomFromCharset(6, "ABCDEFGHJKLMNPQRSTUVWXYZ23456789");
  const nonce = crypto.randomBytes(12).toString("hex");
  const expiresAt = Date.now() + CAPTCHA_TTL_SECONDS * 1000;

  const payload: CaptchaPayload = {
    nonce,
    expiresAt,
    answerHash: hashCaptchaAnswer(nonce, captchaRaw),
  };

  return {
    captchaText: captchaRaw,
    captchaToken: createCaptchaToken(payload),
    expiresInSeconds: CAPTCHA_TTL_SECONDS,
  };
}

export function verifyCaptcha(captchaToken: string, captchaAnswer: string) {
  const payload = parseCaptchaToken(captchaToken);
  if (!payload) {
    return false;
  }

  if (payload.expiresAt < Date.now()) {
    return false;
  }

  const candidateHash = hashCaptchaAnswer(payload.nonce, captchaAnswer);
  return safeEqual(candidateHash, payload.answerHash);
}

export async function getSingletonAdmin() {
  return prisma.admin.findUnique({
    where: { singletonKey: 1 },
  });
}

export async function createOtpChallenge(adminId: string, purpose: OtpPurpose = "LOGIN") {
  const otpCode = generateOtpCode();
  const otpHash = await bcrypt.hash(otpCode, 12);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.adminLoginOtp.updateMany({
    where: {
      adminId,
      purpose,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  const otpChallenge = await prisma.adminLoginOtp.create({
    data: {
      adminId,
      otpHash,
      purpose,
      expiresAt,
    },
    select: {
      id: true,
      expiresAt: true,
    },
  });

  return {
    challengeId: otpChallenge.id,
    otpCode,
    expiresAt: otpChallenge.expiresAt,
    expiresInMinutes: OTP_TTL_MINUTES,
  };
}

export async function verifyOtpChallenge(
  challengeId: string,
  otpInput: string,
  purpose: OtpPurpose = "LOGIN",
): Promise<VerifyOtpResult> {
  const challenge = await prisma.adminLoginOtp.findUnique({
    where: { id: challengeId },
    select: {
      id: true,
      adminId: true,
      otpHash: true,
      purpose: true,
      attempts: true,
      expiresAt: true,
      usedAt: true,
    },
  });

  if (!challenge) {
    return { ok: false, reason: "not_found" };
  }

  if (challenge.usedAt) {
    return { ok: false, reason: "used" };
  }

  if (challenge.purpose !== purpose) {
    return { ok: false, reason: "invalid" };
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    await prisma.adminLoginOtp.update({
      where: { id: challenge.id },
      data: { usedAt: new Date() },
    });
    return { ok: false, reason: "expired" };
  }

  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.adminLoginOtp.update({
      where: { id: challenge.id },
      data: { usedAt: new Date() },
    });
    return { ok: false, reason: "too_many_attempts" };
  }

  const otp = otpInput.trim().toUpperCase();
  const isValid = await bcrypt.compare(otp, challenge.otpHash);

  if (!isValid) {
    const nextAttempts = challenge.attempts + 1;
    await prisma.adminLoginOtp.update({
      where: { id: challenge.id },
      data: {
        attempts: nextAttempts,
        usedAt: nextAttempts >= OTP_MAX_ATTEMPTS ? new Date() : null,
      },
    });

    return nextAttempts >= OTP_MAX_ATTEMPTS
      ? { ok: false, reason: "too_many_attempts" }
      : { ok: false, reason: "invalid" };
  }

  await prisma.adminLoginOtp.update({
    where: { id: challenge.id },
    data: {
      usedAt: new Date(),
    },
  });

  return {
    ok: true,
    adminId: challenge.adminId,
  };
}

export async function createAdminSession(adminId: string) {
  const token = crypto.randomBytes(48).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);

  await prisma.adminSession.create({
    data: {
      adminId,
      tokenHash,
      expiresAt,
    },
  });

  await prisma.admin.update({
    where: { id: adminId },
    data: {
      lastLoginAt: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  return { token, expiresAt };
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const admin = await getAdminSessionByToken(token);

  return admin;
}

export async function getAdminSessionByToken(token: string) {
  const tokenHash = hashSessionToken(token);
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: {
      admin: {
        select: {
          id: true,
          email: true,
          fullName: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      },
    },
  });

  if (!session || session.revokedAt || !session.admin.isActive) {
    return null;
  }

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.adminSession.updateMany({
      where: {
        id: session.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return null;
  }

  return session.admin;
}

export async function validateAdminPassword(adminId: string, currentPassword: string) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!admin) {
    return false;
  }

  return bcrypt.compare(currentPassword, admin.passwordHash);
}

export async function updateAdminPassword(adminId: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.admin.update({
    where: { id: adminId },
    data: {
      passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
}

export async function revokeAdminSessionByToken(token: string) {
  const tokenHash = hashSessionToken(token);

  await prisma.adminSession.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export function getAdminSessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_HOURS * 60 * 60,
    expires: expiresAt,
  };
}

export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) {
    return "***";
  }

  if (local.length <= 2) {
    return `${local[0] ?? "*"}*@${domain}`;
  }

  const first = local.slice(0, 2);
  const last = local.slice(-1);
  return `${first}${"*".repeat(Math.max(local.length - 3, 1))}${last}@${domain}`;
}
